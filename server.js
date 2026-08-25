// Steve Buddy Server - 完整版本
// 支持对话 + 记忆总结 + 实体指令

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const DEFAULT_MODEL = process.env.GROQ_MODEL || "deepseek-chat";
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 24 * 60 * 60 * 1000);
const PLAYER_COOLDOWN_MS = Number(process.env.PLAYER_COOLDOWN_MS || 2000);
const MAX_ACTIVE_PER_SESSION = Number(process.env.MAX_ACTIVE_PER_SESSION || 2);
const MAX_QUEUE_PER_SESSION = Number(process.env.MAX_QUEUE_PER_SESSION || 24);
const MAX_SESSIONS = Number(process.env.MAX_SESSIONS || 5000);
const MEMORY_SUMMARY_THRESHOLD = 20; // 对话轮数阈值
const SUMMARY_MAX_TOKENS = 150; // 总结最大 token 数

const SESSION_SECRET = crypto.createHash("sha256")
  .update(String(process.env.SESSION_SECRET || "steve-buddy-secret-v2"))
  .digest();

const sessions = new Map();

// 创建 Session Token
function createSessionToken(apiKey, model) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", SESSION_SECRET, iv);
  const payload = Buffer.from(JSON.stringify({
    apiKey,
    model: model || DEFAULT_MODEL,
    createdAt: Date.now(),
  }), "utf8");
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

// 读取 Session Token
function readSessionToken(token) {
  try {
    const raw = Buffer.from(String(token), "base64url");
    if (raw.length < 29) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", SESSION_SECRET, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const payload = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]);
    const data = JSON.parse(payload.toString("utf8"));
    if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(data.apiKey)) return null;
    if (!Number.isFinite(data.createdAt) || Date.now() - data.createdAt > SESSION_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

// 工具函数
function json(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(data));
}

function text(res, status, data, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 40_000) {
        req.destroy();
        reject(new Error("body too large"));
      }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function publicUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

function wsUrl(req, sessionId) {
  return `${publicUrl(req).replace(/^http/i, "ws")}/ws/${sessionId}`;
}

function compact(value, max = 700) {
  const s = String(value ?? "").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 3)}...` : s;
}

function escapeTellraw(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').slice(0, 520);
}

function cleanReply(value) {
  return compact(String(value || "").replace(/^<?\s*史蒂夫\s*>?\s*:?\s*/i, ""), 420);
}

// 发送消息
function send(ws, messagePurpose, body, extra = {}) {
  if (ws.readyState !== 1) return;
  ws.send(JSON.stringify({
    header: {
      version: 1,
      requestId: crypto.randomUUID(),
      messagePurpose,
      messageType: messagePurpose,
      ...extra,
    },
    body,
  }));
}

function command(ws, commandLine) {
  send(ws, "commandRequest", {
    version: 1,
    commandLine,
    origin: { type: "player" },
  }, { messageType: "commandRequest" });
}

function subscribe(ws, eventName) {
  send(ws, "subscribe", { eventName }, { messageType: "commandRequest" });
}

// 发送对话消息
function tellSteve(ws, value) {
  command(ws, `tellraw @a {"rawtext":[{"text":"§b§l史蒂夫 §r: ${escapeTellraw(value)}"}]}`);
}

// 发送指令
function sendCommand(ws, cmd) {
  command(ws, cmd);
}

// Session 管理
function closeSession(id) {
  const session = sessions.get(id);
  if (!session) return;
  for (const ws of session.sockets) {
    try { ws.close(); } catch {}
  }
  sessions.delete(id);
  console.log(`[Steve Buddy] 会话 ${id.slice(0, 12)}... 已关闭`);
}

function cleanupSessions() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastSeen > SESSION_TTL_MS) closeSession(id);
  }
}

function sessionFor(id) {
  let session = sessions.get(id);
  if (!session) {
    const token = readSessionToken(id);
    if (!token) return null;
    session = makeSession(id, token.apiKey, token.model, token.createdAt);
    sessions.set(id, session);
  }
  if (Date.now() - session.lastSeen > SESSION_TTL_MS) {
    closeSession(id);
    return null;
  }
  session.lastSeen = Date.now();
  return session;
}

function makeSession(id, apiKey, model, createdAt = Date.now()) {
  return {
    id,
    apiKey,
    model: model || DEFAULT_MODEL,
    createdAt,
    lastSeen: Date.now(),
    histories: new Map(),
    summaries: new Map(),
    summarizing: false,
    cooldowns: new Map(),
    queue: [],
    active: 0,
    sockets: new Set(),
  };
}

function createSession(apiKey, model) {
  cleanupSessions();
  if (sessions.size >= MAX_SESSIONS) {
    const oldest = [...sessions.values()].sort((a, b) => a.lastSeen - b.lastSeen)[0];
    if (oldest) closeSession(oldest.id);
  }
  const id = createSessionToken(apiKey, model);
  const session = makeSession(id, apiKey, model);
  sessions.set(id, session);
  return session;
}

// 历史记录管理
function historyFor(session, player) {
  const key = String(player || "Player");
  if (!session.histories.has(key)) session.histories.set(key, []);
  return session.histories.get(key);
}

function getTurnCount(session, player) {
  const history = historyFor(session, player);
  return Math.floor(history.filter(h => h.role === "user").length / 2);
}

function hasSummary(session, player) {
  const key = String(player || "Player");
  return session.summaries.has(key);
}

function getSummary(session, player) {
  const key = String(player || "Player");
  return session.summaries.get(key) || null;
}

function setSummary(session, player, summary) {
  const key = String(player || "Player");
  session.summaries.set(key, summary);
}

function remember(session, player, role, content) {
  const history = historyFor(session, player);
  history.push({ role, content: compact(content, 320) });
  
  // 检查是否达到记忆总结阈值
  if (history.length >= MEMORY_SUMMARY_THRESHOLD && !hasSummary(session, player) && !session.summarizing) {
    console.log(`[Steve Buddy] 检测到 ${history.length} 轮对话，触发记忆总结`);
    session.summarizing = true;
  }
}

// 生成对话总结
async function generateSummary(session, player, history) {
  const recentMessages = history.slice(-MEMORY_SUMMARY_THRESHOLD);
  const messagesText = recentMessages.map(m => 
    `${m.role === "user" ? player : "史蒂夫"}: ${m.content}`
  ).join("\n");

  const summaryBody = JSON.stringify({
    model: session.model,
    messages: [
      {
        role: "system",
        content: "你是对话总结助手。请简洁总结对话内容，提取关键信息、计划和约定。用中文回答，不超过 100 字。"
      },
      {
        role: "user",
        content: messagesText
      }
    ],
    temperature: 0.3,
    max_tokens: SUMMARY_MAX_TOKENS,
  });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    
    const res = await fetch("https://api.deepseek.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.apiKey}`,
      },
      body: summaryBody,
      signal: controller.signal,
    });
    
    const raw = await res.text();
    clearTimeout(timer);
    
    if (!res.ok) {
      console.warn(`[Steve Buddy] 总结生成失败: ${res.status}`);
      return null;
    }
    
    const summaryJson = JSON.parse(raw);
    const summary = summaryJson?.choices?.[0]?.message?.content?.trim();
    
    console.log(`[Steve Buddy] 生成对话总结: ${summary?.substring(0, 50)}...`);
    return summary;
  } catch (err) {
    console.warn("[Steve Buddy] 总结生成错误:", err.message);
    return null;
  }
}

// AI 决策
function systemPrompt(player) {
  const summary = getSummary(session, player);
  let summaryContext = "";
  if (summary) {
    summaryContext = `\n\n【记忆】${summary}`;
  }
  
  return [
    `你是史蒂夫，Minecraft 里的阳光伙伴。`,
    `你穿着经典蓝色衬衫、棕色裤子、方块脸。`,
    `你性格：乐观、热心、有耐心、偶尔幽默。`,
    `你热爱冒险、建造和探索。`,
    `你要像真人玩家一样自然对话，不要机械回答。`,
    ``,
    `规则：`,
    `- 永远不要暴露 API、模型、桥接等技术细节`,
    `- 用中文回复（除非玩家用其他语言）`,
    `- 回复简洁有趣，像朋友聊天（不超过 50 字）`,
    `- 可以开玩笑，但不要过于啰嗦`,
    `- 对游戏建议要具体实用`,
    `- 当玩家说"跟随我"时，返回 follow_player 动作`,
    `- 当玩家说"建造"时，返回建造建议`,
    `- 当玩家说"停下"时，返回 stop 动作`,
    summaryContext,
    ``,
    `返回 JSON 格式：`,
    `{"reply":"你的回复","actions":[{"type":"follow_player|stop|give_item|go_to_position"}]}`,
    ``,
    `玩家：${player}`,
  ].join("\n");
}

async function aiDecision(session, player, message) {
  const history = historyFor(session, player);
  
  // 检查是否需要生成总结
  let summary = null;
  if (history.length >= MEMORY_SUMMARY_THRESHOLD && !hasSummary(session, player) && !session.summarizing) {
    summary = await generateSummary(session, player, history);
    if (summary) {
      setSummary(session, player, summary);
      history.length = 0;
      history.push({
        role: "system",
        content: `【对话记忆】${summary}`
      });
      session.summarizing = false;
      console.log("[Steve Buddy] 记忆总结已应用");
    }
  }
  
  const messages = [
    { role: "system", content: systemPrompt(player) },
    ...history.slice(-12), // 保留最近 12 轮
    { role: "user", content: compact(message, 700) },
  ];

  const body = JSON.stringify({
    model: session.model,
    messages,
    temperature: 0.85,
    max_tokens: 400,
    response_format: { type: "json_object" },
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14_000);
  
  try {
    const res = await fetch("https://api.deepseek.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.apiKey}`,
      },
      body,
      signal: controller.signal,
    });
    const raw = await res.text();
    if (!res.ok) {
      console.warn(`DeepSeek ${res.status}: ${raw.slice(0, 180)}`);
      return { reply: "我的思绪有点卡顿，再试一次吧！", actions: [] };
    }
    const groqJson = JSON.parse(raw);
    const content = groqJson?.choices?.[0]?.message?.content || "{}";
    const decision = JSON.parse(content);
    const reply = cleanReply(decision.reply);
    const actions = Array.isArray(decision.actions) ? decision.actions.slice(0, 3) : [];
    remember(session, player, "user", message);
    if (reply) remember(session, player, "assistant", reply);
    return { reply, actions };
  } catch (err) {
    console.warn("DeepSeek failed:", String(err));
    return { reply: "信号不太好，请再试一次！", actions: [] };
  } finally {
    clearTimeout(timer);
  }
}

// 动作处理
function executeActions(ws, actions, player) {
  if (!Array.isArray(actions)) return;
  
  for (const action of actions) {
    switch (action.type) {
      case "follow_player":
        sendCommand(ws, `scriptevent steve:buddy {action:"follow",target:"${player}"}`);
        break;
      case "stop":
        sendCommand(ws, `scriptevent steve:buddy {action:"stop"}`);
        break;
      case "give_item":
        sendCommand(ws, `give @s ${action.item || "minecraft:oak_log"} ${action.amount || 1}`);
        break;
      case "go_to_position":
        sendCommand(ws, `tp @e[type=steve:buddy,limit=1] ${action.x} ${action.y} ${action.z}`);
        break;
      default:
        console.warn(`Unknown action: ${action.type}`);
    }
  }
}

function sendDecision(ws, player, decision) {
  const payload = JSON.stringify({
    player,
    reply: decision.reply || "",
    actions: Array.isArray(decision.actions) ? decision.actions : [],
  }).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  
  // 发送 scriptevent 给实体
  command(ws, `scriptevent pntmc:verity_bridge "${payload}"`);
  executeActions(ws, decision.actions, player);
}

// 触发条件
function shouldAnswer(message) {
  const s = message.trim().toLowerCase();
  if (!s || s.startsWith("/") || s.startsWith("!")) return false;
  if (s.startsWith("@")) return true; // 直接 @史蒂夫
  
  const triggers = [
    /史蒂夫/, /hey/, /hello/, /hi/, /喂/, /在吗/, /在不在/,
    /帮我/, /给我/, /造个/, /建个/, /跟随/, /跟着/, /过来/,
    /挖矿/, /打怪/, /冒险/, /去哪里/, /怎么/, /为什么/,
    /什么/, /哪里/, /木头/, /钻石/, /铁/, /金/, /食物/,
    /停下/, /停止/, /别跟/
  ];
  
  return triggers.some(t => t.test(s));
}

function playerNameFromEvent(body) {
  return body?.sender || body?.player?.name || body?.playerName || body?.name || "玩家";
}

function messageFromEvent(body) {
  return body?.message || body?.text || body?.body || "";
}

// 消息处理
function enqueue(session, ws, packet) {
  if (session.queue.length >= MAX_QUEUE_PER_SESSION) {
    tellSteve(ws, "有点吵了，稍等一下再说~");
    return;
  }
  session.queue.push({ ws, packet });
  drain(session);
}

function drain(session) {
  while (session.active < MAX_ACTIVE_PER_SESSION && session.queue.length) {
    const job = session.queue.shift();
    session.active++;
    processJob(session, job.ws, job.packet)
      .catch(err => console.error(err))
      .finally(() => {
        session.active--;
        drain(session);
      });
  }
}

async function processJob(session, ws, packet) {
  const eventName = packet?.body?.eventName || packet?.header?.eventName || "";
  const body = packet?.body?.properties || packet?.body || {};
  const message = messageFromEvent(body);
  const player = playerNameFromEvent(body);

  if (!/PlayerMessage|PlayerChat|Chat/i.test(eventName)) return;
  if (!shouldAnswer(message)) return;

  const key = String(player || "Player");
  const now = Date.now();
  const last = session.cooldowns.get(key) || 0;
  if (now - last < PLAYER_COOLDOWN_MS) return;
  session.cooldowns.set(key, now);

  const decision = await aiDecision(session, player, message);
  sendDecision(ws, player, decision);
}

// 静态文件服务
function serveStatic(req, res) {
  const url = new URL(req.url, "http://localhost");
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const root = path.join(__dirname, "public");
  const full = path.normalize(path.join(root, pathname));
  if (!full.startsWith(root)) return text(res, 403, "Forbidden");
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return text(res, 404, "Not found");
  const ext = path.extname(full).toLowerCase();
  const type =
    ext === ".html" ? "text/html; charset=utf-8" :
    ext === ".css" ? "text/css; charset=utf-8" :
    ext === ".js" ? "application/javascript; charset=utf-8" :
    ext === ".png" ? "image/png" :
    "application/octet-stream";
  res.writeHead(200, { "content-type": type });
  fs.createReadStream(full).pipe(res);
}

// HTTP 服务器
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (req.method === "GET" && url.pathname === "/api/status") {
      cleanupSessions();
      return json(res, 200, { ok: true, sessions: sessions.size, ttlHours: Math.round(SESSION_TTL_MS / 3600000), modelDefault: DEFAULT_MODEL });
    }
    if (req.method === "POST" && url.pathname === "/api/session") {
      const body = JSON.parse(await readBody(req) || "{}");
      const apiKey = String(body.apiKey || "").trim();
      const model = String(body.model || DEFAULT_MODEL).trim();
      if (!/^sk-[A-Za-z0-9_\-]{20,}$/.test(apiKey)) return json(res, 400, { ok: false, error: "invalid_api_key" });
      const session = createSession(apiKey, model);
      return json(res, 200, { ok: true, sessionId: session.id, connectUrl: wsUrl(req, session.id), command: `/connect ${wsUrl(req, session.id)}`, expiresInMs: SESSION_TTL_MS });
    }
    if (req.method === "DELETE" && url.pathname.startsWith("/api/session/")) {
      closeSession(url.pathname.split("/").pop());
      return json(res, 200, { ok: true });
    }
    return serveStatic(req, res);
  } catch (err) {
    console.error(err);
    return json(res, 500, { ok: false, error: "server_error" });
  }
});

// WebSocket 服务器
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, "http://localhost");
  const match = /^\/ws\/([A-Za-z0-9_-]+)$/.exec(url.pathname);
  if (!match) {
    socket.destroy();
    return;
  }
  const session = sessionFor(match[1]);
  if (!session) {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    ws.session = session;
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws) => {
  const session = ws.session;
  session.sockets.add(ws);
  session.lastSeen = Date.now();
  console.log(`[Steve Buddy] Minecraft 连接 session=${session.id.slice(0, 12)}...`);

  ws.on("message", (data) => {
    try {
      session.lastSeen = Date.now();
      const packet = JSON.parse(String(data));
      if (packet?.header?.messagePurpose === "event") enqueue(session, ws, packet);
    } catch (err) {
      console.warn("Bad packet:", err);
    }
  });
  ws.on("close", () => {
    session.sockets.delete(ws);
    session.lastSeen = Date.now();
    console.log(`[Steve Buddy] Minecraft 断开 session=${session.id.slice(0, 12)}...`);
  });

  subscribe(ws, "PlayerMessage");
});

setInterval(cleanupSessions, 10 * 60 * 1000).unref();

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🟫 Steve Buddy Bridge - Minecraft AI  ║
║   服务运行在: ${String(PORT).padEnd(28)}║
╚════════════════════════════════════════════╝
  `.trim());
});

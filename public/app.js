const groqKeyInput = document.querySelector("#groqKey");
const statusEl = document.querySelector("#status");
const result = document.querySelector("#result");
const commandEl = document.querySelector("#command");

function setStatus(message, kind = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${kind}`;
}

document.querySelector("#create").addEventListener("click", async () => {
  const groqApiKey = groqKeyInput.value.trim();
  const model = "deepseek-chat";
  result.classList.add("hidden");
  
  if (!groqApiKey.startsWith("sk-") && !groqApiKey.startsWith("gsk_")) {
    setStatus("❌ API Key 格式错误，必须以 sk- 或 gsk_ 开头", "error");
    return;
  }
  
  setStatus("⏳ 正在创建连接...");
  try {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ apiKey: groqApiKey, model }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "创建失败");
    
    commandEl.textContent = data.command;
    result.classList.remove("hidden");
    setStatus("✅ 连接已创建！在 Minecraft 中运行上面的命令。", "ok");
    groqKeyInput.value = "";
  } catch {
    setStatus("❌ 连接创建失败，请检查 API Key 是否正确。", "error");
  }
});

document.querySelector("#copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText(commandEl.textContent);
  setStatus("✅ 命令已复制到剪贴板！", "ok");
});

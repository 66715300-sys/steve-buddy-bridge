# 🟫 Steve Buddy Bridge - 完整部署指南

## ✅ 已完成

- ✅ 对话桥接服务（server.js）
- ✅ 20轮对话自动记忆总结
- ✅ 中文界面（index.html）
- ✅ Bedrock 实体 Addon（支持跟随、指令）
- ✅ 打包脚本（build_addon.sh）
- ✅ 本地测试通过

---

## 🚀 快速部署到 Railway

### 第一步：创建 GitHub 仓库

```bash
cd /var/minis/workspace/steve-buddy-bridge

# 初始化 Git
git init
git add .
git commit -m "Initial commit: Steve Buddy Bridge"

# 推送到 GitHub（需要先登录 GitHub）
git remote add origin https://github.com/YOUR_USERNAME/steve-buddy-bridge.git
git push -u origin main
```

### 第二步：部署到 Railway

1. 访问 https://railway.app
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的 `steve-buddy-bridge` 仓库
4. 等待自动部署（约 1-2 分钟）
5. 获取你的域名：`https://xxx-yyy.railway.app`

### 第三步：配置环境变量

在 Railway Dashboard → Settings → Variables：

```
GROQ_API_KEY=gsk_your_groq_key_here
PORT=8080
SESSION_SECRET=your-random-secret
```

### 第四步：测试

在浏览器打开：`https://xxx-yyy.railway.app`

---

## 🎮 Minecraft 使用步骤

### 1. 导入 Addon

1. 将 `/var/minis/workspace/steve-buddy-bridge/dist/` 文件夹传输到手机
2. 在 Minecraft 中：
   - 设置 → 资源包 → 我的资源包 → 导入
   - 选择 `Steve_Buddy_Behavior.mcpack`
   - 选择 `Steve_Buddy_Resource.mcpack`
   - 启用两个包

### 2. 生成实体

在游戏中输入命令：
```
/summon steve:buddy ~ ~ ~
```

### 3. 连接 Bridge

1. 在 Railway 部署页面获取你的域名
2. 在 Minecraft 聊天框输入：
   ```
   /connect wss://你的域名/ws/SESSION_ID
   ```

### 4. 开始对话！

- 直接称呼"史蒂夫"就会触发对话
- 说"跟随我"他会跟随
- 说"停下"他会停止

---

## 🔧 配置文件说明

### server.js 关键参数

```javascript
const MEMORY_SUMMARY_THRESHOLD = 20; // 对话轮数阈值（触发总结）
const SUMMARY_MAX_TOKENS = 150;     // 总结最大长度
const PLAYER_COOLDOWN_MS = 2000;    // 玩家回复冷却时间
const MAX_ACTIVE_PER_SESSION = 2;   // 同时在线人数上限
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 8080 | 服务端口 |
| GROQ_MODEL | llama-3.1-8b-instant | AI 模型 |
| SESSION_TTL_MS | 86400000 | 会话有效期（24小时） |
| PLAYER_COOLDOWN_MS | 2000 | 玩家冷却时间 |
| SESSION_SECRET | steve-buddy-secret | 会话加密密钥 |

---

## 📦 文件结构

```
steve-buddy-bridge/
├── server.js           # 核心服务端（19KB）
├── package.json        # 依赖配置
├── README.md          # 使用说明
├── DEPLOY.md          # 本部署文档
├── build_addon.sh     # Addon 打包脚本
├── dist/              # 打包输出
│   ├── Steve_Buddy_Behavior.mcpack
│   └── Steve_Buddy_Resource.mcpack
├── public/
│   ├── index.html     # 前端页面（中文版）
│   ├── app.js         # 前端逻辑
│   └── style.css      # 样式
└── addon/
    ├── manifest.json  # Addon 清单
    ├── entities/
    │   └── steve_buddy.json  # 实体定义
    ├── scripts/
    │   └── steve_buddy.js    # Bedrock 脚本
    ├── behavior_packs/
    │   └── steve_buddy/
    │       └── behavior_pack_info.json
    └── resource_packs/
        └── steve_buddy/
            └── resource_pack_info.json
```

---

## ⚠️ 已知限制

1. **实体跟随**：需要 Bedrock Script API（1.16+），部分旧版本可能不支持
2. **1.26.44 版本**：bedrock-protocol 官方支持到 1.26.40，可能兼容但需测试
3. **无语音**：需要额外集成 TTS 服务（如 Azure Speech）
4. **无视觉**：需要额外集成 Vision API（如 Gemini Vision）

---

## 🔗 相关链接

- [Railway 部署](https://railway.app)
- [Groq API 控制台](https://console.groq.com/keys)
- [Minecraft Bedrock 脚本文档](https://learn.microsoft.com/minecraft/creator/scriptapi/)

---

## 💡 下一步建议

1. **集成 TTS**：使用免费 TTS API（如 edge-tts）
2. **添加更多表情**：定义更多实体动画
3. **添加建造功能**：扩展 Action 类型
4. **创建皮肤**：设计史蒂夫的自定义皮肤

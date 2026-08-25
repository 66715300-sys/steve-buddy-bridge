# Steve Buddy Bridge - Minecraft Bedrock AI 伙伴 🟫

> 完整版：支持**对话 + 实体跟随 + 建造**，专为 Minecraft 手机版设计

## 🎮 项目简介

这是一个 **Minecraft Bedrock（国际版）AI 伙伴系统**，包含：

1. **Bridge 服务端** - WebSocket 桥接，连接游戏和 AI
2. **Bedrock Addon** - 实体跟随、对话气泡
3. **中文优化** - 全中文界面，中文对话

### ✨ 核心特性

- ✅ **自然对话** - Groq API (Llama 3.1 8B)，智能回复
- ✅ **实体跟随** - 自定义 Steve 实体跟随玩家
- ✅ **动作响应** - 建造、挖矿、跟随等指令
- ✅ **记忆系统** - 20轮对话自动总结，节省 Token
- ✅ **手机版适配** - 通过 `/connect` 命令连接

### 🔧 技术栈

- **后端**：Node.js 18+ + WebSocket
- **AI**：Groq API (免费 1M tokens/分钟)
- **协议**：bedrock-protocol (支持 1.16-1.26)
- **部署**：Railway / Render（云平台）

---

## 🚀 快速开始

### 第一步：获取 Groq API Key

1. 访问 https://console.groq.com/keys
2. 注册/登录账号
3. 点击 "Create API Key"
4. 复制生成的 Key（以 `gsk_` 开头）

> 💡 **免费额度**：新用户 1M tokens/分钟，足够日常使用

### 第二步：部署 Bridge 服务

#### 方法 A：Railway（推荐，最简单）

```bash
# 1. Fork 此仓库到你的 GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. 在 Railway 部署
# 访问 https://railway.app
# → New Project → Deploy from GitHub repo
# → 选择你的仓库
# → 自动部署
```

**或者手动部署：**

```bash
# 克隆仓库
git clone https://github.com/your-username/steve-buddy-bridge.git
cd steve-buddy-bridge

# 安装依赖
npm install

# 设置环境变量
export GROQ_API_KEY=gsk_your_key_here
export PORT=8080

# 启动服务
npm start
```

#### 方法 B：本地运行

```bash
npm install
export GROQ_API_KEY=gsk_your_key_here
npm start
```

### 第三步：导入 Addon

1. 运行打包脚本：
```bash
bash build_addon.sh
```

2. 会生成两个文件：
   - `dist/Steve_Buddy_Behavior.mcpack`
   - `dist/Steve_Buddy_Resource.mcpack`

3. 在 Minecraft Bedrock 中：
   - 设置 → 资源包 → 我的资源包 → 导入
   - 选择 `.mcpack` 文件
   - 启用资源包和行为包

### 第四步：游戏内连接

1. 创建/加载世界，**开启"允许作弊"**
2. 按 **T** 打开聊天框
3. 输入命令召唤实体：
   ```
   /summon steve:buddy
   ```
4. 在网页上获取连接命令，粘贴运行：
   ```
   /connect wss://你的域名/ws/SESSION_ID
   ```
5. 开始和史蒂夫对话！

---

## 💬 对话示例

### 邀请挖矿
**你**：史蒂夫，陪我挖矿吧！
**史蒂夫**：好呀！带上铁镐，我们去找钻石！✨

### 请求建造
**你**：帮我造个房子
**史蒂夫**：没问题！先给我一些木头吧。

### 跟随
**你**：跟着我
**史蒂夫**：好嘞！我跟着你走~

---

## 🎯 支持的指令

通过对话触发（自动识别）：

| 指令 | 触发词 | 效果 |
|------|--------|------|
| 跟随 | 跟着我/过来/跟随 | Steve 跟随玩家 |
| 建造 | 造房子/建房子 | 尝试建造 |
| 挖矿 | 挖矿/找钻石 | 尝试挖矿 |
| 停止 | 停下/别跟了 | 停止跟随 |

---

## 🧠 记忆系统

- **前 20 轮**：完整对话历史
- **第 21 轮**：自动生成对话总结
- **后续**：使用总结作为记忆，节省 Token

总结内容示例：
> 【对话记忆】玩家说要找钻石，史蒂夫陪玩家去挖矿，玩家有铁镐和食物...

---

## 📦 项目结构

```
steve-buddy-bridge/
├── server.js              # Bridge 服务端（核心）
├── package.json
├── README.md
├── build_addon.sh         # Addon 打包脚本
├── public/
│   ├── index.html         # 中文界面
│   ├── app.js
│   └── style.css
└── addon/                 # Bedrock Addon
    ├── manifest.json
    ├── entities/
    │   └── steve_buddy.json
    ├── scripts/
    │   └── steve_buddy.js
    ├── behavior_packs/
    └── resource_packs/
```

---

## 🔒 安全说明

- 每个用户独立 Session，互不干扰
- API Key 加密存储，不暴露给其他用户
- 支持 CORS 限制
- 建议不要分享 `/connect` 命令链接

---

## ⚠️ 已知限制

1. **手机端需要互联网** - Railway 提供公网地址
2. **需要 Cheats** - 游戏内需开启作弊模式
3. **实体外观** - 使用基础 Steve 模型（可自定义皮肤）
4. **语言** - 主要支持中文，偶尔识别英文指令

---

## 🔄 升级指南

### 更新 Bridge 服务端

```bash
git pull
npm install
npm start
```

### 更新 Addon

```bash
bash build_addon.sh
# 重新导入 .mcpack 文件
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT License

---

## 🙏 致谢

- 原版 Verity Improved Bridge: https://github.com/boltymcoficial-dotcom/verity-improved-bridge
- bedrock-protocol: https://github.com/PrismarineJS/bedrock-protocol
- Groq AI: https://groq.com

---

祝你和史蒂夫玩得开心！🎮

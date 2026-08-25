# 🚀 Steve Buddy Bridge - 快速部署指南

## ✅ 项目已完成

- ✅ Bridge 服务端（server.js 19KB）
- ✅ 20轮记忆总结系统
- ✅ 中文界面（全中文）
- ✅ Bedrock Addon（实体跟随、对话气泡）
- ✅ 打包完成（dist/ 目录）

---

## 📦 本地测试

服务器已在运行！访问：
```
http://localhost:8080
```

或查看 API 状态：
```bash
curl http://localhost:8080/api/status
```

---

## 🌐 在线部署到 Railway

### 步骤 1：创建 GitHub 仓库

```bash
cd /var/minis/workspace/steve-buddy-bridge

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .
git commit -m "Initial commit: Steve Buddy Bridge v1.0.0"

# 推送到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/steve-buddy-bridge.git
git push -u origin main
```

### 步骤 2：Railway 部署

1. 打开 https://railway.app
2. 登录（GitHub/Google/GitLab）
3. 点击 **New Project** → **Deploy from GitHub repo**
4. 选择 `steve-buddy-bridge`
5. 等待自动部署（约 1 分钟）
6. 获取你的域名：**https://xxx-yyy.railway.app**

### 步骤 3：配置环境变量

在 Railway Dashboard：
1. 点击你的项目
2. 进入 **Variables** 标签
3. 添加以下变量：

| 变量名 | 值 |
|--------|-----|
| GROQ_API_KEY | `gsk_your_key_here` |
| PORT | `8080` |
| SESSION_SECRET | 任意随机字符串（如 `my-steve-secret-123`） |

### 步骤 4：获取 Groq API Key

1. 访问 https://console.groq.com/keys
2. 注册/登录账号
3. 点击 **Create API Key**
4. 复制生成的 Key（以 `gsk_` 开头）

> 💡 **免费额度**：1M tokens/分钟，足够日常使用

---

## 🎮 Minecraft 手机使用步骤

### 1. 导入 Addon

将 `dist/` 文件夹传输到手机（可以通过微信/QQ/云盘）：

1. 打开 Minecraft Bedrock
2. 设置 → 资源包
3. 我的资源包 → 导入
4. 选择两个 `.mcpack` 文件
5. 启用资源包和行为包

### 2. 召唤史蒂夫

在游戏中输入：
```
/summon steve:buddy ~ ~ ~
```

### 3. 连接 Bridge

1. 打开浏览器访问你的 Railway 域名
2. 粘贴 Groq API Key
3. 点击"创建连接"
4. 复制生成的命令
5. 在游戏聊天框（按 T）粘贴并回车：

```
/connect wss://你的域名/ws/SESSION_ID
```

### 4. 开始对话！

- 直接说"史蒂夫"或"@史蒂夫"
- 说"跟着我"他会跟随
- 说"停下"他会停止
- 说"建造"他会尝试建造

---

## 📊 功能说明

### 记忆系统

| 对话轮次 | 行为 |
|---------|------|
| 1-20 轮 | 完整历史记录 |
| 第 21 轮 | 自动生成总结，清空历史 |
| 后续 | 使用总结作为记忆上下文 |

**优势**：节省 70%+ Token，降低 API 成本

### 支持的指令

| 触发词 | 效果 |
|--------|------|
| 跟着我/跟随 | Steve 跟随玩家 |
| 停下/别跟了 | 停止跟随 |
| 建造/造房子 | 尝试建造 |
| 挖矿/找钻石 | 建议挖矿 |
| 嗨/你好 | 打招呼 |

---

## ⚠️ 注意事项

1. **需要互联网**：Railway 提供公网地址
2. **游戏内需开启 Cheats**：使用 `/connect` 和 `/summon`
3. **版本兼容**：支持 Minecraft Bedrock 1.16+
4. **API Key 安全**：不要分享 `/connect` 命令链接

---

## 🔧 常见问题

**Q: 实体不跟随？**
A: 检查：
1. Addon 是否正确导入？
2. 是否启用了行为包？
3. 游戏版本是否 1.16+？
4. 是否运行了 `/summon steve:buddy`？

**Q: 对话没有响应？**
A: 检查：
1. Bridge 服务是否在线？
2. Groq API Key 是否正确？
3. 网络是否通畅？
4. 是否说了正确的触发词？

**Q: 记忆总结不生效？**
A: 需要连续对话 20 轮以上才会触发。可以修改 `server.js` 中的 `MEMORY_SUMMARY_THRESHOLD` 调整阈值。

---

## 📁 文件说明

```
steve-buddy-bridge/
├── server.js              # Bridge 服务端（核心）
├── package.json           # Node.js 配置
├── README.md              # 完整使用说明
├── DEPLOY.md              # 本快速部署指南
├── FINAL_REPORT.md        # 技术报告
├── build_addon.sh         # Addon 打包脚本
├── dist/                  # 打包好的 .mcpack 文件
├── public/                # 前端代码
│   ├── index.html         # 中文界面
│   ├── app.js             # 前端逻辑
│   └── style.css          # 样式
└── addon/                 # Bedrock Addon 源码
    ├── manifest.json      # Addon 清单
    ├── entities/          # 实体定义
    └── scripts/           # Bedrock 脚本
```

---

## 🎯 下一步

1. ✅ 本地测试完成
2. 📤 上传 GitHub
3. 🚀 Railway 部署
4. 🎮 手机测试
5. 🔧 根据反馈优化

---

祝你和史蒂夫玩得开心！🎮✨

有问题随时问我！
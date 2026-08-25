# 🟫 Steve Buddy Bridge - Minecraft AI 伙伴

基于 DeepSeek API 的 Minecraft Bedrock AI 伙伴桥接系统，支持对话 + 实体跟随。

## ✨ 功能特点

- **实时对话**：通过 WebSocket 连接游戏与 DeepSeek AI
- **记忆总结**：20 轮对话自动触发 AI 总结，节省 Token
- **实体跟随**：Bedrock Addon 实现跟随逻辑
- **全中文界面**：友好的中文前端
- **免费额度**：DeepSeek 提供充足免费额度

## 🚀 快速开始

### 1. 获取 DeepSeek API Key

访问 https://platform.deepseek.com/api_keys 注册并创建 Key

### 2. 部署服务

#### 方式一：本地运行
```bash
git clone https://github.com/66715300-sys/steve-buddy-bridge.git
cd steve-buddy-bridge
npm install
export DEEPSEEK_API_KEY=sk-your-key-here
npm start
```

#### 方式二：Docker 部署
```bash
docker-compose up -d
```

#### 方式三：Railway 部署（推荐）
1. Fork 本仓库
2. 在 Railway 导入 GitHub 仓库
3. 配置环境变量 `DEEPSEEK_API_KEY`
4. 自动部署

### 3. 游戏内使用

1. 导入 Bedrock Addon（两个 .mcpack 文件）
2. 开启作弊模式，加载世界
3. 生成实体：`/summon steve:buddy ~ ~ ~`
4. 连接 Bridge：`/connect wss://你的域名/ws/SESSION_ID`

## 📁 项目结构

```
steve-buddy-bridge/
├── server.js              # Bridge 服务端（核心）
├── public/                # 前端页面
│   ├── index.html
│   ├── app.js
│   └── style.css
├── addon/                 # Bedrock Addon 源码
│   ├── manifest.json
│   ├── entities/
│   └── scripts/
├── dist/                  # 打包产物（.mcpack）
├── package.json
├── Dockerfile
└── docker-compose.yml
```

## 🔧 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key | - |
| `DEEPSEEK_MODEL` | 模型名称 | `deepseek-chat` |
| `PORT` | 端口号 | `8080` |
| `SESSION_TTL_HOURS` | 会话过期时间 | `24` |

### API Key 格式

DeepSeek API Key 格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxx`

## ⚠️ 注意事项

1. **版本兼容性**：Bedrock Script API 需要 1.16+ 版本
2. **网络要求**：需要互联网连接访问 DeepSeek API
3. **作弊模式**：游戏内需要开启"允许作弊"才能使用 `/connect` 命令
4. **免费额度**：DeepSeek 提供充足的免费额度用于测试

## 🐛 故障排查

### 问题：服务器无法启动
```bash
# 检查 Node.js 版本
node --version  # 需要 >= 18

# 重新安装依赖
rm -rf node_modules
npm install
```

### 问题：游戏内无法连接
- 确认 Bridge 地址正确（https 开头）
- 检查网络连接
- 确认游戏内已开启作弊模式

### 问题：API 调用失败
- 检查 API Key 是否正确
- 确认 DeepSeek 账户余额
- 查看服务器日志

## 📝 技术栈

- **后端**：Node.js + WebSocket
- **AI**：DeepSeek API
- **Bedrock**：Script API v1.15+
- **前端**：原生 HTML/CSS/JS

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

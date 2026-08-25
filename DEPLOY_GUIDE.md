# 🚀 Railway 一键部署指南

## 步骤（只需点击 3 下）

### 1️⃣ 点击一键部署按钮
[![Deploy to Railway](https://railway.com/button.svg)](https://railway.com/new/template?ref=steve-buddy-bridge&repo=66715300-sys/steve-buddy-bridge)

### 2️⃣ 添加环境变量
部署后，在项目页面点击 **Settings → Variables**，添加：
- Name: `DEEPSEEK_API_KEY`
- Value: `sk-e5c478f04a844e179d329411e594ddec`

### 3️⃣ 获取连接地址
部署成功后，复制项目 URL（如 `https://xxx-yyy.railway.app`）
游戏内使用：`/connect wss://xxx-yyy.railway.app/ws/你的ID`

---

## 如果按钮不工作
1. 打开 https://railway.com
2. 登录你的账号
3. 点击 **New Project → Deploy from GitHub repo**
4. 搜索并选择 `steve-buddy-bridge`
5. 继续以上步骤

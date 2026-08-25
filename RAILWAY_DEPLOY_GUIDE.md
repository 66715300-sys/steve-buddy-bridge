# 🚀 Railway 部署完整指南

## ✅ 仓库状态确认

**通过 GitHub API 验证：**
- 仓库名称: steve-buddy-bridge
- 完整名称: 66715300-sys/steve-buddy-bridge
- 可见性: public（公开）✅
- URL: https://github.com/66715300-sys/steve-buddy-bridge

---

## 🔧 问题诊断

你在 Railway 搜索不到 `steve-buddy-bridge` 的原因：

**Railway 不会直接显示 GitHub 上的所有公开仓库，它只显示：**
1. 你授权过的 GitHub 账号下的仓库
2. 或者你 Fork 过的仓库

---

## 📱 解决方案（按顺序尝试）

### 方法 1：使用一键部署链接（最简单）

**点击这个链接：**
```
https://railway.com/new/template?repo=66715300-sys/steve-buddy-bridge
```

**步骤：**
1. 点击上面的链接
2. 如果用 GitHub 登录 Railway，点击 "Authorize Railway"
3. 授权后应该会自动跳转到选择仓库页面
4. 选择 `steve-buddy-bridge`
5. 点击 Deploy
6. 添加环境变量（见下文）

---

### 方法 2：手动授权 GitHub（推荐）

**步骤：**
1. 打开 Railway：https://railway.com
2. 点击右上角 **New Project**
3. 选择 **GitHub Repository**
4. 如果提示 **"Authorize Railway"**，点击它
5. 选择你的 GitHub 账号（66715300-sys）
6. 选择权限范围（选 All repositories 或 Just the ones you select）
7. 点击 Install
8. 返回 Railway，刷新页面
9. 点击 **GitHub Repository**
10. 搜索或选择 `steve-buddy-bridge`
11. 点击 **Deploy**

---

### 方法 3：从 GitHub 直接部署

**步骤：**
1. 打开 https://github.com/66715300-sys/steve-buddy-bridge
2. 点击仓库名右上角的 **"Fork"**（创建你自己的副本）
3. Fork 完成后，打开 Railway：https://railway.com
4. 点击 **New Project → GitHub Repository**
5. 现在应该能看到你 Fork 的仓库了
6. 选择并部署

---

## ⚙️ 添加环境变量（重要！）

部署开始后：

1. 在 Railway 项目页面，点击右上角 **Settings**
2. 点击 **Variables** 标签
3. 点击 **Add Variable**
4. 填写：
   - **Name:** `DEEPSEEK_API_KEY`
   - **Value:** `sk-e5c478f04a844e179d329411e594ddec`
5. 点击 **Save**

---

## 🌐 获取部署地址

部署成功后（绿色 ✅）：

1. 在项目主页顶部，复制 **Service URL**
   - 格式类似：`https://xxx-yyy.up.railway.app`
   - 或：`https://xxx-yyy.railway.app`

---

## 🎮 游戏内连接

在 Minecraft Bedrock 聊天框输入：

```
/connect wss://你的网址/ws/任意ID
```

**示例：**
```
/connect wss://steve-buddy-bridge.up.railway.app/ws/Steve
```

---

## 🔒 安全说明

- ✅ API Key 只存在 Railway 服务器上
- ✅ GitHub 仓库上看不到 API Key
- ✅ 你可以在 Railway 随时更改 API Key
- ✅ 仓库代码是公开的（不含 API Key）

---

## ❓ 常见问题

**Q: Railway 一直显示"找不到仓库"**
A: 确保你已经授权 Railway 访问你的 GitHub 账号。步骤：
1. 打开 https://github.com/settings/apps
2. 找到 Railway
3. 点击 Configure
4. 确保 steve-buddy-bridge 在允许访问的仓库列表中

**Q: 部署后还是连不上**
A: 检查：
1. API Key 是否正确添加
2. Railway 项目是否显示绿色 ✅（部署成功）
3. 手机和电脑是否在同一网络（如果是本地测试）

**Q: 想用本地测试怎么办**
A: 需要确保：
1. 电脑和手机在同一 WiFi
2. 电脑防火墙允许 8080 端口
3. 手机使用电脑的真实 IP（不是 localhost）


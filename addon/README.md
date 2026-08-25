# Steve Buddy Addon - 史蒂夫AI伙伴

Minecraft Bedrock 实体的 AI 伙伴 Addon，支持跟随、对话和表情。

## 📦 文件结构

```
addon/
├── manifest.json              # Addon 清单
├── entities/
│   └── steve_buddy.json       # 实体定义
└── scripts/
    └── steve_buddy.js         # 脚本逻辑
```

## 🎮 使用方法

### 1. 导入 Addon

在 Minecraft Bedrock 中：

1. 打开 **设置** → **资源包**
2. 点击 **我的资源包** → **导入**
3. 选择 `addon` 文件夹（压缩为 .mcpack）

### 2. 生成实体

在游戏中输入命令：

```
/give @s spawn_egg{EntityId:"steve:buddy"} 1
```

或使用：

```
/summon steve:buddy ~ ~ ~
```

### 3. 激活 Bridge 连接

运行桥接服务后，实体会自动接收指令。

## 🔧 支持的指令

通过 bridge 发送的 actions：

- `follow_player` - 跟随玩家
- `stop` - 停止跟随
- `go_to_position` - 移动到指定位置
- `give_item` - 给予物品
- `face` - 显示表情
- `say_emote` - 显示对话气泡

## 📝 版本历史

- v1.0.0 - 初始版本，支持基础跟随和对话

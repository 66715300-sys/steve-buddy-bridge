// Steve Buddy - Bedrock Script API 实现
// 实体的跟随、对话气泡、表情系统

const STEVE_BUDDY = {
  NAME: "steve:buddy",
  FOLLOW_RANGE: 8,
  STOP_DISTANCE: 2,
};

// 实体状态存储（脚本运行时会保留）
let entityStates = {};

// 初始化实体
function initEntity(entity) {
  const entityId = entity.getId();
  if (!entityStates[entityId]) {
    entityStates[entityId] = {
      isFollowing: false,
      targetPlayerId: null,
      lastUpdateTime: Date.now(),
      emotion: "normal", // normal, happy, excited
      dialogueBubble: "",
    };
  }
  
  // 设置实体属性
  entity.setNameTag("史蒂夫");
  entity.setNameTagVisible(true);
  entity.setGravity(true);
  entity.setHealth(20);
}

// 实体事件处理
function onEntitySpawned(entity) {
  initEntity(entity);
  const entityId = entity.getId();
  console.log(`[Steve Buddy] 实体生成: ${entityId}`);
  
  // 发送初始化消息
  entity.triggerScriptEvent("pntmc:verity_bridge", JSON.stringify({
    type: "init",
    entityId: entityId,
    message: "史蒂夫来了！和我对话吧~"
  }));
}

function onEntityDamage(entity, damage, source) {
  const entityId = entity.getId();
  const state = entityStates[entityId];
  
  if (state) {
    state.emotion = "hurt";
    setTimeout(() => {
      if (entityStates[entityId]) {
        entityStates[entityId].emotion = "normal";
      }
    }, 2000);
  }
}

function onEntityRemoved(entity) {
  const entityId = entity.getId();
  delete entityStates[entityId];
  console.log(`[Steve Buddy] 实体移除: ${entityId}`);
}

// 每帧更新逻辑
function onTick(entity,Δt) {
  const entityId = entity.getId();
  const state = entityStates[entityId];
  
  if (!state || !state.isFollowing) return;
  
  // 获取玩家位置（简化：取第一个玩家）
  const level = entity.getLevel();
  const players = level.getPlayers();
  
  if (players.length === 0) return;
  
  const targetPlayer = players[0];
  const playerPos = targetPlayer.getPos();
  
  // 计算距离
  const entityPos = entity.getPos();
  const distance = Math.sqrt(
    Math.pow(playerPos.x - entityPos.x, 2) +
    Math.pow(playerPos.z - entityPos.z, 2)
  );
  
  // 跟随逻辑
  if (distance > STEVE_BUDDY.FOLLOW_RANGE) {
    // 在范围外，快速移动
    moveToward(entity, targetPlayer, 0.4);
  } else if (distance < STEVE_BUDDY.STOP_DISTANCE) {
    // 太近了，后退
    moveAway(entity, targetPlayer, 0.2);
  } else {
    // 在范围内，保持位置
    stop(entity);
  }
}

// 移动到目标
function moveToward(entity, target, speed) {
  const entityPos = entity.getPos();
  const targetPos = target.getPos();
  
  const dx = targetPos.x - entityPos.x;
  const dz = targetPos.z - entityPos.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  
  if (length > 0) {
    const nx = dx / length;
    const ny = 0;
    const nz = dz / length;
    
    entity.setVelocity(nx * speed, ny, nz * speed);
  }
}

// 远离目标
function moveAway(entity, target, speed) {
  const entityPos = entity.getPos();
  const targetPos = target.getPos();
  
  const dx = entityPos.x - targetPos.x;
  const dz = entityPos.z - targetPos.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  
  if (length > 0) {
    const nx = dx / length;
    const ny = 0;
    const nz = dz / length;
    
    entity.setVelocity(nx * speed, ny, nz * speed);
  }
}

// 停止移动
function stop(entity) {
  entity.setVelocity(0, 0, 0);
}

// 处理指令
function onScriptEvent(entity, eventName, eventData) {
  const entityId = entity.getId();
  const state = entityStates[entityId];
  
  if (!state) return;
  
  try {
    const data = JSON.parse(eventData);
    
    switch (eventName) {
      case "steve:buddy":
        handleEntityCommand(entity, data);
        break;
      case "pntmc:verity_bridge":
        handleBridgeCommand(entity, data);
        break;
    }
  } catch (e) {
    console.error(`[Steve Buddy] 指令解析错误: ${e.message}`);
  }
}

// 处理实体指令
function handleEntityCommand(entity, data) {
  const entityId = entity.getId();
  const state = entityStates[entityId];
  
  if (!state) return;
  
  switch (data.action) {
    case "follow":
      state.isFollowing = true;
      state.targetPlayerId = data.target;
      showDialogue(entity, "好的！我来跟着你~");
      break;
      
    case "stop":
      state.isFollowing = false;
      state.targetPlayerId = null;
      stop(entity);
      showDialogue(entity, "好的，我停下了~");
      break;
      
    case "go_to":
      state.isFollowing = false;
      moveToPosition(entity, data.x, data.y, data.z);
      break;
      
    case "give":
      giveItem(entity, data.item, data.amount);
      break;
      
    case "emote":
      setEmotion(entity, data.type);
      break;
  }
}

// 处理 Bridge 指令
function handleBridgeCommand(entity, data) {
  const entityId = entity.getId();
  const state = entityStates[entityId];
  
  if (!state) return;
  
  // Bridge 发送的主要是对话消息
  if (data.reply) {
    showDialogue(entity, data.reply);
  }
  
  // 处理动作指令
  if (Array.isArray(data.actions)) {
    for (const action of data.actions) {
      switch (action.type) {
        case "follow_player":
          state.isFollowing = true;
          showDialogue(entity, "好的！");
          break;
        case "stop":
          state.isFollowing = false;
          stop(entity);
          break;
        case "build":
          showDialogue(entity, "我来帮你建造！");
          break;
        case "mine":
          showDialogue(entity, "挖矿去吧！");
          break;
      }
    }
  }
}

// 显示对话气泡
function showDialogue(entity, message) {
  // 使用 tellraw 显示气泡（通过命令方式）
  entity.triggerScriptEvent("say", message);
}

// 设置情绪
function setEmotion(entity, emotion) {
  const entityId = entity.getId();
  if (entityStates[entityId]) {
    entityStates[entityId].emotion = emotion;
  }
}

// 移动到指定位置
function moveToPosition(entity, x, y, z) {
  entity.setPos(x, y, z);
}

// 给予物品
function giveItem(entity, item, amount = 1) {
  const level = entity.getLevel();
  const players = level.getPlayers();
  
  if (players.length > 0) {
    players[0].addItem(item, amount);
  }
}

// 导出函数
module.exports = {
  onEntitySpawned,
  onEntityDamage,
  onEntityRemoved,
  onTick,
  onScriptEvent,
};

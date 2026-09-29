# 房间与关卡配置格式 v2

关卡从“定时刷波”改为“房间图”。

示例：

```json
{
  "floorId": "neon_kitchen_01",
  "theme": "neon_kitchen",
  "startRoom": "r01",
  "rooms": {
    "r01": {
      "type": "combat",
      "layout": "room_small_a",
      "enemies": [
        { "id": "glitch_rat", "count": 3 },
        { "id": "kitchen_bot", "count": 2 }
      ],
      "exits": ["r02"]
    },
    "r02": {
      "type": "reward",
      "layout": "reward_a",
      "rewardPool": "common_items",
      "exits": ["r03"]
    },
    "r03": {
      "type": "boss",
      "layout": "boss_wide_a",
      "boss": "pressure_cooker_king",
      "exits": []
    }
  }
}
```

## 房间完成条件

- combat：敌人清零
- elite：精英死亡
- reward：拾取或放弃奖励
- shop：离开商店
- event：完成事件
- boss：Boss 死亡

## 房间只负责数据

运行逻辑由 RoomSystem / CombatSystem / DropSystem 驱动，避免把敌人和掉落写死在主循环里。

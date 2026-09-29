# 关卡配置格式

关卡尽量数据驱动，避免把刷怪节奏写死在代码中。

示例：

\`\`\`json
{
  "id": "park_001",
  "name": "幸福公园",
  "duration": 180,
  "arena": "park_round_01",
  "scenery": "park_sunset",
  "waves": [
    { "time": 0, "enemy": "purple_basic", "count": 8 },
    { "time": 20, "enemy": "cone_runner", "count": 6 },
    { "time": 45, "enemy": "demolition_tank", "count": 2 }
  ],
  "boss": { "time": 150, "enemy": "chef_boss_01" },
  "dropTable": "park_normal"
}
\`\`\`

后续关卡只更换 arena、scenery、wave、boss 和 dropTable，即可复用同一套战斗系统。

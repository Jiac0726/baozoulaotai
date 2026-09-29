# 美术素材规范

## 总原则

最终游戏素材必须从概念大图拆成独立透明 PNG 或 Sprite Sheet，不直接把整张 AI 概念图作为游戏场景。

## 目录

- assets/player：主角动作
- assets/enemies：普通敌人
- assets/boss：Boss
- assets/skills：技能图标与技能主体
- assets/effects：命中、爆炸、预警、拖尾
- assets/drops：金币、EXP、技能球、宝箱等
- assets/arena：中央战斗底板
- assets/scenery：四周布景
- assets/ui：HUD、按钮、面板

## 主角动作

idle / run_8dir / attack / skill / dash / hurt / knockdown / death / pickup。

建议所有同类动作保持统一画布、锚点和角色脚底中心点。

## 场景分层

1. arena_base：纯战斗地面。
2. arena_marks：裂纹、污渍、冰冻、烧焦。
3. scenery_back：远景与天空。
4. scenery_side：树、摊位、路灯、花坛等四周布景。
5. foreground：可遮挡角色的近景。
6. obstacle：真正参与碰撞的障碍物。

## 战斗反馈

技能至少拆为：起手 / 飞行体或主体 / 命中 / 持续 / 消散。敌方攻击必须有红圈、扇形、直线或落点预警。

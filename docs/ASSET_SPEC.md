# 美术素材规范 v2

## 总方向

低分辨率像素美术，高对比霓虹灯光，避免高清 3D 卡通渲染直接进入游戏。

核心关键词：

- 硬像素边缘
- 少渐变
- 强轮廓
- 深色环境
- 紫 / 蓝 / 粉 / 红霓虹高光
- 发光掉落物
- 夸张命中闪光

## 推荐基准

- 角色基础高度：48~64 px
- 小怪：32~56 px
- Boss：96~160 px
- 图标：32 / 48 / 64 px
- 场景瓦片：16 或 32 px 网格
- 最近邻缩放，不使用平滑插值

## 主角 Sprite

至少：

- idle
- run
- jump
- fall
- land
- shoot
- melee
- dash
- hurt
- death

横版以左右两个方向为主，另一方向优先镜像处理。

## 场景分层

1. background：远景霓虹城市/地下设施
2. midground：墙体、招牌、管线
3. platforms：真正碰撞平台
4. props：桌椅、厨具、机器
5. foreground：近景遮挡
6. fx：霓虹、烟雾、蒸汽、闪烁灯

## UI

- 像素边框
- 深色面板
- 荧光描边
- 小地图
- 血量 / 护盾
- 武器栏
- 道具栏
- 金币
- 房间奖励弹窗

## 运行时目录

- assets/player
- assets/enemies
- assets/boss
- assets/weapons
- assets/items
- assets/effects
- assets/rooms
- assets/tiles
- assets/ui

原始 AI 概念图继续保存在 `assets/reference`，仅用于拆分和风格参考。

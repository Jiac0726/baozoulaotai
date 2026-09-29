const config = require("./config/gameConfig");
const Input = require("./core/Input");
const Player = require("./entities/Player");
const CombatSystem = require("./systems/CombatSystem");
const RoomSystem = require("./systems/RoomSystem");

const canvas = wx.createCanvas();
const ctx = canvas.getContext("2d");
const info = wx.getSystemInfoSync();

canvas.width = info.windowWidth;
canvas.height = info.windowHeight;

const w = canvas.width;
const h = canvas.height;

const world = {
  left: config.world.roomPadding,
  right: w - config.world.roomPadding,
  floorY: h - config.world.floorHeight
};

const input = new Input(canvas);
const player = new Player(world.left + 44, world.floorY - config.player.height);
const combat = new CombatSystem();
const roomSystem = new RoomSystem(world);
const enemies = [];

let last = Date.now();
let runComplete = false;

roomSystem.enter(enemies, player);

function update(dt) {
  if (runComplete) return;

  player.update(dt, input, world);
  combat.update(dt, player, enemies, input, world);
  roomSystem.update(enemies);

  if (roomSystem.canExit(player)) {
    runComplete = roomSystem.next(enemies, player);
  }

  if (player.hp <= 0) {
    player.hp = player.maxHp;
    roomSystem.index = 0;
    combat.kills = 0;
    runComplete = false;
    roomSystem.enter(enemies, player);
  }
}

function rect(x, y, width, height, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);
}

function text(str, x, y, size = 16, color = config.colors.text, align = "left") {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(str, x, y);
}

function renderBackground() {
  rect(0, 0, w, h, config.colors.background);

  // 简易霓虹远景占位
  for (let i = 0; i < 12; i++) {
    const bw = 24 + (i % 4) * 9;
    const bh = 50 + (i % 5) * 18;
    const bx = i * (w / 11) - 10;
    rect(bx, world.floorY - bh - 20, bw, bh, i % 2 ? "#18152A" : "#201A38");
    if (i % 2 === 0) {
      rect(bx + 7, world.floorY - bh - 6, 4, 4, config.colors.neonPink);
      rect(bx + 15, world.floorY - bh + 9, 4, 4, config.colors.neonBlue);
    }
  }

  // 房间墙体和地板
  rect(world.left, 76, world.right - world.left, world.floorY - 76, config.colors.room);
  rect(world.left, world.floorY, world.right - world.left, h - world.floorY, config.colors.platform);

  ctx.strokeStyle = config.colors.neonPurple;
  ctx.lineWidth = 3;
  ctx.strokeRect(world.left, 76, world.right - world.left, world.floorY - 76);

  // 右侧出口
  const doorColor = roomSystem.cleared ? config.colors.neonBlue : "#4A445C";
  rect(world.right - 24, world.floorY - 82, 18, 82, doorColor);
}

function renderEntities() {
  // 子弹
  for (const b of combat.bullets) {
    rect(b.x, b.y, b.w, b.h, config.colors.neonYellow);
  }

  // 敌人
  for (const e of enemies) {
    const c = e.type === "runner"
      ? config.colors.neonPink
      : e.type === "tank"
        ? "#C34FFF"
        : config.colors.enemy;

    rect(e.x, e.y, e.w, e.h, c);
    rect(e.x + 6, e.y + 8, 5, 5, "#FFFFFF");
    rect(e.x + e.w - 11, e.y + 8, 5, 5, "#FFFFFF");
  }

  // 玩家
  const playerColor = player.invuln > 0 ? "#FF8EA8" : config.colors.player;
  rect(player.x, player.y, player.w, player.h, playerColor);
  rect(player.x + (player.facing > 0 ? player.w - 6 : 2), player.y + 14, 5, 5, config.colors.neonPink);
}

function renderHud() {
  text("暴走老太", 20, 28, 20, config.colors.neonPink);
  text(`房间 ${roomSystem.index + 1}/${roomSystem.rooms.length}`, 20, 50, 14);
  text(`击败 ${combat.kills}`, 20, 70, 13, config.colors.muted);

  for (let i = 0; i < player.maxHp; i++) {
    rect(w - 24 - i * 22, 18, 15, 12, i < player.hp ? "#FF4F68" : "#3B334B");
  }

  const room = roomSystem.current();
  text(
    room.type === "boss" ? "BOSS 房" : room.type === "reward" ? "奖励房" : "战斗房",
    w / 2,
    28,
    16,
    room.type === "boss" ? config.colors.neonPink : config.colors.neonBlue,
    "center"
  );

  if (roomSystem.cleared) {
    text("房间已清空 →", world.right - 12, 66, 14, config.colors.neonYellow, "right");
    if (roomSystem.reward) {
      text(roomSystem.reward.name, w / 2, 55, 15, config.colors.neonYellow, "center");
      text(roomSystem.reward.desc, w / 2, 73, 11, config.colors.muted, "center");
    }
  }

  // 触控区域提示
  ctx.globalAlpha = 0.22;
  rect(14, h - 92, 62, 62, "#FFFFFF");
  rect(82, h - 92, 62, 62, "#FFFFFF");
  rect(w - 150, h - 92, 62, 62, config.colors.neonBlue);
  rect(w - 78, h - 92, 62, 62, config.colors.neonPink);
  ctx.globalAlpha = 1;

  text("←", 45, h - 53, 24, "#FFFFFF", "center");
  text("→", 113, h - 53, 24, "#FFFFFF", "center");
  text("跳", w - 119, h - 54, 18, "#FFFFFF", "center");
  text("射", w - 47, h - 54, 18, "#FFFFFF", "center");
}

function render() {
  renderBackground();
  renderEntities();
  renderHud();

  if (runComplete) {
    rect(0, 0, w, h, "rgba(0,0,0,.68)");
    text("本层完成", w / 2, h / 2 - 8, 30, config.colors.neonYellow, "center");
    text("横版房间制原型已跑通", w / 2, h / 2 + 24, 15, "#FFFFFF", "center");
  }
}

function loop() {
  const now = Date.now();
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

loop();

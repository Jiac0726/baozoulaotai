// 横版场景渲染套件：主界面 / 战斗场景 / 空房间场景 / 商店场景
// 全部使用程序化像素色块绘制，不依赖图片资源。
const config = require("../config/gameConfig");

/* ---------- 基础图元 ---------- */
function rect(ctx, x, y, ww, hh, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(ww)), Math.max(1, Math.round(hh)));
}
function strokeRect(ctx, x, y, ww, hh, color, line) {
  ctx.strokeStyle = color;
  ctx.lineWidth = line || 2;
  ctx.strokeRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh));
}
function text(ctx, str, x, y, size, color, align) {
  ctx.fillStyle = color;
  ctx.font = "bold " + (size || 15) + "px sans-serif";
  ctx.textAlign = align || "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(String(str), Math.round(x), Math.round(y));
}
function alphaRect(ctx, x, y, ww, hh, fill, a) {
  ctx.save();
  ctx.globalAlpha = a;
  rect(ctx, x, y, ww, hh, fill);
  ctx.restore();
}
// 伪随机（确定性，保证每帧一致）
function hash(i) {
  const s = Math.sin(i * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
// 像素化光晕：同心矩形叠透明度
function glow(ctx, cx, cy, r, color, a) {
  ctx.save();
  for (let i = 4; i >= 1; i--) {
    ctx.globalAlpha = a;
    rect(ctx, cx - (r * i) / 4, cy - (r * i) / 4, (r * i) / 2, (r * i) / 2, color);
  }
  ctx.restore();
}
// 斜向光柱
function lightBeam(ctx, x, y, len, width, color, a, slant) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = color;
  for (let i = 0; i < Math.round(len / 4); i++) {
    ctx.fillRect(Math.round(x + i * slant), Math.round(y + i * 4), Math.round(width), 4);
  }
  ctx.restore();
}

/* ---------- 角色与生物 ---------- */
// 像素老奶奶：x,y 为脚底中心，s 为缩放
function drawGrandma(ctx, x, y, s, facing) {
  const f = facing || 1;
  const u = 4 * s; // 像素单位
  const px = (dx, dy, dw, dh, c) => rect(ctx, x + dx * u * f - (f < 0 ? dw * u : 0), y - (dy + dh) * u, dw * u, dh * u, c);
  // 腿脚
  px(-2.4, 0, 1.7, 1.5, "#3B2B66");
  px(0.7, 0, 1.7, 1.5, "#3B2B66");
  px(-2.7, 0, 2.2, 0.5, "#241A45");
  px(0.5, 0, 2.2, 0.5, "#241A45");
  // 裙子
  px(-3.2, 1.3, 6.4, 5.2, "#7B4BC9");
  px(-2.2, 1.8, 4.4, 3.4, "#9A6BE0");
  // 围裙
  px(-1.6, 1.6, 3.2, 3.4, "#F1E7D2");
  // 手臂
  px(-4.2, 4.6, 1.4, 3.2, "#7B4BC9");
  px(2.8, 4.6, 1.4, 3.2, "#7B4BC9");
  px(-4.2, 3.9, 1.4, 1.1, "#F8F2E7");
  px(2.8, 3.9, 1.4, 1.1, "#F8F2E7");
  // 锅铲（武器）
  px(3.6, 5.2, 0.8, 6.2, "#B98955");
  px(3.2, 11.2, 2.6, 1.8, "#C9C4DD");
  // 头
  px(-2.6, 6.5, 5.2, 4.6, "#F8F2E7");
  // 头发 + 发髻
  px(-2.9, 10.2, 5.8, 1.7, "#EDE6F5");
  px(1.6, 11.4, 2.2, 2.0, "#EDE6F5");
  px(-3.1, 8.6, 1.2, 2.0, "#EDE6F5");
  // 眼镜 + 眼睛
  px(0.2, 8.6, 1.9, 1.3, config.colors.neonPink);
  px(-2.0, 8.6, 1.9, 1.3, config.colors.neonPink);
  px(0.6, 8.9, 0.9, 0.7, "#241A45");
  px(-1.5, 8.9, 0.9, 0.7, "#241A45");
  // 嘴
  px(-0.5, 7.2, 1.4, 0.5, "#B98955");
}

// 小怪：x,y 为脚底中心
function drawMonster(ctx, x, y, s, color) {
  const u = 4 * s;
  rect(ctx, x - 3 * u, y - 5.2 * u, 6 * u, 5.2 * u, color);
  rect(ctx, x - 2.2 * u, y - 6.8 * u, 4.4 * u, 1.8 * u, color);
  // 角
  rect(ctx, x - 2.6 * u, y - 8.0 * u, 0.9 * u, 1.4 * u, "#FFE76A");
  rect(ctx, x + 1.7 * u, y - 8.0 * u, 0.9 * u, 1.4 * u, "#FFE76A");
  // 眼
  rect(ctx, x - 1.7 * u, y - 4.2 * u, 1.1 * u, 1.1 * u, "#FFFFFF");
  rect(ctx, x + 0.6 * u, y - 4.2 * u, 1.1 * u, 1.1 * u, "#FFFFFF");
  rect(ctx, x - 1.3 * u, y - 3.9 * u, 0.5 * u, 0.5 * u, "#241A45");
  rect(ctx, x + 1.0 * u, y - 3.9 * u, 0.5 * u, 0.5 * u, "#241A45");
  // 脚
  rect(ctx, x - 2.4 * u, y - 0.9 * u, 1.6 * u, 0.9 * u, "#241A45");
  rect(ctx, x + 0.8 * u, y - 0.9 * u, 1.6 * u, 0.9 * u, "#241A45");
}

// 店主：站在柜台后，x,y 为脚底中心
function drawShopkeeper(ctx, x, y, s) {
  const u = 4 * s;
  rect(ctx, x - 2.6 * u, y - 6.0 * u, 5.2 * u, 6.0 * u, "#3E6B57"); // 外套
  rect(ctx, x - 1.7 * u, y - 4.6 * u, 3.4 * u, 3.2 * u, "#F1E7D2"); // 围裙
  rect(ctx, x - 2.2 * u, y - 9.8 * u, 4.4 * u, 3.9 * u, "#F8F2E7"); // 头
  rect(ctx, x - 2.6 * u, y - 10.9 * u, 5.2 * u, 1.4 * u, "#EDE6F5"); // 帽
  rect(ctx, x - 3.0 * u, y - 9.9 * u, 1.1 * u, 1.6 * u, "#EDE6F5");
  rect(ctx, x - 1.6 * u, y - 8.5 * u, 1.4 * u, 1.0 * u, config.colors.neonBlue); // 眼镜
  rect(ctx, x + 0.3 * u, y - 8.5 * u, 1.4 * u, 1.0 * u, config.colors.neonBlue);
  rect(ctx, x - 0.6 * u, y - 7.3 * u, 1.3 * u, 0.5 * u, "#B98955"); // 嘴
  rect(ctx, x + 3.1 * u, y - 5.4 * u, 1.2 * u, 2.6 * u, "#3E6B57"); // 手臂
  rect(ctx, x + 3.1 * u, y - 6.1 * u, 1.2 * u, 1.0 * u, "#F8F2E7");
}

/* ---------- 环境部件 ---------- */
function buildingLayer(ctx, w, baseY, seed, color, winColor, count, hMin, hMax) {
  const bw = w / count;
  for (let i = 0; i < count; i++) {
    const bh = hMin + hash(seed + i) * (hMax - hMin);
    const bx = i * bw + hash(seed + i * 3) * bw * 0.18;
    rect(ctx, bx, baseY - bh, bw * 0.84, bh, color);
    if (hash(seed + i * 7) > 0.72) rect(ctx, bx + bw * 0.36, baseY - bh - 12, 3, 12, color);
    for (let wy = baseY - bh + 12; wy < baseY - 14; wy += 16) {
      for (let wx = bx + 7; wx < bx + bw * 0.84 - 9; wx += 14) {
        const lit = hash(seed + i * 31 + wy * 0.13 + wx * 0.07);
        if (lit > 0.62) rect(ctx, wx, wy, 5, 7, lit > 0.88 ? winColor : "#2A2350");
      }
    }
  }
}

function drawSigns(ctx, layout, world) {
  const roomW = world.right - world.left;
  const roomH = world.floorY - 76;
  (layout.signs || []).forEach((s) => {
    const x = world.left + s.x * roomW;
    const y = 76 + s.y * roomH;
    const bw = Math.max(120, s.text.length * 15);
    alphaRect(ctx, x - bw / 2 - 8, y - 20, bw + 16, 28, "#0C0A18", 0.82);
    strokeRect(ctx, x - bw / 2 - 8, y - 20, bw + 16, 28, s.color || config.colors.neonBlue, 2);
    text(ctx, s.text, x, y, 13, s.color || config.colors.neonBlue, "center");
    glow(ctx, x, y - 6, 34, s.color || config.colors.neonBlue, 0.05);
  });
}

function drawProps(ctx, layout, world, opt) {
  const roomW = world.right - world.left;
  const roomH = world.floorY - 76;
  (layout.props || []).forEach((prop) => {
    const x = world.left + prop.x * roomW;
    const y = 76 + prop.y * roomH - prop.h;

    if (prop.type === "crate") {
      rect(ctx, x, y, prop.w, prop.h, "#5A3D2B");
      strokeRect(ctx, x, y, prop.w, prop.h, "#B98955", 2);
      strokeRect(ctx, x + 7, y + 7, prop.w - 14, prop.h - 14, "#7E5737", 2);
    } else if (prop.type === "machine") {
      rect(ctx, x, y, prop.w, prop.h, "#25283B");
      strokeRect(ctx, x, y, prop.w, prop.h, config.colors.neonBlue, 2);
      rect(ctx, x + 10, y + 10, prop.w - 20, 16, "#111827");
      rect(ctx, x + 14, y + 14, 8, 8, config.colors.neonPink);
      rect(ctx, x + 28, y + 14, 8, 8, config.colors.neonYellow);
    } else if (prop.type === "tank") {
      rect(ctx, x, y, prop.w, prop.h, "#323247");
      strokeRect(ctx, x, y, prop.w, prop.h, "#7563A8", 3);
      rect(ctx, x + prop.w * 0.42, y - 12, prop.w * 0.16, 12, "#51496A");
      rect(ctx, x + 10, y + 18, prop.w - 20, 8, config.colors.neonPurple);
    } else if (prop.type === "pipe") {
      rect(ctx, x, y, prop.w, prop.h, "#3C4054");
      rect(ctx, x, y + 4, prop.w, 4, "#6B708C");
      rect(ctx, x + 18, y - 10, 12, prop.h + 20, "#313548");
    } else if (prop.type === "counter") {
      rect(ctx, x, y, prop.w, prop.h, "#3A2D3F");
      strokeRect(ctx, x, y, prop.w, prop.h, "#7D5C86", 2);
      rect(ctx, x, y, prop.w, 7, config.colors.neonPink);
      if (opt && opt.keeper) drawShopkeeper(ctx, x + prop.w / 2, y, 1.1);
      if (opt && opt.goods) {
        // 柜台上的小商品
        for (let i = 0; i < 3; i++) {
          const gx = x + 14 + i * (prop.w - 28) / 3;
          rect(ctx, gx, y - 14, 12, 14, [config.colors.neonYellow, config.colors.neonBlue, config.colors.neonPink][i]);
          rect(ctx, gx + 3, y - 18, 6, 4, "#FFFFFF");
        }
      }
    } else if (prop.type === "shelf") {
      rect(ctx, x, y, prop.w, prop.h, "#2C2A3B");
      strokeRect(ctx, x, y, prop.w, prop.h, "#615875", 2);
      for (let sy = 18; sy < prop.h; sy += 26) {
        rect(ctx, x + 5, y + sy, prop.w - 10, 4, "#514A63");
        if (opt && opt.goods) {
          // 货架商品
          for (let gx = x + 10; gx < x + prop.w - 14; gx += 20) {
            const pick = Math.floor(hash(gx + sy) * 4);
            rect(ctx, gx, y + sy - 14, 11, 14,
              [config.colors.neonYellow, config.colors.neonPink, config.colors.neonBlue, "#5CFF8A"][pick]);
            rect(ctx, gx + 2, y + sy - 18, 7, 4, "rgba(255,255,255,.55)");
          }
        }
      }
    } else if (prop.type === "vent") {
      rect(ctx, x, y, prop.w, prop.h, "#252838");
      strokeRect(ctx, x, y, prop.w, prop.h, "#656B82", 2);
      for (let vx = 8; vx < prop.w - 5; vx += 9) rect(ctx, x + vx, y + 6, 3, prop.h - 12, "#11131D");
    }
  });
}

function drawPlatforms(ctx, platforms) {
  platforms.forEach((p, i) => {
    rect(ctx, p.x, p.y, p.w, p.h, "#343048");
    rect(ctx, p.x, p.y, p.w, 4, i % 2 ? config.colors.neonBlue : config.colors.neonPink);
    for (let sx = p.x + 8; sx < p.x + p.w - 5; sx += 18) rect(ctx, sx, p.y + p.h, 3, 8, "#272337");
  });
}

// 吊灯 + 地面光池
function hangingLamp(ctx, x, topY, poolY, color) {
  rect(ctx, x - 2, topY, 4, 18, "#3A3452");
  rect(ctx, x - 16, topY + 18, 32, 10, "#4B4468");
  rect(ctx, x - 12, topY + 28, 24, 5, color);
  glow(ctx, x, topY + 30, 26, color, 0.07);
  // 光锥
  lightBeam(ctx, x - 26, topY + 34, poolY - topY - 34, 52, color, 0.045, 0);
  // 光池
  for (let i = 3; i >= 1; i--) {
    alphaRect(ctx, x - 18 * i, poolY - 6, 36 * i, 10, color, 0.05);
  }
}

function dustMotes(ctx, w, y0, y1, t, count, color) {
  for (let i = 0; i < count; i++) {
    const dx = (hash(i * 3) * w + t * (6 + hash(i) * 8)) % w;
    const dy = y0 + hash(i * 11) * (y1 - y0) + Math.sin(t * 0.8 + i) * 6;
    alphaRect(ctx, dx, dy, 3, 3, color, 0.22 + hash(i * 5) * 0.3);
  }
}

/* ---------- 场景一：主界面 ---------- */
function menuScene(o) {
  const { ctx, w, h, world, time } = o;
  const t = time || 0;
  const horizon = world.floorY;

  // 夜空渐层
  const sky = ["#0A0818", "#0D0B20", "#120E2A", "#181234", "#221745", "#2C1C55"];
  sky.forEach((c, i) => rect(ctx, 0, (horizon * i) / sky.length, w, horizon / sky.length + 1, c));

  // 星星
  for (let i = 0; i < 52; i++) {
    const sx = (hash(i) * w + t * (2 + hash(i + 3) * 3)) % w;
    const sy = hash(i + 99) * horizon * 0.58;
    const big = hash(i + 7) > 0.8;
    alphaRect(ctx, sx, sy, big ? 3 : 2, big ? 3 : 2, big ? "#FFE9C9" : "#8F86C9", 0.5 + 0.5 * Math.abs(Math.sin(t * 1.4 + i)));
  }

  // 月亮
  const mx = w * 0.78, my = horizon * 0.22, mr = Math.min(w, h) * 0.085;
  glow(ctx, mx, my, mr * 3.2, "#FFE76A", 0.05);
  rect(ctx, mx - mr, my - mr * 0.72, mr * 2, mr * 1.44, "#F6D98A");
  rect(ctx, mx - mr * 0.5, my - mr * 0.28, mr * 0.5, mr * 0.3, "#E2BE72");
  rect(ctx, mx + mr * 0.18, my + mr * 0.12, mr * 0.44, mr * 0.3, "#E2BE72");

  // 远景楼群（两层）
  buildingLayer(ctx, w, horizon - 26, 11, "#141126", "#35D7FF", 12, h * 0.14, h * 0.32);
  buildingLayer(ctx, w, horizon, 37, "#1E1732", "#FF4FD8", 9, h * 0.18, h * 0.42);

  // 地面
  rect(ctx, 0, horizon, w, h - horizon, "#201B33");
  rect(ctx, 0, horizon, w, 3, config.colors.neonPurple);
  for (let i = 0; i < 22; i++) {
    const gx = hash(i * 5) * w;
    rect(ctx, gx, horizon + 10 + hash(i * 9) * (h - horizon - 16), 16 + hash(i) * 34, 2, hash(i + 3) > 0.5 ? "#2C2547" : "#171226");
  }

  // 光柱氛围
  lightBeam(ctx, w * 0.30, 0, horizon * 0.86, 42, config.colors.neonPurple, 0.05, 0.16);
  lightBeam(ctx, w * 0.52, 0, horizon * 0.86, 30, config.colors.neonBlue, 0.045, -0.12);

  // 左侧主角
  const gs = Math.max(1.5, Math.min(2.4, h / 260));
  drawGrandma(ctx, w * 0.155, horizon, gs, 1);
  glow(ctx, w * 0.155, horizon - 20 * gs, 60, config.colors.neonPink, 0.05);

  // 右侧怪物围观
  drawMonster(ctx, w * 0.845, horizon, gs * 0.82, "#9B4DFF");
  drawMonster(ctx, w * 0.925, horizon, gs * 0.62, config.colors.neonPink);
  drawMonster(ctx, w * 0.755, horizon, gs * 0.5, "#5CFF8A");

  // 漂浮技能球
  for (let i = 0; i < 5; i++) {
    const ox = w * (0.36 + i * 0.075);
    const oy = horizon * 0.58 + Math.sin(t * 1.1 + i * 1.7) * 12;
    glow(ctx, ox, oy, 16, [config.colors.neonYellow, config.colors.neonBlue, config.colors.neonPink][i % 3], 0.10);
    rect(ctx, ox - 5, oy - 5, 10, 10, [config.colors.neonYellow, config.colors.neonBlue, config.colors.neonPink][i % 3]);
    rect(ctx, ox - 2, oy - 2, 4, 4, "#FFFFFF");
  }

  // 标题氛围框（文字由上层绘制，位置与菜单文字布局一致）
  alphaRect(ctx, w / 2 - 190, h / 2 - 138, 380, 104, "#0C0A18", 0.32);
  strokeRect(ctx, w / 2 - 190, h / 2 - 138, 380, 104, "#3A2B66", 2);
  rect(ctx, w / 2 - 190, h / 2 - 138, 60, 3, config.colors.neonPink);
  rect(ctx, w / 2 + 130, h / 2 - 37, 60, 3, config.colors.neonBlue);

  // 底部暗角
  alphaRect(ctx, 0, h - 60, w, 60, "#05040C", 0.5);
}

/* ---------- 场景二：战斗场景 ---------- */
function battleScene(o) {
  const { ctx, w, h, world, layout, platforms, time } = o;
  const t = time || 0;
  const roomW = world.right - world.left;
  const roomH = world.floorY - 76;

  // 墙体
  rect(ctx, world.left, 76, roomW, roomH, "#191430");
  for (let gx = 0; gx < 8; gx++) {
    for (let gy = 0; gy < 4; gy++) {
      const px = world.left + gx * (roomW / 8);
      const py = 76 + gy * (roomH / 4);
      strokeRect(ctx, px, py, roomW / 8, roomH / 4, "#221C3D", 1);
      rect(ctx, px + 4, py + 4, 3, 3, "#2E2650"); // 铆钉
      rect(ctx, px + roomW / 8 - 7, py + 4, 3, 3, "#2E2650");
    }
  }
  // 顶部钢梁 + 警戒条纹
  rect(ctx, world.left, 76, roomW, 22, "#241D3F");
  for (let i = 0; i < roomW / 40; i++) {
    rect(ctx, world.left + i * 40 + (i % 2) * 12, 82, 24, 8, i % 2 ? "#FFE76A" : "#241D3F");
  }

  // 墙面灯带
  rect(ctx, world.left + 18, 104, roomW - 36, 3, "#302553");
  rect(ctx, world.left + 18, 108, roomW * 0.28, 2, config.colors.neonBlue);
  rect(ctx, world.right - roomW * 0.25 - 18, 108, roomW * 0.25, 2, config.colors.neonPink);

  // 吊灯
  hangingLamp(ctx, world.left + roomW * 0.28, 76, world.floorY, config.colors.neonYellow);
  hangingLamp(ctx, world.left + roomW * 0.72, 76, world.floorY, config.colors.neonYellow);

  // 顶部警报灯（闪烁）
  const blink = 0.35 + 0.35 * Math.abs(Math.sin(t * 2.6));
  [world.left + 26, world.right - 26].forEach((bx) => {
    glow(ctx, bx, 108, 30, "#FF315B", blink * 0.16);
    rect(ctx, bx - 7, 101, 14, 12, "#FF315B");
    rect(ctx, bx - 3, 103, 6, 5, "#FFB3C0");
  });

  // 地面出怪点
  for (let i = 0; i < 3; i++) {
    const sx = world.left + roomW * (0.24 + i * 0.26);
    const pulse = 0.35 + 0.3 * Math.abs(Math.sin(t * 2 + i * 1.3));
    alphaRect(ctx, sx - 34, world.floorY - 10, 68, 10, "#FF315B", pulse * 0.35);
    strokeRect(ctx, sx - 34, world.floorY - 10, 68, 10, "#FF315B", 2);
    for (let d = 0; d < 3; d++) {
      alphaRect(ctx, sx - 22 + d * 16, world.floorY - 26 - (d % 2) * 8, 4, 12, "#FF6B80", 0.35 + 0.3 * Math.sin(t * 3 + d));
    }
  }

  // 标牌 / 道具 / 高台
  drawSigns(ctx, layout, world);
  drawProps(ctx, layout, world, null);
  drawPlatforms(ctx, platforms);

  // 尘埃火星
  dustMotes(ctx, roomW, 110, world.floorY - 20, t, 14, "#FF8B5C");
}

/* ---------- 场景三：空房间场景 ---------- */
function emptyScene(o) {
  const { ctx, w, h, world, layout, platforms, time } = o;
  const t = time || 0;
  const roomW = world.right - world.left;
  const roomH = world.floorY - 76;

  // 安静墙面
  rect(ctx, world.left, 76, roomW, roomH, "#1B1730");
  for (let gy = 0; gy < 4; gy++) {
    rect(ctx, world.left, 76 + gy * (roomH / 4), roomW, 1, "#221C3D");
  }
  rect(ctx, world.left, 76, roomW, 18, "#221B3B");

  // 高窗 + 光柱
  for (let i = 0; i < 2; i++) {
    const wx = world.left + roomW * (0.30 + i * 0.40);
    rect(ctx, wx - 34, 104, 68, 40, "#2A2148");
    strokeRect(ctx, wx - 34, 104, 68, 40, "#4B3D7E", 2);
    rect(ctx, wx - 30, 108, 60, 32, "#5A4B96");
    rect(ctx, wx - 2, 108, 4, 32, "#2A2148");
    rect(ctx, wx - 30, 122, 60, 4, "#2A2148");
    // 光柱斜洒
    lightBeam(ctx, wx - 20, 144, world.floorY - 160, 46, "#8F7BFF", 0.05, 0.10);
    for (let p = 2; p >= 1; p--) {
      alphaRect(ctx, wx - 20 + (world.floorY - 160) * 0.10 - 18 * p, world.floorY - 12, 36 * p, 12, "#8F7BFF", 0.05);
    }
  }

  // 安静灯带
  rect(ctx, world.left + 18, 96, roomW - 36, 2, "#2E2550");
  rect(ctx, world.left + 18, 96, roomW * 0.18, 2, config.colors.neonBlue);

  // 长椅（空房间休息感）
  const bx = world.left + roomW * 0.50, by = world.floorY - 46;
  rect(ctx, bx - 56, by, 112, 10, "#5A4A2E");
  rect(ctx, bx - 56, by - 30, 112, 8, "#6B5836");
  rect(ctx, bx - 50, by + 10, 8, 26, "#453722");
  rect(ctx, bx + 42, by + 10, 8, 26, "#453722");
  rect(ctx, bx - 56, by - 30, 8, 40, "#453722");
  rect(ctx, bx + 48, by - 30, 8, 40, "#453722");

  // 盆栽
  const plx = world.left + roomW * 0.86;
  rect(ctx, plx - 14, world.floorY - 22, 28, 22, "#7E5737");
  rect(ctx, plx - 10, world.floorY - 18, 20, 14, "#5A3D2B");
  rect(ctx, plx - 3, world.floorY - 52, 6, 32, "#2F6B3F");
  rect(ctx, plx - 18, world.floorY - 48, 16, 8, "#3E8A52");
  rect(ctx, plx + 3, world.floorY - 58, 16, 8, "#3E8A52");
  rect(ctx, plx - 14, world.floorY - 64, 14, 8, "#5CFF8A");

  // 标牌 / 布局道具 / 高台
  drawSigns(ctx, layout, world);
  drawProps(ctx, layout, world, null);
  drawPlatforms(ctx, platforms);

  // 缓慢漂浮的尘埃
  dustMotes(ctx, roomW, 120, world.floorY - 30, t * 0.5, 18, "#B8B2D5");
}

/* ---------- 场景四：商店场景 ---------- */
function shopScene(o) {
  const { ctx, w, h, world, layout, platforms, time } = o;
  const t = time || 0;
  const roomW = world.right - world.left;
  const roomH = world.floorY - 76;

  // 暖色墙面 + 瓷砖
  rect(ctx, world.left, 76, roomW, roomH, "#2A2138");
  for (let gy = 0; gy < 5; gy++) {
    for (let gx = 0; gx < 10; gx++) {
      strokeRect(ctx, world.left + gx * (roomW / 10), 76 + gy * (roomH / 5), roomW / 10, roomH / 5, "#332742", 1);
    }
  }
  rect(ctx, world.left, 76, roomW, 20, "#3A2B47");

  // 霓虹招牌（带辉光）
  const signX = world.left + roomW * 0.5, signY = 118;
  const flicker = 0.72 + 0.28 * Math.abs(Math.sin(t * 5 + Math.sin(t * 13)));
  glow(ctx, signX, signY - 6, 130, config.colors.neonYellow, 0.06 * flicker);
  rect(ctx, signX - 128, signY - 28, 256, 44, "#171022");
  strokeRect(ctx, signX - 128, signY - 28, 256, 44, config.colors.neonYellow, 3);
  rect(ctx, signX - 118, signY - 20, 8, 28, config.colors.neonPink);
  rect(ctx, signX + 110, signY - 20, 8, 28, config.colors.neonBlue);
  text(ctx, "LATE SHOP 深夜小卖部", signX, signY, 17, config.colors.neonYellow, "center");

  // 吊灯（暖光）
  hangingLamp(ctx, world.left + roomW * 0.24, 76, world.floorY, "#FFB85C");
  hangingLamp(ctx, world.left + roomW * 0.76, 76, world.floorY, "#FFB85C");

  // 货架与柜台（带商品与店主）
  drawProps(ctx, layout, world, { goods: true, keeper: true });

  // 柜台前地毯
  const matX = world.left + roomW * 0.5;
  alphaRect(ctx, matX - 90, world.floorY - 12, 180, 12, "#7B4BC9", 0.35);
  for (let i = 0; i < 6; i++) {
    alphaRect(ctx, matX - 84 + i * 30, world.floorY - 9, 22, 6, "#FFE76A", 0.22);
  }

  // 悬挂价签
  for (let i = 0; i < 3; i++) {
    const tx = world.left + roomW * (0.36 + i * 0.14);
    rect(ctx, tx - 1, 150, 2, 26, "#6B5836");
    alphaRect(ctx, tx - 22, 176, 44, 24, "#F1E7D2", 0.92);
    text(ctx, "★", tx, 193, 13, "#B98955", "center");
  }

  // 金币堆（角落）
  const cx = world.left + roomW * 0.085;
  for (let i = 0; i < 8; i++) {
    const ccx = cx + hash(i) * 40, ccy = world.floorY - 6 - hash(i * 3) * 18;
    rect(ctx, ccx, ccy, 10, 5, config.colors.neonYellow);
    rect(ctx, ccx + 2, ccy, 6, 2, "#FFF3B8");
  }

  // 高台（保持可跳）
  drawPlatforms(ctx, platforms);

  // 暖色尘埃
  dustMotes(ctx, roomW, 130, world.floorY - 20, t * 0.6, 12, "#FFD9A0");
}

module.exports = { menuScene, battleScene, emptyScene, shopScene, drawGrandma, drawMonster };

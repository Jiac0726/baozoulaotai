// 渲染冒烟测试：在 Node 中打桩 wx/Canvas，验证四个横版场景与游戏主循环渲染无异常。
// 运行：node tools/render-smoke.js
"use strict";

const path = require("path");

/* ---------- 打桩：Canvas 2D 上下文（记录绘制调用） ---------- */
function makeCtx(stats) {
  return new Proxy(
    {},
    {
      get(t, p) {
        if (p in t) return t[p];
        return (...args) => {
          stats.ops++;
          if (p === "fillText") stats.texts.push(String(args[0]));
        };
      },
      set(t, p, v) {
        t[p] = v;
        return true;
      },
    }
  );
}

function makeCanvas(stats, w, h) {
  return {
    width: w,
    height: h,
    getContext: () => makeCtx(stats),
  };
}

/* ---------- 打桩：wx 全局对象 ---------- */
const touchHandlers = {};
function installWx(stats, w, h) {
  global.wx = {
    createCanvas: () => makeCanvas(stats, w, h),
    getSystemInfoSync: () => ({ windowWidth: w, windowHeight: h }),
    onTouchStart: (cb) => (touchHandlers.start = cb),
    onTouchMove: (cb) => (touchHandlers.move = cb),
    onTouchEnd: (cb) => (touchHandlers.end = cb),
    onTouchCancel: (cb) => (touchHandlers.cancel = cb),
    vibrateShort: () => {},
    getStorageSync: () => null,
    setStorageSync: () => {},
  };
}

/* ---------- 打桩：requestAnimationFrame（手动步进） ---------- */
let pendingFrame = null;
global.requestAnimationFrame = (fn) => {
  pendingFrame = fn;
};
function stepFrame() {
  const fn = pendingFrame;
  pendingFrame = null;
  if (fn) fn(Date.now());
}

function tap(x, y) {
  touchHandlers.start({
    changedTouches: [{ clientX: x, clientY: y }],
    touches: [{ clientX: x, clientY: y }],
  });
}

/* ---------- 用例 ---------- */
let failures = 0;
function check(name, ok, extra) {
  console.log((ok ? "[PASS] " : "[FAIL] ") + name + (extra ? "  " + extra : ""));
  if (!ok) failures++;
}

function testScenes() {
  const sizes = [
    [844, 390],
    [1334, 750],
    [667, 375],
  ];
  for (const [w, h] of sizes) {
    const stats = { ops: 0, texts: [] };
    const ctx = makeCtx(stats);
    const world = { left: 34, right: w - 34, floorY: h - 74 };
    const layouts = require(path.join(__dirname, "..", "src", "data", "roomLayouts"));
    const scenes = require(path.join(__dirname, "..", "src", "render", "sceneKit"));
    const platforms = [{ x: world.left + 60, y: world.floorY - 90, w: 120, h: 12 }];

    const cases = {
      menuScene: () => scenes.menuScene({ ctx, w, h, world, time: 1.23 }),
      battleScene: () =>
        scenes.battleScene({ ctx, w, h, world, room: { type: "combat" }, layout: layouts.room_small_a, platforms, time: 1.23 }),
      emptyScene: () =>
        scenes.emptyScene({ ctx, w, h, world, room: { type: "reward" }, layout: layouts.room_mid_a, platforms, time: 1.23 }),
      shopScene: () =>
        scenes.shopScene({ ctx, w, h, world, room: { type: "shop" }, layout: layouts.room_shop, platforms, time: 1.23 }),
    };

    for (const [name, fn] of Object.entries(cases)) {
      const before = stats.ops;
      let ok = true;
      try {
        fn();
      } catch (e) {
        ok = false;
        console.log("      error: " + e.stack);
      }
      const drawn = stats.ops - before;
      check(`${name} @ ${w}x${h}`, ok && drawn > 80, `draw ops=${drawn}`);
    }
  }
}

function testBootAndFlow() {
  const stats = { ops: 0, texts: [] };
  installWx(stats, 844, 390);
  try {
    require(path.join(__dirname, "..", "src", "main"));
  } catch (e) {
    check("game boot", false, e.stack);
    return;
  }
  stepFrame();
  check("menu render", stats.texts.includes("暴走老太") && stats.texts.includes("开始暴走"));

  const before = stats.ops;
  tap(422, 208); // 点击「开始暴走」按钮区域（w/2-90,h/2-10,180,46）
  for (let i = 0; i < 12; i++) stepFrame();
  check("battle scene after start", stats.ops > before && stats.texts.includes("战斗房"), `ops=${stats.ops - before}`);
  check("game loop stable", pendingFrame !== null);
}

console.log("== 场景渲染测试 ==");
testScenes();
console.log("== 游戏启动与流程测试 ==");
testBootAndFlow();

console.log(failures === 0 ? "\n全部通过 ✔" : `\n${failures} 项失败 ✘`);
process.exit(failures === 0 ? 0 : 1);

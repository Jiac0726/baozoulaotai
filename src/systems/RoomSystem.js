const Enemy = require("../entities/Enemy");

class RoomSystem {
  constructor(world) {
    this.world = world;
    this.index = 0;
    this.cleared = false;
    this.reward = null;
    this.rooms = [
      { type: "combat", enemies: ["basic", "basic", "runner"] },
      { type: "combat", enemies: ["basic", "runner", "runner", "tank"] },
      { type: "reward", enemies: [] },
      { type: "combat", enemies: ["tank", "basic", "runner", "basic"] },
      { type: "boss", enemies: ["tank", "tank", "runner", "runner"] }
    ];
  }

  enter(enemies, player) {
    enemies.length = 0;
    this.cleared = false;
    this.reward = null;
    const room = this.rooms[this.index];
    player.x = this.world.left + 44;
    player.y = this.world.floorY - player.h;

    if (room.type === "reward") {
      this.cleared = true;
      this.reward = { name: "发光拖鞋", desc: "移动速度 +10%（占位）" };
      return;
    }

    const span = this.world.right - this.world.left - 180;
    room.enemies.forEach((type, i) => {
      enemies.push(new Enemy(this.world.left + 150 + (span * (i + 1)) / (room.enemies.length + 1), this.world.floorY, type));
    });
  }

  update(enemies) {
    if (!this.cleared && enemies.length === 0) {
      this.cleared = true;
      if (!this.reward) this.reward = { name: "老花镜", desc: "暴击率 +8%（占位）" };
    }
  }

  canExit(player) {
    return this.cleared && player.x + player.w > this.world.right - 24;
  }

  next(enemies, player) {
    if (this.index < this.rooms.length - 1) {
      this.index++;
      this.enter(enemies, player);
      return false;
    }
    return true;
  }

  current() {
    return this.rooms[this.index];
  }
}

module.exports = RoomSystem;

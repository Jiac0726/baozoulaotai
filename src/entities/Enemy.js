const config = require("../config/gameConfig");

class Enemy {
  constructor(x, floorY, type = "basic") {
    this.type = type;
    this.w = config.enemy.width;
    this.h = config.enemy.height;
    this.x = x;
    this.y = floorY - this.h;
    this.hp = type === "tank" ? 7 : config.enemy.hp;
    this.speed = type === "runner" ? 125 : type === "tank" ? 48 : config.enemy.speed;
    this.dead = false;
  }

  update(dt, player) {
    const dx = player.x - this.x;
    const dir = Math.sign(dx);
    if (Math.abs(dx) > 22) this.x += dir * this.speed * dt;
  }

  damage(v) {
    this.hp -= v;
    if (this.hp <= 0) this.dead = true;
  }
}
module.exports = Enemy;

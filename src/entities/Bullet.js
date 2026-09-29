const config = require("../config/gameConfig");

class Bullet {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.w = config.bullet.width;
    this.h = config.bullet.height;
    this.vx = config.bullet.speed * dir;
    this.damage = config.bullet.damage;
    this.life = config.bullet.life;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }
}

module.exports = Bullet;

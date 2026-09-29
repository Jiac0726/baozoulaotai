const config = require("../config/gameConfig");

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = config.player.width;
    this.h = config.player.height;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = false;
    this.hp = config.player.maxHp;
    this.maxHp = config.player.maxHp;
    this.invuln = 0;
    this.shootTimer = 0;
    this.justJumped = false;
  }

  update(dt, input, world, inventory) {
    this.invuln = Math.max(0, this.invuln - dt);
    this.shootTimer = Math.max(0, this.shootTimer - dt);
    this.justJumped = false;

    const axis = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const speed = config.player.speed * (1 + inventory.mod("speed", 0));
    this.vx = axis * speed;
    if (axis) this.facing = axis;

    if (input.consumeJump() && this.onGround) {
      this.vy = -config.player.jumpSpeed;
      this.onGround = false;
      this.justJumped = true;
    }

    const prevBottom = this.y + this.h;

    this.vy += config.world.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.onGround = false;

    if (this.vy >= 0 && world.platforms) {
      for (const p of world.platforms) {
        const nowBottom = this.y + this.h;
        const horizontal = this.x + this.w > p.x && this.x < p.x + p.w;
        if (horizontal && prevBottom <= p.y && nowBottom >= p.y) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
          break;
        }
      }
    }

    if (this.y + this.h >= world.floorY) {
      this.y = world.floorY - this.h;
      this.vy = 0;
      this.onGround = true;
    }

    this.x = Math.max(world.left, Math.min(world.right - this.w, this.x));
  }

  canShoot() { return this.shootTimer <= 0; }
  didShoot(cooldown) { this.shootTimer = cooldown; }

  damage(v) {
    if (this.invuln > 0 || v <= 0) return false;
    this.hp = Math.max(0, this.hp - v);
    this.invuln = 0.75;
    return true;
  }
}
module.exports = Player;

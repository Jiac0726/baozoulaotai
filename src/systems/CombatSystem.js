const config = require("../config/gameConfig");
const Bullet = require("../entities/Bullet");

function rectHit(a, b) {
  return a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;
}

class CombatSystem {
  constructor() {
    this.bullets = [];
    this.kills = 0;
  }

  update(dt, player, enemies, input, world) {
    if (input.shoot && player.canShoot()) {
      this.bullets.push(new Bullet(
        player.x + player.w / 2,
        player.y + player.h * 0.45,
        player.facing
      ));
      player.didShoot();
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.update(dt);

      if (b.x < world.left - 20 || b.x > world.right + 20) b.dead = true;

      if (!b.dead) {
        for (const e of enemies) {
          if (!e.dead && rectHit(b, e)) {
            e.damage(config.bullet.damage);
            b.dead = true;
            break;
          }
        }
      }

      if (b.dead) this.bullets.splice(i, 1);
    }

    for (const e of enemies) {
      e.update(dt, player);
      if (!e.dead && rectHit(e, player)) {
        player.damage(config.enemy.contactDamage);
      }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      if (enemies[i].dead) {
        enemies.splice(i, 1);
        this.kills++;
      }
    }
  }
}

module.exports = CombatSystem;

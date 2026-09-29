class DropSystem {
  constructor() { this.drops = []; }

  spawnCoin(x,y,value=1) { this.drops.push({type:"coin",x,y,w:14,h:14,value,vy:-120}); }
  spawnHeal(x,y) { this.drops.push({type:"heal",x,y,w:14,h:14,value:1,vy:-140}); }

  update(dt, world, player, inventory) {
    for (let i=this.drops.length-1;i>=0;i--) {
      const d=this.drops[i];
      d.vy += 520*dt;
      d.y += d.vy*dt;
      if (d.y + d.h > world.floorY) { d.y = world.floorY-d.h; d.vy = 0; }

      const hit = player.x < d.x+d.w && player.x+player.w > d.x &&
        player.y < d.y+d.h && player.y+player.h > d.y;
      if (hit) {
        if (d.type==="coin") inventory.coins += d.value;
        if (d.type==="heal") player.hp = Math.min(player.maxHp, player.hp + d.value);
        this.drops.splice(i,1);
      }
    }
  }
}
module.exports = DropSystem;

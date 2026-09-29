const config = require("../config/gameConfig");
class Player {
  constructor(x,y){
    this.x=x; this.y=y; this.r=config.player.radius; this.speed=config.player.speed;
    this.hp=config.player.maxHp; this.maxHp=config.player.maxHp; this.invuln=0;
  }
  update(dt,input,arena){
    this.invuln=Math.max(0,this.invuln-dt);
    if(input.active && input.pointer){
      const dx=input.pointer.x-this.x, dy=input.pointer.y-this.y;
      const len=Math.hypot(dx,dy);
      if(len>5){
        const step=Math.min(this.speed*dt,len);
        this.x+=dx/len*step; this.y+=dy/len*step;
      }
    }
    this.x=Math.max(arena.left+this.r,Math.min(arena.right-this.r,this.x));
    this.y=Math.max(arena.top+this.r,Math.min(arena.bottom-this.r,this.y));
  }
  damage(v){ if(this.invuln>0)return; this.hp=Math.max(0,this.hp-v); this.invuln=.65; }
}
module.exports=Player;

const config=require("../config/gameConfig");
class Enemy{
  constructor(x,y,scale=1){this.x=x;this.y=y;this.r=config.enemy.radius*scale;this.speed=config.enemy.speed*(1+.12*(scale-1));this.hp=config.enemy.hp*scale;}
  update(dt,player){const dx=player.x-this.x,dy=player.y-this.y,len=Math.hypot(dx,dy)||1;this.x+=dx/len*this.speed*dt;this.y+=dy/len*this.speed*dt;}
}
module.exports=Enemy;

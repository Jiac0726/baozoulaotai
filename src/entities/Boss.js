class Boss {
  constructor(x,floorY){
    this.type="boss";
    this.w=92; this.h=86;
    this.x=x; this.y=floorY-this.h;
    this.maxHp=40; this.hp=this.maxHp;
    this.speed=42; this.dead=false;
    this.phase=1; this.attackTimer=1.8; this.flash=0;
  }
  update(dt,player,projectiles){
    this.flash=Math.max(0,this.flash-dt);
    this.phase=this.hp<=this.maxHp*0.35?3:this.hp<=this.maxHp*0.7?2:1;
    const dx=player.x-this.x;
    if(Math.abs(dx)>120) this.x+=Math.sign(dx)*this.speed*(1+0.2*(this.phase-1))*dt;
    this.attackTimer-=dt;
    if(this.attackTimer<=0){
      this.attackTimer=this.phase===3?0.75:this.phase===2?1.15:1.65;
      const dir=Math.sign(dx)||-1;
      const count=this.phase;
      for(let i=0;i<count;i++){
        projectiles.push({
          type:"enemy",
          x:this.x+this.w/2,y:this.y+26+i*10,w:12,h:8,
          vx:dir*(180+40*this.phase),vy:(i-(count-1)/2)*55,
          damage:1,life:3,dead:false
        });
      }
    }
  }
  damage(v){this.hp-=v;this.flash=.08;if(this.hp<=0)this.dead=true;}
}
module.exports=Boss;

const config=require("../config/gameConfig");
class SkillOrbSystem{
  constructor(){this.timer=2.5;this.orbs=[];}
  update(dt,arena){
    this.timer-=dt;
    if(this.timer<=0){
      this.timer=config.skillOrb.spawnEvery;
      const pad=40;
      this.orbs.push({x:arena.left+pad+Math.random()*(arena.right-arena.left-pad*2),y:arena.top+pad+Math.random()*(arena.bottom-arena.top-pad*2),r:config.skillOrb.radius});
    }
  }
}
module.exports=SkillOrbSystem;

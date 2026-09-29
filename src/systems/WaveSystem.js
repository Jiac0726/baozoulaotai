const config=require("../config/gameConfig");
class WaveSystem{
  constructor(){this.wave=1;this.waveTime=0;this.spawnTime=0;}
  update(dt,spawn){
    this.waveTime+=dt; this.spawnTime+=dt;
    const cadence=Math.max(.3,config.wave.spawnEvery-(this.wave-1)*.05);
    if(this.spawnTime>=cadence){this.spawnTime=0;spawn(this.wave);}
    if(this.waveTime>=config.wave.duration){this.wave++;this.waveTime=0;}
  }
}
module.exports=WaveSystem;

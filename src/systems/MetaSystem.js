const KEY="baozoulaotai_meta_v1";
class MetaSystem{
  constructor(){
    this.data=this.load();
  }
  defaults(){
    return{
      unlockedWeapons:["pan_blaster"],
      achievements:{firstKill:false,bossKill:false,rich:false,collector:false},
      lifetimeKills:0,
      lifetimeBossKills:0
    };
  }
  load(){
    try{return Object.assign(this.defaults(),wx.getStorageSync(KEY)||{});}
    catch(e){return this.defaults();}
  }
  save(){try{wx.setStorageSync(KEY,this.data);}catch(e){}}
  registerKill(type){
    this.data.lifetimeKills++;
    if(this.data.lifetimeKills>=1)this.data.achievements.firstKill=true;
    if(type==="boss"){
      this.data.lifetimeBossKills++;
      this.data.achievements.bossKill=true;
    }
    this.save();
  }
  evaluate(inventory){
    if(inventory.coins>=100)this.data.achievements.rich=true;
    if(inventory.items.length>=5)this.data.achievements.collector=true;
    this.save();
  }
  unlockWeapon(id){
    if(!this.data.unlockedWeapons.includes(id))this.data.unlockedWeapons.push(id);
    this.save();
  }
}
module.exports=MetaSystem;

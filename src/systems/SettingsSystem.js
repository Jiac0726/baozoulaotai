const KEY="baozoulaotai_settings_v1";
class SettingsSystem{
  constructor(){this.data=this.load();}
  load(){
    try{return Object.assign({music:true,sfx:true,vibration:true},wx.getStorageSync(KEY)||{});}
    catch(e){return{music:true,sfx:true,vibration:true};}
  }
  toggle(key){
    if(!(key in this.data))return;
    this.data[key]=!this.data[key];
    try{wx.setStorageSync(KEY,this.data);}catch(e){}
  }
}
module.exports=SettingsSystem;

const KEY="baozoulaotai_save_v1";
class SaveSystem {
  load(){
    try{return wx.getStorageSync(KEY)||{bestFloor:0,totalCoins:0,runs:0};}
    catch(e){return {bestFloor:0,totalCoins:0,runs:0};}
  }
  save(data){ try{wx.setStorageSync(KEY,data);}catch(e){} }
}
module.exports=SaveSystem;

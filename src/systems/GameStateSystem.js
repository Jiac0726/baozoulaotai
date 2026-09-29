class GameStateSystem {
  constructor(){this.state="menu";this.message="";}
  start(){this.state="playing";this.message="";}
  pause(){if(this.state==="playing")this.state="paused";}
  resume(){if(this.state==="paused")this.state="playing";}
  settings(){this.state="settings";}
  menu(){this.state="menu";this.message="";}
  floorClear(msg="楼层完成"){this.state="floorclear";this.message=msg;}
  gameOver(msg="失败"){this.state="gameover";this.message=msg;}
  win(msg="通关"){this.state="win";this.message=msg;}
  reset(){this.start();}
}
module.exports=GameStateSystem;

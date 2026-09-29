class GameStateSystem {
  constructor(){this.state="playing";this.message="";}
  pause(){if(this.state==="playing")this.state="paused";}
  resume(){if(this.state==="paused")this.state="playing";}
  gameOver(msg="失败"){this.state="gameover";this.message=msg;}
  win(msg="通关"){this.state="win";this.message=msg;}
  reset(){this.state="playing";this.message="";}
}
module.exports=GameStateSystem;

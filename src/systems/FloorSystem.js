class FloorSystem{
  constructor(){this.floor=1;this.theme="霓虹厨房";}
  next(){
    this.floor++;
    const themes=["霓虹厨房","地下夜市","故障商场","冷冻实验室"];
    this.theme=themes[(this.floor-1)%themes.length];
  }
  reset(){this.floor=1;this.theme="霓虹厨房";}
}
module.exports=FloorSystem;

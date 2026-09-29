const items=require("../data/items");
class RewardSystem{
  constructor(inventory){this.inventory=inventory;this.choices=[];}
  roll(count=3){
    const pool=Object.keys(items).filter(id=>!this.inventory.has(id));
    this.choices=[];
    while(this.choices.length<count && pool.length){
      const i=Math.floor(Math.random()*pool.length);
      this.choices.push(pool.splice(i,1)[0]);
    }
    return this.choices;
  }
  choose(index){
    const id=this.choices[index];
    if(!id)return null;
    this.inventory.addItem(id);
    this.choices=[];
    return id;
  }
}
module.exports=RewardSystem;

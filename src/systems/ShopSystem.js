const items=require("../data/items");

class ShopSystem {
  constructor(inventory){ this.inventory=inventory; this.stock=[]; }

  refresh(){
    const pool=Object.keys(items).filter(id=>!this.inventory.has(id));
    this.stock=[];
    while(this.stock.length<3 && pool.length){
      const i=Math.floor(Math.random()*pool.length);
      this.stock.push(pool.splice(i,1)[0]);
    }
  }

  buy(index){
    const id=this.stock[index];
    if(!id || !items[id]) return {ok:false,msg:"无商品"};
    if(this.inventory.coins<items[id].price) return {ok:false,msg:"金币不足"};
    this.inventory.coins-=items[id].price;
    this.inventory.addItem(id);
    this.stock[index]=null;
    return {ok:true,msg:"购买成功",item:id};
  }
}
module.exports=ShopSystem;

class EventSystem {
  roll() {
    const events=[
      {id:"mystery_pot",title:"神秘高压锅",text:"打开它？",choices:["打开","离开"]},
      {id:"street_vendor",title:"深夜摊主",text:"花 20 金币换 1 点生命？",choices:["成交","算了"]},
      {id:"broken_machine",title:"故障售货机",text:"踹一脚试试？",choices:["踹","不碰"]}
    ];
    return events[Math.floor(Math.random()*events.length)];
  }

  resolve(event,choice,ctx){
    if(!event) return "什么也没发生";
    if(event.id==="mystery_pot" && choice===0){
      if(Math.random()<0.5){ctx.inventory.coins+=40;return "找到 40 金币";}
      ctx.player.damage(1);return "锅炸了，受到 1 点伤害";
    }
    if(event.id==="street_vendor" && choice===0){
      if(ctx.inventory.coins>=20){ctx.inventory.coins-=20;ctx.player.hp=Math.min(ctx.player.maxHp,ctx.player.hp+1);return "恢复 1 点生命";}
      return "金币不足";
    }
    if(event.id==="broken_machine" && choice===0){
      ctx.inventory.coins+=15;return "掉出 15 金币";
    }
    return "你选择离开";
  }
}
module.exports=EventSystem;

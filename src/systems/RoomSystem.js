const Enemy=require("../entities/Enemy");
const Boss=require("../entities/Boss");

class RoomSystem{
  constructor(world){
    this.world=world;
    this.index=0;
    this.cleared=false;
    this.resolved=false;
    this.rooms=[
      {type:"combat",name:"后厨入口",layout:"room_small_a",enemies:["basic","basic","runner"]},
      {type:"reward",name:"储藏间",layout:"room_mid_a"},
      {type:"combat",name:"霓虹走廊",layout:"room_mid_a",enemies:["basic","runner","runner","tank"]},
      {type:"shop",name:"深夜小卖部",layout:"room_shop"},
      {type:"event",name:"故障厨房",layout:"room_event"},
      {type:"elite",name:"冷库",layout:"room_mid_a",enemies:["tank","tank","runner"]},
      {type:"reward",name:"VIP休息室",layout:"room_small_a"},
      {type:"combat",name:"主厨房",layout:"room_mid_a",enemies:["basic","runner","tank","runner","basic"]},
      {type:"boss",name:"高压锅王",layout:"room_boss"}
    ];
  }

  enter(enemies,player,inventory){
    enemies.length=0;
    this.cleared=false;
    this.resolved=false;
    player.x=this.world.left+44;
    player.y=this.world.floorY-player.h;
    inventory.onEnterRoom();

    const room=this.current();
    if(room.type==="reward"||room.type==="shop"||room.type==="event") return;

    if(room.type==="boss"){
      enemies.push(new Boss(this.world.right-160,this.world.floorY));
      return;
    }

    const list=room.enemies||[];
    const span=this.world.right-this.world.left-190;
    list.forEach((type,i)=>{
      enemies.push(new Enemy(
        this.world.left+145+(span*(i+1))/(list.length+1),
        this.world.floorY,
        type
      ));
    });
  }

  resolveRoom(){this.resolved=true;this.cleared=true;}

  update(enemies){
    const type=this.current().type;
    if(["combat","elite","boss"].includes(type)&&!this.cleared&&enemies.length===0){
      this.cleared=true;
      this.resolved=true;
    }
  }

  canExit(player){
    return this.cleared&&this.resolved&&player.x+player.w>this.world.right-24;
  }

  next(enemies,player,inventory){
    if(this.index<this.rooms.length-1){
      this.index++;
      this.enter(enemies,player,inventory);
      return false;
    }
    return true;
  }

  current(){return this.rooms[this.index];}
}
module.exports=RoomSystem;

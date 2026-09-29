const layouts=require("../data/roomLayouts");

class RoomVisualSystem {
  constructor(world){this.world=world;}

  getLayout(room){
    if(room.type==="boss")return layouts.room_boss;
    if(room.type==="shop")return layouts.room_shop;
    if(room.type==="event")return layouts.room_event;
    if(room.type==="elite")return layouts.room_mid_a;
    return room.layout&&layouts[room.layout]?layouts[room.layout]:layouts.room_small_a;
  }

  getPlatforms(room){
    const layout=this.getLayout(room);
    const width=this.world.right-this.world.left;
    const height=this.world.floorY-76;
    return (layout.platforms||[]).map(p=>({
      x:this.world.left+p.x*width,
      y:76+p.y*height,
      w:p.w*width,
      h:Math.max(10,p.h*height)
    }));
  }
}
module.exports=RoomVisualSystem;

const config=require("./config/gameConfig");
const items=require("./data/items");
const weapons=require("./data/weapons");
const Input=require("./core/Input");
const Player=require("./entities/Player");
const CombatSystem=require("./systems/CombatSystem");
const RoomSystem=require("./systems/RoomSystem");
const InventorySystem=require("./systems/InventorySystem");
const DropSystem=require("./systems/DropSystem");
const ShopSystem=require("./systems/ShopSystem");
const EventSystem=require("./systems/EventSystem");
const RewardSystem=require("./systems/RewardSystem");
const SaveSystem=require("./systems/SaveSystem");
const GameStateSystem=require("./systems/GameStateSystem");
const MetaSystem=require("./systems/MetaSystem");
const SettingsSystem=require("./systems/SettingsSystem");
const FloorSystem=require("./systems/FloorSystem");
const RoomVisualSystem=require("./systems/RoomVisualSystem");

const canvas=wx.createCanvas();
const ctx=canvas.getContext("2d");
const info=wx.getSystemInfoSync();
canvas.width=info.windowWidth;
canvas.height=info.windowHeight;

const w=canvas.width,h=canvas.height;
const world={
  left:config.world.roomPadding,
  right:w-config.world.roomPadding,
  floorY:h-config.world.floorHeight
};

const input=new Input(canvas);
const inventory=new InventorySystem();
const player=new Player(world.left+44,world.floorY-config.player.height);
const drops=new DropSystem();
const combat=new CombatSystem(drops);
const rooms=new RoomSystem(world);
const shop=new ShopSystem(inventory);
const events=new EventSystem();
const rewards=new RewardSystem(inventory);
const saveSystem=new SaveSystem();
const gameState=new GameStateSystem();
const meta=new MetaSystem();
const settings=new SettingsSystem();
const floors=new FloorSystem();
const roomVisuals=new RoomVisualSystem(world);
const save=saveSystem.load();
const enemies=[];

let activeEvent=null;
let notice="";
let noticeTimer=0;
let last=Date.now();
let runCoinsStart=0;
let runSaved=false;

function roomSetup(){
  const room=rooms.current();
  notice="";
  activeEvent=null;
  world.platforms=roomVisuals.getPlatforms(room);
  if(room.type==="reward") rewards.roll(3);
  if(room.type==="shop") shop.refresh();
  if(room.type==="event") activeEvent=events.roll();
}

function startRoom(){
  rooms.enter(enemies,player,inventory);
  combat.bullets.length=0;
  combat.enemyProjectiles.length=0;
  drops.drops.length=0;
  roomSetup();
}

function beginRun(){
  inventory.items=[];
  inventory.coins=0;
  inventory.shield=0;
  inventory.weaponId="pan_blaster";
  player.hp=player.maxHp;
  player.invuln=0;
  combat.kills=0;
  combat.killEvents.length=0;
  rooms.index=0;
  floors.reset();
  runCoinsStart=0;
  runSaved=false;
  gameState.start();
  startRoom();
}

function saveRun(won){
  if(runSaved)return;
  runSaved=true;
  save.runs=(save.runs||0)+1;
  save.bestFloor=Math.max(save.bestFloor||0,floors.floor);
  save.totalCoins=(save.totalCoins||0)+Math.max(0,inventory.coins-runCoinsStart);
  if(won) save.wins=(save.wins||0)+1;
  saveSystem.save(save);
  meta.evaluate(inventory);
}

function nextFloor(){
  floors.next();
  rooms.index=0;
  player.hp=Math.min(player.maxHp,player.hp+2);
  if(floors.floor===2){
    meta.unlockWeapon("pressure_launcher");
    inventory.weaponId="pressure_launcher";
    notice="解锁并装备：高压锅榴弹";
  }else if(floors.floor===3){
    meta.unlockWeapon("spatula_laser");
    inventory.weaponId="spatula_laser";
    notice="解锁并装备：锅铲激光";
  }
  runSaved=false;
  gameState.start();
  startRoom();
}

function pointIn(t,x,y,ww,hh){
  return t&&t.x>=x&&t.x<=x+ww&&t.y>=y&&t.y<=y+hh;
}

function handleTap(t){
  if(!t)return;

  if(gameState.state==="menu"){
    if(pointIn(t,w/2-90,h/2-10,180,46)){beginRun();return;}
    if(pointIn(t,w/2-90,h/2+48,180,40)){gameState.settings();return;}
    return;
  }

  if(gameState.state==="settings"){
    const sy=h/2-60;
    if(pointIn(t,w/2-110,sy,220,38)){settings.toggle("music");return;}
    if(pointIn(t,w/2-110,sy+48,220,38)){settings.toggle("sfx");return;}
    if(pointIn(t,w/2-110,sy+96,220,38)){settings.toggle("vibration");return;}
    if(pointIn(t,w/2-70,sy+152,140,38)){gameState.menu();return;}
    return;
  }

  if(gameState.state==="floorclear"){
    if(pointIn(t,w/2-80,h/2+34,160,44)){nextFloor();return;}
    return;
  }

  if(gameState.state==="gameover"||gameState.state==="win"){
    if(pointIn(t,w/2-90,h/2+38,180,42)){beginRun();return;}
    if(pointIn(t,w/2-90,h/2+90,180,36)){gameState.menu();return;}
    return;
  }

  if(gameState.state==="paused"){
    if(pointIn(t,w/2-70,h/2+10,140,40)){gameState.resume();return;}
    if(pointIn(t,w/2-70,h/2+60,140,36)){gameState.menu();return;}
    return;
  }

  if(pointIn(t,w-48,10,38,34)){gameState.pause();return;}

  const room=rooms.current();

  if(room.type==="reward"&&!rooms.resolved){
    const cardW=Math.min(150,(w-80)/3),gap=12,total=cardW*3+gap*2,start=(w-total)/2;
    for(let i=0;i<rewards.choices.length;i++){
      if(pointIn(t,start+i*(cardW+gap),h/2-55,cardW,110)){
        const id=rewards.choose(i);
        if(id){
          notice="获得："+items[id].name;
          noticeTimer=1.8;
          rooms.resolveRoom();
          meta.evaluate(inventory);
        }
        return;
      }
    }
  }

  if(room.type==="shop"&&!rooms.resolved){
    const cardW=Math.min(145,(w-90)/3),gap=12,total=cardW*3+gap*2,start=(w-total)/2;
    for(let i=0;i<shop.stock.length;i++){
      if(pointIn(t,start+i*(cardW+gap),h/2-62,cardW,118)){
        const result=shop.buy(i);
        notice=result.msg;
        noticeTimer=1.5;
        meta.evaluate(inventory);
        return;
      }
    }
    if(pointIn(t,w/2-60,h/2+75,120,34)){
      rooms.resolveRoom();
      notice="离开商店";
      noticeTimer=1;
      return;
    }
  }

  if(room.type==="event"&&!rooms.resolved&&activeEvent){
    const by=h/2+45;
    for(let i=0;i<activeEvent.choices.length;i++){
      const bx=w/2-132+i*140;
      if(pointIn(t,bx,by,124,38)){
        notice=events.resolve(activeEvent,i,{inventory,player});
        noticeTimer=2;
        rooms.resolveRoom();
        meta.evaluate(inventory);
        return;
      }
    }
  }
}

function update(dt){
  handleTap(input.consumeTap());
  noticeTimer=Math.max(0,noticeTimer-dt);

  if(gameState.state!=="playing")return;

  const room=rooms.current();
  const modalLocked=["reward","shop","event"].includes(room.type)&&!rooms.resolved;

  if(!modalLocked){
    const hpBefore=player.hp;
    player.update(dt,input,world,inventory);
    combat.update(dt,player,enemies,input,world,inventory);
    drops.update(dt,world,player,inventory);
    if(player.hp<hpBefore&&settings.data.vibration){
      try{wx.vibrateShort({type:"light"});}catch(e){}
    }
  }

  for(const type of combat.consumeKillEvents()) meta.registerKill(type);

  rooms.update(enemies);

  if(rooms.canExit(player)){
    const floorFinished=rooms.next(enemies,player,inventory);
    combat.bullets.length=0;
    combat.enemyProjectiles.length=0;
    drops.drops.length=0;

    if(floorFinished){
      if(floors.floor<3){
        gameState.floorClear("第 "+floors.floor+" 层完成");
      }else{
        saveRun(true);
        gameState.win("深渊通关");
      }
    }else{
      roomSetup();
    }
  }

  if(player.hp<=0){
    saveRun(false);
    gameState.gameOver("老太倒下了");
  }
}

function rect(x,y,ww,hh,fill){
  ctx.fillStyle=fill;
  ctx.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));
}
function strokeRect(x,y,ww,hh,color,line=2){
  ctx.strokeStyle=color;ctx.lineWidth=line;
  ctx.strokeRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));
}
function text(str,x,y,size=15,color=config.colors.text,align="left"){
  ctx.fillStyle=color;
  ctx.font="bold "+size+"px sans-serif";
  ctx.textAlign=align;
  ctx.textBaseline="alphabetic";
  ctx.fillText(String(str),x,y);
}
function button(x,y,ww,hh,label,color="#302B49"){
  rect(x,y,ww,hh,color);
  strokeRect(x,y,ww,hh,config.colors.neonBlue,2);
  text(label,x+ww/2,y+hh/2+5,14,"#FFFFFF","center");
}

function renderBackdrop(){
  rect(0,0,w,h,config.colors.background);
  for(let i=0;i<18;i++){
    const bw=16+(i%5)*8,bh=32+(i%6)*14,bx=i*(w/16)-8;
    rect(bx,world.floorY-bh-18,bw,bh,i%2?"#141124":"#1E1732");
    if(i%3===0){
      rect(bx+5,world.floorY-bh-5,3,3,config.colors.neonPink);
      rect(bx+11,world.floorY-bh+10,3,3,config.colors.neonBlue);
    }
  }
}

function renderRoomProp(prop){
  const roomW=world.right-world.left;
  const roomH=world.floorY-76;
  const x=world.left+prop.x*roomW;
  const y=76+prop.y*roomH-prop.h;

  if(prop.type==="crate"){
    rect(x,y,prop.w,prop.h,"#5A3D2B");
    strokeRect(x,y,prop.w,prop.h,"#B98955",2);
    strokeRect(x+7,y+7,prop.w-14,prop.h-14,"#7E5737",2);
  }else if(prop.type==="machine"){
    rect(x,y,prop.w,prop.h,"#25283B");
    strokeRect(x,y,prop.w,prop.h,config.colors.neonBlue,2);
    rect(x+10,y+10,prop.w-20,16,"#111827");
    rect(x+14,y+14,8,8,config.colors.neonPink);
    rect(x+28,y+14,8,8,config.colors.neonYellow);
  }else if(prop.type==="tank"){
    rect(x,y,prop.w,prop.h,"#323247");
    strokeRect(x,y,prop.w,prop.h,"#7563A8",3);
    rect(x+prop.w*.42,y-12,prop.w*.16,12,"#51496A");
    rect(x+10,y+18,prop.w-20,8,config.colors.neonPurple);
  }else if(prop.type==="pipe"){
    rect(x,y,prop.w,prop.h,"#3C4054");
    rect(x,y+4,prop.w,4,"#6B708C");
    rect(x+18,y-10,12,prop.h+20,"#313548");
  }else if(prop.type==="counter"){
    rect(x,y,prop.w,prop.h,"#3A2D3F");
    strokeRect(x,y,prop.w,prop.h,"#7D5C86",2);
    rect(x,y,prop.w,7,config.colors.neonPink);
  }else if(prop.type==="shelf"){
    rect(x,y,prop.w,prop.h,"#2C2A3B");
    strokeRect(x,y,prop.w,prop.h,"#615875",2);
    for(let sy=18;sy<prop.h;sy+=26)rect(x+5,y+sy,prop.w-10,4,"#514A63");
  }else if(prop.type==="vent"){
    rect(x,y,prop.w,prop.h,"#252838");
    strokeRect(x,y,prop.w,prop.h,"#656B82",2);
    for(let vx=8;vx<prop.w-5;vx+=9)rect(x+vx,y+6,3,prop.h-12,"#11131D");
  }
}

function renderRoomScene(){
  const layout=roomVisuals.getLayout(rooms.current());
  const roomW=world.right-world.left;
  const roomH=world.floorY-76;

  // 背景墙分块
  for(let gx=0;gx<8;gx++){
    for(let gy=0;gy<4;gy++){
      const px=world.left+gx*(roomW/8);
      const py=76+gy*(roomH/4);
      strokeRect(px,py,roomW/8,roomH/4,"#211C35",1);
    }
  }

  // 墙面灯带
  rect(world.left+18,104,roomW-36,3,"#302553");
  rect(world.left+18,108,roomW*.28,2,config.colors.neonBlue);
  rect(world.right-roomW*.25-18,108,roomW*.25,2,config.colors.neonPink);

  (layout.signs||[]).forEach(s=>{
    text(s.text,world.left+s.x*roomW,76+s.y*roomH,13,s.color||config.colors.neonBlue,"center");
  });

  (layout.props||[]).forEach(renderRoomProp);

  // 可碰撞高台
  (world.platforms||[]).forEach((p,i)=>{
    rect(p.x,p.y,p.w,p.h,"#343048");
    rect(p.x,p.y,p.w,4,i%2?config.colors.neonBlue:config.colors.neonPink);
    for(let sx=p.x+8;sx<p.x+p.w-5;sx+=18)rect(sx,p.y+p.h,3,8,"#272337");
  });
}

function renderBackground(){
  renderBackdrop();
  rect(world.left,76,world.right-world.left,world.floorY-76,config.colors.room);
  renderRoomScene();
  rect(world.left,world.floorY,world.right-world.left,h-world.floorY,config.colors.platform);
  rect(world.left,world.floorY,world.right-world.left,4,config.colors.neonPurple);
  strokeRect(world.left,76,world.right-world.left,world.floorY-76,config.colors.neonPurple,3);

  // 左门与右门
  rect(world.left+6,world.floorY-82,18,82,"#353047");
  const doorColor=rooms.cleared&&rooms.resolved?config.colors.neonBlue:"#49435D";
  rect(world.right-24,world.floorY-82,18,82,doorColor);
  if(rooms.cleared&&rooms.resolved)rect(world.right-20,world.floorY-72,10,4,config.colors.neonYellow);
}

function renderEntities(){
  for(const d of drops.drops){
    rect(d.x,d.y,d.w,d.h,d.type==="coin"?config.colors.neonYellow:"#5CFF8A");
  }

  for(const b of combat.bullets){
    rect(b.x,b.y,b.w,b.h,config.colors.neonYellow);
  }
  for(const p of combat.enemyProjectiles){
    rect(p.x,p.y,p.w,p.h,"#FF445C");
  }

  for(const e of enemies){
    if(e.type==="boss"){
      rect(e.x,e.y,e.w,e.h,e.flash>0?"#FFFFFF":"#FF315B");
      rect(e.x+14,e.y+18,12,10,"#FFE76A");
      rect(e.x+e.w-26,e.y+18,12,10,"#FFE76A");
    }else{
      const c=e.type==="runner"?config.colors.neonPink:e.type==="tank"?"#C34FFF":config.colors.enemy;
      rect(e.x,e.y,e.w,e.h,c);
      rect(e.x+6,e.y+8,5,5,"#FFFFFF");
      rect(e.x+e.w-11,e.y+8,5,5,"#FFFFFF");
    }
  }

  const pc=player.invuln>0?"#FF8EA8":config.colors.player;
  rect(player.x,player.y,player.w,player.h,pc);
  rect(player.x+(player.facing>0?player.w-6:2),player.y+14,5,5,config.colors.neonPink);
}

function roomLabel(type){
  return ({combat:"战斗房",reward:"奖励房",shop:"商店",event:"事件房",elite:"精英房",boss:"BOSS房"})[type]||type;
}

function renderMiniMap(){
  const count=rooms.rooms.length;
  const start=w/2-(count*14)/2;
  for(let i=0;i<count;i++){
    const color=i<rooms.index?"#5CFF8A":i===rooms.index?config.colors.neonYellow:"#49435D";
    rect(start+i*14,52,9,9,color);
  }
}

function renderHud(){
  text("暴走老太",18,26,19,config.colors.neonPink);
  text("第 "+floors.floor+" 层 · "+floors.theme,18,46,12,config.colors.neonBlue);
  text("房间 "+(rooms.index+1)+"/"+rooms.rooms.length+" · "+rooms.current().name,18,64,11,"#FFFFFF");
  text("击败 "+combat.kills+"   金币 "+inventory.coins,18,82,11,config.colors.neonYellow);

  text(roomLabel(rooms.current().type),w/2,28,15,
    rooms.current().type==="boss"?config.colors.neonPink:config.colors.neonBlue,"center");
  renderMiniMap();

  for(let i=0;i<player.maxHp;i++)rect(w-25-i*20,16,13,10,i<player.hp?"#FF4F68":"#3B334B");
  if(inventory.shield>0)text("盾 "+inventory.shield,w-20,47,11,config.colors.neonBlue,"right");
  text(inventory.weapon.name,w-20,66,10,config.colors.neonYellow,"right");

  const boss=enemies.find(e=>e.type==="boss");
  if(boss){
    const bw=Math.min(320,w*.48);
    rect(w/2-bw/2,70,bw,10,"#351829");
    rect(w/2-bw/2,70,bw*(boss.hp/boss.maxHp),10,"#FF315B");
  }

  if(rooms.cleared&&rooms.resolved)text("出口已开启 →",world.right-8,96,11,config.colors.neonYellow,"right");

  inventory.items.slice(-5).forEach((id,i)=>text(items[id].name,18+i*72,101,9,"#B8B2D5"));

  rect(w-48,10,38,34,"#27233C");
  text("Ⅱ",w-29,33,17,"#FFFFFF","center");

  ctx.globalAlpha=.22;
  rect(14,h-64,54,44,"#FFFFFF");
  rect(74,h-64,54,44,"#FFFFFF");
  rect(w-132,h-64,52,44,config.colors.neonBlue);
  rect(w-70,h-64,52,44,config.colors.neonPink);
  ctx.globalAlpha=1;
  text("←",41,h-35,20,"#FFFFFF","center");
  text("→",101,h-35,20,"#FFFFFF","center");
  text("跳",w-106,h-36,15,"#FFFFFF","center");
  text("射",w-44,h-36,15,"#FFFFFF","center");
}

function renderRewardOverlay(){
  if(rooms.current().type!=="reward"||rooms.resolved)return;
  rect(0,0,w,h,"rgba(0,0,0,.68)");
  text("选择一个道具",w/2,h/2-82,24,config.colors.neonYellow,"center");
  const cardW=Math.min(150,(w-80)/3),gap=12,total=cardW*3+gap*2,start=(w-total)/2;
  rewards.choices.forEach((id,i)=>{
    const it=items[id],x=start+i*(cardW+gap),y=h/2-55;
    rect(x,y,cardW,110,"#211C35");
    strokeRect(x,y,cardW,110,[config.colors.neonPink,config.colors.neonBlue,config.colors.neonPurple][i],3);
    text(it.name,x+cardW/2,y+31,15,"#FFFFFF","center");
    text(it.desc,x+cardW/2,y+61,10,"#C9C4DD","center");
    text("点击选择",x+cardW/2,y+92,11,config.colors.neonYellow,"center");
  });
}

function renderShopOverlay(){
  if(rooms.current().type!=="shop"||rooms.resolved)return;
  rect(0,0,w,h,"rgba(0,0,0,.70)");
  text("深夜小卖部 · 金币 "+inventory.coins,w/2,h/2-88,22,config.colors.neonBlue,"center");
  const cardW=Math.min(145,(w-90)/3),gap=12,total=cardW*3+gap*2,start=(w-total)/2;
  shop.stock.forEach((id,i)=>{
    const x=start+i*(cardW+gap),y=h/2-62;
    rect(x,y,cardW,118,"#211C35");
    strokeRect(x,y,cardW,118,config.colors.neonBlue,2);
    if(!id){text("已售出",x+cardW/2,y+60,16,config.colors.muted,"center");return;}
    const it=items[id];
    text(it.name,x+cardW/2,y+27,14,"#FFFFFF","center");
    text(it.desc,x+cardW/2,y+54,9,"#C9C4DD","center");
    text(it.price+" 金币",x+cardW/2,y+88,13,config.colors.neonYellow,"center");
    text("点击购买",x+cardW/2,y+108,9,"#FFFFFF","center");
  });
  button(w/2-60,h/2+75,120,34,"离开商店");
}

function renderEventOverlay(){
  if(rooms.current().type!=="event"||rooms.resolved||!activeEvent)return;
  rect(0,0,w,h,"rgba(0,0,0,.70)");
  text(activeEvent.title,w/2,h/2-55,24,config.colors.neonPink,"center");
  text(activeEvent.text,w/2,h/2-20,14,"#FFFFFF","center");
  activeEvent.choices.forEach((c,i)=>button(w/2-132+i*140,h/2+45,124,38,c,i===0?"#5A2B55":"#2B3355"));
}

function renderMenu(){
  renderBackdrop();
  rect(0,0,w,h,"rgba(3,2,12,.45)");
  text("暴走老太",w/2,h/2-105,38,config.colors.neonPink,"center");
  text("NEON ROGUELIKE PROTOTYPE",w/2,h/2-76,12,config.colors.neonBlue,"center");
  text("历史最佳 "+(save.bestFloor||0)+" 层 · 通关 "+(save.wins||0)+" 次",w/2,h/2-43,12,"#C9C4DD","center");
  button(w/2-90,h/2-10,180,46,"开始暴走","#55234F");
  button(w/2-90,h/2+48,180,40,"设置","#263657");
  const ach=meta.data.achievements;
  const unlocked=Object.keys(ach).filter(k=>ach[k]).length;
  text("成就 "+unlocked+"/4 · 累计击败 "+meta.data.lifetimeKills,w/2,h/2+112,11,config.colors.muted,"center");
}

function onOff(v){return v?"开":"关";}

function renderSettings(){
  renderBackdrop();
  rect(0,0,w,h,"rgba(0,0,0,.68)");
  text("设置",w/2,h/2-105,28,config.colors.neonBlue,"center");
  const sy=h/2-60;
  button(w/2-110,sy,220,38,"音乐："+onOff(settings.data.music));
  button(w/2-110,sy+48,220,38,"音效："+onOff(settings.data.sfx));
  button(w/2-110,sy+96,220,38,"震动："+onOff(settings.data.vibration));
  button(w/2-70,sy+152,140,38,"返回");
}

function renderStateOverlay(){
  if(gameState.state==="playing"||gameState.state==="menu"||gameState.state==="settings")return;
  rect(0,0,w,h,"rgba(0,0,0,.78)");

  if(gameState.state==="paused"){
    text("已暂停",w/2,h/2-32,28,config.colors.neonBlue,"center");
    button(w/2-70,h/2+10,140,40,"继续游戏");
    button(w/2-70,h/2+60,140,36,"返回主页");
    return;
  }

  if(gameState.state==="floorclear"){
    text(gameState.message,w/2,h/2-58,30,config.colors.neonYellow,"center");
    text("保留道具与金币，继续深入",w/2,h/2-20,13,"#FFFFFF","center");
    text("下一层将自动解锁新武器",w/2,h/2+3,11,config.colors.neonBlue,"center");
    button(w/2-80,h/2+34,160,44,"进入下一层","#503260");
    return;
  }

  text(gameState.message,w/2,h/2-55,30,gameState.state==="win"?config.colors.neonYellow:"#FF4F68","center");
  text("第 "+floors.floor+" 层 · 击败 "+combat.kills+" · 金币 "+inventory.coins,w/2,h/2-18,13,"#FFFFFF","center");
  text("历史最佳 "+(save.bestFloor||0)+" 层 · 游玩 "+(save.runs||0)+" 局",w/2,h/2+7,11,config.colors.muted,"center");
  button(w/2-90,h/2+38,180,42,"重新开始",gameState.state==="win"?"#5A4A20":"#57283A");
  button(w/2-90,h/2+90,180,36,"返回主页");
}

function render(){
  if(gameState.state==="menu"){renderMenu();return;}
  if(gameState.state==="settings"){renderSettings();return;}

  renderBackground();
  renderEntities();
  renderHud();
  renderRewardOverlay();
  renderShopOverlay();
  renderEventOverlay();

  if(noticeTimer>0){
    rect(w/2-120,88,240,32,"rgba(0,0,0,.78)");
    text(notice,w/2,109,12,config.colors.neonYellow,"center");
  }

  renderStateOverlay();
}

function loop(){
  const now=Date.now();
  const dt=Math.min(.033,(now-last)/1000);
  last=now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}
loop();

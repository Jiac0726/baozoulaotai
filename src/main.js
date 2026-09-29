const config=require("./config/gameConfig");
const items=require("./data/items");
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
const save=saveSystem.load();
const enemies=[];

let activeEvent=null;
let notice="";
let noticeTimer=0;
let last=Date.now();
let runCoinsStart=inventory.coins;

function roomSetup(){
  const room=rooms.current();
  notice="";
  if(room.type==="reward") rewards.roll(3);
  if(room.type==="shop") shop.refresh();
  if(room.type==="event") activeEvent=events.roll();
}
rooms.enter(enemies,player,inventory);
roomSetup();

function saveRun(won){
  save.runs=(save.runs||0)+1;
  save.bestFloor=Math.max(save.bestFloor||0,won?rooms.rooms.length:rooms.index+1);
  save.totalCoins=(save.totalCoins||0)+Math.max(0,inventory.coins-runCoinsStart);
  saveSystem.save(save);
}

function restartRun(){
  inventory.items=[];
  inventory.weaponId="pan_blaster";
  inventory.coins=0;
  inventory.shield=0;
  player.hp=player.maxHp;
  player.invuln=0;
  rooms.index=0;
  combat.kills=0;
  combat.bullets.length=0;
  combat.enemyProjectiles.length=0;
  drops.drops.length=0;
  gameState.reset();
  runCoinsStart=0;
  rooms.enter(enemies,player,inventory);
  roomSetup();
}

function pointIn(t,x,y,ww,hh){
  return t && t.x>=x && t.x<=x+ww && t.y>=y && t.y<=y+hh;
}

function handleTap(t){
  if(!t)return;

  if(gameState.state==="gameover"||gameState.state==="win"){
    if(pointIn(t,w/2-80,h/2+40,160,44)) restartRun();
    return;
  }

  if(gameState.state==="paused"){
    if(pointIn(t,w/2-70,h/2+18,140,42)) gameState.resume();
    return;
  }

  if(pointIn(t,w-48,10,38,34)){
    gameState.pause();
    return;
  }

  const room=rooms.current();

  if(room.type==="reward"&&!rooms.resolved){
    const cardW=Math.min(150,(w-80)/3);
    const gap=12;
    const total=cardW*3+gap*2;
    const start=(w-total)/2;
    for(let i=0;i<rewards.choices.length;i++){
      if(pointIn(t,start+i*(cardW+gap),h/2-55,cardW,110)){
        const id=rewards.choose(i);
        if(id){
          notice="获得："+items[id].name;
          noticeTimer=1.8;
          rooms.resolveRoom();
        }
        return;
      }
    }
  }

  if(room.type==="shop"&&!rooms.resolved){
    const cardW=Math.min(145,(w-90)/3);
    const gap=12;
    const total=cardW*3+gap*2;
    const start=(w-total)/2;
    for(let i=0;i<shop.stock.length;i++){
      if(pointIn(t,start+i*(cardW+gap),h/2-62,cardW,118)){
        const result=shop.buy(i);
        notice=result.msg;
        noticeTimer=1.5;
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
        return;
      }
    }
  }
}

function update(dt){
  handleTap(input.consumeTap());
  noticeTimer=Math.max(0,noticeTimer-dt);

  if(gameState.state!=="playing")return;

  player.update(dt,input,world,inventory);
  combat.update(dt,player,enemies,input,world,inventory);
  drops.update(dt,world,player,inventory);
  rooms.update(enemies);

  if(rooms.canExit(player)){
    const finished=rooms.next(enemies,player,inventory);
    combat.bullets.length=0;
    combat.enemyProjectiles.length=0;
    drops.drops.length=0;
    if(finished){
      saveRun(true);
      gameState.win("本层通关");
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
  ctx.strokeStyle=color;ctx.lineWidth=line;ctx.strokeRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));
}
function text(str,x,y,size=15,color=config.colors.text,align="left"){
  ctx.fillStyle=color;ctx.font="bold "+size+"px sans-serif";ctx.textAlign=align;ctx.textBaseline="alphabetic";ctx.fillText(String(str),x,y);
}
function button(x,y,ww,hh,label,color="#302B49"){
  rect(x,y,ww,hh,color);strokeRect(x,y,ww,hh,config.colors.neonBlue,2);text(label,x+ww/2,y+hh/2+5,14,"#FFFFFF","center");
}

function renderBackground(){
  rect(0,0,w,h,config.colors.background);

  for(let i=0;i<16;i++){
    const bw=18+(i%5)*7;
    const bh=35+(i%6)*13;
    const bx=i*(w/14)-10;
    rect(bx,world.floorY-bh-18,bw,bh,i%2?"#141124":"#1E1732");
    if(i%3===0){
      rect(bx+5,world.floorY-bh-5,3,3,config.colors.neonPink);
      rect(bx+11,world.floorY-bh+10,3,3,config.colors.neonBlue);
    }
  }

  rect(world.left,76,world.right-world.left,world.floorY-76,config.colors.room);
  rect(world.left,world.floorY,world.right-world.left,h-world.floorY,config.colors.platform);
  strokeRect(world.left,76,world.right-world.left,world.floorY-76,config.colors.neonPurple,3);

  const doorColor=rooms.cleared&&rooms.resolved?config.colors.neonBlue:"#49435D";
  rect(world.right-24,world.floorY-82,18,82,doorColor);
}

function renderEntities(){
  for(const d of drops.drops){
    rect(d.x,d.y,d.w,d.h,d.type==="coin"?config.colors.neonYellow:"#5CFF8A");
  }

  for(const b of combat.bullets){
    rect(b.x,b.y,b.w,b.h,combat.lastCrit?config.colors.neonPink:config.colors.neonYellow);
  }
  for(const p of combat.enemyProjectiles){
    rect(p.x,p.y,p.w,p.h,"#FF445C");
  }

  for(const e of enemies){
    if(e.type==="boss"){
      rect(e.x,e.y,e.w,e.h,e.flash>0?"#FFFFFF":"#FF315B");
      rect(e.x+14,e.y+18,12,10,"#FFE76A");
      rect(e.x+e.w-26,e.y+18,12,10,"#FFE76A");
      continue;
    }
    const c=e.type==="runner"?config.colors.neonPink:e.type==="tank"?"#C34FFF":config.colors.enemy;
    rect(e.x,e.y,e.w,e.h,c);
    rect(e.x+6,e.y+8,5,5,"#FFFFFF");
    rect(e.x+e.w-11,e.y+8,5,5,"#FFFFFF");
  }

  const pc=player.invuln>0?"#FF8EA8":config.colors.player;
  rect(player.x,player.y,player.w,player.h,pc);
  rect(player.x+(player.facing>0?player.w-6:2),player.y+14,5,5,config.colors.neonPink);
}

function roomLabel(type){
  return ({combat:"战斗房",reward:"奖励房",shop:"商店",event:"事件房",elite:"精英房",boss:"BOSS房"})[type]||type;
}

function renderHud(){
  text("暴走老太",18,26,19,config.colors.neonPink);
  text("房间 "+(rooms.index+1)+"/"+rooms.rooms.length+" · "+rooms.current().name,18,47,12,"#FFFFFF");
  text("击败 "+combat.kills+"   金币 "+inventory.coins,18,66,12,config.colors.neonYellow);

  text(roomLabel(rooms.current().type),w/2,28,15,
    rooms.current().type==="boss"?config.colors.neonPink:config.colors.neonBlue,"center");

  for(let i=0;i<player.maxHp;i++)rect(w-25-i*20,16,13,10,i<player.hp?"#FF4F68":"#3B334B");
  if(inventory.shield>0)text("盾 "+inventory.shield,w-20,48,12,config.colors.neonBlue,"right");

  const boss=enemies.find(e=>e.type==="boss");
  if(boss){
    const bw=Math.min(320,w*.48);
    rect(w/2-bw/2,48,bw,12,"#351829");
    rect(w/2-bw/2,48,bw*(boss.hp/boss.maxHp),12,"#FF315B");
    text("高压锅王 · 阶段 "+boss.phase,w/2,45,11,"#FFFFFF","center");
  }

  if(rooms.cleared&&rooms.resolved) text("出口已开启 →",world.right-8,68,12,config.colors.neonYellow,"right");

  text("道具 "+inventory.items.length,18,86,11,config.colors.muted);
  inventory.items.slice(-5).forEach((id,i)=>text(items[id].name,18+i*68,103,9,"#B8B2D5"));

  rect(w-48,10,38,34,"#27233C");text("Ⅱ",w-29,33,17,"#FFFFFF","center");

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
  rect(0,0,w,h,"rgba(0,0,0,.65)");
  text("选择一个道具",w/2,h/2-82,24,config.colors.neonYellow,"center");
  const cardW=Math.min(150,(w-80)/3),gap=12,total=cardW*3+gap*2,start=(w-total)/2;
  rewards.choices.forEach((id,i)=>{
    const it=items[id],x=start+i*(cardW+gap),y=h/2-55;
    rect(x,y,cardW,110,"#211C35");strokeRect(x,y,cardW,110,[config.colors.neonPink,config.colors.neonBlue,config.colors.neonPurple][i],3);
    text(it.name,x+cardW/2,y+31,15,"#FFFFFF","center");
    text(it.desc,x+cardW/2,y+61,10,"#C9C4DD","center");
    text("点击选择",x+cardW/2,y+92,11,config.colors.neonYellow,"center");
  });
}

function renderShopOverlay(){
  if(rooms.current().type!=="shop"||rooms.resolved)return;
  rect(0,0,w,h,"rgba(0,0,0,.68)");
  text("深夜小卖部 · 金币 "+inventory.coins,w/2,h/2-88,22,config.colors.neonBlue,"center");
  const cardW=Math.min(145,(w-90)/3),gap=12,total=cardW*3+gap*2,start=(w-total)/2;
  shop.stock.forEach((id,i)=>{
    const x=start+i*(cardW+gap),y=h/2-62;
    rect(x,y,cardW,118,"#211C35");strokeRect(x,y,cardW,118,config.colors.neonBlue,2);
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
  rect(0,0,w,h,"rgba(0,0,0,.68)");
  text(activeEvent.title,w/2,h/2-55,24,config.colors.neonPink,"center");
  text(activeEvent.text,w/2,h/2-20,14,"#FFFFFF","center");
  activeEvent.choices.forEach((c,i)=>button(w/2-132+i*140,h/2+45,124,38,c,i===0?"#5A2B55":"#2B3355"));
}

function renderStateOverlay(){
  if(gameState.state==="playing")return;
  rect(0,0,w,h,"rgba(0,0,0,.76)");
  if(gameState.state==="paused"){
    text("已暂停",w/2,h/2-25,28,config.colors.neonBlue,"center");
    button(w/2-70,h/2+18,140,42,"继续游戏");
  }else{
    text(gameState.message,w/2,h/2-42,30,gameState.state==="win"?config.colors.neonYellow:"#FF4F68","center");
    text("本局击败 "+combat.kills+" · 金币 "+inventory.coins,w/2,h/2-8,14,"#FFFFFF","center");
    text("历史最佳 "+(save.bestFloor||0)+" 房 · 游玩 "+(save.runs||0)+" 局",w/2,h/2+18,11,config.colors.muted,"center");
    button(w/2-80,h/2+40,160,44,"重新开始",gameState.state==="win"?"#5A4A20":"#57283A");
  }
}

function render(){
  renderBackground();
  renderEntities();
  renderHud();
  renderRewardOverlay();
  renderShopOverlay();
  renderEventOverlay();
  if(noticeTimer>0){
    rect(w/2-110,86,220,34,"rgba(0,0,0,.75)");
    text(notice,w/2,108,13,config.colors.neonYellow,"center");
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

const config=require("./config/gameConfig");
const Input=require("./core/Input");
const Player=require("./entities/Player");
const Enemy=require("./entities/Enemy");
const WaveSystem=require("./systems/WaveSystem");
const SkillOrbSystem=require("./systems/SkillOrbSystem");

const canvas=wx.createCanvas();
const ctx=canvas.getContext("2d");
const {windowWidth:w,windowHeight:h}=wx.getSystemInfoSync();
canvas.width=w;canvas.height=h;
const arena={left:config.arena.marginX,right:w-config.arena.marginX,top:config.arena.top,bottom:h-config.arena.bottom};
const input=new Input(canvas);
const player=new Player(w/2,(arena.top+arena.bottom)/2);
const wave=new WaveSystem();
const orbSystem=new SkillOrbSystem();
const enemies=[];
let score=0,last=Date.now(),burst=0;

function spawnEnemy(waveNo){
  const side=Math.floor(Math.random()*4); let x,y;
  if(side===0){x=arena.left;y=arena.top+Math.random()*(arena.bottom-arena.top);}
  if(side===1){x=arena.right;y=arena.top+Math.random()*(arena.bottom-arena.top);}
  if(side===2){x=arena.left+Math.random()*(arena.right-arena.left);y=arena.top;}
  if(side===3){x=arena.left+Math.random()*(arena.right-arena.left);y=arena.bottom;}
  enemies.push(new Enemy(x,y,1+Math.min(1.4,(waveNo-1)*.08)));
}
function hit(a,b){return Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r;}
function update(dt){
  player.update(dt,input,arena); wave.update(dt,spawnEnemy); orbSystem.update(dt,arena); burst=Math.max(0,burst-dt);
  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i]; e.update(dt,player);
    if(hit(e,player)) player.damage(config.enemy.contactDamage);
    if(burst>0 && Math.hypot(e.x-player.x,e.y-player.y)<105){ enemies.splice(i,1); score++; }
  }
  for(let i=orbSystem.orbs.length-1;i>=0;i--){
    if(hit(player,orbSystem.orbs[i])){orbSystem.orbs.splice(i,1);burst=1.1;}
  }
  if(player.hp<=0){player.hp=player.maxHp;player.x=w/2;player.y=(arena.top+arena.bottom)/2;enemies.length=0;score=0;wave.wave=1;wave.waveTime=0;}
}
function circle(x,y,r,fill){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
function render(){
  ctx.fillStyle=config.colors.background;ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#24314A";ctx.fillRect(0,0,w,arena.top);ctx.fillRect(0,arena.bottom,w,h-arena.bottom);
  ctx.fillStyle=config.colors.arena;ctx.fillRect(arena.left,arena.top,arena.right-arena.left,arena.bottom-arena.top);
  ctx.strokeStyle=config.colors.border;ctx.lineWidth=5;ctx.strokeRect(arena.left,arena.top,arena.right-arena.left,arena.bottom-arena.top);
  if(burst>0){ctx.strokeStyle="rgba(255,190,40,.85)";ctx.lineWidth=8;ctx.beginPath();ctx.arc(player.x,player.y,95,0,Math.PI*2);ctx.stroke();}
  orbSystem.orbs.forEach(o=>{circle(o.x,o.y,o.r+6,"rgba(56,189,248,.25)");circle(o.x,o.y,o.r,config.colors.orb);});
  enemies.forEach(e=>circle(e.x,e.y,e.r,config.colors.enemy));
  circle(player.x,player.y,player.r,player.invuln>0?"#FFB4B4":config.colors.player);
  ctx.fillStyle=config.colors.text;ctx.font="bold 18px sans-serif";ctx.fillText("暴走老太 · 原型",18,34);
  ctx.font="15px sans-serif";ctx.fillText("第 "+wave.wave+" 波",18,62);ctx.fillText("击败 "+score,18,84);
  ctx.fillStyle="#3B455B";ctx.fillRect(18,102,w-36,18);ctx.fillStyle="#EF4444";ctx.fillRect(18,102,(w-36)*(player.hp/player.maxHp),18);
  ctx.fillStyle="#FFFFFF";ctx.font="12px sans-serif";ctx.fillText("HP "+player.hp+"/"+player.maxHp,26,115);
  ctx.fillStyle="rgba(0,0,0,.5)";ctx.fillRect(18,h-84,w-36,54);ctx.fillStyle="#FFFFFF";ctx.font="14px sans-serif";ctx.fillText("按住并拖动移动；拾取蓝色技能球触发范围锅盖攻击",28,h-52);
}
function loop(){const now=Date.now();const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);render();requestAnimationFrame(loop);}loop();

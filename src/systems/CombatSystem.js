const Bullet = require("../entities/Bullet");

function rectHit(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x &&
    a.y < b.y+b.h && a.y+a.h > b.y;
}

class CombatSystem {
  constructor(dropSystem){
    this.bullets=[];
    this.enemyProjectiles=[];
    this.kills=0;
    this.dropSystem=dropSystem;
    this.lastCrit=false;
  }

  fire(player,inventory,dirOverride=null){
    const weapon=inventory.weapon;
    const shots=weapon.shots + inventory.mod("extraShots",0);
    const dir=dirOverride || player.facing;
    for(let i=0;i<shots;i++){
      const b=new Bullet(player.x+player.w/2,player.y+player.h*.45,dir);
      b.damage=weapon.damage;
      b.vx=weapon.speed*dir;
      b.vy=(i-(shots-1)/2)*42;
      b.ricochet=inventory.mod("ricochet",0);
      this.bullets.push(b);
    }
    player.didShoot(weapon.cooldown);
  }

  update(dt,player,enemies,input,world,inventory){
    if(input.shoot && player.canShoot()) this.fire(player,inventory);

    if(player.justJumped && inventory.flag("jumpShot")){
      const b=new Bullet(player.x+player.w/2,player.y+player.h,1);
      b.vx=0;b.vy=380;b.damage=1;b.life=.7;
      this.bullets.push(b);
    }

    for(let i=this.bullets.length-1;i>=0;i--){
      const b=this.bullets[i];
      b.x+=b.vx*dt;
      b.y+=(b.vy||0)*dt;
      b.life-=dt;
      if(b.x<world.left || b.x>world.right || b.y<70 || b.y>world.floorY){
        if(b.ricochet>0 && (b.x<world.left || b.x>world.right)){
          b.vx*=-1;b.ricochet--;b.x=Math.max(world.left,Math.min(world.right-b.w,b.x));
        } else b.dead=true;
      }

      if(!b.dead){
        for(const e of enemies){
          if(!e.dead && rectHit(b,e)){
            const crit=Math.random()<inventory.mod("crit",0);
            const dmg=b.damage*(crit?2:1);
            e.damage(dmg);
            this.lastCrit=crit;
            if(crit && inventory.flag("burnOnCrit")) e.damage(1);
            b.dead=true;
            break;
          }
        }
      }
      if(b.life<=0)b.dead=true;
      if(b.dead)this.bullets.splice(i,1);
    }

    for(const e of enemies){
      if(e.dead)continue;
      if(e.type==="boss") e.update(dt,player,this.enemyProjectiles);
      else e.update(dt,player);
      if(rectHit(e,player)){
        const dmg=inventory.takeDamage(1);
        player.damage(dmg);
      }
    }

    for(let i=this.enemyProjectiles.length-1;i>=0;i--){
      const p=this.enemyProjectiles[i];
      p.x+=p.vx*dt;p.y+=(p.vy||0)*dt;p.life-=dt;
      if(rectHit(p,player)){
        const dmg=inventory.takeDamage(p.damage||1);
        player.damage(dmg);p.dead=true;
      }
      if(p.life<=0 || p.x<world.left-30 || p.x>world.right+30)p.dead=true;
      if(p.dead)this.enemyProjectiles.splice(i,1);
    }

    for(let i=enemies.length-1;i>=0;i--){
      const e=enemies[i];
      if(e.dead){
        this.kills++;
        this.dropSystem.spawnCoin(e.x,e.y, e.type==="boss"?25:e.type==="tank"?3:1);
        if(Math.random()<inventory.mod("killHealChance",0)) this.dropSystem.spawnHeal(e.x+8,e.y);
        enemies.splice(i,1);
      }
    }
  }
}
module.exports=CombatSystem;

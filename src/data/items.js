module.exports = {
  old_glasses: { id:"old_glasses", name:"老花镜", type:"passive", price:60, desc:"暴击率 +8%", mods:{ crit:0.08 } },
  neon_slippers: { id:"neon_slippers", name:"发光拖鞋", type:"passive", price:70, desc:"移动速度 +12%", mods:{ speed:0.12 } },
  apron_shield: { id:"apron_shield", name:"围裙护盾", type:"passive", price:85, desc:"每个房间获得 1 点护盾", mods:{ roomShield:1 } },
  thermos: { id:"thermos", name:"保温壶", type:"passive", price:90, desc:"击杀时 18% 概率回复 1 生命", mods:{ killHealChance:0.18 } },
  chili_badge: { id:"chili_badge", name:"辣酱徽章", type:"passive", price:95, desc:"暴击附加灼烧伤害", mods:{ burnOnCrit:true } },
  smile_sticker: { id:"smile_sticker", name:"笑脸锅贴", type:"passive", price:80, desc:"跳跃时向下发射弹片", mods:{ jumpShot:true } },
  double_pan: { id:"double_pan", name:"双锅流", type:"passive", price:110, desc:"额外发射 1 枚子弹", mods:{ extraShots:1 } },
  ricochet_spoon: { id:"ricochet_spoon", name:"弹跳锅铲", type:"passive", price:120, desc:"子弹可反弹 1 次", mods:{ ricochet:1 } }
};

module.exports = {
  arena: { marginX: 28, top: 150, bottom: 150 },
  player: { radius: 18, speed: 230, maxHp: 100 },
  enemy: { radius: 14, speed: 72, hp: 24, contactDamage: 10 },
  wave: { duration: 25, spawnEvery: 0.8 },
  skillOrb: { radius: 11, spawnEvery: 7 },
  colors: {
    background: "#182033", arena: "#C99C6B", border: "#765231",
    player: "#F3E4D4", enemy: "#6B3FA0", orb: "#38BDF8", text: "#FFFFFF"
  }
};

module.exports = {
  world: {
    gravity: 1550,
    floorHeight: 74,
    roomPadding: 34
  },
  player: {
    width: 34,
    height: 46,
    speed: 235,
    jumpSpeed: 585,
    maxHp: 6,
    shootCooldown: 0.22
  },
  enemy: {
    width: 32,
    height: 34,
    speed: 82,
    hp: 3,
    contactDamage: 1
  },
  bullet: {
    width: 14,
    height: 6,
    speed: 570,
    damage: 1,
    life: 1.6
  },
  colors: {
    background: "#090814",
    room: "#151326",
    platform: "#25203C",
    neonPink: "#FF4FD8",
    neonBlue: "#35D7FF",
    neonPurple: "#8F5BFF",
    neonYellow: "#FFE76A",
    player: "#F8F2E7",
    enemy: "#9B4DFF",
    text: "#FFFFFF",
    muted: "#8E8AA8"
  }
};

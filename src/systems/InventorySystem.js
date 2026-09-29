const items = require("../data/items");
const weapons = require("../data/weapons");

class InventorySystem {
  constructor() {
    this.weaponId = "pan_blaster";
    this.items = [];
    this.coins = 0;
    this.shield = 0;
  }

  get weapon() { return weapons[this.weaponId]; }

  addItem(id) {
    if (!items[id]) return false;
    this.items.push(id);
    return true;
  }

  has(id) { return this.items.includes(id); }

  mod(name, base = 0) {
    return this.items.reduce((v, id) => {
      const m = items[id].mods || {};
      return v + (typeof m[name] === "number" ? m[name] : 0);
    }, base);
  }

  flag(name) {
    return this.items.some(id => (items[id].mods || {})[name] === true);
  }

  onEnterRoom() {
    const s = this.mod("roomShield", 0);
    if (s > 0) this.shield = s;
  }

  takeDamage(amount) {
    if (this.shield > 0) {
      const used = Math.min(this.shield, amount);
      this.shield -= used;
      amount -= used;
    }
    return amount;
  }

  randomItem(excludeOwned = true) {
    const pool = Object.keys(items).filter(id => !excludeOwned || !this.has(id));
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
module.exports = InventorySystem;

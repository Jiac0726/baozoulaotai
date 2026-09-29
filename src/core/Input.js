class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.pointer = null;
    this.active = false;
    wx.onTouchStart(e => this.handle(e));
    wx.onTouchMove(e => this.handle(e));
    wx.onTouchEnd(() => { this.active = false; this.pointer = null; });
    wx.onTouchCancel(() => { this.active = false; this.pointer = null; });
  }
  handle(e) {
    const t = e.touches && e.touches[0];
    if (!t) return;
    this.pointer = { x: t.clientX, y: t.clientY };
    this.active = true;
  }
}
module.exports = Input;

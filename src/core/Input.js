const {buildControlLayout,contains}=require("../ui/ControlLayout");

class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.layout = buildControlLayout(canvas);
    this.left = false;
    this.right = false;
    this.jump = false;
    this.shoot = false;
    this.jumpPressed = false;
    this.tap = null;

    wx.onTouchStart(e => {
      const changed = e.changedTouches && e.changedTouches[0];
      if (changed) this.tap = { x: changed.clientX, y: changed.clientY };
      this.handle(e.touches || []);
    });
    wx.onTouchMove(e => this.handle(e.touches || []));
    wx.onTouchEnd(e => this.handle(e.touches || []));
    wx.onTouchCancel(() => this.reset());
  }

  reset() {
    this.left = this.right = this.jump = this.shoot = false;
  }

  handle(touches) {
    const prevJump = this.jump;
    this.left = false;
    this.right = false;
    this.jump = false;
    this.shoot = false;

    for (const t of touches) {
      const x = t.clientX;
      const y = t.clientY;

      if (contains(this.layout.left,x,y)) this.left = true;
      if (contains(this.layout.right,x,y)) this.right = true;
      if (contains(this.layout.jump,x,y)) this.jump = true;
      if (contains(this.layout.shoot,x,y)) this.shoot = true;
    }

    this.jumpPressed = this.jump && !prevJump;
  }

  consumeJump() {
    const v = this.jumpPressed;
    this.jumpPressed = false;
    return v;
  }

  consumeTap() {
    const t = this.tap;
    this.tap = null;
    return t;
  }
}
module.exports = Input;

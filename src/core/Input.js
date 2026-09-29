class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.left = false;
    this.right = false;
    this.jump = false;
    this.shoot = false;
    this.jumpPressed = false;

    wx.onTouchStart(e => this.handle(e.touches || []));
    wx.onTouchMove(e => this.handle(e.touches || []));
    wx.onTouchEnd(e => this.handle(e.touches || []));
    wx.onTouchCancel(() => this.reset());
  }

  reset() {
    this.left = this.right = this.jump = this.shoot = false;
  }

  handle(touches) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const prevJump = this.jump;

    this.left = false;
    this.right = false;
    this.jump = false;
    this.shoot = false;

    for (const t of touches) {
      const x = t.clientX;
      const y = t.clientY;

      if (x < w * 0.36) {
        if (x < w * 0.18) this.left = true;
        else this.right = true;
      } else if (x > w * 0.78 && y > h * 0.48) {
        this.shoot = true;
      } else if (x > w * 0.58 && y > h * 0.48) {
        this.jump = true;
      }
    }

    this.jumpPressed = this.jump && !prevJump;
  }

  consumeJump() {
    const v = this.jumpPressed;
    this.jumpPressed = false;
    return v;
  }
}
module.exports = Input;

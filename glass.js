import {Bodies, Body, Composite} from 'matter-js'


let canvasWidth = innerWidth
let canvasHeight = innerHeight
export class Glass {
  constructor(pos, engine, img) {
    const thickness = 25
    const wallColor = '#00000000'
    this.glassImg = img
    this.cx = pos.x
    this.cy = pos.y
    this.control = {
      left: false,
      right: false,
      up: false,
      down: false,
      clockwise: false,
      counterClockwise: false,
    }

    let left = Bodies.rectangle(this.cx - 60, this.cy, thickness, 150, {
      chamfer: {radius: 10},
      angle: Math.PI / 180 * -15,
      // render: {fillStyle: wallColor}
    })
    let right = Bodies.rectangle(this.cx + 37, this.cy, thickness, 150, {
      chamfer: {radius: 10},
      angle: Math.PI / 180 * 15,
      // render: {fillStyle: wallColor}
    })
    let bottom = Bodies.rectangle(this.cx - 10, this.cy + 72, 85, thickness * 2, {
      chamfer: {radius: 20},
      // render: {fillStyle: wallColor}
    })
    this.glassImg.style.transform = `translate(${this.cx - canvasWidth / 2}px, ${this.cy - canvasHeight / 2}px)`

    this.glass = Body.create({
      parts: [left, right, bottom],
      isStatic: true
    })

    Composite.add(engine.world, [this.glass])
  }

  setPosition = pos => {
    Body.setPosition(this.glass, {x: pos.x, y: pos.y});

    const current_angle = this.glass.angle

    this.glassImg.style.transform =
      `translate(${pos.x + 11 - canvasWidth / 2}px, ${pos.y - 25 - canvasHeight / 2}px)` +
      `rotate(${Math.floor(180 * current_angle / Math.PI)}deg)`
  }

  setAngle = angle => {
    Body.setAngle(this.glass, angle)
    console.log(`rotate(${angle}deg)`)
    const current_pos = this.getPosition()
    // TODO: the glass is not rotating exactly with the body, use another image maybe
    this.glassImg.style.transform =
      `translate(${current_pos.x + 11 - canvasWidth / 2}px, ${current_pos.y - 25 - canvasHeight / 2}px) ` +
      `rotate(${Math.floor(180 * angle / Math.PI)}deg)`
  }
  getPosition = () => {
    return {
      x: this.glass.position.x,
      y: this.glass.position.y
    }
  }

  updatePosition = () => {
    // FIXME: one direction at a time
    const current_pos = this.getPosition()
    const current_angle = this.glass.angle
    if (this.control.right) {
      this.setPosition({x: current_pos.x + 5, y: current_pos.y})
    }
    if (this.control.left) {
      this.setPosition({x: current_pos.x - 5, y: current_pos.y});
    }
    if (this.control.up) {
      this.setPosition({x: current_pos.x, y: current_pos.y - 5});
    }
    if (this.control.down) {
      this.setPosition({x: current_pos.x, y: current_pos.y + 5});
    }
    if (this.control.clockwise) {
      this.setAngle(current_angle + 0.02)
    }
    if (this.control.counterClockwise) {
      this.setAngle(current_angle - 0.02)
    }
  };
}
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

    const radians = Math.PI / 180 * 15
    this.leftTip = Bodies.circle(
      this.cx - 60 - Math.sin(radians) * 150 / 2,
      this.cy - Math.cos(radians) * 150 / 2,
      1
    )
    this.rightTip = Bodies.circle(
      this.cx + 37 + Math.sin(radians) * 150 / 2,
      this.cy - Math.cos(radians) * 150 / 2,
      1
    )
    let left = Bodies.rectangle(this.cx - 60, this.cy, thickness, 150, {
      chamfer: {radius: 10},
      angle: -radians,
      render: {fillStyle: wallColor}
    })
    let right = Bodies.rectangle(this.cx + 37, this.cy, thickness, 150, {
      chamfer: {radius: 10},
      angle: radians,
      render: {fillStyle: wallColor}
    })
    let bottom = Bodies.rectangle(this.cx - 10, this.cy + 72, 85, thickness * 2, {
      chamfer: {radius: 20},
      render: {fillStyle: wallColor}
    })
    this.glassImg.style.transform = `translate(${this.cx - canvasWidth / 2}px, ${this.cy - canvasHeight / 2}px)`

    this.glass = Body.create({
      parts: [left, right, bottom, this.leftTip, this.rightTip],
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

  getLowestCupLipPoint = () => Math.max(this.leftTip.position.y, this.rightTip.position.y)

  updatePosition = () => {
    // FIXME: one direction at a time
    let new_pos = this.getPosition()
    const current_angle = this.glass.angle
    if (this.control.right) {
      new_pos.x = new_pos.x + 5
    }
    if (this.control.left) {
      new_pos.x = new_pos.x - 5
    }
    if (this.control.up) {
      new_pos.y = new_pos.y - 5
    }
    if (this.control.down) {
      new_pos.y = new_pos.y + 5
    }
    if (this.control.clockwise) {
      this.setAngle(current_angle + 0.02)
    }
    if (this.control.counterClockwise) {
      this.setAngle(current_angle - 0.02)
    }

    this.setPosition({
      x: Math.min(Math.max(new_pos.x, 0), canvasWidth),
      y: Math.min(Math.max(new_pos.y, 0), canvasHeight - 20)
    })
  };
}
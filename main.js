import {Bodies, Body, Composite, Engine, Events, Mouse, Render, Runner} from 'matter-js'

const canvas = document.querySelector('#matter-canvas')
let canvasWidth = innerWidth
let canvasHeight = innerHeight

const stdDeviation = [8, 10]
const colorMatrix = ['15 -3', '30 -5']

let engine, render, runner, mouse
let circles = []
let glass

function init() {
  engine = Engine.create({
    constraintIterations: 10,
    positionIterations: 10
  })

  render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: canvasWidth,
      height: canvasHeight,
      wireframes: false,
      background: 'transparent',
      pixelRatio: 1
    }
  })

  mouse = Mouse.create(canvas)
  mouse.element.removeEventListener('mousewheel', mouse.mousewheel)
  mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel)

  runner = Runner.create()

  Render.run(render)
  Runner.run(runner, engine)
}


function createLiquid(pos, num, color = '#fff') {

  const radius = randomNumBetween(6, 7)
  for (let i = 0; i < num; ++i) {
    const body = Bodies.circle(pos.x, pos.y, radius, {
      friction: 0,
      density: 1,
      frictionAir: 0,
      restitution: 0.7,
      render: {fillStyle: color}
    })
    Body.applyForce(body, body.position, {x: 1, y: 0})
    Composite.add(engine.world, body)
    circles.push(body)
  }
}

class Glass {
  constructor() {
    const thickness = 25
    const wallColor = '#00000000'
    this.glassImg = document.querySelector('#glass')
    this.cx = canvasWidth * 0.5
    this.cy = canvasHeight * 0.8
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
      render: {fillStyle: wallColor}
    })
    let right = Bodies.rectangle(this.cx + 37, this.cy, thickness, 150, {
      chamfer: {radius: 10},
      angle: Math.PI / 180 * 15,
      render: {fillStyle: wallColor}
    })
    let bottom = Bodies.rectangle(this.cx - 10, this.cy + 72, 85, thickness * 2, {
      chamfer: {radius: 20},
      render: {fillStyle: wallColor}
    })
    this.glassImg.style.transform = `translate(${this.cx - canvasWidth / 2}px, ${this.cy - canvasHeight / 2}px)`

    this.left = left
    this.glass = Body.create({
      parts: [left, right, bottom],
      isStatic: true
    })

    Composite.add(engine.world, [this.glass])
  }

  setPosition = pos => {
    Body.setPosition(glass.glass, {x: pos.x, y: pos.y});

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

const x = canvasWidth * 0.5
const y = canvasHeight * 0.8
const initial_pos = {x: x, y: y}

init()
resizeFilter()
glass = new Glass()
createLiquid(initial_pos, 100)

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft')
    glass.control.left = true;
  if (event.key === 'ArrowRight')
    glass.control.right = true;
  if (event.key === 'ArrowUp')
    glass.control.up = true;
  if (event.key === 'ArrowDown')
    glass.control.down = true;
  if (event.key === 'q')
    glass.control.counterClockwise = true;
  if (event.key === 'e')
    glass.control.clockwise = true;
});

document.addEventListener('keyup', event => {
  if (event.key === 'ArrowLeft')
    glass.control.left = false;
  if (event.key === 'ArrowRight')
    glass.control.right = false;
  if (event.key === 'ArrowUp')
    glass.control.up = false;
  if (event.key === 'ArrowDown')
    glass.control.down = false;
  if (event.key === 'q')
    glass.control.counterClockwise = false;
  if (event.key === 'e')
    glass.control.clockwise = false;
})


// Check for up and down
Events.on(runner, 'tick', e => {
  for (let i = circles.length - 1; i >= 0; i--) {
    if (circles[i].position.y - circles[i].circleRadius > canvasHeight) {
      Composite.remove(engine.world, circles[i])
      circles.splice(i, 1)
    }
  }

  glass.updatePosition()
})

function resizeFilter() {
  const feGaussianBlur = document.querySelector('#gooey feGaussianBlur')
  const feColorMatrix = document.querySelector('#gooey feColorMatrix')
  let index
  if (canvasWidth < 600) index = 0
  else index = 1
  feGaussianBlur.setAttribute('stdDeviation', stdDeviation[index])
  feColorMatrix.setAttribute('values', `1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${colorMatrix[index]}`)
}

window.addEventListener('resize', () => {
  canvasWidth = innerWidth
  canvasHeight = innerHeight
  render.canvas.width = canvasWidth
  render.canvas.height = canvasHeight
  resizeFilter()

  glass.setPosition({x: canvasWidth * 0.5, y: canvasHeight * 0.8})
})

function randomNumBetween(min, max) {
  return Math.random() * (max - min) + min
}

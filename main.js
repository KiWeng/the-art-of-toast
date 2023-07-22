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

function createLiquid() {
  const x = 105
  const y = 105
  const radius = randomNumBetween(6, 7)
  const body = Bodies.circle(x, y, radius, {
    friction: 0,
    density: 1,
    frictionAir: 0,
    restitution: 0.7,
    render: {fillStyle: '#fff'}
  })
  Body.applyForce(body, body.position, {x: 1, y: 0})
  Composite.add(engine.world, body)
  circles.push(body)
}

class Glass {
  constructor() {
    const thickness = 25
    const wallColor = '#00000000'
    this.glassImg = document.querySelector('#glass')
    this.cx = canvasWidth * 0.5
    this.cy = canvasHeight * 0.8

    this.left = Bodies.rectangle(this.cx - 60, this.cy, thickness, 150, {
      chamfer: {radius: 10},
      isStatic: true,
      angle: Math.PI / 180 * -15,
      render: {fillStyle: wallColor}
    })
    this.right = Bodies.rectangle(this.cx + 37, this.cy, thickness, 150, {
      chamfer: {radius: 10},
      isStatic: true,
      angle: Math.PI / 180 * 15,
      render: {fillStyle: wallColor}
    })
    this.bottom = Bodies.rectangle(this.cx - 10, this.cy + 72, 85, thickness * 2, {
      chamfer: {radius: 20},
      isStatic: true,
      render: {fillStyle: wallColor}
    })
    this.glassImg.style.transform = `translate(${this.cx - canvasWidth / 2}px, ${this.cy - canvasHeight / 2}px)`

    Composite.add(engine.world, [this.left, this.right, this.bottom])
  }

  setPosition = pos => {
    console.log(this.left);
    this.cx = pos.x
    this.cy = pos.y
    Body.setPosition(this.left, {x: this.cx - 60, y: this.cy})
    Body.setPosition(this.right, {x: this.cx + 37, y: this.cy})
    Body.setPosition(this.bottom, {x: this.cx - 10, y: this.cy + 72})
    this.glassImg.style.transform = `translate(${this.cx - canvasWidth / 2}px, ${this.cy - canvasHeight / 2}px)`
  }

  getPosition = () => {
    return {
      x: this.left.position.x + 60,
      y: this.left.position.y
    }
  }
}

init()
resizeFilter()
glass = new Glass()

const controller = {
  left: false,
  right: false,
  up: false,
  down: false
}
document.addEventListener('keydown', event => {
  const currentPos = glass.getPosition()
  if (event.key === 'ArrowLeft') {
    controller.left = true;
    glass.setPosition({x: currentPos.x - 1, y: currentPos.y})
  } else if (event.key === 'ArrowRight') {
    controller.right = true;
    const currentPos = glass.getPosition()
    glass.setPosition({x: currentPos.x + 1, y: currentPos.y})
  } else if (event.key === 'ArrowUp') {
    controller.right = true;
    const currentPos = glass.getPosition()
    glass.setPosition({x: currentPos.x, y: currentPos.y - 1})
  } else if (event.key === 'ArrowDown') {
    controller.right = true;
    const currentPos = glass.getPosition()
    glass.setPosition({x: currentPos.x, y: currentPos.y + 1})
  }

  // check for up/down keys...
});

document.addEventListener('keyup', event => {
  if (event.key === 'ArrowLeft') {
    controller.left = false;
  } else if (event.key === 'ArrowRight') {
    controller.right = false;
  }

  // check for up/down keys
});

// Inside engine update loop
if (controller.right) {
  // Body.applyForce(body, {x: 0.001, y: 0});
}

if (controller.left) {
  const currentPos = glass.getPosition()
  // Body.applyForce(body, {x: -0.001, y: 0});
}

// Check for up and down
Events.on(runner, 'tick', e => {
  createLiquid()
  for (let i = circles.length - 1; i >= 0; i--) {
    if (circles[i].position.y - circles[i].circleRadius > canvasHeight) {
      Composite.remove(engine.world, circles[i])
      circles.splice(i, 1)
    }
  }
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

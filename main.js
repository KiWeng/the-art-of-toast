import {Bodies, Body, Bounds, Composite, Engine, Events, Mouse, Render, Runner} from 'matter-js'
import {Glass} from './glass.js'
import {bindKey, unbindKey} from '@rwh/keystrokes'

const canvas = document.querySelector('#matter-canvas')
let canvasWidth = innerWidth
let canvasHeight = innerHeight

const stdDeviation = [8, 10]
const colorMatrix = ['15 -3', '30 -5']

let engine, render, runner, mouse
let circles = []
let glass0, glass1

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

const x0 = canvasWidth * 0.3
const x1 = canvasWidth * 0.7
const y = canvasHeight * 0.8
const initial_pos0 = {x: x0, y: y}
const initial_pos1 = {x: x1, y: y}

init()
resizeFilter()
glass0 = new Glass(initial_pos0, engine, document.querySelector('#glass0'))
glass1 = new Glass(initial_pos1, engine, document.querySelector('#glass1'))
createLiquid(initial_pos0, 100)
createLiquid(initial_pos1, 100)


bindKey('a', {
  onPressed: () => glass0.control.left = true,
  onReleased: () => glass0.control.left = false
})
bindKey('d', {
  onPressed: () => glass0.control.right = true,
  onReleased: () => glass0.control.right = false
})
bindKey('w', {
  onPressed: () => glass0.control.up = true,
  onReleased: () => glass0.control.up = false
})
bindKey('s', {
  onPressed: () => glass0.control.down = true,
  onReleased: () => glass0.control.down = false
})
bindKey('q', {
  onPressed: () => glass0.control.counterClockwise = true,
  onReleased: () => glass0.control.counterClockwise = false
})
bindKey('e', {
  onPressed: () => glass0.control.clockwise = true,
  onReleased: () => glass0.control.clockwise = false
})


bindKey('k', {
  onPressed: () => glass1.control.left = true,
  onReleased: () => glass1.control.left = false
})
bindKey(';', {
  onPressed: () => glass1.control.right = true,
  onReleased: () => glass1.control.right = false
})
bindKey('o', {
  onPressed: () => glass1.control.up = true,
  onReleased: () => glass1.control.up = false
})
bindKey('l', {
  onPressed: () => glass1.control.down = true,
  onReleased: () => glass1.control.down = false
})
bindKey('i', {
  onPressed: () => glass1.control.counterClockwise = true,
  onReleased: () => glass1.control.counterClockwise = false
})
bindKey('p', {
  onPressed: () => glass1.control.clockwise = true,
  onReleased: () => glass1.control.clockwise = false
})

// Check for up and down
Events.on(runner, 'tick', e => {
  for (let i = circles.length - 1; i >= 0; i--) {
    if (circles[i].position.y - circles[i].circleRadius > canvasHeight) {
      Composite.remove(engine.world, circles[i])
      circles.splice(i, 1)
    }
  }

  if (Bounds.overlaps(glass0.glass.bounds, glass1.glass.bounds)) {
    let endGameTitle = document.getElementById('endgame')
    let foreground = document.getElementById('foreground')
    let background = document.getElementById('background')

    const boundKeys = 'qweasdiopkl;'
    for (let ch of boundKeys) {
      unbindKey(ch)
    }

    glass0.control.clockwise = false
    glass0.control.counterClockwise = false
    glass0.control.left = false
    glass0.control.right = false
    glass0.control.down = false
    glass0.control.up = false
    glass0.control.clockwise = false
    glass1.control.counterClockwise = false
    glass1.control.left = false
    glass1.control.right = false
    glass1.control.down = false
    glass1.control.up = false

    if (glass0.getLowestCupLipPoint() > glass1.getLowestCupLipPoint()) {
      endGameTitle.innerText = "Left"
    } else {
      endGameTitle.innerText = "Right"
    }

    foreground.style.animation = "fadeIn 0.5s"
    background.style.animation = "fadeIn 0.5s"
    background.style.display = "flex"
    foreground.style.display = "flex"
  }

  glass0.updatePosition()
  glass1.updatePosition()
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

  // FIXME:
  // glass0.setPosition({x: canvasWidth * 0.5, y: canvasHeight * 0.8})
  // glass1.setPosition({x: canvasWidth * 0.5, y: canvasHeight * 0.8})
})

function randomNumBetween(min, max) {
  return Math.random() * (max - min) + min
}

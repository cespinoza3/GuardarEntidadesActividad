import kaboom from "kaboom"

// initialize context
kaboom()

// load assets
loadSprite("bean", "sprites/bean.png")
loadSprite("steel", "sprites/steel.png")

function getMapTiles() {
  return [
    '##########',
    '#p------x#',
    '##########'
  ]
}

class Op {
  name = () => 'op'
  action = (player) => null
  constructor(name, action) {
    this.name = name
    this.action = action
  }

  static makeLookAt(name, direction) {
    return new Op(() => name, (player) => {
      player.direction = direction
    })
  }
}

const ops = {
  right: Op.makeLookAt('right', RIGHT),
  left: Op.makeLookAt('left', LEFT),
  up: Op.makeLookAt('up', UP),
  down: Op.makeLookAt('down', DOWN),
}

function loadInstructions() {
  return Array(7).fill(ops.right)
}

const blockPos = (x, y) => pos(x*65, y*65) 

function interpretMap(map, state) {
  function makePlayer(blockX, blockY) {
    return add([
      sprite("bean"),
      blockPos(blockX, blockY),
      area()
    ])
  }

  function makeSteel(x, y) {
    return add([
      sprite("steel"),
      blockPos(x, y),
      area()
    ])
  }
  
  map.forEach((row, y) => {
    Array.prototype.forEach.call(row, (c, x) => {
      if (c == 'p') {
        state.player = makePlayer(x, y)
      } else if (c == '#') {
        makeSteel(x, y)
      }
    })
  })
  
}

const state = {}
const map = getMapTiles()
interpretMap(map, state)
const {player} = state

const instructions = loadInstructions()

function topLeftCorner() {
  return camPos().sub(width()/2, height()/2)
}

function guiPos(_x, _y) {
  return {
    id: 'guiPos',
    require: ['pos'],
    add() {
      this.guiPos = vec2(_x, _y)
      this.pos = topLeftCorner().add(this.guiPos)
    },
    update() {
      this.pos = topLeftCorner().add(this.guiPos)
    }
  }
}

class PlanPanel {
  constructor(instructions) {
    this.instructions = instructions
    this.current = 0
    this.drawnInstructions = []
    this.pointer = null
  }

  draw() {
    this.pointer = add([
      text(">"),
      pos(0, 0),
      guiPos(0, 0)
    ])

    this.drawnInstructions = this.instructions
      .map((x, y) => add([
        text(x.name()), 
        pos(),
        guiPos(65, y * 65)
      ]))
  }
}

const planPanel = new PlanPanel(instructions)
planPanel.draw()

onUpdate(() => {
  camPos(player.pos)
})

timer(1, () => {
  
})


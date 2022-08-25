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
  Op(name, action) {
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

onUpdate(() => {
  camPos(player.pos)
})

timer(1, () => {
  
})


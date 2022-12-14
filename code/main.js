import kaboom from "kaboom"

// initialize context
kaboom()

// load assets
loadSprite("bean", "sprites/bean.png")
loadSprite("steel", "sprites/steel.png")

const cellSize = vec2(65, 65)

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

const blockPos = (x, y) => pos(x * 65, y * 65)

function interpretMap(map, state) {
  function makePlayer(blockX, blockY) {
    return add([
      sprite("bean"),
      blockPos(blockX, blockY),
      area(),
      {
        direction: RIGHT
      }
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
const { player } = state

const instructions = loadInstructions()
let opPointer = 0
const doInstruction = (player) => {
  instructions[opPointer].action(player)
}
const nextInstruction = () => {
  opPointer += 1
}

const hasNextInstruction = () => opPointer < instructions.length

function topLeftCorner() {
  return camPos().sub(width() / 2, height() / 2)
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

/**
* animates callback passing a value increasing from
* 0.0 to 1.0, proportional to the time completed
*/
function animation(duration, callback) {
  let t = 0
  const stop = onUpdate(() => {
    t += dt()
    callback(t / duration)
  })
  return wait(duration, stop)
}

class PlanPanel {

  yUnit = 65
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
      fixed()
    ])

    this.drawnInstructions = this.instructions
      .map((x, y) => add([
        text(x.name()),
        pos(65, 65 * y),
        fixed()
      ]))
  }

  next() {
    const actualYs = this.drawnInstructions.map(x => x.pos.y)
    return animation(1, (percent) => {
      this.drawnInstructions.forEach((x, i) => {
        x.pos.y = actualYs[i] - this.yUnit * percent
      })
    })
  }
}

const planPanel = new PlanPanel(instructions)
planPanel.draw()

onUpdate(() => {
  camPos(player.pos)
})

async function stepPlayer() {
  while (hasNextInstruction()) {
    doInstruction(player)
    const currentPos = player.pos
    await animation(1, (percent) => {
      player.pos = currentPos.add(cellSize.scale(player.direction).scale(percent))
    })
    nextInstruction()
    await planPanel.next()
  }

}

loop(1, () => {

})
wait(1, () => {
  stepPlayer()
})


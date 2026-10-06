import Phaser from 'phaser'
import { useGameStore } from '../stores/game'

const world = { width: 1800, height: 1400 }

type CollisionKind = 'house' | 'tree' | 'well'

type StaticObject = {
  name: string
  x: number
  y: number
  scale: number
  collision?: CollisionKind
}

const objects: StaticObject[] = [
  { name: 'buildings/house-01', x: 350, y: 590, scale: .92, collision: 'house' },
  { name: 'buildings/house-02', x: 1450, y: 575, scale: .93, collision: 'house' },
  { name: 'buildings/house-03', x: 350, y: 1280, scale: .94, collision: 'house' },
  { name: 'buildings/house-01', x: 1460, y: 1280, scale: .91, collision: 'house' },

  { name: 'environment/tree-01', x: 120, y: 650, scale: .95, collision: 'tree' },
  { name: 'environment/tree-02', x: 250, y: 420, scale: .9, collision: 'tree' },
  { name: 'environment/tree-01', x: 1650, y: 430, scale: .92, collision: 'tree' },
  { name: 'environment/tree-02', x: 1720, y: 760, scale: .92, collision: 'tree' },
  { name: 'environment/tree-01', x: 180, y: 1190, scale: .94, collision: 'tree' },
  { name: 'environment/tree-02', x: 1640, y: 1210, scale: .96, collision: 'tree' },

  { name: 'environment/well', x: 900, y: 805, scale: .82, collision: 'well' },
  { name: 'environment/cart', x: 650, y: 1180, scale: .82 },
  { name: 'environment/signpost', x: 780, y: 690, scale: .78 },
  { name: 'environment/notice-board', x: 1210, y: 690, scale: .8 },
  { name: 'environment/bench', x: 720, y: 970, scale: .86 },
  { name: 'environment/bench', x: 1220, y: 970, scale: .86 },
  { name: 'environment/lamp', x: 650, y: 820, scale: .8 },
  { name: 'environment/lamp', x: 1320, y: 820, scale: .8 },
  { name: 'environment/barrel', x: 510, y: 685, scale: .78 },
  { name: 'environment/crates-02', x: 1530, y: 735, scale: .74 },
  { name: 'environment/fence-01', x: 220, y: 870, scale: .9 },
  { name: 'environment/fence-01', x: 315, y: 870, scale: .9 },
  { name: 'environment/fence-01', x: 1490, y: 920, scale: .9 },
  { name: 'environment/fence-01', x: 1585, y: 920, scale: .9 },
  { name: 'environment/wood-pile', x: 1580, y: 1120, scale: .78 },
  { name: 'environment/hay', x: 1510, y: 1040, scale: .78 },
  { name: 'environment/bush-01', x: 520, y: 790, scale: .74 },
  { name: 'environment/bush-02', x: 1420, y: 1000, scale: .74 },
  { name: 'environment/rock-01', x: 280, y: 1070, scale: .68 },
  { name: 'environment/rock-02', x: 1530, y: 1320, scale: .72 },
  { name: 'environment/flower-box', x: 470, y: 620, scale: .7 },
  { name: 'environment/flower-box', x: 1350, y: 605, scale: .7 },
]

function makeGround(scene: Phaser.Scene) {
  const texture = scene.textures.createCanvas('village-ground', world.width, world.height)!
  const ctx = texture.getCanvas().getContext('2d')!
  let seed = 1829

  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  ctx.fillStyle = '#66834f'
  ctx.fillRect(0, 0, world.width, world.height)

  for (let i = 0; i < 15500; i++) {
    const x = random() * world.width
    const y = random() * world.height
    ctx.fillStyle = random() < .5 ? '#86a76925' : '#263d2b19'
    ctx.beginPath()
    ctx.ellipse(x, y, 2 + random() * 19, 1 + random() * 9, random() * 6, 0, Math.PI * 2)
    ctx.fill()
  }

  function road(path: () => void) {
    ctx.save()
    path()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    for (const [width, color] of [[212, '#506941'], [188, '#816d4b'], [166, '#9a8056'], [143, '#ac9063']] as const) {
      ctx.lineWidth = width
      ctx.strokeStyle = color
      ctx.stroke()
    }

    ctx.restore()
  }

  road(() => {
    ctx.beginPath()
    ctx.moveTo(-40, 875)
    ctx.bezierCurveTo(445, 852, 750, 896, 1100, 871)
    ctx.bezierCurveTo(1450, 848, 1650, 883, 1840, 865)
  })

  road(() => {
    ctx.beginPath()
    ctx.moveTo(890, -40)
    ctx.bezierCurveTo(905, 370, 861, 685, 896, 950)
    ctx.bezierCurveTo(919, 1160, 889, 1300, 905, 1440)
  })

  for (let i = 0; i < 10500; i++) {
    const x = random() * world.width
    const y = random() * world.height

    if (
      Math.abs(y - (875 - 12 * Math.sin(x / 190))) > 72 &&
      Math.abs(x - (895 + 17 * Math.sin(y / 220))) > 70
    ) {
      continue
    }

    ctx.fillStyle = random() < .65 ? '#e3c99935' : '#584a3538'
    ctx.beginPath()
    ctx.ellipse(x, y, .8 + random() * 4, .5 + random() * 2.5, random() * 6, 0, Math.PI * 2)
    ctx.fill()
  }

  for (let i = 0; i < 3100; i++) {
    const x = random() * world.width
    const y = random() * world.height

    if (Math.abs(y - 875) < 107 || Math.abs(x - 895) < 102) continue

    ctx.strokeStyle = random() < .6 ? '#334f30a8' : '#a7b970b0'
    ctx.lineWidth = 1 + random() * 1.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + (random() - .5) * 6, y - 3 - random() * 6)
    ctx.stroke()

    if (random() < .032) {
      ctx.fillStyle = random() < .5 ? '#eedcaa' : '#e4b852'
      ctx.beginPath()
      ctx.arc(x, y - 4, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  texture.refresh()
  scene.add.image(0, 0, 'village-ground').setOrigin(0).setDepth(-1000)
}

export class VillageScene extends Phaser.Scene {
  private ethan!: Phaser.GameObjects.Image
  private ethanLabel!: Phaser.GameObjects.Text
  private ethanShadow!: Phaser.GameObjects.Ellipse
  private sword!: Phaser.GameObjects.Container
  private swing!: Phaser.GameObjects.Arc

  private aldric!: Phaser.GameObjects.Image
  private questMarker!: Phaser.GameObjects.Container
  private questHalo!: Phaser.GameObjects.Arc

  private shrew!: Phaser.GameObjects.Image
  private shrewLabel!: Phaser.GameObjects.Text
  private shrewShadow!: Phaser.GameObjects.Ellipse

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>

  private obstacles: Phaser.Geom.Rectangle[] = []
  private destination: Phaser.Math.Vector2 | null = null
  private feet = { x: 920, y: 970 }
  private velocity = new Phaser.Math.Vector2(0, 0)
  private facing = 1
  private attackSeen = 0
  private nextAttack = 0

  private shrewTarget = { x: 1020, y: 1160 }
  private shrewPause = 0
  private nextDust = 0

  private readonly maxSpeed = 165
  private readonly playerRadius = 15

  constructor() {
    super('VillageScene')
  }

  preload() {
    for (const object of objects) {
      this.load.image(object.name, `/assets/game/${object.name}.png`)
    }

    for (const name of ['ethan', 'aldric', 'unknown-shrew']) {
      this.load.image(`character/${name}`, `/assets/game/characters/${name}.png`)
    }
  }

  create() {
    makeGround(this)

    for (const object of objects) {
      const image = this.add
        .image(object.x, object.y, object.name)
        .setOrigin(.5, 1)
        .setScale(object.scale)
        .setDepth(object.y)

      if (object.collision) {
        this.addObstacleFor(image, object.collision)
      }

      if (object.name.endsWith('/well')) {
        image.setDepth(object.y + 4)
      }
    }

    this.ethanShadow = this.add
      .ellipse(this.feet.x, this.feet.y, 38, 11, 0x182819, .32)
      .setDepth(this.feet.y - 2)

    this.ethan = this.add
      .image(this.feet.x, this.feet.y, 'character/ethan')
      .setOrigin(.5, 1)
      .setDisplaySize(66, 140)
      .setDepth(this.feet.y)

    this.ethanLabel = this.add
      .text(0, 0, 'ETHAN', {
        font: 'bold 12px Georgia',
        color: '#fff1cb',
        backgroundColor: '#17221dcc',
        padding: { x: 7, y: 3 },
      })
      .setOrigin(.5)
      .setDepth(4000)

    this.makeSword()

    this.aldric = this.add
      .image(1140, 1010, 'character/aldric')
      .setOrigin(.5, 1)
      .setDisplaySize(62, 134)
      .setDepth(1010)

    this.add
      .ellipse(1140, 1011, 41, 11, 0x182819, .32)
      .setDepth(1008)

    this.add
      .text(1140, 858, 'ALDRIC', {
        font: 'bold 12px Georgia',
        color: '#fff1cb',
        backgroundColor: '#17221dcc',
        padding: { x: 7, y: 3 },
      })
      .setOrigin(.5)
      .setDepth(4000)

    this.questHalo = this.add
      .circle(1140, 840, 26, 0xffd37a, .16)
      .setDepth(4001)

    const marker = this.add.circle(0, 0, 20, 0x9e6728).setStrokeStyle(3, 0xffe5a0)
    const glyph = this.add.text(0, -3, '!', { font: 'bold 29px Georgia', color: '#fff8d8' }).setOrigin(.5)
    const label = this.add.text(0, 31, 'NUEVA MISIÓN', {
      font: 'bold 10px Arial',
      color: '#fff0b8',
      backgroundColor: '#1b281fe6',
      padding: { x: 6, y: 4 },
    }).setOrigin(.5)

    this.questMarker = this.add
      .container(1140, 838, [marker, glyph, label])
      .setDepth(4002)

    this.tweens.add({
      targets: this.questMarker,
      y: 830,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.tweens.add({
      targets: this.questHalo,
      scale: 1.25,
      alpha: .25,
      duration: 1200,
      yoyo: true,
      repeat: -1,
    })

    this.shrewShadow = this.add.ellipse(1030, 1190, 27, 7, 0x182819, .32)
    this.shrew = this.add.image(1030, 1190, 'character/unknown-shrew').setOrigin(.5, 1).setDisplaySize(64, 42)
    this.shrewLabel = this.add.text(1030, 1130, '???', {
      font: 'bold 12px Georgia',
      color: '#fff0bf',
      backgroundColor: '#1b281fc9',
      padding: { x: 5, y: 2 },
    }).setOrigin(.5).setDepth(4000)

    this.cameras.main
      .setBounds(0, 0, world.width, world.height)
      .startFollow(this.ethan, true, .085, .085)
      .setZoom(1)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd

    this.input.keyboard!.on('keydown-E', () => this.talk())
    this.input.keyboard!.on('keydown-SPACE', (event: KeyboardEvent) => {
      event.preventDefault()
      this.attack()
    })
    this.input.keyboard!.on('keydown-J', () => this.attack())

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const p = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2

      if (Phaser.Math.Distance.Between(p.x, p.y, this.aldric.x, this.aldric.y) < 65) {
        this.talk()
        return
      }

      this.destination = new Phaser.Math.Vector2(p.x, p.y)
    })

    this.positionEthan(0, false)
  }

  private addObstacleFor(image: Phaser.GameObjects.Image, type: CollisionKind) {
    const x = image.x
    const y = image.y

    if (type === 'house') {
      const width = Math.min(image.displayWidth * .78, 245)
      const height = Math.min(image.displayHeight * .58, 140)
      this.obstacles.push(new Phaser.Geom.Rectangle(x - width / 2, y - height, width, height))
      return
    }

    if (type === 'tree') {
      const width = Math.min(image.displayWidth * .70, 105)
      const height = Math.min(image.displayHeight * .78, 140)
      this.obstacles.push(new Phaser.Geom.Rectangle(x - width / 2, y - height, width, height))
      return
    }

    const width = Math.min(image.displayWidth * .80, 105)
    const height = Math.min(image.displayHeight * .70, 88)
    this.obstacles.push(new Phaser.Geom.Rectangle(x - width / 2, y - height, width, height))
  }

  private makeSword() {
    const g = this.add.graphics()
    g.fillStyle(0x704727)
    g.fillRoundedRect(-3, -4, 6, 19, 2)
    g.fillStyle(0xe9bd69)
    g.fillRect(-13, -7, 26, 5)
    g.fillCircle(0, 16, 4)
    g.fillStyle(0xd5e5e3)
    g.fillTriangle(-5, -9, 5, -9, 0, -68)
    g.lineStyle(1.5, 0xffffff, .85)
    g.lineBetween(0, -12, 0, -61)

    this.sword = this.add.container(0, 0, [g]).setDepth(1100).setAngle(20)
    this.swing = this.add
      .arc(0, 0, 56, 210, 320, false, 0xffffff, 0)
      .setStrokeStyle(8, 0xf6e3b0, .85)
      .setVisible(false)
  }

  private attack() {
    const now = this.time.now
    if (useGameStore().dialogue || now < this.nextAttack) return

    this.nextAttack = now + 410
    this.destination = null
    this.velocity.scale(.25)

    this.sword.setAngle(-70 * this.facing).setScale(this.facing, 1)
    this.swing
      .setPosition(this.feet.x + this.facing * 17, this.feet.y - 67)
      .setScale(this.facing, 1)
      .setDepth(this.feet.y + 2)
      .setAlpha(.85)
      .setVisible(true)

    this.tweens.add({
      targets: this.sword,
      angle: 72 * this.facing,
      duration: 220,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.sword,
          angle: 20 * this.facing,
          duration: 180,
        })
      },
    })

    this.tweens.add({
      targets: this.swing,
      alpha: 0,
      duration: 210,
      onComplete: () => {
        this.swing.setVisible(false)
        this.swing.setAlpha(.85)
      },
    })
  }

  private talk() {
    if (Phaser.Math.Distance.Between(this.feet.x, this.feet.y, this.aldric.x, this.aldric.y) < 112) {
      this.destination = null
      this.velocity.set(0, 0)
      useGameStore().speak()
    }
  }

  private positionEthan(time: number, moving: boolean) {
    const walk = moving ? Math.sin(time * .012) : 0
    const bob = moving ? Math.abs(walk) * .8 : Math.sin(time * .002) * .22

    this.ethan
      .setPosition(this.feet.x, this.feet.y - bob)
      .setFlipX(this.facing < 0)
      .setAngle(moving ? walk * .35 : 0)
      .setDepth(this.feet.y)

    this.ethanShadow
      .setPosition(this.feet.x, this.feet.y)
      .setScale(1 - Math.abs(walk) * .025, 1)
      .setDepth(this.feet.y - 2)

    this.sword
      .setPosition(this.feet.x + this.facing * 17, this.feet.y - 64 - bob)
      .setDepth(this.feet.y + 1)

    this.ethanLabel.setPosition(this.feet.x, this.feet.y - 150 - bob)
  }

  private canStandAt(x: number, y: number) {
    const feetCircle = new Phaser.Geom.Circle(x, y - 9, this.playerRadius)

    return !this.obstacles.some((obstacle) =>
      Phaser.Geom.Intersects.CircleToRectangle(feetCircle, obstacle),
    )
  }

  private movePlayer(dx: number, dy: number) {
    if (dx !== 0) {
      const nextX = Phaser.Math.Clamp(this.feet.x + dx, 22, world.width - 22)

      if (this.canStandAt(nextX, this.feet.y)) {
        this.feet.x = nextX
      } else {
        this.velocity.x = 0
      }
    }

    if (dy !== 0) {
      const nextY = Phaser.Math.Clamp(this.feet.y + dy, 35, world.height - 16)

      if (this.canStandAt(this.feet.x, nextY)) {
        this.feet.y = nextY
      } else {
        this.velocity.y = 0
      }
    }
  }

  private moveShrew(time: number, delta: number) {
    if (
      time > this.shrewPause &&
      Phaser.Math.Distance.Between(this.shrew.x, this.shrew.y, this.shrewTarget.x, this.shrewTarget.y) < 8
    ) {
      const angle = Math.sin(time * .0017 + 3) * 5
      const radius = 50 + (Math.sin(time * .0008) + 1) * 75

      this.shrewTarget = {
        x: Phaser.Math.Clamp(this.shrew.x + Math.cos(angle) * radius, 300, 1510),
        y: Phaser.Math.Clamp(this.shrew.y + Math.sin(angle) * radius, 1000, 1300),
      }

      this.shrewPause = time + 500 + Math.abs(Math.sin(time)) * 800
    }

    if (time > this.shrewPause) {
      const dx = this.shrewTarget.x - this.shrew.x
      const dy = this.shrewTarget.y - this.shrew.y
      const distance = Math.hypot(dx, dy)

      if (distance > 8) {
        const step = Math.min(distance, delta * .065)
        this.shrew.x += dx / distance * step
        this.shrew.y += dy / distance * step
        this.shrew.setFlipX(dx < 0).setAngle(Math.sin(time * .025) * 1.5)
      }
    }

    this.shrew.setDepth(this.shrew.y)
    this.shrewShadow.setPosition(this.shrew.x, this.shrew.y).setDepth(this.shrew.y - 1)
    this.shrewLabel.setPosition(this.shrew.x, this.shrew.y - 61)
  }

  update(time: number, delta: number) {
    const game = useGameStore()

    this.questMarker.setVisible(!game.quest)
    this.questHalo.setVisible(!game.quest)

    this.aldric
      .setY(1010 + Math.sin(time * .002) * .35)
      .setAngle(Math.sin(time * .0015) * .18)

    this.moveShrew(time, Math.min(delta, 40))

    if (game.attackPulse !== this.attackSeen) {
      this.attackSeen = game.attackPulse
      this.attack()
    }

    if (game.dialogue) {
      this.velocity.scale(.65)
      this.positionEthan(time, false)
      return
    }

    let inputX =
      Number(this.cursors.right.isDown || this.wasd.D.isDown) -
      Number(this.cursors.left.isDown || this.wasd.A.isDown)

    let inputY =
      Number(this.cursors.down.isDown || this.wasd.S.isDown) -
      Number(this.cursors.up.isDown || this.wasd.W.isDown)

    if (inputX || inputY) {
      this.destination = null
    }

    if (!inputX && !inputY && this.destination) {
      const toTargetX = this.destination.x - this.feet.x
      const toTargetY = this.destination.y - this.feet.y
      const distance = Math.hypot(toTargetX, toTargetY)

      if (distance > 10) {
        inputX = toTargetX / distance
        inputY = toTargetY / distance
      } else {
        this.destination = null
      }
    }

    const inputLength = Math.hypot(inputX, inputY)

    if (inputLength > 0) {
      inputX /= inputLength
      inputY /= inputLength

      if (Math.abs(inputX) > .15) {
        this.facing = inputX > 0 ? 1 : -1
      }
    }

    const targetX = inputX * this.maxSpeed
    const targetY = inputY * this.maxSpeed
    const dt = Math.min(delta, 40) / 1000
    const smoothing = 1 - Math.exp(-11 * dt)

    this.velocity.x = Phaser.Math.Linear(this.velocity.x, targetX, smoothing)
    this.velocity.y = Phaser.Math.Linear(this.velocity.y, targetY, smoothing)

    if (!inputLength && !this.destination && this.velocity.length() < 3) {
      this.velocity.set(0, 0)
    }

    this.movePlayer(this.velocity.x * dt, this.velocity.y * dt)

    const moving = this.velocity.lengthSq() > 25
    this.positionEthan(time, moving)

    if (moving && time > this.nextDust) {
      this.nextDust = time + 300

      const dust = this.add
        .circle(this.feet.x, this.feet.y, 1.8, 0xd6bf90, .38)
        .setDepth(this.feet.y - 3)

      this.tweens.add({
        targets: dust,
        alpha: 0,
        scale: 1.7,
        y: dust.y - 4,
        duration: 300,
        onComplete: () => dust.destroy(),
      })
    }
  }
}

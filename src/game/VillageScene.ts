import Phaser from 'phaser'
import { useGameStore } from '../stores/game'

const world = { width: 1800, height: 1400 }
const objects: [string, number, number, number][] = [
  ['buildings/house-01', 485, 630, 1.12], ['buildings/house-02', 1100, 615, 1.14], ['buildings/house-03', 1530, 755, 1.1],
  ['environment/tree-01', 165, 635, 1.07], ['environment/tree-02', 290, 1160, 1], ['environment/tree-01', 1590, 1200, 1.08], ['environment/tree-02', 1710, 490, 1],
  ['environment/well', 1110, 1050, .9], ['environment/cart', 655, 1140, .93], ['environment/signpost', 775, 740, .85], ['environment/notice-board', 1300, 780, .85],
  ['environment/bench', 1320, 1220, .9], ['environment/lamp', 450, 945, .9], ['environment/lamp', 1430, 955, .9], ['environment/barrel', 610, 730, .9],
  ['environment/crates-02', 1480, 1020, .85], ['environment/fence-01', 220, 1010, 1], ['environment/fence-02', 330, 1010, 1],
  ['environment/wood-pile', 1640, 800, .85], ['environment/hay', 1610, 905, .85], ['environment/bush-01', 235, 795, .85],
  ['environment/bush-02', 1450, 1320, .85], ['environment/rock-01', 220, 1310, .75], ['environment/flower-box', 1060, 680, .8],
]

function makeGround(scene: Phaser.Scene) {
  const texture = scene.textures.createCanvas('village-ground', world.width, world.height)!
  const ctx = texture.getCanvas().getContext('2d')!
  let seed = 1829
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  ctx.fillStyle = '#66834f'; ctx.fillRect(0, 0, world.width, world.height)
  for (let i = 0; i < 15500; i++) {
    const x = random() * world.width, y = random() * world.height
    ctx.fillStyle = random() < .5 ? '#86a76925' : '#263d2b19'
    ctx.beginPath(); ctx.ellipse(x, y, 2 + random() * 19, 1 + random() * 9, random() * 6, 0, Math.PI * 2); ctx.fill()
  }
  function road(path: () => void) {
    ctx.save(); path(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    for (const [width, color] of [[212, '#506941'], [188, '#816d4b'], [166, '#9a8056'], [143, '#ac9063']] as const) {
      ctx.lineWidth = width; ctx.strokeStyle = color; ctx.stroke()
    }
    ctx.restore()
  }
  road(() => { ctx.beginPath(); ctx.moveTo(-40, 875); ctx.bezierCurveTo(445, 852, 750, 896, 1100, 871); ctx.bezierCurveTo(1450, 848, 1650, 883, 1840, 865) })
  road(() => { ctx.beginPath(); ctx.moveTo(890, -40); ctx.bezierCurveTo(905, 370, 861, 685, 896, 950); ctx.bezierCurveTo(919, 1160, 889, 1300, 905, 1440) })
  for (let i = 0; i < 10500; i++) {
    const x = random() * world.width, y = random() * world.height
    if (Math.abs(y - (875 - 12 * Math.sin(x / 190))) > 72 && Math.abs(x - (895 + 17 * Math.sin(y / 220))) > 70) continue
    ctx.fillStyle = random() < .65 ? '#e3c99935' : '#584a3538'
    ctx.beginPath(); ctx.ellipse(x, y, .8 + random() * 4, .5 + random() * 2.5, random() * 6, 0, Math.PI * 2); ctx.fill()
  }
  for (let i = 0; i < 3100; i++) {
    const x = random() * world.width, y = random() * world.height
    if (Math.abs(y - 875) < 107 || Math.abs(x - 895) < 102) continue
    ctx.strokeStyle = random() < .6 ? '#334f30a8' : '#a7b970b0'; ctx.lineWidth = 1 + random() * 1.5
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (random() - .5) * 6, y - 3 - random() * 6); ctx.stroke()
    if (random() < .032) { ctx.fillStyle = random() < .5 ? '#eedcaa' : '#e4b852'; ctx.beginPath(); ctx.arc(x, y - 4, 2.5, 0, Math.PI * 2); ctx.fill() }
  }
  texture.refresh()
  scene.add.image(0, 0, 'village-ground').setOrigin(0).setDepth(-100)
}

export class VillageScene extends Phaser.Scene {
  private ethan!: Phaser.GameObjects.Image
  private body!: Phaser.GameObjects.Image
  private leftLeg!: Phaser.GameObjects.Image
  private rightLeg!: Phaser.GameObjects.Image
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
  private feet = { x: 920, y: 1060 }
  private facing = 1
  private attackSeen = 0
  private nextAttack = 0
  private shrewTarget = { x: 1020, y: 1160 }
  private shrewPause = 0
  private nextDust = 0
  constructor() { super('VillageScene') }

  preload() {
    for (const [name] of objects) this.load.image(name, `/assets/game/${name}.png`)
    for (const name of ['ethan', 'ethan-body', 'ethan-left-leg', 'ethan-right-leg', 'aldric', 'unknown-shrew'])
      this.load.image(`character/${name}`, `/assets/game/characters/${name}.png`)
  }

  create() {
    makeGround(this)
    for (const [name, x, y, scale] of objects) {
      const image = this.add.image(x, y, name).setOrigin(.5, 1).setScale(scale).setDepth(y)
      if (name.startsWith('buildings/') || name.includes('tree-') || name.endsWith('/well')) {
        const halfWidth = Math.min(image.displayWidth * .30, 83)
        this.obstacles.push(new Phaser.Geom.Rectangle(x - halfWidth, y - 39, halfWidth * 2, 37))
      }
    }
    this.ethanShadow = this.add.ellipse(this.feet.x, this.feet.y, 40, 12, 0x182819, .35)
    this.leftLeg = this.add.image(0, 0, 'character/ethan-left-leg').setOrigin(.5, 1).setDisplaySize(70, 148)
    this.rightLeg = this.add.image(0, 0, 'character/ethan-right-leg').setOrigin(.5, 1).setDisplaySize(70, 148)
    this.body = this.add.image(0, 0, 'character/ethan-body').setOrigin(.5, 1).setDisplaySize(70, 148)
    this.ethan = this.add.image(0, 0, 'character/ethan').setVisible(false)
    this.ethanLabel = this.add.text(0, 0, 'ETHAN', { font: 'bold 13px Georgia', color: '#fff1cb', backgroundColor: '#17221dd9', padding: { x: 8, y: 4 } }).setOrigin(.5).setDepth(2000)
    this.makeSword()
    this.aldric = this.add.image(1170, 1150, 'character/aldric').setOrigin(.5, 1).setDisplaySize(66, 142).setDepth(1150)
    this.add.ellipse(1170, 1151, 43, 12, 0x182819, .35).setDepth(1149)
    this.add.text(1170, 990, 'ALDRIC', { font: 'bold 13px Georgia', color: '#fff1cb', backgroundColor: '#17221dd9', padding: { x: 8, y: 4 } }).setOrigin(.5).setDepth(2000)
    this.questHalo = this.add.circle(1170, 970, 28, 0xffd37a, .18).setDepth(2001)
    const marker = this.add.circle(0, 0, 22, 0x9e6728).setStrokeStyle(3, 0xffe5a0)
    const glyph = this.add.text(0, -3, '!', { font: 'bold 32px Georgia', color: '#fff8d8' }).setOrigin(.5)
    const label = this.add.text(0, 34, 'NUEVA MISIÓN', { font: 'bold 11px Arial', color: '#fff0b8', backgroundColor: '#1b281fe6', padding: { x: 7, y: 4 } }).setOrigin(.5)
    this.questMarker = this.add.container(1170, 967, [marker, glyph, label]).setDepth(2002)
    this.tweens.add({ targets: this.questMarker, y: 957, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    this.tweens.add({ targets: this.questHalo, scale: 1.3, alpha: .28, duration: 1100, yoyo: true, repeat: -1 })
    this.shrewShadow = this.add.ellipse(1020, 1160, 30, 8, 0x182819, .35)
    this.shrew = this.add.image(1020, 1160, 'character/unknown-shrew').setOrigin(.5, 1).setDisplaySize(71, 46)
    this.shrewLabel = this.add.text(1020, 1092, '???', { font: 'bold 13px Georgia', color: '#fff0bf', backgroundColor: '#1b281fc9', padding: { x: 5, y: 2 } }).setOrigin(.5).setDepth(2000)
    this.cameras.main.setBounds(0, 0, world.width, world.height).startFollow(this.ethan, true, .11, .11).setZoom(1.08)
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd
    this.input.keyboard!.on('keydown-E', () => this.talk())
    this.input.keyboard!.on('keydown-SPACE', (event: KeyboardEvent) => { event.preventDefault(); this.attack() })
    this.input.keyboard!.on('keydown-J', () => this.attack())
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const p = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2
      if (Phaser.Math.Distance.Between(p.x, p.y, this.aldric.x, this.aldric.y) < 65) { this.talk(); return }
      this.destination = p
    })
    this.positionEthan(0, false)
  }

  private makeSword() {
    const g = this.add.graphics()
    g.fillStyle(0x704727); g.fillRoundedRect(-3, -4, 6, 19, 2)
    g.fillStyle(0xe9bd69); g.fillRect(-13, -7, 26, 5); g.fillCircle(0, 16, 4)
    g.fillStyle(0xd5e5e3); g.fillTriangle(-5, -9, 5, -9, 0, -68)
    g.lineStyle(1.5, 0xffffff, .85); g.lineBetween(0, -12, 0, -61)
    this.sword = this.add.container(0, 0, [g]).setDepth(1100).setAngle(20)
    this.swing = this.add.arc(0, 0, 56, 210, 320, false, 0xffffff, 0).setStrokeStyle(8, 0xf6e3b0, .85).setVisible(false)
  }

  private attack() {
    const now = this.time.now
    if (useGameStore().dialogue || now < this.nextAttack) return
    this.nextAttack = now + 410
    this.destination = null
    this.sword.setAngle(-70 * this.facing).setScale(this.facing, 1)
    this.swing.setPosition(this.feet.x + this.facing * 17, this.feet.y - 69).setScale(this.facing, 1).setDepth(this.feet.y + 1).setAlpha(.85).setVisible(true)
    this.tweens.add({ targets: this.sword, angle: 72 * this.facing, duration: 220, ease: 'Cubic.easeOut', onComplete: () => {
      this.tweens.add({ targets: this.sword, angle: 20 * this.facing, duration: 180 })
    } })
    this.tweens.add({ targets: this.swing, alpha: 0, duration: 210, onComplete: () => { this.swing.setVisible(false); this.swing.setAlpha(.85) } })
  }

  private talk() {
    if (Phaser.Math.Distance.Between(this.feet.x, this.feet.y, this.aldric.x, this.aldric.y) < 112) useGameStore().speak()
  }

  private positionEthan(time: number, moving: boolean) {
    const bob = moving ? Math.abs(Math.sin(time * .013)) * 2 : Math.sin(time * .002) * .6
    const gait = moving ? Math.sin(time * .013) : 0
    this.ethan.setPosition(this.feet.x, this.feet.y - bob)
    this.ethanShadow.setPosition(this.feet.x, this.feet.y).setDepth(this.feet.y - 2)
    for (const [image, sign] of [[this.leftLeg, 1], [this.rightLeg, -1]] as const) {
      image.setPosition(this.feet.x + sign * gait * 4, this.feet.y - bob + (sign * gait > 0 ? Math.abs(gait) * 3 : 0))
        .setAngle(sign * gait * 5).setFlipX(this.facing < 0).setDepth(this.feet.y - 1)
    }
    this.body.setPosition(this.feet.x, this.feet.y - bob).setAngle(moving ? gait * .7 : 0).setFlipX(this.facing < 0).setDepth(this.feet.y)
    this.sword.setPosition(this.feet.x + this.facing * 17, this.feet.y - 67 - bob).setDepth(this.feet.y + 1)
    this.ethanLabel.setPosition(this.feet.x, this.feet.y - 163 - bob)
  }

  private moveShrew(time: number, delta: number) {
    if (time > this.shrewPause && Phaser.Math.Distance.Between(this.shrew.x, this.shrew.y, this.shrewTarget.x, this.shrewTarget.y) < 8) {
      const angle = Math.sin(time * .0017 + 3) * 5, radius = 50 + (Math.sin(time * .0008) + 1) * 75
      this.shrewTarget = { x: Phaser.Math.Clamp(this.shrew.x + Math.cos(angle) * radius, 300, 1510), y: Phaser.Math.Clamp(this.shrew.y + Math.sin(angle) * radius, 995, 1300) }
      this.shrewPause = time + 500 + Math.abs(Math.sin(time)) * 800
    }
    if (time > this.shrewPause) {
      const dx = this.shrewTarget.x - this.shrew.x, dy = this.shrewTarget.y - this.shrew.y, distance = Math.hypot(dx, dy)
      if (distance > 8) {
        const step = Math.min(distance, delta * .075)
        this.shrew.x += dx / distance * step; this.shrew.y += dy / distance * step
        this.shrew.setFlipX(dx < 0).setAngle(Math.sin(time * .025) * 2)
      }
    }
    this.shrew.setDepth(this.shrew.y)
    this.shrewShadow.setPosition(this.shrew.x, this.shrew.y).setDepth(this.shrew.y - 1)
    this.shrewLabel.setPosition(this.shrew.x, this.shrew.y - 64)
  }

  update(time: number, delta: number) {
    const game = useGameStore()
    this.questMarker.setVisible(!game.quest); this.questHalo.setVisible(!game.quest)
    this.aldric.y = 1150 + Math.sin(time * .002) * .8
    this.aldric.setScale(66 / 119, (142 / 256) * (1 + Math.sin(time * .002) * .008))
    this.aldric.setAngle(Math.sin(time * .0015) * .45)
    this.moveShrew(time, Math.min(delta, 50))
    if (game.attackPulse !== this.attackSeen) { this.attackSeen = game.attackPulse; this.attack() }
    if (game.dialogue) return
    let dx = Number(this.cursors.right.isDown || this.wasd.D.isDown) - Number(this.cursors.left.isDown || this.wasd.A.isDown)
    let dy = Number(this.cursors.down.isDown || this.wasd.S.isDown) - Number(this.cursors.up.isDown || this.wasd.W.isDown)
    if (dx || dy) this.destination = null
    if (!dx && !dy && this.destination) {
      const distance = Phaser.Math.Distance.Between(this.feet.x, this.feet.y, this.destination.x, this.destination.y)
      if (distance > 8) { dx = this.destination.x - this.feet.x; dy = this.destination.y - this.feet.y } else this.destination = null
    }
    const moving = Boolean(dx || dy), norm = Math.hypot(dx, dy) || 1, speed = Math.min(delta, 50) * .22
    if (dx) this.facing = dx > 0 ? 1 : -1
    const x = Phaser.Math.Clamp(this.feet.x + dx / norm * speed, 18, world.width - 18)
    const y = Phaser.Math.Clamp(this.feet.y + dy / norm * speed, 28, world.height - 12)
    if (!this.obstacles.some(o => o.contains(x, y))) this.feet = { x, y }
    this.positionEthan(time, moving)
    if (moving && time > this.nextDust) {
      this.nextDust = time + 240
      const dust = this.add.circle(this.feet.x, this.feet.y, 2, 0xd6bf90, .5).setDepth(this.feet.y - 3)
      this.tweens.add({ targets: dust, alpha: 0, scale: 2, y: dust.y - 5, duration: 340, onComplete: () => dust.destroy() })
    }
  }
}

import Phaser from 'phaser'
import { useGameStore } from '../stores/game'

const world = { width: 1800, height: 1400 }
const objects: [string,number,number,number][] = [
  ['buildings/house-01',510,620,1.12],['buildings/house-02',1060,600,1.14],['buildings/house-03',1500,740,1.1],
  ['environment/tree-01',170,630,1.07],['environment/tree-02',310,1120,1],['environment/tree-01',1610,1150,1.08],['environment/tree-02',1710,540,1],
  ['environment/well',1130,1030,.9],['environment/cart',690,1100,.93],['environment/signpost',840,770,.85],['environment/notice-board',1240,790,.85],
  ['environment/bench',1210,1210,.9],['environment/lamp',450,880,.9],['environment/lamp',1420,930,.9],['environment/barrel',610,760,.9],
  ['environment/crates-02',1490,975,.85],['environment/fence-01',230,970,1],['environment/fence-02',340,970,1],
  ['environment/wood-pile',1520,800,.85],['environment/hay',1580,870,.85],['environment/bush-01',255,780,.85],
  ['environment/bush-02',1450,1230,.85],['environment/rock-01',220,1290,.75],['environment/flower-box',1030,680,.8],
]
const terrain=['grass','grass-flowers','dirt','cobblestone']
export class VillageScene extends Phaser.Scene {
  private ethan!: Phaser.GameObjects.Image
  private ethanLabel!: Phaser.GameObjects.Text
  private ethanShadow!: Phaser.GameObjects.Ellipse
  private aldric!: Phaser.GameObjects.Image
  private questMarker!: Phaser.GameObjects.Container
  private questHalo!: Phaser.GameObjects.Arc
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<'W'|'A'|'S'|'D', Phaser.Input.Keyboard.Key>
  private obstacles: Phaser.Geom.Rectangle[]=[]
  private destination: Phaser.Math.Vector2|null=null
  private lastDust=0
  private feet={x:920,y:1020}
  private spriteScale={x:1,y:1}
  private aldricScale={x:1,y:1}
  private facing=1
  constructor(){super('VillageScene')}
  preload(){
    for(const name of terrain)this.load.image(`terrain/${name}`,`/assets/game/terrain/${name}.png`)
    for(const [name] of objects)this.load.image(name,`/assets/game/${name}.png`)
    this.load.image('character/ethan','/assets/game/characters/ethan.png')
    this.load.image('character/aldric','/assets/game/characters/aldric.png')
  }
  create(){
    this.cameras.main.setBackgroundColor('#658359')
    this.add.rectangle(900,700,1800,1400,0x658359).setDepth(-100)
    // These PNGs are transparent ground patches, not edge-to-edge tiles.
    // Scatter and overlap them on a solid base so no rectangular seams appear.
    const road=this.add.graphics().setDepth(-95)
    road.fillStyle(0x78694a,.74)
    road.fillRoundedRect(60,793,1680,174,75)
    road.fillRoundedRect(808,150,174,1140,75)
    let seed=1481
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
    for(let i=0;i<390;i++){
      const x=random()*world.width,y=random()*world.height
      const onRoad=(y>770&&y<990)||(x>785&&x<1005)
      const texture=onRoad?'terrain/dirt':random()<.22?'terrain/grass-flowers':'terrain/grass'
      this.add.image(x,y,texture).setScale(.85+random()*.65).setRotation((random()-.5)*.8).setAlpha(onRoad?.78:.7).setDepth(-90)
    }
    for(let i=0;i<46;i++){
      const x=120+i*34+(random()-.5)*27,y=830+(random()-.5)*75
      this.add.image(x,y,'terrain/cobblestone').setScale(.68+random()*.18).setRotation((random()-.5)*.45).setAlpha(.85).setDepth(-80)
    }
    for(const [name,x,y,scale] of objects){
      this.add.image(x,y,name).setOrigin(.5,1).setScale(scale).setDepth(y)
      if(name.startsWith('buildings/')||name.includes('tree-')||name.endsWith('/well'))
        this.obstacles.push(new Phaser.Geom.Rectangle(x-42*scale,y-38*scale,84*scale,38*scale))
    }
    this.ethanShadow=this.add.ellipse(920,1020,44,13,0x10221d,.43).setDepth(1019)
    this.ethan=this.add.image(920,1020,'character/ethan').setOrigin(.5,1).setDisplaySize(51,108).setDepth(1020)
    this.spriteScale={x:this.ethan.scaleX,y:this.ethan.scaleY}
    this.ethanLabel=this.add.text(920,896,'ETHAN',{font:'bold 13px Georgia',color:'#fff1cb',backgroundColor:'#17221dd9',padding:{x:8,y:4}}).setOrigin(.5).setDepth(2000)
    this.add.ellipse(1160,1130,44,13,0x10221d,.43).setDepth(1129)
    this.aldric=this.add.image(1160,1130,'character/aldric').setOrigin(.5,1).setDisplaySize(51,110).setDepth(1130)
    this.aldricScale={x:this.aldric.scaleX,y:this.aldric.scaleY}
    this.add.text(1160,1004,'ALDRIC',{font:'bold 13px Georgia',color:'#fff1cb',backgroundColor:'#17221dd9',padding:{x:8,y:4}}).setOrigin(.5).setDepth(2000)
    this.questHalo=this.add.circle(1160,961,27,0xffd37a,.18).setDepth(2001)
    const emblem=this.add.circle(0,0,22,0x9e6728).setStrokeStyle(3,0xffe5a0)
    const glyph=this.add.text(0,-3,'!',{font:'bold 32px Georgia',color:'#fff8d8'}).setOrigin(.5)
    const markerLabel=this.add.text(0,34,'NUEVA MISIÓN',{font:'bold 11px Arial',color:'#fff0b8',backgroundColor:'#1b281fe6',padding:{x:7,y:4}}).setOrigin(.5)
    this.questMarker=this.add.container(1160,958,[emblem,glyph,markerLabel]).setDepth(2002)
    this.tweens.add({targets:this.questMarker,y:949,duration:800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})
    this.tweens.add({targets:this.questHalo,scale:1.35,alpha:.25,duration:1100,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})
    this.cameras.main.setBounds(0,0,world.width,world.height).startFollow(this.ethan,true,.12,.12).setZoom(1.08)
    this.cursors=this.input.keyboard!.createCursorKeys()
    this.wasd=this.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd
    this.input.keyboard!.on('keydown-E',()=>this.talk())
    this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
      const p=pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2
      if(Phaser.Math.Distance.Between(p.x,p.y,this.aldric.x,this.aldric.y)<65){this.talk();return}
      this.destination=p
    })
  }
  private talk(){if(Phaser.Math.Distance.Between(this.feet.x,this.feet.y,this.aldric.x,this.aldric.y)<110)useGameStore().speak()}
  update(time:number,delta:number){
    const missionAvailable=!useGameStore().quest
    this.questMarker.setVisible(missionAvailable)
    this.questHalo.setVisible(missionAvailable)
    const idle=1+Math.sin(time*.0024)*.009
    this.aldric.setScale(this.aldricScale.x*idle,this.aldricScale.y*idle)
    this.aldric.setAngle(Math.sin(time*.0018)*.45)
    if(useGameStore().dialogue)return
    let dx=Number(this.cursors.right.isDown||this.wasd.D.isDown)-Number(this.cursors.left.isDown||this.wasd.A.isDown)
    let dy=Number(this.cursors.down.isDown||this.wasd.S.isDown)-Number(this.cursors.up.isDown||this.wasd.W.isDown)
    if(!dx&&!dy&&this.destination){
      const dist=Phaser.Math.Distance.Between(this.feet.x,this.feet.y,this.destination.x,this.destination.y)
      if(dist>12){dx=this.destination.x-this.feet.x;dy=this.destination.y-this.feet.y}else this.destination=null
    }
    const norm=Math.hypot(dx,dy)||1,speed=Math.min(delta,50)*.22
    const x=Phaser.Math.Clamp(this.feet.x+dx/norm*speed,18,world.width-18)
    const y=Phaser.Math.Clamp(this.feet.y+dy/norm*speed,25,world.height-10)
    const moving=Math.abs(dx)+Math.abs(dy)>0
    if(dx!==0)this.facing=dx>0?1:-1
    if(!this.obstacles.some(o=>o.contains(x,y))){
      this.feet={x,y}
      this.ethanShadow.setPosition(x,y).setDepth(y-1)
      this.ethanLabel.setPosition(x,y-124)
    }
    this.ethan.setPosition(this.feet.x,this.feet.y-(moving?Math.abs(Math.sin(time*.014))*2.6:Math.sin(time*.003)*.5)).setDepth(this.feet.y)
    this.ethan.setAngle(moving?Math.sin(time*.014)*3:Math.sin(time*.002)*.6)
    const breath=moving?1+Math.sin(time*.028)*.015:1+Math.sin(time*.003)*.008
    this.ethan.setScale(this.spriteScale.x*breath*this.facing,this.spriteScale.y*breath)
    if(moving&&time-this.lastDust>190){
      this.lastDust=time
      const dust=this.add.circle(this.feet.x+(Math.random()-.5)*18,this.feet.y,3,0xd8c295,.4).setDepth(this.ethanShadow.depth-.1)
      this.tweens.add({targets:dust,alpha:0,scale:2,y:dust.y-9,duration:430,onComplete:()=>dust.destroy()})
    }
  }
}

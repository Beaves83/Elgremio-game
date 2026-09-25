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
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<'W'|'A'|'S'|'D', Phaser.Input.Keyboard.Key>
  private obstacles: Phaser.Geom.Rectangle[]=[]
  private destination: Phaser.Math.Vector2|null=null
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
    for(let y=0;y<world.height;y+=112)for(let x=0;x<world.width;x+=112){
      const path=Math.abs(y-820)<112||Math.abs(x-890)<95
      const name=path?'dirt':(x*7+y*13)%11<2?'grass-flowers':'grass'
      this.add.image(x,y,`terrain/${name}`).setOrigin(0,0).setDisplaySize(113,113).setDepth(-90)
    }
    for(let x=155;x<1710;x+=108)this.add.image(x,819,'terrain/cobblestone').setOrigin(0,0).setDisplaySize(109,105).setDepth(-80)
    for(const [name,x,y,scale] of objects){
      this.add.image(x,y,name).setOrigin(.5,1).setScale(scale).setDepth(y)
      if(name.startsWith('buildings/')||name.includes('tree-')||name.endsWith('/well'))
        this.obstacles.push(new Phaser.Geom.Rectangle(x-42*scale,y-38*scale,84*scale,38*scale))
    }
    this.ethanShadow=this.add.ellipse(920,1020,44,13,0x10221d,.43).setDepth(1019)
    this.ethan=this.add.image(920,1020,'character/ethan').setOrigin(.5,1).setDisplaySize(51,108).setDepth(1020)
    this.ethanLabel=this.add.text(920,896,'ETHAN',{font:'bold 13px Georgia',color:'#fff1cb',backgroundColor:'#17221dd9',padding:{x:8,y:4}}).setOrigin(.5).setDepth(2000)
    this.add.ellipse(1160,1130,44,13,0x10221d,.43).setDepth(1129)
    this.aldric=this.add.image(1160,1130,'character/aldric').setOrigin(.5,1).setDisplaySize(51,110).setDepth(1130)
    this.add.text(1160,1004,'ALDRIC',{font:'bold 13px Georgia',color:'#fff1cb',backgroundColor:'#17221dd9',padding:{x:8,y:4}}).setOrigin(.5).setDepth(2000)
    const emblem=this.add.circle(0,0,19,0x8d632b).setStrokeStyle(2,0xf9d887)
    const glyph=this.add.text(0,-1,'!',{font:'bold 28px Georgia',color:'#fff3bf'}).setOrigin(.5)
    this.questMarker=this.add.container(1160,967,[emblem,glyph]).setDepth(2001)
    this.tweens.add({targets:this.questMarker,y:959,duration:850,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})
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
  private talk(){if(Phaser.Math.Distance.Between(this.ethan.x,this.ethan.y,this.aldric.x,this.aldric.y)<110)useGameStore().speak()}
  update(_time:number,delta:number){
    this.questMarker.setVisible(!useGameStore().quest)
    if(useGameStore().dialogue)return
    let dx=Number(this.cursors.right.isDown||this.wasd.D.isDown)-Number(this.cursors.left.isDown||this.wasd.A.isDown)
    let dy=Number(this.cursors.down.isDown||this.wasd.S.isDown)-Number(this.cursors.up.isDown||this.wasd.W.isDown)
    if(!dx&&!dy&&this.destination){
      const dist=Phaser.Math.Distance.Between(this.ethan.x,this.ethan.y,this.destination.x,this.destination.y)
      if(dist>12){dx=this.destination.x-this.ethan.x;dy=this.destination.y-this.ethan.y}else this.destination=null
    }
    const norm=Math.hypot(dx,dy)||1,speed=Math.min(delta,50)*.22
    const x=Phaser.Math.Clamp(this.ethan.x+dx/norm*speed,18,world.width-18)
    const y=Phaser.Math.Clamp(this.ethan.y+dy/norm*speed,25,world.height-10)
    if(!this.obstacles.some(o=>o.contains(x,y))){
      this.ethan.setPosition(x,y).setDepth(y)
      this.ethanShadow.setPosition(x,y).setDepth(y-1)
      this.ethanLabel.setPosition(x,y-124)
    }
  }
}

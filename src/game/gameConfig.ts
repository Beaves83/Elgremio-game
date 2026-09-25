import Phaser from 'phaser'
import { VillageScene } from './VillageScene'
export function gameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return { type: Phaser.AUTO, parent, width: parent.clientWidth, height: parent.clientHeight, backgroundColor: '#63835a', scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [VillageScene], render: { pixelArt: false, antialias: true } }
}

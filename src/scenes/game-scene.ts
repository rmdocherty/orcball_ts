import { Redhat } from '../objects/redhat';
import { GraphicDot } from '../objects/dots';
import { init } from '../logic/board';
import { Dot } from '../interfaces/shared';

export class GameScene extends Phaser.Scene {
  private myRedhat: Redhat;
  private myDot: GraphicDot;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    this.load.image('redhat', '../assets/redhat.png');
    this.load.image('redParticle', '../assets/red.png');
  }

  create(): void {
    const emitter = this.add.particles(0, 0, 'redParticle', {
      speed: 100,
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD'
    });

    this.myRedhat = new Redhat({
      scene: this,
      x: 400,
      y: 300,
      texture: 'redhat'
    });

    this.myDot = new GraphicDot({ scene: this, logicPos: { x: 1, y: 1 }, val: Dot.EMPTY })

    emitter.startFollow(this.myRedhat);
    init();
  }
}

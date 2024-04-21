import { Redhat } from '../objects/redhat';
import { GraphicDot } from '../objects/dots';
import { Ball } from '../objects/ball';
import { LogicGame, } from '../logic/board';
import { Dot } from '../interfaces/shared';
import { i_to_p, p_to_i } from "../interfaces/shared";

export class GameScene extends Phaser.Scene {
  private ball: Ball;
  private gfxDots: GraphicDot[];
  private logicGame: LogicGame;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void { // load my assets in here later
    this.load.image('redhat', '../assets/redhat.png');
    this.load.image('redParticle', '../assets/red.png');
  }

  create(): void {
    this.logicGame = new LogicGame(11, 9);
    this.gfxDots = this.initDots(this.logicGame);
    this.ball = new Ball(this, { x: 4, y: 5 })
    this.ball.on('hover', this.onBallHover, this)
  }

  initDots(game: LogicGame): GraphicDot[] {
    const dots: GraphicDot[] = []
    for (let y = 0; y < game.grid.h; y++) {
      for (let x = 0; x < game.grid.w; x++) {
        const val = game.grid.get(x, y);
        const tmpDot = new GraphicDot({ scene: this, logicPos: { x: x, y: y }, val: val });
        dots.push(tmpDot);
      }
    }
    return dots;
  }

  onBallHover(): void {
    const ballPos = this.logicGame.ballPos
    const validMoves = this.logicGame.getValidMoves(ballPos)
    for (let p of validMoves) {
      console.log(p)
      const idx = p_to_i(p, this.logicGame.grid.w);
      this.gfxDots[idx].onPointerDown();
    }
    console.log(validMoves);
  }
}

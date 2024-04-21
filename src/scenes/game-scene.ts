import { Redhat } from '../objects/redhat';
import { GraphicDot } from '../objects/dots';
import { Ball } from '../objects/ball';
import { LogicGame, } from '../logic/board';
import { Dot, Point } from '../interfaces/shared';
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
    this.ball = new Ball(this, this.logicGame.ballPos)
    //this.ball.on('hover', this.onBallHover, this)
  }

  initDots(game: LogicGame): GraphicDot[] {
    const dots: GraphicDot[] = []
    for (let y = 0; y < game.grid.h; y++) {
      for (let x = 0; x < game.grid.w; x++) {
        const val = game.grid.get(x, y);
        const tmpDot = new GraphicDot({ scene: this, logicPos: { x: x, y: y }, val: val });
        tmpDot.on('dot_hover_on', this.onDotHover)
        dots.push(tmpDot);
      }
    }
    return dots;
  }

  highlightValidMoves(validMoves: Point[]): void {
    //const ballPos = this.logicGame.ballPos
    //const validMoves = this.logicGame.getValidMoves(ballPos)
    for (let p of validMoves) {
      const idx = p_to_i(p, this.logicGame.grid.w);
      this.gfxDots[idx].highlight();
    }
  }

  onDotHover(dot: GraphicDot): void {
    console.log(dot.logicPos)
  }
}

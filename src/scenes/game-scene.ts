import { Redhat } from '../objects/redhat';
import { GraphicDot } from '../objects/dots';
import { Ball } from '../objects/ball';
import { LogicGame, } from '../logic/board';
import { Dot, Point } from '../interfaces/shared';
import { i_to_p, p_to_i } from "../interfaces/shared";

export class GameScene extends Phaser.Scene {
  private ball: Ball;
  private gfxDots: GraphicDot[];
  private drawnLines: Phaser.GameObjects.Line[];
  private tmpLine: Phaser.GameObjects.Line[];
  private validMoves: Point[];
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
    this.ball = new Ball(this, this.logicGame.ballPos);
    this.handleTurnEnd();
  }

  // ============ GAME LOGIC ===========
  handleTurnEnd(): void {
    // move ball, update player banner, highlight valid moves
    const ballPos = this.logicGame.ballPos;
    const validMoves = this.logicGame.getValidMoves(ballPos);
    this.validMoves = validMoves;
    console.log(validMoves)
    this.highlightValidMoves(validMoves);
  }

  // ============ GRAPHICS ============

  initDots(game: LogicGame): GraphicDot[] {
    const dots: GraphicDot[] = [];
    for (let y = 0; y < game.grid.h; y++) {
      for (let x = 0; x < game.grid.w; x++) {
        const val = game.grid.get(x, y);
        const tmpDot = new GraphicDot({ scene: this, logicPos: { x: x, y: y }, val: val });
        tmpDot.on('dot_hover_on', this.onDotHover.bind(this));
        dots.push(tmpDot);
      }
    }
    return dots;
  }

  onDotHover(dot: GraphicDot): void {
    const queryPoint = dot.logicPos
    for (let validPoint of this.validMoves) {
      const isValid = (queryPoint.x == validPoint.x && queryPoint.y == validPoint.y)
      if (isValid) { console.log(queryPoint) }
    }
  }

  highlightValidMoves(validMoves: Point[]): void {
    for (let p of validMoves) {
      const idx = p_to_i(p, this.logicGame.grid.w);
      this.gfxDots[idx].highlight();
    }
  }

  // best way is temp line that gets moved around
  // when moved confirmed create proper line and store it in an attr list
  // ensure lines below dots in terms of z-index


}

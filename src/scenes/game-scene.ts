import { Redhat } from '../objects/redhat';
import { GraphicDot } from '../objects/dots';
import { Ball } from '../objects/ball';
import { LogicGame, } from '../logic/board';
import { Dot, Point, toGfxPos, DOT_SIZE, LINE_WIDTH } from '../interfaces/shared';
import { i_to_p, p_to_i } from "../interfaces/shared";


const centerPoint = (p: Point): Point => {
  return { x: p.x + DOT_SIZE + LINE_WIDTH, y: p.y + DOT_SIZE + LINE_WIDTH }
}

export class GameScene extends Phaser.Scene {
  private ball: Ball;
  private gfxDots: GraphicDot[];
  private drawnLines: Phaser.GameObjects.Line[];
  private tmpLine: Phaser.GameObjects.Line;
  private validMoves: Point[] = [];
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
    this.tmpLine = this.initLine()
    this.add.existing(this.tmpLine)
    this.handleMoveEnd();
  }

  // ============ GAME LOGIC ===========
  handleMoveEnd(): void {
    // move ball, update player banner, highlight valid moves
    this.setHighlightValidMoves(this.validMoves, false);
    const ballPos = this.logicGame.ballPos;
    this.ball.move(ballPos)
    const validMoves = this.logicGame.getValidMoves(ballPos);
    this.validMoves = validMoves;
    console.log(validMoves)
    this.setHighlightValidMoves(validMoves, true);
  }

  checkPointValid(queryPoint: Point): boolean {
    for (let validPoint of this.validMoves) {
      const isValid = (queryPoint.x == validPoint.x && queryPoint.y == validPoint.y);
      if (isValid) { return true }
    }
    return false
  }

  // ============ EVENTS ===========

  onDotHover(dot: GraphicDot): void {
    const ballPoint = this.logicGame.ballPos
    const queryPoint = dot.logicPos
    if (this.checkPointValid(queryPoint)) {
      this.drawTempLine(ballPoint, queryPoint)
    }
  }

  onDotHoverOff(dot: GraphicDot): void {
    this.hideTempLine()
  }

  onDotClick(dot: GraphicDot): void {
    const ballPoint = this.logicGame.ballPos
    const queryPoint = dot.logicPos
    if (!this.checkPointValid(queryPoint)) {
      return
    }
    // update game
    // handle turn end
    console.log('foo')
    const summary = this.logicGame.makeMove(ballPoint, queryPoint)
    this.handleMoveEnd()
  }



  // ============ GRAPHICS ============

  initDots(game: LogicGame): GraphicDot[] {
    const dots: GraphicDot[] = [];
    for (let y = 0; y < game.grid.h; y++) {
      for (let x = 0; x < game.grid.w; x++) {
        const val = game.grid.get(x, y);
        const tmpDot = new GraphicDot({ scene: this, logicPos: { x: x, y: y }, val: val });
        tmpDot.on('dot_hover_on', this.onDotHover.bind(this));
        tmpDot.on('dot_hover_off', this.onDotHoverOff.bind(this));
        tmpDot.on('dot_click_on', this.onDotClick.bind(this));
        dots.push(tmpDot);
      }
    }
    return dots;
  }

  initLine(): Phaser.GameObjects.Line {
    const lineColour = Phaser.Display.Color.GetColor32(245, 234, 240, 100);
    const tmpLine = new Phaser.GameObjects.Line(this, 0, 0, 100, 100, 150, 150, lineColour, 0)
    tmpLine.setLineWidth(2 * LINE_WIDTH, 2 * LINE_WIDTH)
    tmpLine.visible = false
    tmpLine.setDepth(-10)
    return tmpLine
  }

  setHighlightValidMoves(validMoves: Point[], on: boolean = true): void {
    for (let p of validMoves) {
      const idx = p_to_i(p, this.logicGame.grid.w);
      if (on) {
        this.gfxDots[idx].highlight();
      } else {
        this.gfxDots[idx].unhighlight();
      }
    }
  }

  drawTempLine(start: Point, end: Point): void {
    const startGfx = centerPoint(toGfxPos(start));
    const endGfx = centerPoint(toGfxPos(end));
    this.tmpLine.visible = true;
    this.tmpLine.setTo(startGfx.x, startGfx.y, endGfx.x, endGfx.y);
  }

  hideTempLine(): void {
    this.tmpLine.visible = false;
  }




  // best way is temp line that gets moved around
  // when moved confirmed create proper line and store it in an attr list
  // ensure lines below dots in terms of z-index


}

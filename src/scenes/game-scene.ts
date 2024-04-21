import { Redhat } from '../objects/redhat';
import { GraphicDot } from '../objects/dots';
import { Ball } from '../objects/ball';
import { LogicGame, } from '../logic/board';
import { Dot, Point, toGfxPos, DOT_SIZE, LINE_WIDTH, WinState, Colours, valToCol, Link } from '../interfaces/shared';
import { i_to_p, p_to_i } from "../interfaces/shared";


const centerPoint = (p: Point): Point => {
  return { x: p.x + DOT_SIZE + LINE_WIDTH, y: p.y + DOT_SIZE + LINE_WIDTH }
}

export class GameScene extends Phaser.Scene {
  private ball: Ball;
  private gfxDots: GraphicDot[];
  private drawnLines: Phaser.GameObjects.Line[] = [];
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

    const ballPos = this.logicGame.ballPos
    this.ball = new Ball(this, ballPos);

    this.tmpLine = this.initLine()
    this.add.existing(this.tmpLine)

    this.handleMoveEnd(ballPos, ballPos);
  }

  // ============ GAME LOGIC ===========
  handleMoveEnd(start: Point, end: Point): void {
    this.setHighlightValidMoves(this.validMoves, false);
    const ballPos = this.logicGame.ballPos;
    this.ball.move(ballPos)
    this.gfxDots[p_to_i(ballPos, this.logicGame.grid.w)].updateVal(Dot.FILLED)

    this.makePermanentLine(start, end)

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
    const summary = this.logicGame.makeMove(ballPoint, queryPoint)
    if (summary.winState != WinState.NONE) {
      console.log("Game over, " + summary.winState.toString())
    }
    this.handleMoveEnd(ballPoint, queryPoint)
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
    //const tmpLine = new Phaser.GameObjects.Line(this, 0, 0, 100, 100, 150, 150, lineColour, 0)
    //tmpLine.setLineWidth(2 * LINE_WIDTH, 2 * LINE_WIDTH)
    //tmpLine.visible = false
    //tmpLine.setDepth(-10)
    const tmpLine = this.createLine(0, 0, 0, 0, lineColour, 2 * LINE_WIDTH, false)
    return tmpLine
  }

  createLine(x0: number, y0: number, x1: number, y1: number, color: number, width: number, visible: boolean = false): Phaser.GameObjects.Line {
    const tmpLine = new Phaser.GameObjects.Line(this, 0, 0, 100, 100, 150, 150, color, 0);
    tmpLine.setLineWidth(width, width);
    tmpLine.visible = visible;
    tmpLine.setDepth(-10);
    return tmpLine;
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

  makePermanentLine(start: Point, end: Point): void {
    const startGfx = centerPoint(toGfxPos(start));
    const endGfx = centerPoint(toGfxPos(end));

    const c = Phaser.Display.Color.HexStringToColor(valToCol[1]); //TODO: make less bad
    const colour = Phaser.Display.Color.GetColor32(c.red, c.green, c.blue, c.alpha);
    const tmpLine = this.createLine(startGfx.x, startGfx.y, endGfx.x, endGfx.y, colour, 2 * LINE_WIDTH, true)
    tmpLine.setTo(startGfx.x, startGfx.y, endGfx.x, endGfx.y);

    this.drawnLines.push(tmpLine)
    this.add.existing(tmpLine)
  }




  // best way is temp line that gets moved around
  // when moved confirmed create proper line and store it in an attr list
  // ensure lines below dots in terms of z-index


}

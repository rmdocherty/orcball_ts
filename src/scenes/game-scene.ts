import { Redhat } from '../objects/redhat';
import { GraphicDot } from '../objects/dots';
import { AbilityButton } from '../objects/button';
import { Ball } from '../objects/ball';
import { LogicGame, } from '../logic/board';
import { Dot, Point, toGfxPos, WinState, Colours, Link, Player, Character, CHAR_NAMES } from '../interfaces/shared';
import { DOT_SIZE, LINE_WIDTH, valToCol, GAME_H, GAME_W, BANNER_H, SF } from '../interfaces/shared';
import { i_to_p, p_to_i, colourEnumToPhaserColor } from "../interfaces/shared";


const centerPoint = (p: Point): Point => {
  return { x: p.x + DOT_SIZE + LINE_WIDTH, y: p.y + DOT_SIZE + LINE_WIDTH }
}



export class GameScene extends Phaser.Scene {
  private ball: Ball;
  private gfxDots: GraphicDot[];
  private drawnLines: Phaser.GameObjects.Line[] = [];
  private tmpLine: Phaser.GameObjects.Line;
  private playerBanner: Phaser.GameObjects.Rectangle;
  private bgImage: Phaser.GameObjects.Image;
  private walls: Phaser.GameObjects.Image;

  private p1Button: AbilityButton
  private p2Button: AbilityButton

  private tags: Phaser.Animations.Animation[][] = []
  private p1Sprite: Phaser.GameObjects.Sprite;
  private p2Sprite: Phaser.GameObjects.Sprite;


  private validMoves: Point[] = [];
  private logicGame: LogicGame;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void { // load my assets in here later
    this.load.image('bg', '../assets/tiles/bg.png')
    this.load.image('walls', '../assets/tiles/walls.png')
    for (let btn of ["p1_button", "p2_button"]) {
      this.load.image(btn, '../assets/buttons/' + btn + '.png')
    }

    for (let icon of CHAR_NAMES) {
      this.load.image(icon + "_ability", '../assets/non_cc/' + icon + '_ability.png')
    }
    for (let sprite of CHAR_NAMES) {
      this.load.aseprite(sprite, '../assets/characters/' + sprite + '.png', '../assets/characters/' + sprite + '.json')
    }
  }


  // TODO: shrink sides of map by 1 tile

  create(): void {

    for (let name of CHAR_NAMES) {
      const tag = this.anims.createFromAseprite(name);
      this.tags.push(tag)
    }

    this.bgImage = new Phaser.GameObjects.Image(this, GAME_W / 2, GAME_H / 2, 'bg')
    this.bgImage.setScale(SF, SF)
    this.bgImage.setDepth(-100)
    this.add.existing(this.bgImage)

    // TODO: make walls semi translucent when mouse over the boudns/over dots on bounds
    this.walls = new Phaser.GameObjects.Image(this, GAME_W / 2, GAME_H / 2 + 30, 'walls')
    this.walls.setScale(SF, SF)
    this.bgImage.setDepth(-100)
    this.add.existing(this.walls)

    this.logicGame = new LogicGame(11, 9, Character.MAGE, Character.ORC);
    this.gfxDots = this.initDots(this.logicGame);

    const ballPos = this.logicGame.ballPos
    this.ball = new Ball(this, ballPos);

    this.tmpLine = this.initLine()
    this.add.existing(this.tmpLine)

    const bannerColour = colourEnumToPhaserColor(Colours.P1_COL)
    this.playerBanner = new Phaser.GameObjects.Rectangle(this, 0, GAME_H - BANNER_H, GAME_W * 2, BANNER_H * 2, bannerColour)
    this.add.existing(this.playerBanner)

    this.p1Button = new AbilityButton(this, 640, 1160, this.logicGame.p1Details)
    this.add.existing(this.p1Button)
    this.p2Button = new AbilityButton(this, 110, 136, this.logicGame.p2Details)
    this.add.existing(this.p2Button)

    this.initAnims();
    this.handleMoveEnd(ballPos, ballPos);
  }

  // ============ GAME LOGIC ===========
  handleMoveEnd(start: Point, end: Point): void {
    this.setHighlightValidMoves(this.validMoves, false);
    const ballPos = this.logicGame.ballPos;
    this.ball.move(ballPos)
    this.gfxDots[p_to_i(ballPos, this.logicGame.grid.w)].updateVal(Dot.FILLED)

    this.makePermanentLine(start, end)

    const validMoves = this.logicGame.getValidMoves(ballPos, Character.RANGER);
    this.validMoves = validMoves;
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
    const summary = this.logicGame.makeMove(ballPoint, queryPoint, Character.RANGER)
    if (summary.moveOver == true) {
      const newPlayer = this.logicGame.player
      const newColourHex = (newPlayer == Player.P1) ? Colours.P1_COL : Colours.P2_COL
      const newColour = colourEnumToPhaserColor(newColourHex)
      this.playerBanner.fillColor = newColour
    }

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
    const tmpLine = this.createLine(0, 0, 0, 0, lineColour, 2 * LINE_WIDTH, false)
    return tmpLine
  }

  initAnims(): void {

    const pos = [{ x: 120, y: 1100 }, { x: 650, y: 70 }];
    const details = [this.logicGame.p1Details, this.logicGame.p2Details];
    for (let i = 0; i < 2; i++) {

      const c = CHAR_NAMES[details[i].character as unknown as number]
      console.log(c)
      const spr = new Phaser.GameObjects.Sprite(this, pos[i].x, pos[i].y, c);
      spr.setScale(SF + 1, SF + 1);
      spr.play({ key: c + '_passive', repeat: -1 });
      if (i == 0) {
        this.p1Sprite = spr;
      } else {
        spr.setFlipX(true);
        this.p2Sprite = spr;
      }
      this.add.existing(spr);
    }
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

  //TODO: add player colour banner @ bottom
  // add abilities: shape icon for player, ability button on bottom
}

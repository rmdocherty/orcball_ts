
import { GraphicDot } from '../objects/dots';
import { AbilityButton, MenuButton, itemStyle } from '../objects/button';
import { Ball } from '../objects/ball';
import { LogicGame, } from '../logic/board';
import { Dot, Point, toGfxPos, WinState, Colours, Link, Player, Character, CHAR_NAMES, DOT_NAMES, GameStart } from '../interfaces/shared';
import { DOT_SIZE, LINE_WIDTH, valToCol, GAME_H, GAME_W, BANNER_H, SF } from '../interfaces/shared';
import { i_to_p, p_to_i, colourEnumToPhaserColor } from "../interfaces/shared";
import { X_LHS } from './menu-scene';


const FUDGE_PX = 3
const centerPoint = (p: Point): Point => {
  return { x: p.x + DOT_SIZE + LINE_WIDTH + FUDGE_PX, y: p.y + DOT_SIZE + LINE_WIDTH + FUDGE_PX }
}




export class GameScene extends Phaser.Scene {
  private ball: Ball;
  private gfxDots: GraphicDot[];
  private drawnLines: Phaser.GameObjects.Line[] = [];
  private tmpLine: Phaser.GameObjects.Line;

  private bgImage: Phaser.GameObjects.Image;
  private walls: Phaser.GameObjects.Image;

  private playerBanner: Phaser.GameObjects.Rectangle;
  private quitButton: Phaser.GameObjects.Text;
  private restartButton: Phaser.GameObjects.Text;

  private p1Button: AbilityButton
  private p2Button: AbilityButton

  private tags: Phaser.Animations.Animation[][] = []
  private p1Sprite: Phaser.GameObjects.Sprite;
  private p2Sprite: Phaser.GameObjects.Sprite;

  private abilityActive: boolean = false
  private validMoves: Point[] = [];
  private logicGame: LogicGame;
  private winState: WinState

  private muted: boolean
  private music: Phaser.Sound.BaseSound

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameStart) {
    this.logicGame = new LogicGame(11, 9, data.p1, data.p2);
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
    for (let name of DOT_NAMES) {
      this.load.aseprite(name, '../assets/tiles/' + name + '_dot.png', '../assets/tiles/' + name + '_dot.json')
    }
    this.load.aseprite('ball', '../assets/tiles/ball.png', '../assets/tiles/ball.json')
    this.load.image('win_popup', '../assets/menus/bio_frame.png')


  }



  create(): void {

    for (let name of CHAR_NAMES) {
      const tag = this.anims.createFromAseprite(name);
      this.tags.push(tag)
    }
    for (let name of DOT_NAMES) {
      const tag = this.anims.createFromAseprite(name);
      this.tags.push(tag)
    }
    const tag = this.anims.createFromAseprite('ball');

    this.initBG()
    this.initBanner()

    this.winState = WinState.NONE

    this.gfxDots = this.initDots(this.logicGame);

    const ballPos = this.logicGame.ballPos
    this.ball = new Ball(this, ballPos);

    this.tmpLine = this.initLine()
    this.add.existing(this.tmpLine)

    this.p1Button = new AbilityButton(this, 640, 1160, this.logicGame.p1Details)
    this.p1Button.on('ability_clicked', this.onButtonPress.bind(this))
    this.add.existing(this.p1Button)
    this.p2Button = new AbilityButton(this, 110, 136, this.logicGame.p2Details)
    this.p2Button.on('ability_clicked', this.onButtonPress.bind(this))
    this.add.existing(this.p2Button)

    this.muted = false

    this.initAnims();
    this.handleMoveEnd(ballPos, ballPos);

    this.music = this.sound.add('main_music')
    this.music.play({ volume: 0.45, delay: 0.6 })

  }

  // ============ GAME LOGIC ===========
  handleMoveEnd(start: Point, end: Point): void {
    this.hideTempLine()
    this.abilityActive = false
    this.setHighlightValidMoves(this.validMoves, false);
    const ballPos = this.logicGame.ballPos;

    this.moveBall(start, ballPos)

    this.gfxDots[p_to_i(ballPos, this.logicGame.grid.w)].updateVal(Dot.FILLED)

    const [dx, dy] = [end.x - start.x, end.y - start.y]
    const delta = Math.sqrt(dx * dx + dy * dy)
    if (delta < Math.sqrt(3)) { // only draw 1 links
      this.makePermanentLine(start, end)
    }

    const validMoves = this.logicGame.getValidMoves(ballPos, Character.NONE);
    this.validMoves = validMoves;
    this.setHighlightValidMoves(validMoves, true);

    this.updatePlayers(this.logicGame.player);
  }

  checkPointValid(queryPoint: Point): boolean {
    for (let validPoint of this.validMoves) {
      const isValid = (queryPoint.x == validPoint.x && queryPoint.y == validPoint.y);
      if (isValid) { return true }
    }
    return false
  }

  updatePlayers(player: Player): void {
    this.pauseResumeSprites(player);
    const btns = [this.p1Button, this.p2Button];
    btns[player].turnMatches = true
    btns[1 - player].turnMatches = false

    const lg = this.logicGame
    const details = [lg.p1Details, lg.p2Details]
    for (let i = 0; i < 2; i++) {
      btns[i].setAvailable(details[i].movesBeforeCooldown)
    }
  }

  updateOnAbilityPress(): void {
    const lg = this.logicGame
    const details = [lg.p1Details, lg.p2Details][lg.player]
    const ballPos = this.logicGame.ballPos;
    const validMoves = this.logicGame.getValidMoves(ballPos, details.character);
    this.validMoves = validMoves;
    // TODO: filter for new valid moves and show them with purple dot
    this.setHighlightValidMoves(validMoves, true);

    const soundName = CHAR_NAMES[details.character] + "_ability";
    this.sound.play(soundName, { volume: 1.5 })
  }

  quit(): void {
    this.music.stop()
    this.scene.start('MenuScene')
  }

  restart(): void {
    this.music.stop()
    const p1Details = this.logicGame.p1Details
    const p2Details = this.logicGame.p2Details
    this.scene.start('GameScene', { p1: p1Details.character, p2: p2Details.character })
  }

  mute(text: Phaser.GameObjects.Text): void {
    if (this.muted) {
      text.setText('Mute')
      this.music.resume()
    } else {
      this.music.pause()
      text.setText('Unumute')
    }
    this.muted = !this.muted
  }

  onWin(): void {
    // was 0x4f4d46
    const rect = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x8b9150, 10)
    const popup = this.add.image(GAME_W / 2, GAME_H / 2 - 100, 'win_popup')
    const text = this.add.text(X_LHS + 100, GAME_H / 2 - 280, 'P' + this.winState.toString() + ' Wins!', itemStyle)

    this.restartButton.setPosition(X_LHS + 230, GAME_H / 2 - 120)
    this.restartButton.setDepth(100)

    this.quitButton.setPosition(X_LHS + 230, GAME_H / 2 - 30)
    this.quitButton.setDepth(100)
    popup.setScale(SF, SF)
    this.sound.play('win')
  }

  // ============ EVENTS ===========

  onDotHover(dot: GraphicDot): void {
    const ballPoint = this.logicGame.ballPos;
    const queryPoint = dot.logicPos;
    if (this.checkPointValid(queryPoint)) {
      dot.grow();
      this.drawTempLine(ballPoint, queryPoint);
    }
  }

  onDotHoverOff(dot: GraphicDot): void {
    this.hideTempLine()
    this.setHighlightValidMoves(this.validMoves)
  }

  onDotClick(dot: GraphicDot): void {
    const ballPoint = this.logicGame.ballPos
    const queryPoint = dot.logicPos
    if (!this.checkPointValid(queryPoint)) {
      return
    }

    // if ability has been clicked, use that player's character to make logic move
    const lg = this.logicGame
    const details = [lg.p1Details, lg.p2Details][lg.player]
    const char = (this.abilityActive) ? details.character : Character.NONE

    const summary = this.logicGame.makeMove(ballPoint, queryPoint, char)
    if (summary.moveOver == true) {
      const newPlayer = this.logicGame.player
      const newColourHex = (newPlayer == Player.P1) ? Colours.P1_COL : Colours.P2_COL
      const newColour = colourEnumToPhaserColor(newColourHex)
      this.playerBanner.fillColor = newColour
    }

    this.winState = summary.winState
    this.handleMoveEnd(ballPoint, queryPoint)
  }

  onButtonPress(): void {
    this.abilityActive = true
    this.updateOnAbilityPress()
  }



  // ============ GRAPHICS ============
  initBG(): void {
    this.bgImage = new Phaser.GameObjects.Image(this, GAME_W / 2, GAME_H / 2, 'bg')
    this.bgImage.setScale(SF, SF)
    this.bgImage.setDepth(-100)
    this.add.existing(this.bgImage)

    // TODO: make walls semi translucent when mouse over the boudns/over dots on bounds
    this.walls = new Phaser.GameObjects.Image(this, GAME_W / 2, GAME_H / 2 + 30, 'walls')
    this.walls.setScale(SF, SF)
    this.walls.setDepth(-99)
    this.add.existing(this.walls)
    this.walls.postFX.addShadow(0, 2, 0.01)
  }

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
    //const lineColour = Phaser.Display.Color.GetColor32(245, 234, 240, 100);
    const lineColour = Phaser.Display.Color.GetColor32(203, 219, 252, 255);
    const tmpLine = this.createLine(0, 0, 0, 0, lineColour, 2 * LINE_WIDTH, false)
    return tmpLine
  }

  initBanner(): void {
    const bannerColour = colourEnumToPhaserColor(Colours.P1_COL)
    this.playerBanner = new Phaser.GameObjects.Rectangle(this, 0, GAME_H - BANNER_H, GAME_W * 2, BANNER_H * 2, bannerColour)
    this.add.existing(this.playerBanner)

    const newStyle = {
      fontFamily: "fibberish", fontSize: 48, shadow: {
        color: '#000000',
        fill: true,
        offsetX: 1,
        offsetY: 1,
        stroke: true,
        blur: 5,
      }
    }

    const y = GAME_H - BANNER_H - 5
    const quit = new MenuButton(this, GAME_W - 100, y, 'Quit', newStyle)
    const restart = new MenuButton(this, GAME_W - 250, y, 'Restart', newStyle)
    const mute = new MenuButton(this, 100, y, 'Mute', newStyle)

    quit.on('pointerdown', this.quit.bind(this))
    restart.on('pointerdown', this.restart.bind(this))
    mute.on('pointerdown', this.mute.bind(this, mute))

    this.quitButton = quit
    this.restartButton = restart
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

  // ============ ANIMATIONS ============
  initAnims(): void {
    // TODO: only play anims of activte player
    const pos = [{ x: 120, y: 1100 }, { x: 650, y: 70 }];
    const details = [this.logicGame.p1Details, this.logicGame.p2Details];
    for (let i = 0; i < 2; i++) {
      const c = CHAR_NAMES[details[i].character as unknown as number]
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
      spr.postFX.addShadow(0, 2, 0.01)
    }
    this.p2Sprite.anims.pause()
  }

  pauseResumeSprites(player: Player): void {
    const sprs = [this.p1Sprite, this.p2Sprite];
    sprs[player].anims.resume()
    sprs[1 - player].anims.pause()
  }

  moveBall(oldPos: Point, newPos: Point): void {
    const newGfxPos = toGfxPos(newPos)
    this.ball.move(oldPos, newPos)
    const ballSpeed = 160
    const dx = newPos.x - oldPos.x
    const dy = -1 * (newPos.y - oldPos.y)
    const delta = Math.sqrt(dx * dx + dy * dy)

    this.tweens.add({
      targets: this.ball,
      x: newGfxPos.x,
      y: newGfxPos.y,
      duration: Math.floor(ballSpeed * delta),
      onComplete: this.moveEnded.bind(this)
    })

    const ballSoundIdx = Math.floor(Math.random() * 3) + 1
    this.sound.play('kick' + ballSoundIdx.toString(), { volume: 1.1 })
  }

  moveEnded(): void {
    this.ball.anims.pause()
    this.ball.updatePos(this.logicGame.ballPos)

    if (this.winState != WinState.NONE) {
      console.log("Game over, " + this.winState.toString())
      this.onWin()
    }
  }


}

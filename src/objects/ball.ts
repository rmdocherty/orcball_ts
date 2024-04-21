import { Point, toGfxPos, Colours } from "../interfaces/shared";
import { DOT_SIZE, OFFSET } from "../interfaces/shared";

export class Ball extends Phaser.GameObjects.Ellipse {
    logicPos: Point;
    gfxPos: Point;

    constructor(scene: Phaser.Scene, pos: Point) {
        const gfxPos = toGfxPos(pos);
        const c = Phaser.Display.Color.HexStringToColor(Colours.BROWN);
        const color = Phaser.Display.Color.GetColor32(c.red, c.green, c.blue, c.alpha);
        super(scene, gfxPos.x, gfxPos.y, DOT_SIZE + 10, DOT_SIZE + 10, color);
        this.logicPos = pos;

        // chrome dev console interferes with pointer over events, firefox doesn't
        this.on('pointerover', this.onPointerOver)
        this.setInteractive()
        this.scene.add.existing(this);
    }

    onPointerOver(): void {
        this.emit('hover', this)
    }



}
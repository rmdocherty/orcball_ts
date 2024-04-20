import { Point, DotsConstructor, Dot, valToCol } from "../interfaces/shared";
import { DOT_SIZE, DOT_SPACING, OFFSET } from "../interfaces/shared";


const toGfxPos = (logicPos: Point): Point => {
    const l = DOT_SPACING;
    const [ox, oy] = [OFFSET.x, OFFSET.y];
    const gfxPos = { x: logicPos.x * l + ox, y: logicPos.y * l + oy };
    return gfxPos;
}



export class GraphicDot extends Phaser.GameObjects.Container {
    logicPos: Point;
    gfxPos: Point;
    //outerCurve: Phaser.Curves.Ellipse;
    innerDot: Phaser.GameObjects.Ellipse;
    outerDot: Phaser.GameObjects.Ellipse;

    constructor(params: DotsConstructor) {
        super(params.scene);
        this.logicPos = params.logicPos;
        this.gfxPos = toGfxPos(params.logicPos);

        const r = DOT_SIZE;
        const c = Phaser.Display.Color.HexStringToColor(valToCol[params.val])
        const color = Phaser.Display.Color.GetColor32(c.red, c.green, c.blue, c.alpha)
        this.innerDot = new Phaser.GameObjects.Ellipse(params.scene, this.gfxPos.x, this.gfxPos.y, r, r, color);
        this.outerDot = new Phaser.GameObjects.Ellipse(params.scene, this.gfxPos.x, this.gfxPos.y, r + 10, r + 10, color);

        this.add(this.innerDot);
        this.add(this.outerDot);

        this.moveUp(this.innerDot); // depth sorting for container
        this.outerDot.visible = false; // hide initially

        this.initInputs();

        this.scene.add.existing(this);
    }

    private initInputs(): void {
        this.innerDot.setInteractive()
        const fns = [this.onPointerDown, this.onPointerOff, this.onPointerUp];
        const events = ["pointerdown", "pointerout", "pointerup"];
        for (let i = 0; i < fns.length; i++) {
            // bind otherwise 'this' in fn refers to inner dot
            this.innerDot.on(events[i], fns[i].bind(this));
        }
    }

    private onPointerDown(): void {
        this.outerDot.visible = true;
    }

    private onPointerOff(): void {
        this.outerDot.visible = false;
    }

    private onPointerUp(): void {
        this.outerDot.visible = false;
    }



}
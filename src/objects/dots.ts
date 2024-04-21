import { Point, DotsConstructor, valToCol, toGfxPos } from "../interfaces/shared";
import { DOT_SIZE, DOT_SPACING, OFFSET, Dot } from "../interfaces/shared";


// these will be simpler in the game: actually just sprites where the highlighting is
// handled by frames
export class GraphicDot extends Phaser.GameObjects.Container {
    logicPos: Point;
    gfxPos: Point;

    innerDot: Phaser.GameObjects.Ellipse;
    outerDot: Phaser.GameObjects.Ellipse;
    debugText: Phaser.GameObjects.Text;

    constructor(params: DotsConstructor) {
        super(params.scene);
        this.logicPos = params.logicPos;
        this.gfxPos = toGfxPos(params.logicPos);
        const x = this.gfxPos.x;
        const y = this.gfxPos.y;

        const r = DOT_SIZE;
        const c = Phaser.Display.Color.HexStringToColor(valToCol[params.val]);
        const color = Phaser.Display.Color.GetColor32(c.red, c.green, c.blue, c.alpha);
        const outerColor = Phaser.Display.Color.GetColor32(245, 234, 240, 100);
        this.innerDot = new Phaser.GameObjects.Ellipse(params.scene, x, y, r, r, color);
        this.outerDot = new Phaser.GameObjects.Ellipse(params.scene, x, y, r + 10, r + 10, outerColor, 0);

        this.debugText = new Phaser.GameObjects.Text(params.scene, x - 20, y - 8, this.logicPos.x.toString() + "," + this.logicPos.y.toString(), { color: '#000000' });

        this.add(this.innerDot);
        this.add(this.outerDot);
        //this.add(this.debugText);

        this.moveUp(this.innerDot); // depth sorting for container
        this.outerDot.visible = false; // hide initially

        if (params.val == Dot.VOID) {
            this.innerDot.visible = false;
        } else {
            this.initInputs();
        }


        this.scene.add.existing(this);
    }

    private initInputs(): void {
        this.innerDot.setInteractive()
        const fns = [this.onPointerDown, this.onPointerOver, this.onPointerOut];
        const events = ["pointerdown", "pointerover", "pointerout"];
        for (let i = 0; i < fns.length; i++) {
            // bind otherwise 'this' in fn refers to inner dot
            this.innerDot.on(events[i], fns[i].bind(this));
        }
    }

    public highlight(): void {
        this.outerDot.visible = true;
    }

    private unhighlight(): void {
        this.outerDot.visible = false;
    }

    private onPointerOver(): void {
        this.emit('dot_hover_on', this);
    }

    private onPointerOut(): void {
        this.emit('dot_hover_off', this);
    }

    private onPointerDown(): void {
        this.emit('dot_click_on', this);
    }

    private onPointerUp(): void {
        this.outerDot.visible = false;
    }
}
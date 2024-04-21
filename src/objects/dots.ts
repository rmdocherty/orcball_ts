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

    innerColor: number;
    outerColor: number;

    constructor(params: DotsConstructor) {
        super(params.scene);
        this.logicPos = params.logicPos;
        this.gfxPos = toGfxPos(params.logicPos);
        const x = this.gfxPos.x;
        const y = this.gfxPos.y;

        const r = DOT_SIZE;
        const c = Phaser.Display.Color.HexStringToColor(valToCol[params.val]);
        this.innerColor = Phaser.Display.Color.GetColor32(c.red, c.green, c.blue, c.alpha);
        this.outerColor = Phaser.Display.Color.GetColor32(245, 234, 240, 100);
        this.innerDot = new Phaser.GameObjects.Ellipse(params.scene, x, y, r, r, this.innerColor);
        this.outerDot = new Phaser.GameObjects.Ellipse(params.scene, x, y, r + 10, r + 10, this.outerColor, 0);

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
        this.outerDot.setInteractive()
        const fns = [this.onPointerDown, this.onPointerOver, this.onPointerOut];
        const events = ["pointerdown", "pointerover", "pointerout"];
        for (let i = 0; i < fns.length; i++) {
            // bind otherwise 'this' in fn refers to inner dot
            this.outerDot.on(events[i], fns[i].bind(this));
        }
    }

    public highlight(): void {
        this.outerDot.visible = true;
    }

    public unhighlight(): void {
        this.outerDot.visible = false;
    }

    public grow(): void {
        this.outerDot.fillColor = this.innerColor
    }

    public shrink(): void {
        this.outerDot.fillColor = this.outerColor
    }

    public updateVal(newVal: Dot): void {
        const c = Phaser.Display.Color.HexStringToColor(valToCol[newVal]);
        this.innerColor = Phaser.Display.Color.GetColor32(c.red, c.green, c.blue, c.alpha);
        this.innerDot.fillColor = this.innerColor
    }


    private onPointerOver(): void {
        this.grow()
        this.emit('dot_hover_on', this);
    }

    private onPointerOut(): void {
        this.shrink()
        this.emit('dot_hover_off', this);
    }

    private onPointerDown(): void {
        this.emit('dot_click_on', this);
    }

    private onPointerUp(): void {
        this.outerDot.visible = false;
    }
}
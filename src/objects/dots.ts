import { Point, DotsConstructor, toGfxPos, Dot, SF } from "../interfaces/shared";

const dotNames = ["empty", "filled", "wall", "goal", "void"]

export class GraphicDot extends Phaser.GameObjects.Sprite {
    logicPos: Point;
    gfxPos: Point;
    dotName: string;

    constructor(params: DotsConstructor) {
        const gfxPos = toGfxPos(params.logicPos);
        const x = gfxPos.x;
        const y = gfxPos.y;
        const dotIdx = params.val as unknown as number;
        const name = dotNames[dotIdx]

        super(params.scene, x, y, name, 0);
        this.setScale(SF, SF);
        //this.play({ key: name, repeat:  });

        this.dotName = name;
        this.logicPos = params.logicPos;
        this.gfxPos = gfxPos;

        this.initInputs();

        if (params.val != Dot.VOID) { this.scene.add.existing(this); }

    }

    private initInputs(): void {
        this.setInteractive()
        const fns = [this.onPointerDown, this.onPointerOver, this.onPointerOut];
        const events = ["pointerdown", "pointerover", "pointerout"];
        for (let i = 0; i < fns.length; i++) {
            // bind otherwise 'this' in fn refers to inner dot
            this.on(events[i], fns[i].bind(this));
        }
    }

    public updateVal(val: Dot): void {
        const dotIdx = val as unknown as number;
        const name = dotNames[dotIdx]
        this.setTexture(name)
        this.name = name
    }

    public highlight(): void {
        this.setFrame(1)
        return
    }

    public unhighlight(): void {
        this.setFrame(0)
        return
    }

    public grow(): void {
        this.setFrame(3)
    }

    public shrink(): void {
        this.setFrame(0)
    }

    private onPointerOver(): void {
        //this.grow()
        this.emit('dot_hover_on', this);
    }

    private onPointerOut(): void {
        this.shrink()
        this.emit('dot_hover_off', this);
    }

    private onPointerDown(): void {
        this.emit('dot_click_on', this);
    }

}

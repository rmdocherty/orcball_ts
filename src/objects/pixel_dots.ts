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

        if (params.val != Dot.VOID) { this.scene.add.existing(this); }

    }

    public updateVal(val: Dot): void {
        return
    }

    public highlight(): void {
        return
    }

    public unhighlight(): void {
        return
    }

}

import { Point, toGfxPos, SF } from "../interfaces/shared";


export class Ball extends Phaser.GameObjects.Sprite {
    logicPos: Point;
    gfxPos: Point;
    prevState: "diag" | "vert" = "vert"

    constructor(scene: Phaser.Scene, logicPos: Point) {
        const gfxPos = toGfxPos(logicPos);
        super(scene, gfxPos.x, gfxPos.y, 'ball')

        this.setScale(SF, SF)
        this.logicPos = logicPos
        this.gfxPos = gfxPos

        this.play({ key: 'vert', repeat: -1 });
        this.anims.pause()

        this.scene.add.existing(this)
        this.postFX.addShadow(0, 2, 0.01)
    }

    move(oldPos: Point, newPos: Point): void {
        const gfxPos = toGfxPos(newPos);
        this.anims.resume()
        const dx = newPos.x - oldPos.x
        const dy = -1 * (newPos.y - oldPos.y)
        this.adjustFromDelta(dx, dy)
        this.gfxPos = gfxPos
    }

    updatePos(newPos: Point) {
        const gfxPos = toGfxPos(newPos);
        this.setPosition(gfxPos.x, gfxPos.y)
        this.gfxPos = gfxPos

    }

    adjustFromDelta(dx: number, dy: number) {
        const isDiag = (dx != 0) && (dy != 0)
        const isVert = !isDiag

        if (isDiag && this.prevState == "vert") {
            this.play({ key: 'diag', repeat: -1 });
            this.anims.pause()
            this.prevState = "diag"
        } else if (isVert && this.prevState == "diag") {
            this.play({ key: 'vert', repeat: -1 });
            this.anims.pause()
            this.prevState = "vert"
        }

        if (isVert && dy > 0) {
            this.setAngle(0)
            this.setFlipY(false)
        } else if (isVert && dy < 0) {
            this.setAngle(0)
            this.setFlipY(true)
        } else if (isVert && dx > 0) {
            this.setAngle(90)
        } else if (isVert && dx > 0) {
            this.setAngle(-90)
        } else if (isDiag && dy > 0 && dx > 0) {
            this.setAngle(0)
            this.setFlipY(false)
        } else if (isDiag && dy < 0 && dx < 0) {
            this.setAngle(0)
            this.setFlipY(true)
        }
    }
}
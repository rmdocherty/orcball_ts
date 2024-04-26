import { SF, GAME_H, GAME_W } from "../interfaces/shared"
import { X_LHS, X_RHS, YSPACE } from "../scenes/menu-scene";
import { MenuButton, itemStyle } from "./button";


export const tutorialTextStyle = {
    fontFamily: 'fibberish',
    fontSize: 36,
    wordWrap: { width: 600 }
}

const tutorialText = [
    "Grab a friend! Orcball is a multiplayer strategy based on paper football. Players take it in turns to move the ball along the dots to their opponent's goal (orange).",
    "Move to a neighbouring dot by clicking or tapping it. If you move to an empty dot (white) it ends your turn and it is now your opponent's turn.",
    "When you move from one dot to another, it fills that link between the two dots. You cannot move along filled links, shown in yellow.",
    "If you move onto a filled dot (yellow) you may move again without ending your turn!",
    "If you move onto a wall dot (grey) you may move again without ending your turn by bouncing off it. You cannot move horizontally or vertically along walls.",
    "Each character has a power they can use before they take a move, which then goes on cooldown, recharging after your opponent moves a certain distance. This is the main difference between Orcball and paper football. "

]

export class Tutorial extends Phaser.GameObjects.Container {
    fwdArrow: Phaser.GameObjects.Image;
    revArrow: Phaser.GameObjects.Image;
    pageNumber: number;
    tutorialImage: Phaser.GameObjects.Image;
    tutorialText: Phaser.GameObjects.Text;
    //gotoMenu: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        super(scene)

        this.pageNumber = 0;

        const tutorialFrame = new Phaser.GameObjects.Image(scene, GAME_W / 2, GAME_H / 2, 'tutorial_frame')
        const arrowY = YSPACE * 4.4
        this.fwdArrow = new Phaser.GameObjects.Image(scene, X_RHS + 110, arrowY, 'arrow')
        this.revArrow = new Phaser.GameObjects.Image(scene, X_LHS, arrowY, 'arrow')
        this.revArrow.flipX = true

        this.tutorialImage = new Phaser.GameObjects.Image(scene, GAME_W / 2, GAME_H / 2 - 130, "t1")
        this.tutorialImage.setScale(0.9, 0.9)

        this.tutorialText = new Phaser.GameObjects.Text(scene, GAME_W / 2 - 290, GAME_H / 2, 'AHHHH', tutorialTextStyle)



        for (let obj of [tutorialFrame, this.fwdArrow, this.revArrow]) {
            obj.setScale(SF, SF)
            obj.postFX.addShadow(0, 2, 0.015)
            this.add(obj)
        }

        this.add(this.tutorialText)
        this.add(this.tutorialImage)

        let arrowN = 0
        for (let arrow of [this.revArrow, this.fwdArrow]) {
            arrow.setInteractive()
            const fns = [this.onPointerOver, this.onPointerOut, this.onPointerDown];
            const events = ["pointerover", "pointerout", "pointerdown"];
            for (let i = 0; i < fns.length; i++) {
                // bind otherwise 'this' in fn refers to inner dot
                arrow.on(events[i], fns[i].bind(this, arrowN));
            }
            arrowN++
        }

        this.revArrow.visible = false

        this.scene.add.existing(this)

        this.goToPage(0)
    }

    private goToPage(pageN: number): void {
        if (pageN > 0) {
            this.revArrow.visible = true
        } else {
            this.revArrow.visible = false
        }

        if (pageN == 5) { this.fwdArrow.visible = false } else { this.fwdArrow.visible = true }
        const newN = Math.min(Math.max(0, pageN), 6)
        this.pageNumber = newN
        this.tutorialText.setText(tutorialText[newN])
        this.tutorialImage.setTexture("t" + (newN + 1).toString())
    }

    private onPointerOver(i: number): void {
        const arrow = [this.revArrow, this.fwdArrow][i]
        arrow.setScale(1.05 * SF, 1.05 * SF)
    }

    private onPointerOut(i: number): void {
        const arrow = [this.revArrow, this.fwdArrow][i]
        arrow.setScale(SF, SF)
    }

    private onPointerDown(i: number): void {
        this.goToPage(this.pageNumber + (2 * i - 1))
    }
}
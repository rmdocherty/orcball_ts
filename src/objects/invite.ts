import { GAME_H, GAME_W, SF } from "../interfaces/shared"
import { tutorialTextStyle } from "./tutorial"
import { MenuButton, itemStyle } from "./button"

const msg = "Send this code to a friend! When they enter it the game will start automatically. (NB: will open an alert as can't access clipboard on itch)"
const URL = (true) ? "https://avaloggames.itch.io/orcball?" : "localhost:8080?"

export const inviteButonStyle = {
    fontFamily: 'fibberish',
    fontSize: 80,
    wordWrap: { width: 600 },
    color: "#fbf236",
    shadow: {
        color: '#000000',
        fill: true,
        offsetX: 2,
        offsetY: 2,
        stroke: true,
        blur: 20,
    },
}

export class Invite extends Phaser.GameObjects.Container {
    enter: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, id: string) {
        super(scene)
        const frame = new Phaser.GameObjects.Image(scene, GAME_W / 2, GAME_H / 2, 'tutorial_frame')
        const url = URL + id //TODO: CHANGE FOR RELEASE

        const text = new Phaser.GameObjects.Text(this.scene, GAME_W / 2 - 290, GAME_H / 2 - 300, msg, tutorialTextStyle)
        const urlText = new Phaser.GameObjects.Text(this.scene, GAME_W / 2, GAME_H / 2 - 100, id, itemStyle)
        urlText.setOrigin(0.5, 0.5 * (GAME_H / 2) / GAME_H)
        const copy = new MenuButton(this.scene, GAME_W / 2, GAME_H / 2 + 60, 'Copy!', inviteButonStyle)
        this.enter = new MenuButton(this.scene, GAME_W / 2, GAME_H / 2 + 180, 'Enter!', inviteButonStyle)

        this.add(frame)
        this.add(text)
        this.add(urlText)
        this.add(copy)
        this.add(this.enter)

        for (let obj of [frame]) {
            obj.setScale(SF, SF)
            obj.postFX.addShadow(0, 2, 0.015)
            this.add(obj)
        }

        copy.on('pointerdown', this.copyContent.bind(this, id))

        this.scene.add.existing(this)
    }

    copyContent = async (id: string) => {

        alert(id)
    }
}

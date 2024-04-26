import { GAME_H, GAME_W, SF } from "../interfaces/shared"
import { tutorialTextStyle } from "./tutorial"
import { MenuButton } from "./button"

const msg = "Send this link to a friend! When they join the game will start automatically. (NB: will open an alert as can't access clipboard on itch)"
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
    constructor(scene: Phaser.Scene, id: string) {
        super(scene)
        const frame = new Phaser.GameObjects.Image(scene, GAME_W / 2, GAME_H / 2, 'tutorial_frame')
        const url = URL + id //TODO: CHANGE FOR RELEASE

        const text = new Phaser.GameObjects.Text(this.scene, GAME_W / 2 - 290, GAME_H / 2 - 200, msg, tutorialTextStyle)
        const urlText = new Phaser.GameObjects.Text(this.scene, GAME_W / 2 - 290, GAME_H / 2, url, tutorialTextStyle)
        const copy = new MenuButton(this.scene, GAME_W / 2, GAME_H / 2 + 150, 'Copy!', inviteButonStyle)

        this.add(frame)
        this.add(text)
        this.add(urlText)
        this.add(copy)

        for (let obj of [frame]) {
            obj.setScale(SF, SF)
            obj.postFX.addShadow(0, 2, 0.015)
            this.add(obj)
        }

        copy.on('pointerdown', this.copyContent.bind(this, url))

        this.scene.add.existing(this)
    }

    copyContent = async (id: string) => {

        alert(id)
        try {
            await navigator.clipboard.writeText(id);
            console.log('Content copied to clipboard');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }
}

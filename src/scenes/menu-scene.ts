import { GAME_H, GAME_W, SF } from '../interfaces/shared';


const itemStyle = {
    fontFamily: 'fibberish',
    fontSize: 80,

    shadow: {
        color: '#000000',
        fill: true,
        offsetX: 2,
        offsetY: 2,
        stroke: true,
        blur: 20,
    },
}

const OY = 160
const YSPACE = 240
const X_LHS = 140
const X_RHS = 500

export class MenuScene extends Phaser.Scene {
    bgImage: Phaser.GameObjects.Image
    title: Phaser.GameObjects.Text
    charSelectItems: Phaser.GameObjects.GameObject[] = [];

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload(): void {
        this.load.image('bg', '../assets/tiles/bg.png')
        this.load.image('title', '../assets/menus/title.png')
        this.load.image('frame', '../assets/menus/char_frame.png')
        this.load.image('bio', '../assets/menus/bio_frame.png')
        this.load.image('tooltip', '../assets/buttons/tooltip_frame.png')
    }

    create(): void {
        this.bgImage = new Phaser.GameObjects.Image(this, GAME_W / 2, GAME_H / 2, 'bg')
        this.bgImage.setScale(SF, SF)
        this.bgImage.setDepth(-100)
        this.add.existing(this.bgImage)

        const title = this.add.image(375, 350, 'title')
        title.setScale(SF + 1, SF + 1)

        const names = ["tutorial", "local", "online"]
        for (let i = 0; i < names.length; i++) {
            const text = this.add.text(GAME_W / 2, 550 + 150 * i, names[i], itemStyle)
            text.setOrigin(0.5, 0.5)
        }

        this.createCharSelect()

    }

    createCharSelect(): void {
        for (let i = 0; i < 4; i++) {
            const frame = this.add.image(X_LHS, OY + YSPACE * i, 'frame')
            frame.setScale(SF, SF)
            this.charSelectItems.push(frame)
        }
        const bio = this.add.image(X_RHS, YSPACE + 40, 'bio')
        bio.setScale(SF, SF)
        const tooltip = this.add.image(X_RHS, OY + YSPACE * 2, 'tooltip')
        tooltip.setScale(SF, SF)

        for (let item of [bio, tooltip]) {
            this.charSelectItems.push(item)
        }

        for (let item of this.charSelectItems) {
            // @ts-ignore
            item.setVisible(false)
        }
    }
}
import { GAME_H, GAME_W, SF } from '../interfaces/shared';
import { MenuButton, itemStyle } from '../objects/button';




const OY = 160
const YSPACE = 240
const X_LHS = 140
const X_RHS = 500

export class MenuScene extends Phaser.Scene {
    bgImage: Phaser.GameObjects.Image
    title: Phaser.GameObjects.Text
    menuItems: Phaser.GameObjects.GameObject[] = []
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
        title.postFX.addShadow(0, 2, 0.02)
        this.menuItems.push(title)

        const names = ["tutorial", "local", "online"]
        const fns = [this.loadTutorial, this.loadLocal, this.loadOnline]
        for (let i = 0; i < names.length; i++) {
            const text = new MenuButton(this, GAME_W / 2, 550 + 150 * i, names[i], itemStyle)
            text.on('pointerdown', fns[i].bind(this))
            this.menuItems.push(text)
        }
        this.createCharSelect()
    }

    createCharSelect(): void {
        for (let i = 0; i < 4; i++) {
            const frame = this.add.image(X_LHS, OY + YSPACE * i, 'frame')
            frame.setScale(SF, SF)
            this.charSelectItems.push(frame)
            frame.postFX.addShadow(0, 2, 0.015)
        }
        const bio = this.add.image(X_RHS, YSPACE + 40, 'bio')
        bio.setScale(SF, SF)
        const tooltip = this.add.image(X_RHS, OY + YSPACE * 2, 'tooltip')
        tooltip.setScale(SF, SF)

        for (let item of [bio, tooltip]) {
            this.charSelectItems.push(item)
            item.postFX.addShadow(0, 2, 0.015)
        }

        this.setCharSelect(false)
    }

    setMenuVis(vis: boolean) {
        for (let item of this.menuItems) {
            // @ts-ignore
            item.setVisible(vis)
        }
    }

    setCharSelect(vis: boolean) {
        for (let item of this.charSelectItems) {
            // @ts-ignore
            item.setVisible(vis)
        }
    }

    loadTutorial() {
        console.log('tutorial')
        this.setMenuVis(false)
    }

    loadLocal() {
        console.log('local')
        this.setMenuVis(false)
        this.setCharSelect(true)
    }

    loadOnline() {
        console.log('online')
        this.setMenuVis(false)
        this.setCharSelect(true)
    }
}
import { wrap } from 'module';
import { GAME_H, GAME_W, SF, CHAR_NAMES } from '../interfaces/shared';
import { MenuButton, itemStyle } from '../objects/button';


const characterBios = require('../assets/data.json')

const OY = 160
const YSPACE = 240
const X_LHS = 140
const X_RHS = 500

interface Bio {
    name: string,
    desc: string,
    tooltipName: string,
    tooltip: string
}

export const bioNameStyle = {
    fontFamily: 'fibberish',
    fontSize: 48,
}

export const bioStyle = {
    fontFamily: 'fibberish',
    fontSize: 34,
    wordWrap: { width: 350 }
}

export class MenuScene extends Phaser.Scene {
    bgImage: Phaser.GameObjects.Image
    title: Phaser.GameObjects.Text
    menuItems: Phaser.GameObjects.GameObject[] = []
    charSelectItems: Phaser.GameObjects.GameObject[] = [];
    frames: Phaser.GameObjects.Image[] = [];
    charSprites: Phaser.GameObjects.Sprite[] = []
    selectedCharIdx: number = 0
    currentBio: Bio = characterBios["warrior"]
    bioItems: Phaser.GameObjects.Text[] = [];

    // ============ INITS ===========
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload(): void {
        this.load.image('bg', '../assets/tiles/bg.png')
        this.load.image('title', '../assets/menus/title.png')
        this.load.image('frame', '../assets/menus/char_frame.png')
        this.load.image('bio', '../assets/menus/bio_frame.png')
        this.load.image('tooltip', '../assets/buttons/tooltip_frame.png')
        for (let sprite of CHAR_NAMES) {
            this.load.aseprite(sprite, '../assets/characters/' + sprite + '.png', '../assets/characters/' + sprite + '.json')
        }
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
            frame.setInteractive()
            this.frames.push(frame)
            frame.on('pointerdown', this.onFrameClick.bind(this, i))
            frame.on('pointerover', this.onFrameHover.bind(this, i))
            frame.on('pointerout', this.onFrameOut.bind(this, i))
        }
        const bio = this.add.image(X_RHS, YSPACE + 40, 'bio')
        bio.setScale(SF, SF)
        const tooltip = this.add.image(X_RHS, OY + YSPACE * 2, 'tooltip')
        tooltip.setScale(SF, SF)

        for (let item of [bio, tooltip]) {
            this.charSelectItems.push(item)
            item.postFX.addShadow(0, 2, 0.015)
        }

        const bioTitle = this.add.text(X_RHS - 180, YSPACE - 150, this.currentBio.name, bioNameStyle)
        const bioText = this.add.text(X_RHS - 180, YSPACE - 90, this.currentBio.desc, bioStyle)

        for (let item of [bioTitle, bioText]) {
            this.charSelectItems.push(item)
            item.postFX.addShadow(0, 2, 0.015)
            this.bioItems.push(item)
        }
        this.setCharSelect(false)
    }

    // ============ WELCOME MENU ===========

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
        this.initAnims()
    }

    loadOnline() {
        console.log('online')
        this.setMenuVis(false)
        this.setCharSelect(true)
    }

    // ============ CHARACTER SELECT ===========
    onFrameClick(i: number) {
        const newBio: Bio = characterBios[CHAR_NAMES[i]]
        const newText = [newBio.name, newBio.desc]
        for (let i = 0; i < newText.length; i++) {
            this.bioItems[i].setText(newText[i])
        }
        this.charSprites[this.selectedCharIdx].anims.pause();
        this.charSprites[i].anims.resume();

        this.selectedCharIdx = i
        this.currentBio = newBio
    }

    onFrameHover(i: number) {
        this.frames[i].setScale(SF * 1.05, SF * 1.05)
    }

    onFrameOut(i: number) {
        this.frames[i].setScale(SF, SF)
    }

    initAnims(): void {
        for (let name of CHAR_NAMES) {
            const tag = this.anims.createFromAseprite(name);
        }
        for (let i = 0; i < 4; i++) {
            const c = CHAR_NAMES[i]
            const spr = new Phaser.GameObjects.Sprite(this, X_LHS - 10, 124 + i * YSPACE, c);
            spr.setScale(SF, SF);
            spr.play({ key: c + '_passive', repeat: -1 });
            spr.anims.pause()
            this.add.existing(spr);
            spr.postFX.addShadow(0, 2, 0.008)
            this.charSelectItems.push(spr)
            this.charSprites.push(spr)
        }
        this.charSprites[0].anims.resume();
    }



}
import { wrap } from 'module';
import { GAME_H, GAME_W, SF, CHAR_NAMES, DOT_NAMES } from '../interfaces/shared';
import { MenuButton, itemStyle } from '../objects/button';


let characterBios = require('../assets/data.json')

export const OY = 160
export const YSPACE = 240
export const X_LHS = 140
export const X_RHS = 500

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

export const p1Style: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'fibberish',
    fontSize: 72,
    color: "#ac3232",
}

export const p2Style: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'fibberish',
    fontSize: 72,
    color: "#5b6ee1",
}

export class MenuScene extends Phaser.Scene {
    // DEFAULT INITS BAD WHEN CHANGING SCENES!
    bgImage: Phaser.GameObjects.Image
    title: Phaser.GameObjects.Text
    menuItems: Phaser.GameObjects.GameObject[] = []
    charSelectItems: Phaser.GameObjects.GameObject[] = [];

    frames: Phaser.GameObjects.Image[] = [];
    charSprites: Phaser.GameObjects.Sprite[]

    currentBio: Bio = characterBios["warrior"]
    selectedCharIdx: number
    selectedChars: number[];

    bioItems: Phaser.GameObjects.Text[];
    playerSelectTexts: Phaser.GameObjects.Text[];

    confirmButton: Phaser.GameObjects.Image;

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
        this.load.image('confirm', '../assets/buttons/confirm_button.png')
        for (let sprite of CHAR_NAMES) {
            this.load.aseprite(sprite, '../assets/characters/' + sprite + '.png', '../assets/characters/' + sprite + '.json')
        }

        this.load.image('walls', '../assets/tiles/walls.png')
        for (let btn of ["p1_button", "p2_button"]) {
            this.load.image(btn, '../assets/buttons/' + btn + '.png')
        }

        for (let icon of CHAR_NAMES) {
            this.load.image(icon + "_ability", '../assets/non_cc/' + icon + '_ability.png')
        }
        for (let sprite of CHAR_NAMES) {
            this.load.aseprite(sprite, '../assets/characters/' + sprite + '.png', '../assets/characters/' + sprite + '.json')
        }
        for (let name of DOT_NAMES) {
            this.load.aseprite(name, '../assets/tiles/' + name + '_dot.png', '../assets/tiles/' + name + '_dot.json')
        }
        this.load.aseprite('ball', '../assets/tiles/ball.png', '../assets/tiles/ball.json')
        this.load.image('win_popup', '../assets/menus/bio_frame.png')

        this.load.image('banner_1', '../assets/menus/banner_1.png')
        this.load.image('banner_2', '../assets/menus/banner_2.png')

        this.load.image('tutorial_frame', '../assets/menus/tutorial_frame.png')
        for (let i = 1; i < 7; i++) {
            const name = 't' + i.toString()
            this.load.image(name, '../assets/menus/' + name + '.png')
        }

        this.preloadAudio()
    }

    preloadAudio(): void {
        this.load.audio('main_music', '../assets/music/embark.ogg')
        const fnames = ["ability_used", "accept", "invalid", "kick1", "kick2", "kick3", "mage_ability", "orc_ability", "ranger_ability", "warrior_ability", "win"]
        for (let fname of fnames) {
            this.load.audio(fname, '../assets/music/' + fname + ".wav")
        }
    }

    create(): void {
        this.selectedCharIdx = 0
        this.selectedChars = []
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
        const tooltip = this.add.image(X_RHS, OY + YSPACE * 2, 'tooltip')
        const confirmButton = this.add.image(X_RHS + X_LHS, YSPACE * 3.5, 'confirm')

        const p1Char = this.add.text(X_LHS - 80, YSPACE * 4.5, 'P1: ???', p1Style)
        const p2Char = this.add.text(X_RHS, YSPACE * 4.5, 'P2: ???', p2Style)

        for (let item of [bio, tooltip, confirmButton]) {
            this.charSelectItems.push(item)
            item.setScale(SF, SF)
            item.postFX.addShadow(0, 2, 0.015)
        }

        this.playerSelectTexts = []
        for (let item of [p1Char, p2Char]) {
            this.charSelectItems.push(item)
            this.playerSelectTexts.push(item)
        }

        confirmButton.setInteractive()
        confirmButton.on('pointerdown', this.onConfirmDown.bind(this))
        confirmButton.on('pointerover', this.onConfirmHover.bind(this))
        confirmButton.on('pointerout', this.onConfirmOut.bind(this))

        this.confirmButton = confirmButton

        const bioTitle = this.add.text(X_RHS - 180, YSPACE - 150, this.currentBio.name, bioNameStyle)
        const bioText = this.add.text(X_RHS - 180, YSPACE - 90, this.currentBio.desc, bioStyle)
        const toolName = this.add.text(X_RHS - 180, YSPACE * 2 + 70, this.currentBio.tooltipName, bioNameStyle)
        const toolDesc = this.add.text(X_RHS - 180, YSPACE * 2 + 130, this.currentBio.tooltip, bioStyle)

        this.bioItems = []
        for (let item of [bioTitle, bioText, toolName, toolDesc]) {
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

        const tutorialFrame = this.add.image(GAME_W / 2, GAME_H / 2, 'tutorial_frame')
        tutorialFrame.setScale(SF, SF)
        tutorialFrame.postFX.addShadow(0, 2, 0.015)

    }

    loadLocal() {
        console.log('local')
        this.sound.play('accept')
        this.setMenuVis(false)
        this.setCharSelect(true)
        this.initAnims()
    }

    loadOnline() {
        console.log('online')
        this.setMenuVis(false)
        this.setCharSelect(true)
        this.initAnims()
    }

    // ============ CHARACTER SELECT ===========
    onFrameClick(i: number) {
        const newBio: Bio = characterBios[CHAR_NAMES[i]]
        const newText = [newBio.name, newBio.desc, newBio.tooltipName, newBio.tooltip]
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

    onConfirmHover() {
        this.confirmButton.setScale(SF * 1.05, SF * 1.05)
    }

    onConfirmOut() {
        this.confirmButton.setScale(SF, SF)
    }

    onConfirmDown() {
        const i = this.selectedCharIdx
        this.selectedChars.push(i)
        this.confirmButton.setScale(SF, SF)
        if (this.selectedChars.length == 2) {
            this.scene.start('GameScene', { p1: this.selectedChars[0], p2: this.selectedChars[1] })
        }
        const bioName: string = characterBios[CHAR_NAMES[i]].name
        const name = bioName.split(",")[0]
        this.playerSelectTexts[0].setText('P1: ' + name)
        this.sound.play('accept')
    }

    initAnims(): void {
        for (let name of CHAR_NAMES) {
            const tag = this.anims.createFromAseprite(name);
        }

        const sprs: Phaser.GameObjects.Sprite[] = []
        for (let i = 0; i < 4; i++) {
            const c = CHAR_NAMES[i]
            const spr = new Phaser.GameObjects.Sprite(this, X_LHS - 10, 124 + i * YSPACE, c);
            spr.setScale(SF, SF);
            spr.play({ key: c + '_passive', repeat: -1 });
            spr.anims.pause()
            this.add.existing(spr);
            spr.postFX.addShadow(0, 2, 0.008)
            this.charSelectItems.push(spr)
            sprs.push(spr)
        }
        this.charSprites = sprs
        sprs[this.selectedCharIdx].anims.resume();
    }

}
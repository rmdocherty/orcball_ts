import { Character, PlayerDetails, SF } from "../interfaces/shared";


const cooldownTextStyle = {
    fontFamily: 'fibberish', fontSize: 80, shadow: {
        color: '#000000',
        fill: true,
        offsetX: 2,
        offsetY: 2,
        blur: 20
    }
}

export class AbilityButton extends Phaser.GameObjects.Container {
    private button: Phaser.GameObjects.Image
    private abilityIcon: Phaser.GameObjects.Image
    private cooldownText: Phaser.GameObjects.Text
    public available: boolean = true;
    public turnMatches: boolean = true;

    // TODO: add cooldown here

    constructor(scene: Phaser.Scene, x: number, y: number, playerDetails: PlayerDetails) {
        super(scene);
        const playerString = ["p1", "p2"][playerDetails.player];
        const abilityString = ["warrior", "orc", "mage", "ranger"][playerDetails.character];
        this.button = new Phaser.GameObjects.Image(scene, x, y, playerString + "_button");
        this.abilityIcon = new Phaser.GameObjects.Image(scene, x, y, abilityString + "_ability");
        this.cooldownText = new Phaser.GameObjects.Text(scene, x + 35, y + 10, '5', cooldownTextStyle)

        this.cooldownText.visible = false;

        this.button.postFX.addShadow(0, 2, 0.01)

        this.setScales(SF);
        this.initInputs();

        this.add(this.button);
        this.add(this.abilityIcon);
        this.add(this.cooldownText)
    }

    private initInputs(): void {
        this.button.setInteractive();
        const fns = [this.onPointerOver, this.onPointerOut, this.onPointerDown];
        const events = ["pointerover", "pointerout", "pointerdown"];
        for (let i = 0; i < fns.length; i++) {
            // bind otherwise 'this' in fn refers to inner dot
            this.button.on(events[i], fns[i].bind(this));
        }
    }

    private setScales(sf: number) {
        this.button.setScale(sf, sf);
        this.abilityIcon.setScale(sf, sf);
    }

    private setTints(color: number) {
        this.button.setTint(color);
        this.abilityIcon.setTint(color);
    }

    private onPointerOver(): void {
        if (this.turnMatches && this.available) { this.setScales(1.05 * SF) };
    }

    private onPointerOut(): void {
        if (this.turnMatches) { this.setScales(SF) };
    }

    private onPointerDown(): void {
        if (this.available && this.turnMatches) {
            this.emit('ability_clicked', this);
        } else {
            this.scene.sound.play('invalid')
        }
    }

    public setAvailable(turnsLeft: number) {
        console.log(turnsLeft)
        if (turnsLeft <= 0) {
            this.available = true
            this.button.clearTint();
            this.abilityIcon.clearTint();
            this.cooldownText.visible = false
        } else {
            this.available = false
            this.setTints(0X696a6a);
            this.cooldownText.setText(turnsLeft.toString())
            this.cooldownText.visible = true
        }
    }
}

export const itemStyle = {
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

export class MenuButton extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y, text, style)
        this.setOrigin(0.5, 0.5)
        this.scene.add.existing(this)
        this.initInputs()
    }

    private initInputs(): void {
        this.setInteractive();
        const fns = [this.onPointerOver, this.onPointerOut];
        const events = ["pointerover", "pointerout",];
        for (let i = 0; i < fns.length; i++) {
            // bind otherwise 'this' in fn refers to inner dot
            this.on(events[i], fns[i].bind(this));
        }
    }

    private onPointerOver(): void {
        this.setScale(1.1, 1.1)
        //this.setTint()
    }

    private onPointerOut(): void {
        this.setScale(1, 1)
        this.clearTint()
    }


}
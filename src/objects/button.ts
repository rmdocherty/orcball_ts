import { Character, PlayerDetails, SF } from "../interfaces/shared";


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
        this.cooldownText = new Phaser.GameObjects.Text(scene, x, y, '5', {
            fontFamily: 'fibberish', fontSize: 50, shadow: {
                color: '#000000',
                fill: true,
                offsetX: 2,
                offsetY: 2,
                blur: 20
            }
        })

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
        if (this.turnMatches) { this.setScales(1.05 * SF) };
    }

    private onPointerOut(): void {
        if (this.turnMatches) { this.setScales(SF) };
    }

    private onPointerDown(): void {
        if (this.available && this.turnMatches) {
            this.emit('ability_clicked', this);
        };
    }

    public setAvailable(available: boolean) {
        this.available = available;
        if (available == true) {
            this.button.clearTint();
            this.abilityIcon.clearTint();
        } else {
            this.setTints(0X696a6a);
        }
    }
}
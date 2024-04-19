import { ImageConstructor } from '../interfaces/image.interface';

// redhat seems to be an image rather than a sprite
export class Redhat extends Phaser.GameObjects.Image {
  body: Phaser.Physics.Arcade.Body;

  constructor(params: ImageConstructor) { // constructor just means init for the class
    super(params.scene, params.x, params.y, params.texture, params.frame);
    // any fields I want to access later should be defined here (and not, say, in initSprite)

    // generic init helpers they've written
    this.initSprite();
    this.initPhysics();
    this.initInputs();

    this.scene.add.existing(this); // adds itself to the scene

  }

  private initSprite(): void {
    this.setInteractive(); // this is needed for obj to have inputs processed
    this.setScale(0.5);
  }

  private initPhysics(): void {
    this.scene.physics.world.enable(this);
    this.body.setVelocity(100, 200);
    this.body.setBounce(1, 1);
    this.body.setCollideWorldBounds(true);
    this.body.setSize(200, 300);
  }

  private initInputs(): void {
    const fns = [this.onPointerDown, this.onPointerOff, this.onPointerUp];
    const events = ["pointerdown", "pointerout", "pointerup"];
    for (let i = 0; i < fns.length; i++) {
      this.on(events[i], fns[i]);
    }
  }

  private onPointerDown(): void {
    this.setTint(0xff0000);
  }

  private onPointerOff(): void {
    this.clearTint();
  }

  private onPointerUp(): void {
    this.clearTint();
  }

}

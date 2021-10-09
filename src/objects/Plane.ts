import { BoundsFactory } from 'matter';
import Phaser from 'phaser';

import convertRadiansToCompass from '../utils/convertRadiansToCompass';

export default class Plane extends Phaser.GameObjects.Rectangle {
  private plane: Phaser.GameObjects.Rectangle;
  private velocity: Phaser.Types.Math.Vector2Like;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private debugger;
  private debugText: string[];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    /* --------------------- Create the Plane shape -------------------- */
    const planeShapeEdgeLength = 12;
    this.plane = scene.add
      .rectangle(
        this.x,
        this.y,
        planeShapeEdgeLength,
        planeShapeEdgeLength,
        0xa0f078
      )
      .setOrigin(0.5, 0.5);

    // Enable physics on the Plane object
    scene.physics.add.existing(this);

    // Config the physics body (aka hitbox)
    const body = this.body as Phaser.Physics.Arcade.Body;

    body.setSize(this.plane.width, this.plane.height);

    // CursorKeys is a convenient way to access the arrow keys and spacebar
    this.cursors = scene.input.keyboard.createCursorKeys();

    /* ----------------------- Init Direction Box ---------------------- */
    const text = scene.add.text(
      scene.scale.width,
      scene.scale.height,
      'Hello World',
      {
        fixedWidth: 150,
        fixedHeight: 36,
      }
    );
    text.setOrigin(0.5, 0.5);
    text.setInteractive().on('pointerdown', () => {
      this.rexUI.edit(text);
    });

    /* ------------------------- Init Debugger ------------------------- */
    this.debugText = ['----PLANE DEBUGGER----'];
    this.debugger = scene.add.text(10, 10, this.debugText);
  }

  preUpdate() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    // Aligns the Plane with its hitbox
    this.plane.x = body.x + body.halfWidth;
    this.plane.y = body.y + body.halfHeight;

    // Velocity from angle
    const newRadian = 0;
    this.velocity = this.scene.physics.velocityFromRotation(newRadian, 60);

    /* ---------------------------- DEBUGGER --------------------------- */
    this.debugText[1] = `Accel-X: ${body.acceleration.x.toFixed(2)}`;
    this.debugText[2] = `Accel-Y: ${body.acceleration.y.toFixed(2)}`;
    this.debugText[3] = `Velocity-X: ${body.velocity.x.toFixed(2)}`;
    this.debugText[4] = `Velocity-Y: ${body.velocity.y.toFixed(2)}`;
    this.debugText[5] = `Angle: ${body.angle.toFixed(2)}`;
    this.debugText[6] = `Compass: ${convertRadiansToCompass(body.angle).toFixed(
      0
    )}`;
    this.debugger.setText(this.debugText);
  }
}

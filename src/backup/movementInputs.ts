import { BoundsFactory } from 'matter';
import Phaser from 'phaser';

import convertRadiansToCompass from '../utils/convertRadiansToHeading';

export default class Plane extends Phaser.GameObjects.Rectangle {
  private plane: Phaser.GameObjects.Rectangle;
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

    /* ---------------------------- DEBUGGER --------------------------- */
    this.debugText = ['----PLANE DEBUGGER----'];
    this.debugger = scene.add.text(10, 10, this.debugText);
  }

  preUpdate() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    // Aligns the Plane with its hitbox
    this.plane.x = body.x + body.halfWidth;
    this.plane.y = body.y + body.halfHeight;

    /* ---------------------- SET MOVEMENT INPUTS ---------------------- */
    const key = this.cursors;
    const ACCEL = 200;
    const MAX_VELOCITY = 100;
    const BOOST_MULTIPLIER = 3;

    // Limits
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(MAX_VELOCITY);

    // Normal movement
    if (key.up.isDown) body.setAccelerationY(-ACCEL);
    if (key.down.isDown) body.setAccelerationY(ACCEL);
    if (key.left.isDown) body.setAccelerationX(-ACCEL);
    if (key.right.isDown) body.setAccelerationX(ACCEL);

    // Boosted movement
    if (key.space.isDown) {
      body.setMaxVelocity(
        MAX_VELOCITY * BOOST_MULTIPLIER,
        MAX_VELOCITY * BOOST_MULTIPLIER
      );
      if (key.up.isDown && key.space.isDown)
        body.setAccelerationY(-ACCEL * BOOST_MULTIPLIER);
      if (key.down.isDown && key.space.isDown)
        body.setAccelerationY(ACCEL * BOOST_MULTIPLIER);
      if (key.left.isDown && key.space.isDown)
        body.setAccelerationX(-ACCEL * BOOST_MULTIPLIER);
      if (key.right.isDown && key.space.isDown)
        body.setAccelerationX(ACCEL * BOOST_MULTIPLIER);
    }

    // No keys pressed (slow down)
    if (key.up.isUp && key.down.isUp) {
      body.setAccelerationY(0);
      if (body.velocity.y > 0) body.setVelocityY(body.velocity.y - 1);
      if (body.velocity.y < 0) body.setVelocityY(body.velocity.y + 1);
    }
    if (key.left.isUp && key.right.isUp) {
      body.setAccelerationX(0);
      if (body.velocity.x > 0) body.setVelocityX(body.velocity.x - 1);
      if (body.velocity.x < 0) body.setVelocityX(body.velocity.x + 1);
    }

    // DEBUG
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

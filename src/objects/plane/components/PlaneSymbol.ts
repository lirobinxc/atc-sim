import Phaser from 'phaser';
import { convertHeadingToRadians } from '../../../utils/convertHeadingToRadians';
import { Plane } from '../Plane';

interface IPlaneSymbol {
  plane: Plane;
  scene: Phaser.Scene;
  x: number;
  y: number;
}

export class PlaneSymbol extends Phaser.GameObjects.Rectangle {
  plane: Plane;
  /* ---------------------------- Properties --------------------------- */
  constructor({ plane, scene, x, y }: IPlaneSymbol) {
    super(
      scene,
      x,
      y,
      plane.config.plane.SIZE,
      plane.config.plane.SIZE,
      plane.config.plane.COLOR,
      1
    );

    /* ----------------------- Init Plane Object ----------------------- */
    this.plane = plane;
    // Add object to the scene
    scene.add.existing(this);

    // Enable physics on the Plane object
    scene.physics.add.existing(this);

    // Config the physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(this.displayWidth + 2, this.displayHeight + 2);

    /* -------------------------- Init Events -------------------------- */
    this.setInteractive();
    this.on('pointerdown', () => {
      plane.status.isSelected = true;
    });
  }

  preUpdate() {
    this.updateNewHeading();
    this.changeColorOnClick();
  }

  /** Updates velocity when given a compass heading. */
  private updateNewHeading(plane = this.plane) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    // CurrentHeading is gradually dec/inc until it reaches the newHeading
    if (plane.move.currentHeading !== plane.move.newHeading) {
      plane.status.isExecutingCommand = true;
      if (plane.move.turnTo === 'Left') {
        if (plane.move.currentHeading === 1) plane.move.currentHeading = 360;
        else plane.move.currentHeading -= 1;
      }
      if (plane.move.turnTo === 'Right') {
        if (plane.move.currentHeading === 360) plane.move.currentHeading = 1;
        else plane.move.currentHeading += 1;
      }
    } else {
      plane.status.isExecutingCommand = false;
    }
    const planeRadian = convertHeadingToRadians(plane.move.currentHeading);
    this.scene.physics.velocityFromRotation(
      planeRadian,
      plane.move.speed,
      body.velocity
    );
  }

  /** Change plane color if selected */
  private changeColorOnClick(plane = this.plane) {
    if (plane.status.isSelected) {
      this.fillColor = plane.config.plane.COLOR_SELECTED;
    } else {
      this.fillColor = plane.config.plane.COLOR;
    }
    const escKey: Phaser.Input.Keyboard.Key =
      this.scene.input.keyboard.addKey('ESC');
    if (escKey.isDown) {
      plane.status.isSelected = false;
    }
  }
}

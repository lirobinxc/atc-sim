import Phaser from 'phaser';
import { EmitEvents } from '../../../types/EmitEvents';
import { convertHeadingToRadians } from '../../../utils/convertHeadingToRadians';
import { Plane } from '../Plane';

interface IPlaneSymbol {
  plane: Plane;
  x: number;
  y: number;
}

export class PlaneSymbol extends Phaser.GameObjects.Rectangle {
  plane: Plane;
  /* ---------------------------- Properties --------------------------- */
  constructor({ plane, x, y }: IPlaneSymbol) {
    super(
      plane.scene,
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
    // NOTE: This is required to activate preUpdate() method
    this.scene.add.existing(this);
    this.setDepth(1);

    // Enable physics on the Plane object
    this.scene.physics.add.existing(this);
    this.updatePlaneVelocity();

    // Config the physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(this.displayWidth + 2, this.displayHeight + 2);

    /* -------------------------- Init Events -------------------------- */
    this.setInteractive();
  }

  preUpdate() {
    this.updateNewHeading();
    this.updatePlaneVelocity();
    this.changeColorOnClick();
  }

  /** Updates velocity when given a compass heading. */
  private updateNewHeading() {
    // CurrentHeading is gradually dec/inc until it reaches the newHeading
    const TURN_RATE = this.plane.config.plane.TURN_RATE;

    if (
      this.plane.move.currentHeading < this.plane.move.newHeading - TURN_RATE ||
      this.plane.move.currentHeading > this.plane.move.newHeading + TURN_RATE
    ) {
      this.plane.status.isExecutingCommand = true;
      if (this.plane.move.turnTo === 'Left') {
        if (this.plane.move.currentHeading <= 1)
          this.plane.move.currentHeading = 360;
        else this.plane.move.currentHeading -= TURN_RATE;
      }
      if (this.plane.move.turnTo === 'Right') {
        if (this.plane.move.currentHeading >= 360)
          this.plane.move.currentHeading = 1;
        else this.plane.move.currentHeading += TURN_RATE;
      }
    } else {
      this.plane.move.currentHeading = this.plane.move.newHeading;
      this.plane.status.isExecutingCommand = false;
    }
  }

  private updatePlaneVelocity() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const planeRadian = convertHeadingToRadians(this.plane.move.currentHeading);
    this.scene.physics.velocityFromRotation(
      planeRadian,
      this.plane.move.speed,
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
  }
}

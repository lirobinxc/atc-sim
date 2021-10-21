import Phaser from 'phaser';
import { planeConfig, IPlaneConfig } from '../../config/PlaneConfig';
import { PlaneSymbol } from './components/PlaneSymbol';
import { convertHeadingToRadians } from '../../utils/convertHeadingToRadians';

interface IPlane {
  config: IPlaneConfig;
  scene: Phaser.Scene;
  x: number;
  y: number;
}

export class Plane extends Phaser.GameObjects.Container {
  config: IPlaneConfig;
  scene: Phaser.Scene;
  status: { isSelected: boolean; isExecutingCommand: boolean };
  move: {
    currentHeading: number;
    newHeading: number;
    turnTo: 'Left' | 'Right';
    speed: number;
  };
  symbol: PlaneSymbol;

  constructor({ config, scene, x, y }: IPlane) {
    super(scene, x, y);
    /* --------------------------- Init Props -------------------------- */
    this.config = config;
    this.scene = scene;
    this.status = { isSelected: false, isExecutingCommand: false };
    const initHeading = Phaser.Math.Between(1, 360);
    this.move = {
      currentHeading: initHeading,
      newHeading: initHeading,
      speed: config.plane.INITIAL_SPEED,
      turnTo: 'Left',
    };
    this.symbol = new PlaneSymbol({ plane: this, scene, x, y });

    /* -------------------------- Setup Plane -------------------------- */
    scene.add.existing(this);
  }

  preUpdate() {
    const body = this.symbol.body as Phaser.Physics.Arcade.Body;

    /* ----------------------- Set Plane Heading ----------------------- */
    // This section calculates velocity when given a compass heading.
    if (this.move.currentHeading !== this.move.newHeading) {
      this.status.isExecutingCommand = true;
      if (this.move.turnTo === 'Left') {
        if (this.move.currentHeading === 1) this.move.currentHeading = 360;
        else this.move.currentHeading -= 1;
      }
      if (this.move.turnTo === 'Right') {
        if (this.move.currentHeading === 360) this.move.currentHeading = 1;
        else this.move.currentHeading += 1;
      }
    } else {
      this.status.isExecutingCommand = false;
    }

    const planeRadian = convertHeadingToRadians(this.move.currentHeading);
    this.scene.physics.velocityFromRotation(
      planeRadian,
      this.move.speed,
      body.velocity
    );

    /* ---------------- Change Plane Symbol if selected ---------------- */
    if (this.status.isSelected) {
      this.symbol.fillColor = this.config.plane.COLOR_SELECTED;
    } else {
      this.symbol.fillColor = this.config.plane.COLOR;
    }
    const escKey: Phaser.Input.Keyboard.Key =
      this.scene.input.keyboard.addKey('ESC');
    if (escKey.isDown) {
      this.status.isSelected = false;
    }
  }
}

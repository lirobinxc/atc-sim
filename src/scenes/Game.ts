import Phaser from 'phaser';
import Plane from '../objects/Plane';
// Types
import { SceneKeys } from '../types/SceneKeys';

export default class Game extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Game);
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const plane1 = new Plane(this, width * 0.5, height * 0.5, 'ACA-142');
    const plane2 = new Plane(this, width * 0.4, height * 0.4, 'DAL-23');

    this.add.existing(plane1);
    this.add.existing(plane2);
  }
}

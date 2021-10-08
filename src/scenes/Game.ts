import Phaser, { Scale } from 'phaser';
import Plane from '../objects/Plane';

export default class Game extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const plane = new Plane(this, width * 0.5, height * 0.5);
    this.add.existing(plane);
  }
}

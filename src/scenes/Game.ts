import Phaser from 'phaser';
import Plane from '../objects/Plane';
// Types
import SceneKeys from '../types/SceneKeys';

export default class Game extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Game);
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const plane = new Plane(this, width * 0.5, height * 0.5);
    this.add.existing(plane);
  }
}

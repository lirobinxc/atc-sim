import Phaser from 'phaser';

export default class Plane extends Phaser.GameObjects.Rectangle {
  constructor(
    scene: Phaser.Scene,
    xy1: Phaser.Types.Math.Vector2Like,
    xy2: Phaser.Types.Math.Vector2Like
  ) {
    super(scene, xy1, xy2);
  }
}

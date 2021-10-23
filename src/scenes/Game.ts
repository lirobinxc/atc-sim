import Phaser from 'phaser';
import { planeConfig } from '../config/PlaneConfig';
import { PlaneSymbol } from '../objects/plane/components/PlaneSymbol';
import { Plane } from '../objects/plane/Plane';
// Types
import { SceneKeys } from '../types/SceneKeys';

export default class Game extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Game);
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const NUM_OF_PLANES = 2;
    const planes: Plane[] = this.generatePlanes(NUM_OF_PLANES);

    // DEBUG: screen middle circle
    this.add.circle(width * 0.5, height * 0.5, 2, 0xff0000);
  }

  generatePlanes(num: number): Plane[] {
    const planes: Plane[] = [];
    for (let i = 0; i < num; i++) {
      // planeConfig.plane.INITIAL_SPEED = Phaser.Math.Between(5, 20);
      planes.push(
        new Plane({
          config: planeConfig,
          scene: this,
          x: this.scale.width * 0.5,
          y: this.scale.height * 0.5,
        })
      );
    }
    return planes;
  }
}

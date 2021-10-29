import Phaser from 'phaser';
import { Plane } from '../Plane';

export class PlaneDebugger extends Phaser.GameObjects.Text {
  constructor(plane: Plane) {
    super(plane.scene, 10, 10, ['testing'], { color: 'white' });
  }
}

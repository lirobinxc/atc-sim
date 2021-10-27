import Phaser from 'phaser';
import { Plane } from '../Plane';

export class PlaneSymbolHeadingLine extends Phaser.GameObjects.Line {
  private plane: Plane;

  constructor(plane: Plane) {
    super(plane.scene, 0, 0, 0, 0, 0, 0, 0xaad1a5);

    this.plane = plane;

    // Add object to the scene
    plane.scene.add.existing(this);

    this.setLineWidth(0.7).setOrigin(0, 0);
  }

  preUpdate() {
    this.setLinePosition();
  }

  private setLinePosition() {
    const body = this.plane.symbol.body;
    const planePosition = this.plane.symbol.getCenter();
    this.setTo(
      planePosition.x,
      planePosition.y,
      planePosition.x + 5 * body.velocity.x,
      planePosition.y + 5 * body.velocity.y
    );
  }
}

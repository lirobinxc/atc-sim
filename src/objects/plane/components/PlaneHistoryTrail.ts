import Phaser from 'phaser';
import { convertRadiansToQuadrant } from '../../../utils/convertRadiansToQuadrant';
import { Plane } from '../Plane';

export class PlaneHistoryTrail extends Phaser.GameObjects.Line {
  private plane: Plane;

  constructor(plane: Plane) {
    super(plane.scene, 0, 0, 0, 0, 0, 0, 0xaad1a5);

    this.plane = plane;

    // Add object to the scene
    plane.scene.add.existing(this);

    this.setLineWidth(0.7).setOrigin(0, 0);
  }

  preUpdate() {
    this.setTrailPosition();
    this.getTrailQuadrant();
  }

  private setTrailPosition() {
    const [point1, point2] = this.getLinePoints();
    this.setTo(point1.x, point1.y, point2.x, point2.y);
  }

  private getLinePoints(): [
    Phaser.Types.Math.Vector2Like,
    Phaser.Types.Math.Vector2Like
  ] {
    const body = this.plane.symbol.body;
    const planePosition = this.plane.symbol.getCenter();
    const point1 = {
      x: planePosition.x,
      y: planePosition.y,
    };
    const point2 = {
      x: planePosition.x + 5 * body.velocity.x,
      y: planePosition.y + 5 * body.velocity.y,
    };
    return [point1, point2];
  }

  public getTrailQuadrant() {
    const [point1, point2] = this.getLinePoints();
    const angle = Phaser.Math.Angle.BetweenPoints(point1, point2);
    const quadrant = convertRadiansToQuadrant(angle);
    return quadrant;
  }
}

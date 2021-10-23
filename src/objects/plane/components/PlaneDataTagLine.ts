import Phaser from 'phaser';
import { Plane } from '../Plane';
import { PlaneDataTagPosition } from './PlaneDataTag';

export class PlaneDataTagLine extends Phaser.GameObjects.Line {
  private plane: Plane;

  constructor(plane: Plane) {
    super(plane.scene, 0, 0);

    this.plane = plane;

    this.setTo(
      this.getLinePlacement(PlaneDataTagPosition.BottomRight).planeCorner.x,
      this.getLinePlacement(PlaneDataTagPosition.BottomRight).planeCorner.y,
      this.getLinePlacement(PlaneDataTagPosition.BottomRight).dataCorner.x,
      this.getLinePlacement(PlaneDataTagPosition.BottomRight).dataCorner.y
    )
      .setOrigin(0, 0)
      .setLineWidth(0.7);
  }

  preUpdate() {
    this.setLinePosition();
  }

  private getLinePlacement(position: PlaneDataTagPosition) {
    const getCorners = {
      [PlaneDataTagPosition.TopLeft]: {
        getPlaneCorner: this.plane.symbol.getTopLeft(),
        getDataCorner: this.getBottomRight(),
      },
      [PlaneDataTagPosition.TopRight]: {
        getPlaneCorner: this.plane.symbol.getTopRight(),
        getDataCorner: this.getBottomLeft(),
      },
      [PlaneDataTagPosition.BottomLeft]: {
        getPlaneCorner: this.plane.symbol.getBottomLeft(),
        getDataCorner: this.getTopRight(),
      },
      [PlaneDataTagPosition.BottomRight]: {
        getPlaneCorner: this.plane.symbol.getBottomRight(),
        getDataCorner: this.getTopLeft(),
      },
    };
    const linePlacement = {
      planeCorner: getCorners[position].getPlaneCorner,
      dataCorner: getCorners[position].getDataCorner,
    };
    return linePlacement;
  }

  private setLinePosition() {
    this.setTo(
      this.getLinePlacement(this.plane.dataTag.position).planeCorner.x,
      this.getLinePlacement(this.plane.dataTag.position).planeCorner.y,
      this.getLinePlacement(this.plane.dataTag.position).dataCorner.x,
      this.getLinePlacement(this.plane.dataTag.position).dataCorner.y
    );
  }
}

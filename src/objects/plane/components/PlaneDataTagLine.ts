import Phaser from 'phaser';
import { Plane } from '../Plane';
import { Quadrant } from './PlaneDataTag';

export class PlaneDataTagLine extends Phaser.GameObjects.Line {
  private plane: Plane;

  constructor(plane: Plane) {
    super(plane.scene, 0, 0, 0, 0, 0, 0, 0xffffff);

    this.plane = plane;

    // Add object to the scene
    plane.scene.add.existing(this);

    this.setLineWidth(0.7)
      .setOrigin(0, 0)
      .setTo(
        this.getLinePlacement(Quadrant.BottomRight).planeCorner.x,
        this.getLinePlacement(Quadrant.BottomRight).planeCorner.y,
        this.getLinePlacement(Quadrant.BottomRight).dataCorner.x,
        this.getLinePlacement(Quadrant.BottomRight).dataCorner.y
      );
  }

  preUpdate() {
    this.setLinePosition();
    // console.log(
    //   this.getLinePlacement(PlaneDataTagPosition.BottomRight).planeCorner.x,
    //   this.getLinePlacement(PlaneDataTagPosition.BottomRight).planeCorner.y,
    //   this.getLinePlacement(PlaneDataTagPosition.BottomRight).dataCorner.x,
    //   this.getLinePlacement(PlaneDataTagPosition.BottomRight).dataCorner.y
    // );
  }

  private getLinePlacement(quadrant: Quadrant) {
    const getCorners = {
      [Quadrant.TopLeft]: {
        getPlaneCorner: this.plane.symbol.getTopLeft(),
        getDataCorner: this.plane.dataTag.getBottomRight(),
      },
      [Quadrant.TopRight]: {
        getPlaneCorner: this.plane.symbol.getTopRight(),
        getDataCorner: this.plane.dataTag.getBottomLeft(),
      },
      [Quadrant.BottomLeft]: {
        getPlaneCorner: this.plane.symbol.getBottomLeft(),
        getDataCorner: this.plane.dataTag.getTopRight(),
      },
      [Quadrant.BottomRight]: {
        getPlaneCorner: this.plane.symbol.getBottomRight(),
        getDataCorner: this.plane.dataTag.getTopLeft(),
      },
    };
    const linePlacement = {
      planeCorner: getCorners[quadrant].getPlaneCorner,
      dataCorner: getCorners[quadrant].getDataCorner,
    };
    return linePlacement;
  }

  private setLinePosition() {
    this.setTo(
      this.getLinePlacement(this.plane.dataTag.quadrant).planeCorner.x,
      this.getLinePlacement(this.plane.dataTag.quadrant).planeCorner.y,
      this.getLinePlacement(this.plane.dataTag.quadrant).dataCorner.x,
      this.getLinePlacement(this.plane.dataTag.quadrant).dataCorner.y
    );
  }
}

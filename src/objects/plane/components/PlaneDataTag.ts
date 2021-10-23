import Phaser from 'phaser';
import { Plane } from '../Plane';

export enum PlaneDataTagPosition {
  TopLeft = 'topLeft',
  TopRight = 'topRight',
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
}

export class PlaneDataTag extends Phaser.GameObjects.Text {
  private plane: Plane;
  private line: Phaser.GameObjects.Line;
  public position: PlaneDataTagPosition;

  constructor(plane: Plane) {
    super(plane.scene, plane.symbol.x, plane.symbol.y, '', {});
    // Init properties
    this.plane = plane;
    this.position = PlaneDataTagPosition.BottomRight;
    this.setText([this.plane.callsign.full]);

    // Add object to the scene
    plane.scene.add.existing(this);

    // Setup
    this.setOrigin(0.5, 0.5);

    /* ---------------------- Add Connecting Line ---------------------- */
    this.line = plane.scene.add
      .line(
        0,
        0,
        this.getLinePlacement(PlaneDataTagPosition.BottomRight).planeCorner.x,
        this.getLinePlacement(PlaneDataTagPosition.BottomRight).planeCorner.y,
        this.getLinePlacement(PlaneDataTagPosition.BottomRight).dataCorner.x,
        this.getLinePlacement(PlaneDataTagPosition.BottomRight).dataCorner.y,
        this.plane.config.dataTag.LINE_COLOR
      )
      .setOrigin(0, 0)
      .setLineWidth(0.7);

    /* -------------------------- Init Events -------------------------- */
    this.setInteractive();
    this.on('pointerdown', () => {
      this.cycleTextPosition();
    });
  }

  preUpdate() {
    this.setTextPosition();
    this.setLinePosition();
    this.updateDataTag();
  }

  private updateDataTag() {
    const line1 = this.plane.callsign.full;
    const line2 = `${this.plane.move.altitude.toString().padStart(3, '0')}  ${
      this.plane.move.speed
    }`;
    const line3 = `${this.plane.move.currentHeading
      .toString()
      .padStart(3, '0')}`;
    const PAD_LENGTH = 6;
    this.setText([
      line1.padEnd(PAD_LENGTH, ' '),
      line2.padEnd(PAD_LENGTH, ' '),
      line3.padEnd(PAD_LENGTH, ' '),
    ]);
  }

  private setTextPosition() {
    const offset = {
      [PlaneDataTagPosition.TopLeft]: {
        x: -this.plane.config.dataTag.TEXT_OFFSET_X,
        y: -this.plane.config.dataTag.TEXT_OFFSET_Y,
      },
      [PlaneDataTagPosition.TopRight]: {
        x: this.plane.config.dataTag.TEXT_OFFSET_X,
        y: -this.plane.config.dataTag.TEXT_OFFSET_Y,
      },
      [PlaneDataTagPosition.BottomLeft]: {
        x: -this.plane.config.dataTag.TEXT_OFFSET_X,
        y: this.plane.config.dataTag.TEXT_OFFSET_Y,
      },
      [PlaneDataTagPosition.BottomRight]: {
        x: this.plane.config.dataTag.TEXT_OFFSET_X,
        y: this.plane.config.dataTag.TEXT_OFFSET_Y,
      },
    };

    this.setX(this.plane.symbol.x + offset[this.position].x);
    this.setY(this.plane.symbol.y + offset[this.position].y);
  }

  private cycleTextPosition() {
    switch (this.position) {
      case PlaneDataTagPosition.TopLeft:
        return (this.position = PlaneDataTagPosition.TopRight);
      case PlaneDataTagPosition.TopRight:
        return (this.position = PlaneDataTagPosition.BottomRight);
      case PlaneDataTagPosition.BottomRight:
        return (this.position = PlaneDataTagPosition.BottomLeft);
      case PlaneDataTagPosition.BottomLeft:
        return (this.position = PlaneDataTagPosition.TopLeft);
      default:
        return (this.position = PlaneDataTagPosition.BottomRight);
    }
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
    this.line.setTo(
      this.getLinePlacement(this.position).planeCorner.x,
      this.getLinePlacement(this.position).planeCorner.y,
      this.getLinePlacement(this.position).dataCorner.x,
      this.getLinePlacement(this.position).dataCorner.y
    );
  }
}

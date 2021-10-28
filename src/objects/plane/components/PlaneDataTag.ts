import Phaser from 'phaser';
import { Plane } from '../Plane';

export enum Quadrant {
  TopLeft = 'topLeft',
  TopRight = 'topRight',
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
}

export class PlaneDataTag extends Phaser.GameObjects.Text {
  private plane: Plane;
  public quadrant: Quadrant;
  public autoSetQuadrant: boolean;

  constructor(plane: Plane) {
    super(plane.scene, plane.symbol.x, plane.symbol.y, '', {});
    // Init properties
    this.plane = plane;
    this.quadrant = Quadrant.BottomRight;
    this.autoSetQuadrant = true;
    this.setText([this.plane.callsign.full, '', '']);

    // Add object to the scene
    plane.scene.add.existing(this);
    plane.scene.physics.add.existing(this);

    // Setup
    this.setOrigin(0.5, 0.5);

    /* -------------------------- Init Events -------------------------- */
    this.setInteractive();
    this.on('pointerdown', () => {
      this.autoSetQuadrant = false;
      this.cycleTagPosition();
    });
  }

  preUpdate() {
    this.updateTagText();
    this.updateTagPosition();
    this.updateTagQuadrantBasedOnHistoryTrail();
  }

  private updateTagText() {
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

  private updateTagPosition() {
    // position is based on the current this.quadrant property
    const dataTagOffset = {
      [Quadrant.TopLeft]: {
        x: -this.plane.config.dataTag.TEXT_OFFSET_X,
        y: -this.plane.config.dataTag.TEXT_OFFSET_Y,
      },
      [Quadrant.TopRight]: {
        x: this.plane.config.dataTag.TEXT_OFFSET_X,
        y: -this.plane.config.dataTag.TEXT_OFFSET_Y,
      },
      [Quadrant.BottomLeft]: {
        x: -this.plane.config.dataTag.TEXT_OFFSET_X,
        y: this.plane.config.dataTag.TEXT_OFFSET_Y,
      },
      [Quadrant.BottomRight]: {
        x: this.plane.config.dataTag.TEXT_OFFSET_X,
        y: this.plane.config.dataTag.TEXT_OFFSET_Y,
      },
    };

    this.setX(this.plane.symbol.x + dataTagOffset[this.quadrant].x);
    this.setY(this.plane.symbol.y + dataTagOffset[this.quadrant].y);
  }

  private updateTagQuadrantBasedOnHistoryTrail() {
    if (!this.autoSetQuadrant) return;

    const historyTrail = this.plane.historyTrail;
    if (!historyTrail) return;

    const historyTrailQuadrant = historyTrail.getTrailQuadrant();
    if (historyTrailQuadrant === Quadrant.TopLeft)
      this.quadrant = Quadrant.BottomRight;
    if (historyTrailQuadrant === Quadrant.TopRight)
      this.quadrant = Quadrant.BottomLeft;
    if (historyTrailQuadrant === Quadrant.BottomLeft)
      this.quadrant = Quadrant.TopRight;
    if (historyTrailQuadrant === Quadrant.BottomRight)
      this.quadrant = Quadrant.TopLeft;

    this.autoSetQuadrant = false;
  }

  private cycleTagPosition() {
    switch (this.quadrant) {
      case Quadrant.TopLeft:
        return (this.quadrant = Quadrant.TopRight);
      case Quadrant.TopRight:
        return (this.quadrant = Quadrant.BottomRight);
      case Quadrant.BottomRight:
        return (this.quadrant = Quadrant.BottomLeft);
      case Quadrant.BottomLeft:
        return (this.quadrant = Quadrant.TopLeft);
      default:
        return (this.quadrant = Quadrant.BottomRight);
    }
  }
}

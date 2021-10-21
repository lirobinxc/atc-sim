import Phaser from 'phaser';
import { Plane } from '../Plane';

export class PilotSpeech extends Phaser.GameObjects.Text {
  private plane: Plane;
  public position: 'Above' | 'Below';

  constructor(plane: Plane) {
    super(
      plane.scene,
      plane.symbol.x,
      plane.symbol.y,
      plane.pilotSpeech.text,
      {}
    );
    // Init properties
    this.plane = plane;
    this.position = 'Above';

    // Add object to the scene
    plane.scene.add.existing(this);

    // Setup
    this.setOrigin(0.5, 0.5);
  }

  preUpdate() {
    this.setTextPosition();
  }

  private syncTextPositionWithPlaneSymbol() {
    this.setX(this.plane.symbol.x);
    this.setY(this.plane.symbol.y);
  }

  private setTextPosition() {
    if (this.position === 'Above') {
      this.setX(this.plane.symbol.x);
      this.setY(
        this.plane.symbol.y - this.plane.config.pilotSpeech.TEXT_OFFSET_Y
      );
    }
    if (this.position === 'Below') {
      this.setX(this.plane.symbol.x);
      this.setY(
        this.plane.symbol.y + this.plane.config.pilotSpeech.TEXT_OFFSET_Y
      );
    }
  }
}

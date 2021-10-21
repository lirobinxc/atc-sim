import Phaser from 'phaser';
import { Plane } from '../Plane';

export class PlaneSpeechBubble extends Phaser.GameObjects.Text {
  private plane: Plane;

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

    // Add object to the scene
    plane.scene.add.existing(this);

    // Setup
    this.setOrigin(0.5, 0.5);
  }

  preUpdate() {
    this.syncTextPositionWithPlaneSymbol();
  }

  private syncTextPositionWithPlaneSymbol() {
    this.setX(this.plane.symbol.x);
    this.setY(this.plane.symbol.y);
  }
}

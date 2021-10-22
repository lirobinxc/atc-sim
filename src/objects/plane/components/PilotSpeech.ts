import Phaser from 'phaser';
import { Plane } from '../Plane';
import { PlaneDataTagPosition } from './PlaneDataTag';

export class PilotSpeech extends Phaser.GameObjects.Text {
  private plane: Plane;
  public position: 'Above' | 'Below';
  public isTalking: boolean;
  public speechSynth: undefined | SpeechSynthesis;

  constructor(plane: Plane) {
    super(plane.scene, plane.symbol.x, plane.symbol.y, '', {});
    // Init properties
    this.plane = plane;
    this.position = 'Above';
    this.isTalking = false;
    this.speechSynth = window.speechSynthesis || undefined;

    // Add object to the scene
    plane.scene.add.existing(this);

    // Setup
    this.setOrigin(0.5, 0.5);
  }

  preUpdate() {
    this.setTextPosition();
  }

  private setTextPosition() {
    // Moves text position above/below depending on where the PlaneDataTag is
    if (
      this.plane.dataTag.position === PlaneDataTagPosition.BottomLeft ||
      this.plane.dataTag.position === PlaneDataTagPosition.BottomRight
    ) {
      this.position = 'Above';
    } else {
      this.position = 'Below';
    }

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

  public talk(phrase: string) {
    if (!this.isTalking) {
      this.isTalking = true;
      this.text = phrase;
      const utterThis = new SpeechSynthesisUtterance(this.text);
      this.speechSynth?.speak(utterThis);

      setTimeout(() => {
        this.text = '';
        this.isTalking = false;
      }, phrase.length * 120);
    }
  }
}

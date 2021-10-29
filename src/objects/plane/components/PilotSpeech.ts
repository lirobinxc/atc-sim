import Phaser from 'phaser';
import { Plane } from '../Plane';
import { Quadrant } from './PlaneDataTag';

export class PilotSpeech extends Phaser.GameObjects.Text {
  private plane: Plane;
  public position: 'Above' | 'Below';
  public isTalking: boolean;
  public speechSynth: undefined | SpeechSynthesis;
  private pilotVoice: undefined | SpeechSynthesisVoice;

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
    this.setPilotVoice();
  }

  private setTextPosition() {
    // Moves text position above/below depending on where the PlaneDataTag is
    if (
      this.plane.dataTag.quadrant === Quadrant.BottomLeft ||
      this.plane.dataTag.quadrant === Quadrant.BottomRight
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
    if (!this.speechSynth) return;

    if (!this.isTalking) {
      this.isTalking = true;
      this.text = phrase;
      const utterThis = new SpeechSynthesisUtterance(this.text);

      if (this.pilotVoice) {
        utterThis.voice = this.pilotVoice;
        utterThis.rate = 1.2;
      }

      this.speechSynth?.speak(utterThis);

      setTimeout(() => {
        this.text = '';
        this.isTalking = false;
      }, phrase.length * 120);
    }
  }

  private setPilotVoice() {
    if (!this.speechSynth) return;
    if (!this.pilotVoice) {
      const voices = this.speechSynth
        .getVoices()
        .filter(
          (voice) =>
            voice.lang[0] === 'e' &&
            voice.lang[1] === 'n' &&
            voice.name !== 'Google US English'
        );
      console.log(voices);

      this.pilotVoice = voices[Phaser.Math.Between(0, voices.length - 1)];
    }
  }
}

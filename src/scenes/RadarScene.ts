import Phaser from 'phaser';
import { planeConfig } from '../config/PlaneConfig';
import {
  IRadarSceneConfig,
  radarSceneConfig,
} from '../config/RadarSceneConfig';
import { initPlaneSpeechRecognition } from '../objects/plane/functions/initPlaneSpeechRecognition';
import { Plane } from '../objects/plane/Plane';
// Types
import { SceneKeys } from '../types/SceneKeys';

export class RadarScene extends Phaser.Scene {
  public config!: IRadarSceneConfig;
  public speech: any;
  public speechIsActive!: boolean;
  private existingPlaneNames!: { [key: string]: true };

  constructor() {
    super(SceneKeys.RadarScene);
    this.speech = undefined;
  }

  init() {
    this.config = radarSceneConfig;
    this.speechIsActive = false;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const NUM_OF_PLANES = 1;
    const planes: Plane[] = this.generatePlanes(NUM_OF_PLANES);

    /* -------------------- Init Speech Recognition -------------------- */
    initPlaneSpeechRecognition(this, planes);

    this.initPressToTalk();

    // DEBUG: screen middle circle
    this.add.circle(width * 0.5, height * 0.5, 2, 0xff0000);
  }

  generatePlanes(num: number): Plane[] {
    const planes: Plane[] = [];
    this.existingPlaneNames = {};

    for (let i = 0; i < num; i++) {
      // planeConfig.plane.INITIAL_SPEED = Phaser.Math.Between(5, 20);
      const newPlane = new Plane({
        config: planeConfig,
        scene: this,
        x: this.scale.width * 0.5,
        y: this.scale.height * 0.5,
      });

      if (this.existingPlaneNames[newPlane.callsign.full]) {
        newPlane.destroy(true);
        continue;
      }

      this.existingPlaneNames[newPlane.callsign.full] = true;
      planes.push(newPlane);
    }

    return planes;
  }

  private initPressToTalk = () => {
    const keyCodes = Phaser.Input.Keyboard.KeyCodes;
    const spaceKey = this.input.keyboard.addKey(keyCodes.SPACE);
    spaceKey.on('down', (e: Phaser.Types.Input.EventData) => {
      if (this.speech && !this.speechIsActive) {
        this.speech.start();
      }
    });
    spaceKey.on('up', (e: Phaser.Types.Input.EventData) => {
      this.speech.stop();
    });
  };
}

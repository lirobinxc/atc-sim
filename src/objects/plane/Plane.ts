import Phaser from 'phaser';
import type { IPlaneConfig } from '../../config/PlaneConfig';
import { PlaneSymbol } from './components/PlaneSymbol';
import { generateCallsign, IPlaneCallsign } from '../../utils/generateCallsign';
import { initPlaneSpeechRecognition } from './functions/initPlaneSpeechRecognition';
import { PilotSpeech } from './components/PilotSpeech';
import { PlaneDataTag } from './components/PlaneDataTag';
import { PlaneSpeechRecogntion } from './components/PlaneSpeechRecognition';

interface IPlaneConstructor {
  config: IPlaneConfig;
  scene: Phaser.Scene;
  x: number;
  y: number;
}

interface IPlayerSpeech {
  init: undefined | any; // the SpeechRecognition object
  text: string[];
  isActive: boolean;
  result?: {
    turnTo: 'Left' | 'Right';
    newHeading: number;
  };
}

export class Plane extends Phaser.GameObjects.Container {
  config: IPlaneConfig;
  scene: Phaser.Scene;
  callsign: IPlaneCallsign;
  status: { isSelected: boolean; isExecutingCommand: boolean };
  move: {
    currentHeading: number;
    newHeading: number;
    turnTo: 'Left' | 'Right';
    speed: number;
    altitude: number;
  };
  symbol: PlaneSymbol;
  dataTag: PlaneDataTag;
  pilotSpeech: PilotSpeech;
  playerSpeech: IPlayerSpeech;

  constructor({ config, scene, x, y }: IPlaneConstructor) {
    super(scene, x, y);
    /* --------------------------- Init Props -------------------------- */
    this.config = config;
    this.scene = scene;
    this.callsign = generateCallsign();
    this.status = { isSelected: false, isExecutingCommand: false };
    const initHeading = Phaser.Math.Between(1, 360);
    this.move = {
      currentHeading: initHeading,
      newHeading: initHeading,
      speed: config.plane.INITIAL_SPEED,
      turnTo: 'Left',
      altitude: 180,
    };
    this.symbol = new PlaneSymbol({ plane: this, scene, x, y });
    this.dataTag = new PlaneDataTag(this);

    this.pilotSpeech = new PilotSpeech(this);
    this.playerSpeech = {
      init: undefined,
      isActive: false,
      text: [''],
    };

    /* -------------------------- Setup Plane -------------------------- */
    scene.add.existing(this);

    /* -------------------- Setup Speech Recognition ------------------- */
    initPlaneSpeechRecognition(this);
  }

  preUpdate() {
    this.initPressToTalk();
  }

  private initPressToTalk() {
    const keyCodes = Phaser.Input.Keyboard.KeyCodes;
    const spaceKey = this.scene.input.keyboard.addKey(keyCodes.SPACE);
    if (spaceKey.isDown) {
      if (!this.playerSpeech.isActive) this.playerSpeech.init.start();
    }
    if (spaceKey.isUp) {
      if (this.playerSpeech.isActive) this.playerSpeech.init.stop();
    }
  }

  /** Update Plane movement based on speech result. */
  // private processPlayerSpeechResult() {
  //   const result = this.playerSpeech.result;
  //   const current = this.move;

  //   if (current.turnTo !== result.turnTo) {
  //     current.turnTo = result.turnTo;
  //   }
  //   if (current.newHeading !== result.newHeading) {
  //     current.newHeading = result.newHeading;
  //   }
  // }
}

import Phaser from 'phaser';
import type { IPlaneConfig } from '../../config/PlaneConfig';
import { PlaneSymbol } from './components/PlaneSymbol';
import { generateCallsign, IPlaneCallsign } from '../../utils/generateCallsign';
import { initPlaneSpeechRecogntion } from './functions/initPlaneSpeechRecognition';
import { PlaneSpeechBubble } from './components/PlaneSpeechBubble';

export interface IPlaneConstructor {
  config: IPlaneConfig;
  scene: Phaser.Scene;
  x: number;
  y: number;
}

export interface IPlayerSpeech {
  init: any; // the SpeechRecognition object
  text: string[];
  isActive: boolean;
}

export interface IPilotSpeech {
  init: undefined | PlaneSpeechBubble;
  text: string;
  isTalking: boolean;
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
  };
  symbol: PlaneSymbol;
  playerSpeech: IPlayerSpeech;
  pilotSpeech: IPilotSpeech;

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
    };
    this.symbol = new PlaneSymbol({ plane: this, scene, x, y });
    this.playerSpeech = { init: undefined, isActive: false, text: ['testing'] };
    this.pilotSpeech = {
      init: undefined,
      text: 'testing',
      isTalking: false,
    };

    /* -------------------------- Setup Plane -------------------------- */
    scene.add.existing(this);

    /* -------------------- Setup Speech Recognition ------------------- */
    initPlaneSpeechRecogntion(this);

    /* ----------------------- Setup Pilot Speech ---------------------- */
    this.pilotSpeech.init = new PlaneSpeechBubble(this);
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
}

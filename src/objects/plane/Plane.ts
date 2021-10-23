import Phaser from 'phaser';
import type { IPlaneConfig } from '../../config/PlaneConfig';
import { PlaneSymbol } from './components/PlaneSymbol';
import {
  CallsignType,
  generateCallsign,
  IPlaneCallsign,
} from '../../utils/generateCallsign';
import { PilotSpeech } from './components/PilotSpeech';
import { PlaneDataTag } from './components/PlaneDataTag';
import { RadarScene } from '../../scenes/RadarScene';
import { PlaneDataTagLine } from './components/PlaneDataTagLine';

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
  // Components
  symbol: PlaneSymbol;
  dataTag: PlaneDataTag;
  dataTagLine: PlaneDataTagLine;
  pilotSpeech: PilotSpeech;

  constructor({ config, scene, x, y }: IPlaneConstructor) {
    super(scene, x, y);
    /* --------------------------- Init Props -------------------------- */
    this.config = config;
    this.scene = scene;
    this.callsign = generateCallsign(config.plane.CALLSIGN_TYPE);
    this.status = { isSelected: false, isExecutingCommand: false };
    const initHeading = Phaser.Math.Between(1, 360);
    this.move = {
      currentHeading: initHeading,
      newHeading: initHeading,
      speed: config.plane.INITIAL_SPEED,
      turnTo: 'Left',
      altitude: 180,
    };
    this.symbol = new PlaneSymbol({ plane: this });
    this.dataTag = new PlaneDataTag(this);
    this.dataTagLine = new PlaneDataTagLine(this);

    this.pilotSpeech = new PilotSpeech(this);

    /* -------------------------- Setup Plane -------------------------- */
    this.add([this.symbol, this.dataTag, this.dataTagLine, this.pilotSpeech]);
    scene.add.existing(this);
  }

  preUpdate() {}
}

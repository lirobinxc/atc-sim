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
import { PlaneDataTagLine } from './components/PlaneDataTagLine';
import { PlaneSymbolHeadingLine } from './components/PlaneSymbolHeadingLine';

interface IPlaneConstructor {
  config: IPlaneConfig;
  scene: Phaser.Scene;
  x: number;
  y: number;
}

export class Plane extends Phaser.GameObjects.Group {
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
  symbolHeadingLine: PlaneSymbolHeadingLine;
  dataTag: PlaneDataTag;
  dataTagLine: PlaneDataTagLine;
  pilotSpeech: PilotSpeech;

  constructor({ config, scene, x, y }: IPlaneConstructor) {
    super(scene);
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
    this.symbol = new PlaneSymbol({ plane: this, x, y });
    this.symbolHeadingLine = new PlaneSymbolHeadingLine(this);
    this.dataTag = new PlaneDataTag(this);
    this.dataTagLine = new PlaneDataTagLine(this);
    this.pilotSpeech = new PilotSpeech(this);

    /* -------------------------- Setup Plane -------------------------- */
    const groupChildren = [
      this.symbol,
      // this.symbolHeadingLine,
      this.dataTag,
      this.dataTagLine,
      this.pilotSpeech,
    ];
    groupChildren.forEach((child) => this.add(child));
  }

  /** Regenerates the plane's callsign. */
  regenerateCallsign() {
    this.callsign = generateCallsign(this.config.plane.CALLSIGN_TYPE);
  }
}

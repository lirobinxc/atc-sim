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
import { PlaneHistoryTrail } from './components/PlaneHistoryTrail';

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
  historyTrail: PlaneHistoryTrail;
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
      speed: Phaser.Math.Between(
        config.plane.INITIAL_SPEED.MIN,
        config.plane.INITIAL_SPEED.MAX
      ),
      turnTo: 'Left',
      altitude: 180,
    };
    this.symbol = new PlaneSymbol({ plane: this, x, y });
    this.historyTrail = new PlaneHistoryTrail(this);
    this.dataTag = new PlaneDataTag(this);
    this.dataTagLine = new PlaneDataTagLine(this);
    this.pilotSpeech = new PilotSpeech(this);

    /* -------------------------- Setup Plane -------------------------- */
    const groupChildren = [
      this.symbol,
      this.historyTrail,
      this.dataTag,
      this.dataTagLine,
      this.pilotSpeech,
    ];
    this.addMultiple(groupChildren);
  }

  /** Regenerates the plane's callsign. */
  regenerateCallsign() {
    this.callsign = generateCallsign(this.config.plane.CALLSIGN_TYPE);
  }

  public squawkIdent = () => {
    const blinkSpeed = 200; // milliseconds
    const blinkTime = 3000; // milliseconds
    const interval = setInterval(() => {
      this.symbol.setVisible(!this.symbol.visible);
    }, blinkSpeed);
    setTimeout(() => {
      clearInterval(interval);
      this.symbol.setVisible(true);
    }, blinkTime);
  };
}

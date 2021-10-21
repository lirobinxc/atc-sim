import Phaser from 'phaser';
import { convertCallsignToSpoken } from '../../utils/convertCallsignToSpoken';
import { convertHeadingToRadians } from '../../utils/convertHeadingToRadians';
import { convertNumToStr } from '../../utils/convertNumToStr';
import { convertRadiansToHeading } from '../../utils/convertRadiansToHeading';
import { generateCallsign, ICallsign } from '../../utils/generateCallsign';

import { planeConfig, IPlaneConfig } from '../../config/PlaneConfig';
import { PlaneSymbol } from './components/PlaneSymbol';
import { initPlaneSpeechRecogntion } from './functions/initPlaneSpeechRecognition';
import { PlaneDataBox } from './components/PlaneDataBox';

export enum PlaneDataBoxPosition {
  TopLeft = 'topLeft',
  TopRight = 'topRight',
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
}

interface IPlaneDataBoxOffset {
  [PlaneDataBoxPosition.TopLeft]: { x: number; y: number };
  [PlaneDataBoxPosition.TopRight]: { x: number; y: number };
  [PlaneDataBoxPosition.BottomLeft]: { x: number; y: number };
  [PlaneDataBoxPosition.BottomRight]: { x: number; y: number };
}

interface IPlane {
  config: IPlaneConfig;
  scene: Phaser.Scene;
  x: number;
  y: number;
}

export interface IPlaneSpeech {
  init: any; // the SpeechRecognition object
  text: string[];
  isActive: boolean;
}

export default class Plane {
  public config: IPlaneConfig;
  // Plane Status
  public planeIsSelected: boolean;
  public planeIsExecutingCommand: boolean;
  // Plane Movement
  public planeSpeed: number;
  public planeCurrentHeading: number;
  public planeNewHeading: number;
  public planeTurnTo: 'Left' | 'Right';
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private debugger;
  private debugText: string[];
  private speech: IPlaneSpeech;
  private speechSynth: SpeechSynthesis;
  // Plane Attributes
  private planeCallsign: ICallsign;
  private planeCallsignSpoken: string;
  private planeSpeechBubble: Phaser.GameObjects.Text;
  private planeDataBox: Phaser.GameObjects.Text;
  private planeDataBoxLine: Phaser.GameObjects.Line;
  private planeDataBoxPosition: PlaneDataBoxPosition;
  private planeDataBoxOffset: IPlaneDataBoxOffset;
  private planeDataText: string[];
  private planeTalk: string;
  private isPlaneTalking: boolean;
  private PilotPhrases: { SayAgain: string; Roger: string };

  constructor({ config, scene, x, y }: IPlane) {
    this.config = config;
    this.planeCallsign = generateCallsign();
    this.planeCallsignSpoken = convertCallsignToSpoken(this.planeCallsign);
    this.speech = {
      init: null,
      text: [''],
      isActive: false,
    };
    this.speech.isActive = false;
    this.planeTalk = 'testing';
    this.isPlaneTalking = false;
    // Plane Data Text
    this.planeDataBoxPosition = PlaneDataBoxPosition.BottomRight;
    this.planeDataText = [''];
    this.planeDataText[0] = this.planeCallsign.full;

    this.PilotPhrases = { SayAgain: 'Say again', Roger: 'Roger' };

    /* -------------------- Create the Plane Symbol -------------------- */
    this.plane = new PlaneSymbol({ config: this.config, scene, x, y });

    /* -------------------- Init speech recognition -------------------- */
    initPlaneSpeechRecogntion({ plane: this.speech, speech: this.plane });

    /* ----------------- Create Plane talk text bubble ----------------- */
    this.planeSpeechBubble = scene.add
      .text(this.plane.x, this.plane.y, this.planeTalk)
      .setOrigin(0.5, 0.5);

    /* --------------------- Create Plane Data Box --------------------- */
    this.planeDataBoxOffset = {
      [PlaneDataBoxPosition.TopLeft]: {
        x: -this.config.dataBox.TEXT_OFFSET_X,
        y: -this.config.dataBox.TEXT_OFFSET_Y,
      },
      [PlaneDataBoxPosition.TopRight]: {
        x: this.config.dataBox.TEXT_OFFSET_X,
        y: -this.config.dataBox.TEXT_OFFSET_Y,
      },
      [PlaneDataBoxPosition.BottomLeft]: {
        x: -this.config.dataBox.TEXT_OFFSET_X,
        y: this.config.dataBox.TEXT_OFFSET_Y,
      },
      [PlaneDataBoxPosition.BottomRight]: {
        x: this.config.dataBox.TEXT_OFFSET_X,
        y: this.config.dataBox.TEXT_OFFSET_Y,
      },
    };
    this.planeDataBox = new PlaneDataBox({
      plane: this.plane,
      scene,
      x: this.plane.x + this.planeDataBoxOffset[this.planeDataBoxPosition].x,
      y: this.plane.y + this.planeDataBoxOffset[this.planeDataBoxPosition].y,
      text: this.planeDataText,
      style: { color: 'white' },
    });

    // planeDataBox Line
    this.planeDataBoxLine = scene.add
      .line(
        0,
        0,
        this.getPlaneDataBoxLinePlacement(PlaneDataBoxPosition.BottomRight)
          .planeCorner.x,
        this.getPlaneDataBoxLinePlacement(PlaneDataBoxPosition.BottomRight)
          .planeCorner.y,
        this.getPlaneDataBoxLinePlacement(PlaneDataBoxPosition.BottomRight)
          .dataCorner.x,
        this.getPlaneDataBoxLinePlacement(PlaneDataBoxPosition.BottomRight)
          .dataCorner.y,
        this.config.dataBox.LINE_COLOR
      )
      .setOrigin(0, 0)
      .setLineWidth(0.7);

    this.planeDataBox.setInteractive();
    this.planeDataBox.on('pointerdown', () => {
      this.cyclePlaneDataBoxPosition();
    });

    /* ------------------------ Init Cursor Keys ----------------------- */
    // CursorKeys is a convenient way to access the arrow keys and spacebar
    this.cursors = scene.input.keyboard.createCursorKeys();

    /* --------------------- Init Speech Synthesis --------------------- */
    this.speechSynth = window.speechSynthesis;

    /* ------------------------- Init Debugger ------------------------- */
    this.debugText = ['----PLANE DEBUGGER----'];
    this.debugger = scene.add.text(10, 10, this.debugText);
  }

  preUpdate() {
    const body = this.plane.body as Phaser.Physics.Arcade.Body;
    /* ------------------- Align elements with hitbox ------------------ */
    // Aligns Plane speech bubble
    this.planeSpeechBubble.x = this.plane.x;
    this.planeSpeechBubble.y = this.plane.y;
    // Updates speech bubble test
    this.planeSpeechBubble.setText(this.planeTalk);
    // Aligns Plane data box
    this.planeDataBox.setX(
      this.plane.x + this.planeDataBoxOffset[this.planeDataBoxPosition].x
    );
    this.planeDataBox.setY(
      this.plane.y + this.planeDataBoxOffset[this.planeDataBoxPosition].y
    );
    // Aligns line connecting Plane to Data Box
    this.planeDataBoxLine.setTo(
      this.getPlaneDataBoxLinePlacement(this.planeDataBoxPosition).planeCorner
        .x,
      this.getPlaneDataBoxLinePlacement(this.planeDataBoxPosition).planeCorner
        .y,
      this.getPlaneDataBoxLinePlacement(this.planeDataBoxPosition).dataCorner.x,
      this.getPlaneDataBoxLinePlacement(this.planeDataBoxPosition).dataCorner.y
    );

    /* ---------------------------- DEBUGGER --------------------------- */
    const compassHeading = convertRadiansToHeading(body.angle);
    this.debugText[1] = `Accel-X: ${body.acceleration.x.toFixed(2)}`;
    this.debugText[2] = `Accel-Y: ${body.acceleration.y.toFixed(2)}`;
    this.debugText[3] = `Velocity-X: ${body.velocity.x.toFixed(2)}`;
    this.debugText[4] = `Velocity-Y: ${body.velocity.y.toFixed(2)}`;
    this.debugText[5] = `Compass: ${compassHeading.toFixed(0)}`;
    this.debugText[6] = `Angle (rad): ${body.angle.toFixed(2)}`;
    this.debugText[7] = `Heading = ${this.plane.currentHeading
      .toString()
      .padStart(3, '0')}`;
    this.debugText[9] = `LAST COMMAND: Turn ${
      this.plane.turnTo
    } heading ${this.plane.newHeading.toString().padStart(3, '0')}`;
    this.debugText[10] = `SPEECH: ${this.speech.text.join(' ')}`;

    this.debugger.setText(this.debugText);

    /* ---------------------- SET MOVEMENT INPUTS ---------------------- */
    const key = this.cursors;

    // Press to talk
    if (key.space.isDown) {
      if (!this.speech.isActive) this.speech.init.start();
    }
    if (key.space.isUp) {
      if (this.speech.isActive) this.speech.init.stop();
    }
  }

  /* -------------------------- OTHER METHODS -------------------------- */
  setPlaneTalk(phrase: string) {
    if (!this.isPlaneTalking) {
      this.isPlaneTalking = true;
      this.planeTalk = phrase;
      const utterThis = new SpeechSynthesisUtterance(this.planeTalk);
      this.speechSynth.speak(utterThis);
      setTimeout(() => {
        this.planeTalk = '';
        this.isPlaneTalking = false;
      }, phrase.length * 200);
    }
  }

  cyclePlaneDataBoxPosition() {
    switch (this.planeDataBoxPosition) {
      case PlaneDataBoxPosition.TopLeft:
        return (this.planeDataBoxPosition = PlaneDataBoxPosition.TopRight);
      case PlaneDataBoxPosition.TopRight:
        return (this.planeDataBoxPosition = PlaneDataBoxPosition.BottomRight);
      case PlaneDataBoxPosition.BottomRight:
        return (this.planeDataBoxPosition = PlaneDataBoxPosition.BottomLeft);
      case PlaneDataBoxPosition.BottomLeft:
        return (this.planeDataBoxPosition = PlaneDataBoxPosition.TopLeft);
      default:
        return (this.planeDataBoxPosition = PlaneDataBoxPosition.BottomRight);
    }
  }

  getPlaneDataBoxLinePlacement(position: PlaneDataBoxPosition) {
    const getCorners = {
      [PlaneDataBoxPosition.TopLeft]: {
        getPlaneCorner: this.plane.getTopLeft(),
        getDataCorner: this.planeDataBox.getBottomRight(),
      },
      [PlaneDataBoxPosition.TopRight]: {
        getPlaneCorner: this.plane.getTopRight(),
        getDataCorner: this.planeDataBox.getBottomLeft(),
      },
      [PlaneDataBoxPosition.BottomLeft]: {
        getPlaneCorner: this.plane.getBottomLeft(),
        getDataCorner: this.planeDataBox.getTopRight(),
      },
      [PlaneDataBoxPosition.BottomRight]: {
        getPlaneCorner: this.plane.getBottomRight(),
        getDataCorner: this.planeDataBox.getTopLeft(),
      },
    };
    const linePlacement = {
      planeCorner: getCorners[position].getPlaneCorner,
      dataCorner: getCorners[position].getDataCorner,
    };
    return linePlacement;
  }
}

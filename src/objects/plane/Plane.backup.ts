import Phaser from 'phaser';
import { convertCallsignToSpoken } from '../../utils/convertCallsignToSpoken';
import { convertHeadingToRadians } from '../../utils/convertHeadingToRadians';
import { convertNumToStr } from '../../utils/convertNumToStr';
import { convertRadiansToHeading } from '../../utils/convertRadiansToHeading';
import { generateCallsign, ICallsign } from '../../utils/generateCallsign';

import { planeConfig, IPlaneConfig } from '../../config/PlaneConfig';

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

export default class Plane extends Phaser.GameObjects.Container {
  private config: IPlaneConfig;
  private plane: Phaser.GameObjects.Rectangle;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private debugger;
  private debugText: string[];
  private speech: any;
  private speechText: string[];
  private isSpeechActive: boolean;
  private speechSynth: SpeechSynthesis;
  // Plane Attributes
  private planeCallsign: ICallsign;
  private planeCallsignSpoken: string;
  private isPlaneExecutingCommand: boolean;
  private isPlaneSelected: boolean;
  private planeNewHeading: number;
  private planeTurn: 'Left' | 'Right';
  private planeHeading: number;
  private planeSpeed: number;
  private planeSpeechBubble: Phaser.GameObjects.Text;
  private planeDataBox: Phaser.GameObjects.Text;
  private planeDataBoxLine: Phaser.GameObjects.Line;
  private planeDataBoxPosition: PlaneDataBoxPosition;
  private planeDataBoxOffset: IPlaneDataBoxOffset;
  private planeDataText: string[];
  private planeTalk: string;
  private isPlaneTalking: boolean;
  private PilotPhrases: { SayAgain: string; Roger: string };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this); // adds it to the scene

    /* --------------------- Init Plane Attributes --------------------- */
    this.config = planeConfig;
    this.planeCallsign = generateCallsign();
    this.planeCallsignSpoken = convertCallsignToSpoken(this.planeCallsign);
    this.isPlaneExecutingCommand = false;
    this.isPlaneSelected = false;
    this.planeHeading = Phaser.Math.Between(1, 360);
    this.planeNewHeading = this.planeHeading;
    this.planeTurn = 'Left';
    this.planeSpeed = this.config.plane.INITIAL_SPEED;
    this.speechText = [''];
    this.isSpeechActive = false;
    this.planeTalk = 'testing';
    this.isPlaneTalking = false;
    // Plane Data Text
    this.planeDataBoxPosition = PlaneDataBoxPosition.BottomRight;
    this.planeDataText = [''];
    this.planeDataText[0] = this.planeCallsign.full;

    this.PilotPhrases = { SayAgain: 'Say again', Roger: 'Roger' };

    /* --------------------- Scale the Plane object -------------------- */
    this.setScale(0.125);
    /* --------------------- Create the Plane shape -------------------- */
    const planeShapeEdgeLength = 12;
    this.plane = scene.add.rectangle(
      x,
      y,
      planeShapeEdgeLength,
      planeShapeEdgeLength,
      this.config.plane.COLOR
    );

    // Enable physics on the Plane object
    scene.physics.add.existing(this.plane);

    // Config the physics body (aka hitbox)
    const body = this.plane.body as Phaser.Physics.Arcade.Body;

    body.setCollideWorldBounds(true);
    console.log(this);
    body.setSize(this.plane.displayWidth + 10, this.plane.displayHeight + 10);

    /* ----------------------- Init onPlaneClick ----------------------- */
    this.plane.setInteractive();
    this.plane.on('pointerdown', () => {});

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
    this.planeDataBox = scene.add
      .text(
        this.plane.x + this.planeDataBoxOffset[this.planeDataBoxPosition].x,
        this.plane.y + this.planeDataBoxOffset[this.planeDataBoxPosition].y,
        this.planeDataText,
        { color: 'white' }
      )
      .setOrigin(0.5, 0.5);

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

    /* --------------------- Init Speech Recognition -------------------- */

    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const startSpeechRecognition = () => {
        this.speech = new SpeechRecognition();

        this.speech.onresult = (event: any) => {
          const transcript: string = event.results[0][0].transcript;
          const words = transcript.toLowerCase().split(' ');
          if (words.length > 0) this.speechText = words;
          console.log(this.speechText);

          if (this.speechText.length > 0) {
            // Get HEADING
            const headingPrefixIdx = this.speechText.indexOf('heading');
            const headingStr = this.speechText[headingPrefixIdx + 1];
            const headingNum = Number(headingStr);

            // Get TURN
            const turnPrefixIdx = this.speechText.indexOf('turn');
            const turnStr = this.speechText[turnPrefixIdx + 1];
            if (turnStr === 'left') this.planeTurn = 'Left';
            if (turnStr === 'right') this.planeTurn = 'Right';

            if (isNaN(headingNum)) {
              this.setPlaneTalk(this.PilotPhrases.SayAgain);
            } else if (headingNum < 1 || headingNum > 360) {
              this.setPlaneTalk(this.PilotPhrases.SayAgain);
            } else {
              setTimeout(() => {
                const spokenHeading = convertNumToStr(headingStr);
                this.setPlaneTalk(
                  `${this.PilotPhrases.Roger}, heading ${spokenHeading}`
                );
                this.planeNewHeading = headingNum;
              }, 500);
            }
          }
        };

        this.speech.onstart = () => {
          console.log('LISTENING...');
          this.isSpeechActive = true;
        };

        this.speech.onend = () => {
          console.log('SPEECH STOPPED');
          this.isSpeechActive = false;
        };

        this.speech.onerror = () => {
          console.error('SPEECH ERROR');
        };
      };
      try {
        startSpeechRecognition();
      } catch (err) {
        console.error(err);
      }
    } else {
      alert(
        `Your browser doesn't support Speech Recognition. Use the latest Chrome.`
      );
    }

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

    /* ----------------------- Set Plane Heading ----------------------- */
    // This section calculates velocity when given a compass heading.
    if (this.planeHeading !== this.planeNewHeading) {
      this.isPlaneExecutingCommand = true;
      if (this.planeTurn === 'Left') {
        if (this.planeHeading === 1) this.planeHeading = 360;
        else this.planeHeading -= 1;
      }
      if (this.planeTurn === 'Right') {
        if (this.planeHeading === 360) this.planeHeading = 1;
        else this.planeHeading += 1;
      }
    } else {
      this.isPlaneExecutingCommand = false;
    }
    const planeRadian = convertHeadingToRadians(this.planeHeading);
    this.scene.physics.velocityFromRotation(
      planeRadian,
      this.planeSpeed,
      body.velocity
    );

    /* ---------------- Change Plane Symbol if selected ---------------- */
    if (this.isPlaneSelected) {
      this.plane.fillColor = this.config.plane.COLOR_SELECTED;
    } else {
      this.plane.fillColor = this.config.plane.COLOR;
    }
    const escKey: Phaser.Input.Keyboard.Key =
      this.scene.input.keyboard.addKey('ESC');
    if (escKey.isDown) {
      this.isPlaneSelected = false;
    }

    /* ---------------------------- DEBUGGER --------------------------- */
    const compassHeading = convertRadiansToHeading(body.angle);
    this.debugText[1] = `Accel-X: ${body.acceleration.x.toFixed(2)}`;
    this.debugText[2] = `Accel-Y: ${body.acceleration.y.toFixed(2)}`;
    this.debugText[3] = `Velocity-X: ${body.velocity.x.toFixed(2)}`;
    this.debugText[4] = `Velocity-Y: ${body.velocity.y.toFixed(2)}`;
    this.debugText[5] = `Compass: ${compassHeading.toFixed(0)}`;
    this.debugText[6] = `Angle (rad): ${body.angle.toFixed(2)}`;
    this.debugText[7] = `Heading = ${this.planeHeading
      .toString()
      .padStart(3, '0')}`;
    this.debugText[9] = `LAST COMMAND: Turn ${
      this.planeTurn
    } heading ${this.planeNewHeading.toString().padStart(3, '0')}`;
    this.debugText[10] = `SPEECH: ${this.speechText.join(' ')}`;

    this.debugger.setText(this.debugText);

    /* ---------------------- SET MOVEMENT INPUTS ---------------------- */
    const key = this.cursors;

    // Press to talk
    if (key.space.isDown) {
      if (!this.isSpeechActive) this.speech.start();
    }
    if (key.space.isUp) {
      if (this.isSpeechActive) this.speech.stop();
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

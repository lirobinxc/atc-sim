import Phaser from 'phaser';
import convertHeadingToRadians from '../utils/convertHeadingToRadians';
import convertNumToStr from '../utils/convertNumToStr';

import convertRadiansToHeading from '../utils/convertRadiansToHeading';

export default class Plane extends Phaser.GameObjects.Rectangle {
  private plane: Phaser.GameObjects.Rectangle;
  private velocity: Phaser.Types.Math.Vector2Like;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private debugger;
  private debugText: string[];
  private speech: any;
  private speechText: string[];
  private isSpeechActive: boolean;
  private speechSynth: SpeechSynthesis;
  // Plane Attributes
  private planeHeading: number;
  private planeSpeed: number;
  private planeSpeechBubble: Phaser.GameObjects.Text;
  private planeTalk: string;
  private isPlaneTalking: boolean;
  private PilotPhrases: { SayAgain: string; Roger: string };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    /* --------------------- Init Plane Attributes --------------------- */
    const INITIAL_SPEED = 25;
    this.planeHeading = 360;
    this.planeSpeed = INITIAL_SPEED;
    this.velocity = { x: INITIAL_SPEED, y: INITIAL_SPEED };
    this.speechText = [''];
    this.isSpeechActive = false;
    this.planeTalk = '';
    this.isPlaneTalking = false;

    this.PilotPhrases = { SayAgain: 'Say again', Roger: 'Roger' };

    /* --------------------- Create the Plane shape -------------------- */
    const planeShapeEdgeLength = 12;
    this.plane = scene.add
      .rectangle(
        this.x,
        this.y,
        planeShapeEdgeLength,
        planeShapeEdgeLength,
        0xa0f078
      )
      .setOrigin(0.5, 0.5);

    // Enable physics on the Plane object
    scene.physics.add.existing(this);

    // Config the physics body (aka hitbox)
    const body = this.body as Phaser.Physics.Arcade.Body;

    body.setSize(this.plane.width, this.plane.height);
    body.setCollideWorldBounds(true);

    /* ----------------- Create Plane talk text bubble ----------------- */
    this.planeSpeechBubble = scene.add
      .text(this.plane.x - 25, this.plane.y - 25, this.planeTalk)
      .setOrigin(0.5, 0.5);

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
            const headingPrefixIdx = this.speechText.indexOf('heading');
            const headingStr = this.speechText[headingPrefixIdx + 1];
            const headingNum = Number(headingStr);

            if (isNaN(headingNum)) {
              if (!this.isPlaneTalking)
                this.setPlaneTalk(this.PilotPhrases.SayAgain);
            } else {
              setTimeout(() => {
                const spokenHeading = convertNumToStr(headingStr);
                if (!this.isPlaneTalking) {
                  this.setPlaneTalk(
                    `${this.PilotPhrases.Roger}, heading ${spokenHeading}`
                  );
                }
                this.planeHeading = headingNum;
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
      startSpeechRecognition();
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
    const body = this.body as Phaser.Physics.Arcade.Body;
    // Aligns the Plane with its hitbox
    this.plane.x = body.x + body.halfWidth;
    this.plane.y = body.y + body.halfHeight;
    // Aligns Plane speech bubble
    this.planeSpeechBubble.x = body.x + body.halfWidth + 25;
    this.planeSpeechBubble.y = body.y + body.halfHeight + 25;
    // Updates speech bubble test
    this.planeSpeechBubble.setText(this.planeTalk);

    /* ----------------------- Set Plane Heading ----------------------- */
    // This section calculates velocity when given a compass heading.
    const planeRadian = convertHeadingToRadians(this.planeHeading);
    this.scene.physics.velocityFromRotation(
      planeRadian,
      this.planeSpeed,
      body.velocity
    );

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
    this.debugText[8] = `COMMAND: Speech = ${this.speechText.join(' ')}`;

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

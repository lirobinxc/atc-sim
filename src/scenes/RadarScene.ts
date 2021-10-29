import Phaser from 'phaser';
import { planeConfig } from '../config/PlaneConfig';
import {
  IRadarSceneConfig,
  radarSceneConfig,
} from '../config/RadarSceneConfig';
import { initPlaneSpeechRecognition } from '../objects/plane/functions/initPlaneSpeechRecognition';
import { Plane } from '../objects/plane/Plane';
import { EmitEvents } from '../types/EmitEvents';
// Types
import { SceneKeys } from '../types/SceneKeys';

export class RadarScene extends Phaser.Scene {
  public config!: IRadarSceneConfig;
  public gameInputs!: {
    ESC: Phaser.Input.Keyboard.Key;
    ONE: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  public speech: any;
  public speechIsActive!: boolean;
  private planes!: Plane[];
  private existingPlaneNames!: { [key: string]: true };
  private existingPlanePositions!: Phaser.Math.Vector2[];
  public selectedPlane: Plane | undefined;

  constructor() {
    super(SceneKeys.RadarScene);
    this.speech = undefined;
  }

  init() {
    this.config = radarSceneConfig;
    this.gameInputs = {
      ESC: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.speechIsActive = false;
    this.planes = [];
    this.existingPlaneNames = {};
    this.existingPlanePositions = [];
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const NUM_OF_PLANES = 2;
    this.generatePlanes(NUM_OF_PLANES);

    /* -------------------- Init Speech Recognition -------------------- */
    initPlaneSpeechRecognition(this, this.planes);

    this.initPressToTalk();

    /* ----------------------------- Events ---------------------------- */
    this.input.on('pointerdown', this.handlePointerDown);

    this.planes.forEach((plane) => {
      plane.symbol.on(EmitEvents.Clicked, () => {
        if (plane.status.isSelected) {
          plane.dataTag.cycleTagPosition();
        }
        this.selectedPlane = plane;
        this.updateSelectedPlane();
      });
    });

    /* ----------------------------- DEBUG ----------------------------- */
    // screen middle red dot
    this.add.circle(width * 0.5, height * 0.5, 2, 0xff0000);
  }

  update() {
    this.handleKeyPresses();
  }

  private generatePlanes = (num: number) => {
    for (let i = 0; i < num; i++) {
      this.addNewPlane();
    }
  };

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

  private updateSelectedPlane = () => {
    this.planes.forEach((plane) => {
      if (this.selectedPlane?.callsign.full === plane.callsign.full) {
        plane.status.isSelected = true;
      } else plane.status.isSelected = false;
    });
  };

  private handleKeyPresses = () => {
    if (Phaser.Input.Keyboard.JustDown(this.gameInputs.ESC))
      this.clearSelectedPlanes();

    if (Phaser.Input.Keyboard.JustDown(this.gameInputs.ONE)) {
      this.addNewPlane();
    }

    if (Phaser.Input.Keyboard.JustDown(this.gameInputs.D)) {
      this.removePlane(this.planes[0]);
    }
  };

  private handlePointerDown = (
    pointer: Phaser.Input.Pointer,
    currentlyOver: Phaser.GameObjects.GameObject[]
  ) => {
    if (currentlyOver.length < 1) {
      return this.clearSelectedPlanes();
    }

    currentlyOver.forEach((gameObj) => {
      gameObj.emit(EmitEvents.Clicked);
    });
  };

  public clearSelectedPlanes = () => {
    this.selectedPlane = undefined;
    this.updateSelectedPlane();
  };

  public addNewPlane = () => {
    let planeGenSuccess = true;
    const maxNumOfAttempts = 10;
    let attemptCounter = 0;
    do {
      const newPlane = new Plane({
        config: planeConfig,
        scene: this,
        x: this.scale.width * Phaser.Math.FloatBetween(0.2, 0.8),
        y: this.scale.height * Phaser.Math.FloatBetween(0.2, 0.8),
      });

      // Regenerate the plane's callsign if it already exists
      const maxNumOfCallsignRegens = 10;
      let counterOfNameRegenAttempts = 0;

      while (this.existingPlaneNames[newPlane.callsign.full]) {
        if (counterOfNameRegenAttempts > maxNumOfCallsignRegens) {
          planeGenSuccess = false;
          break;
        }
        newPlane.regenerateCallsign();
        counterOfNameRegenAttempts++;
      }

      // Regnerate plane if it's too close to another
      const newPlanePosition = newPlane.symbol.getCenter();
      const isNewPlaneTooClose = this.existingPlanePositions.some(
        (existingPlanePosition) => {
          return (
            Phaser.Math.Distance.BetweenPoints(
              newPlanePosition,
              existingPlanePosition
            ) < 80
          );
        }
      );
      if (isNewPlaneTooClose) planeGenSuccess = false;

      // Push a successful generated plane to the Plane[]
      if (planeGenSuccess) {
        this.existingPlaneNames[newPlane.callsign.full] = true;
        this.existingPlanePositions.push(newPlane.symbol.getCenter());
        this.planes.push(newPlane);
        return;
      } else {
        newPlane.destroy(true);
        console.error('Adding plane failed. Trying again.');
        attemptCounter++;
      }
    } while (planeGenSuccess === false && attemptCounter < maxNumOfAttempts);
  };

  public removePlane(specificPlane: Plane | undefined = undefined) {
    if (!specificPlane) {
      if (this.planes.length > 0) {
        this.planes.pop()?.destroy(true);
      }
      return;
    }

    if (specificPlane instanceof Plane) {
      this.planes = this.planes.filter(
        (plane) => plane.callsign.full !== specificPlane.callsign.full
      );
      specificPlane.destroy(true);
      return;
    }
  }
}

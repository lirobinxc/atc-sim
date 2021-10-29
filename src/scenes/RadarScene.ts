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
  public gameInputs!: { escKey: Phaser.Input.Keyboard.Key };
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
    this.speechIsActive = false;
    this.gameInputs = {
      escKey: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    };
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const NUM_OF_PLANES = 5;
    this.planes = this.generatePlanes(NUM_OF_PLANES);

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
    this.handlePressEscKey();
  }

  private generatePlanes = (num: number): Plane[] => {
    const planes: Plane[] = [];
    this.existingPlaneNames = {};
    this.existingPlanePositions = [];
    let planeGenSuccess = true;

    for (let i = 0; i < num; i++) {
      planeConfig.plane.INITIAL_SPEED = Phaser.Math.Between(5, 20);
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
            ) < 100
          );
        }
      );
      if (isNewPlaneTooClose) planeGenSuccess = false;

      // Push a successful generated plane to the Plane[]
      if (planeGenSuccess) {
        this.existingPlaneNames[newPlane.callsign.full] = true;
        this.existingPlanePositions.push(newPlane.symbol.getCenter());
        planes.push(newPlane);
      } else {
        newPlane.destroy(true);
      }
    }

    return planes;
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

  private handlePressEscKey = () => {
    if (Phaser.Input.Keyboard.JustDown(this.gameInputs.escKey))
      this.clearSelectedPlanes();
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
}

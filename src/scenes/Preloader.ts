import Phaser from 'phaser';
// Types
import { SceneKeys } from '../types/SceneKeys';

export class Preloader extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preloader);
  }

  preload() {}

  create() {
    this.scene.start(SceneKeys.RadarScene);
  }
}

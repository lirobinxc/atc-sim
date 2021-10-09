import Phaser from 'phaser';
// Types
import SceneKeys from '../types/SceneKeys';
import DomKeys from '../types/DomKeys';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preloader);
  }

  preload() {
    this.load.html(
      DomKeys.DirectionInput,
      'phaser-atc/src/dom-elements/textInput.html'
    );
  }

  create() {
    this.scene.start(SceneKeys.Game);
  }
}

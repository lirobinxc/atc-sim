import Phaser from 'phaser';
import { PlaneSymbol } from './PlaneSymbol';

export interface IPlaneDataBox {
  plane: PlaneSymbol;
  scene: Phaser.Scene;
  x: number;
  y: number;
  text: string | string[];
  style?: Phaser.Types.GameObjects.Text.TextStyle;
}

export class PlaneDataBox extends Phaser.GameObjects.Text {
  constructor({ scene, x, y, text, style = {} }: IPlaneDataBox) {
    super(scene, x, y, text, style);
    scene.add.existing(this);

    this.setOrigin(0.5, 0.5);
  }
}

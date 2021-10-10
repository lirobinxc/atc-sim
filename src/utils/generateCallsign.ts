import { PlaneCarriers } from '../types/PlaneCarriers';
import { getRandomEnum } from './getRandomEnum';

export interface ICallsign {
  carrier: string;
  number: number;
  full: string;
}

export function generateCallsign(): ICallsign {
  const carrierCodes = Object.keys(PlaneCarriers);
  const carrier = carrierCodes[Phaser.Math.Between(0, carrierCodes.length - 1)];
  const number = Phaser.Math.Between(10, 999);
  return {
    carrier,
    number,
    full: `${carrier}${number}`,
  };
}

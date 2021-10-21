import { PlaneCarriers } from '../types/PlaneCarriers';
import { convertCallsignToSpoken } from './convertCallsignToSpoken';

export interface IPlaneCallsign {
  carrier: string;
  number: number;
  full: string;
  spoken: string;
}

export function generateCallsign(): IPlaneCallsign {
  const carrierCodes = Object.keys(PlaneCarriers);
  const carrier = carrierCodes[Phaser.Math.Between(0, carrierCodes.length - 1)];
  const number = Phaser.Math.Between(10, 999);
  const callsignData = {
    carrier,
    number,
    full: `${carrier}${number}`,
    spoken: '',
  };
  return {
    ...callsignData,
    spoken: convertCallsignToSpoken(callsignData),
  };
}

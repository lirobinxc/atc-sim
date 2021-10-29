import {
  PlaneCarriersAuthentic,
  PlaneCarriersCasual,
} from '../types/PlaneCarriers';
import { convertCallsignToSpoken } from './convertCallsignToSpoken';

export interface IPlaneCallsign {
  carrier: string;
  number: number;
  full: string;
  spoken: string;
}

export enum CallsignType {
  Casual = 'Casual',
  Authentic = 'Authentic',
}

export function generateCallsign(type: CallsignType): IPlaneCallsign {
  let carrierCodes;
  if (type === CallsignType.Authentic) {
    carrierCodes = Object.keys(PlaneCarriersAuthentic);
  } else carrierCodes = Object.keys(PlaneCarriersCasual);

  const carrier = carrierCodes[Phaser.Math.Between(0, carrierCodes.length - 1)];
  const number = Phaser.Math.Between(100, 799);
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

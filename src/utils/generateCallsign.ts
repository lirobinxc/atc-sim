import {
  PlaneCarriersAuthentic,
  PlaneCarriersCasual,
} from '../types/PlaneCarriers';
import { convertCallsignToSpoken } from './convertCallsignToSpoken';

export interface IPlaneCallsign {
  carrier: { code: string; spoken: string };
  number: number;
  full: string;
  spoken: string;
}

export enum CallsignType {
  Casual = 'Casual',
  Authentic = 'Authentic',
}

const bannedNumbers: { [key: number | string]: boolean } = {
  764: true,
};

export function generateCallsign(type: CallsignType): IPlaneCallsign {
  let carrierCodes;
  let carrierSpokenArr;
  if (type === CallsignType.Authentic) {
    carrierCodes = Object.keys(PlaneCarriersAuthentic);
    carrierSpokenArr = Object.values(PlaneCarriersAuthentic);
  } else {
    carrierCodes = Object.keys(PlaneCarriersCasual);
    carrierSpokenArr = Object.values(PlaneCarriersCasual);
  }

  const randomIdx = Phaser.Math.Between(0, carrierCodes.length - 1);

  const carrierCode = carrierCodes[randomIdx];
  const carrierSpoken = carrierSpokenArr[randomIdx];

  let number = Phaser.Math.Between(100, 799);

  while (bannedNumbers[number]) {
    number = Phaser.Math.Between(100, 799);
  }

  const callsignData = {
    carrier: {
      code: carrierCode,
      spoken: carrierSpoken,
    },
    number,
    full: `${carrierCode}${number}`,
    spoken: '',
  };
  return {
    ...callsignData,
    spoken: convertCallsignToSpoken(callsignData),
  };
}

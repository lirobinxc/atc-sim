import { CallsignType } from '../utils/generateCallsign';

export const planeConfig = {
  plane: {
    CALLSIGN_TYPE: CallsignType.Authentic,
    INITIAL_SPEED: { MIN: 2, MAX: 8 },
    COLOR: 0xa0f078,
    COLOR_SELECTED: 0xcc66ff,
    SIZE: 10,
    TURN_RATE: 0.4, // degrees per frame
  },
  dataTag: {
    FONT_COLOR: '#fff',
    LINE_COLOR: 0xffffff,
    TEXT_OFFSET_X: 80,
    TEXT_OFFSET_Y: 60,
  },
  pilotSpeech: {
    TEXT_OFFSET_Y: 20,
  },
  historyTrail: {
    MAX_DOTS: 5,
    INTERVAL: 1500, // milliseconds
    LATEST_COLOR: 0xa0f078,
    HISTORY_COLOR: 0x73ab57,
  },
};

type PlaneConfigType = typeof planeConfig;
export interface IPlaneConfig extends PlaneConfigType {}

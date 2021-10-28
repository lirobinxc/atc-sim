import { CallsignType } from '../utils/generateCallsign';

export const planeConfig = {
  plane: {
    CALLSIGN_TYPE: CallsignType.Casual,
    INITIAL_SPEED: 4,
    COLOR: 0xa0f078,
    COLOR_SELECTED: 0xcc66ff,
    SIZE: 10,
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
};

type PlaneConfigType = typeof planeConfig;
export interface IPlaneConfig extends PlaneConfigType {}

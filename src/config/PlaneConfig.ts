export interface IPlaneConfig {
  plane: {
    INITIAL_SPEED: number;
    COLOR: number;
    COLOR_SELECTED: number;
    SIZE: number;
  };
  dataTag: {
    FONT_COLOR: string;
    LINE_COLOR: number;
    TEXT_OFFSET_X: number;
    TEXT_OFFSET_Y: number;
  };
  pilotSpeech: {
    TEXT_OFFSET_Y: number;
  };
}

export const planeConfig = {
  plane: {
    INITIAL_SPEED: 5,
    COLOR: 0xa0f078,
    COLOR_SELECTED: 0xcc66ff,
    SIZE: 10,
  },
  dataTag: {
    FONT_COLOR: '#fff',
    LINE_COLOR: 0xffffff,
    TEXT_OFFSET_X: 60,
    TEXT_OFFSET_Y: 40,
  },
  pilotSpeech: {
    TEXT_OFFSET_Y: 20,
  },
};

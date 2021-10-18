export interface IPlaneConfig {
  plane: {
    INITIAL_SPEED: number;
    COLOR: number;
    COLOR_SELECTED: number;
  };
  dataBox: {
    FONT_COLOR: string;
    LINE_COLOR: number;
    TEXT_OFFSET_X: number;
    TEXT_OFFSET_Y: number;
  };
}

export const planeConfig = {
  plane: {
    INITIAL_SPEED: 10,
    COLOR: 0xa0f078,
    COLOR_SELECTED: 0xcc66ff,
  },
  dataBox: {
    FONT_COLOR: '#fff',
    LINE_COLOR: 0xffffff,
    TEXT_OFFSET_X: 60,
    TEXT_OFFSET_Y: 40,
  },
};

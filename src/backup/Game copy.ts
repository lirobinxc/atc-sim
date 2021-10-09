import Phaser from 'phaser';

export default class Game extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const radarGraphics = this.add.graphics({
      lineStyle: { width: 0.8, color: 0x6e785d },
    });
    const planeGraphics = this.add.graphics({
      lineStyle: { width: 3, color: 0xa0f078 },
    });

    const SCREEN = {
      height: {
        value: this.scale.height,
        middle: this.scale.height * 0.5,
      },
      width: {
        value: this.scale.width,
        middle: this.scale.width * 0.5,
      },
      get h(): number {
        return this.height.value;
      },
      get w(): number {
        return this.width.value;
      },
      get midH(): number {
        return this.height.middle;
      },
      get midW(): number {
        return this.width.middle;
      },
    };

    const radarOuterCircle = new Phaser.Geom.Circle(
      SCREEN.midW,
      SCREEN.midH,
      SCREEN.h * 0.48
    );

    const point = new Phaser.Geom.Point(SCREEN.midW, SCREEN.midH);

    console.log({
      widthMid: SCREEN.midW,
      heightMid: SCREEN.midH,
    });

    const planeShapeEdgeLength = 9;
    const planeShape = new Phaser.Geom.Rectangle(
      SCREEN.midW,
      SCREEN.midH,
      planeShapeEdgeLength,
      planeShapeEdgeLength
    );

    // this.input.on('pointermove', function (pointer: Phaser.Input.Pointer) {
    //   Phaser.Geom.Rectangle.CenterOn(planeShape, pointer.x, pointer.y);
    //   redraw();
    // });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log({ pointerX: pointer.x, pointerY: pointer.y });
    });

    radarGraphics.strokeCircleShape(radarOuterCircle);
    const plane = planeGraphics.strokeRectShape(planeShape);

    /* ------------------------ Set world bounds ----------------------- */
    // this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, SCREEN.h - 30);

    // function redraw(): any {
    //   radarGraphics.clear();
    //   planeGraphics.clear();

    //   radarGraphics.strokeCircleShape(radarOuterCircle);
    //   planeGraphics.strokeRectShape(planeShape);

    //   const intersection = Phaser.Geom.Intersects.GetCircleToRectangle(
    //     radarOuterCircle,
    //     planeShape
    //   );
    //   if (intersection.length > 1) {
    //     console.log('INTERSECT');
    //   }
    // }
  }
}

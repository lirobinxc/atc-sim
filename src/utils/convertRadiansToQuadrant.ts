import { Quadrant } from '../objects/plane/components/PlaneDataTag';

export function convertRadiansToQuadrant(radian: number): Quadrant {
  if (radian > Math.PI || radian < -Math.PI)
    throw new Error('Argument is not a radian (number between -pi and pi)');

  if (radian >= -1.57 && radian < 0) {
    return Quadrant.TopRight;
  } else if (radian >= 0 && radian < 1.57) {
    return Quadrant.BottomRight;
  } else if (radian >= 1.57 && radian <= Math.PI) {
    return Quadrant.BottomLeft;
  } else if (radian >= -Math.PI && radian < -1.57) {
    return Quadrant.TopLeft;
  } else {
    console.error(
      'Error detecting quadrant from radian, defaulting to BottomRight'
    );
    return Quadrant.BottomRight;
  }
}

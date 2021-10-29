import Phaser from 'phaser';
import { convertRadiansToQuadrant } from '../../../utils/convertRadiansToQuadrant';
import { Plane } from '../Plane';

export class PlaneHistoryTrail extends Phaser.GameObjects.GameObject {
  private plane: Plane;
  private startTime: number;
  private trailPositionHistory: Phaser.Types.Math.Vector2Like[];
  private latestTrailDots: Phaser.GameObjects.Arc[];
  private currentOldestDotIdx: number;
  private displayFullTrailHistory: boolean;

  constructor(plane: Plane) {
    super(plane.scene, 'trail');

    this.plane = plane;
    this.startTime = new Date().getTime();
    this.trailPositionHistory = [];
    this.latestTrailDots = [];
    this.currentOldestDotIdx = 0;
    this.displayFullTrailHistory = false;

    // Add object to the scene
    plane.scene.add.existing(this);

    // Init existing plane trail
    this.generateExistingTrailDots();
  }

  preUpdate() {
    this.drawLatestTrailDotsPerInterval(
      this.plane.config.historyTrail.INTERVAL
    );
    this.drawFullTrailHistory();
  }

  private drawLatestTrailDotsPerInterval(milliseconds: number) {
    const currentTime = new Date().getTime();
    if (
      currentTime - this.startTime < milliseconds &&
      currentTime !== this.startTime
    )
      return;

    if (this.currentOldestDotIdx >= this.plane.config.historyTrail.MAX_DOTS)
      this.currentOldestDotIdx = 0;

    const oldestDot = this.latestTrailDots[this.currentOldestDotIdx];
    if (!oldestDot) return;

    const newPosition = this.getLatestPlanePosition();
    oldestDot.setX(newPosition.x);
    oldestDot.setY(newPosition.y);

    this.currentOldestDotIdx++;

    this.startTime = new Date().getTime();
  }

  private drawFullTrailHistory() {
    // only visibile if plane is selected
    if (this.plane.status.isSelected) {
    }
    if (!this.plane.status.isSelected) {
    }
  }

  private getLatestPlanePosition() {
    const position = this.plane.symbol.getCenter();
    this.trailPositionHistory.push(position);
    return position;
  }

  private getLinePoints(): [
    Phaser.Types.Math.Vector2Like,
    Phaser.Types.Math.Vector2Like
  ] {
    const body = this.plane.symbol.body;
    const planePosition = this.plane.symbol.getCenter();
    const point1 = {
      x: planePosition.x,
      y: planePosition.y,
    };
    const point2 = {
      x: planePosition.x + body.velocity.x,
      y: planePosition.y + body.velocity.y,
    };
    return [point1, point2];
  }

  public getTrailHeadingQuadrant() {
    const [point1, point2] = this.getLinePoints();
    const angle = Phaser.Math.Angle.BetweenPoints(point1, point2);
    const quadrant = convertRadiansToQuadrant(angle);
    return quadrant;
  }

  private generateExistingTrailDots() {
    const MAX_NUM_OF_DOTS = this.plane.config.historyTrail.MAX_DOTS;
    const planePosition = this.plane.symbol.getCenter();
    const { x: planeVelocityX, y: planeVelocityY } =
      this.plane.symbol.body.velocity;

    for (let i = 0; i < MAX_NUM_OF_DOTS; i++) {
      let timeElapsed = (i * this.plane.config.historyTrail.INTERVAL) / 1000;

      const position = {
        x: planePosition.x - timeElapsed * planeVelocityX,
        y: planePosition.y - timeElapsed * planeVelocityY,
      };
      const dot = this.scene.add.circle(
        position.x,
        position.y,
        1.5,
        this.plane.config.historyTrail.LATEST_COLOR
      );

      this.trailPositionHistory.push(position);
      this.latestTrailDots.push(dot);
    }
    // Set the positions & dots into chronological order
    this.trailPositionHistory.reverse();
    this.latestTrailDots.reverse();

    this.plane.addMultiple(this.latestTrailDots);
  }
}

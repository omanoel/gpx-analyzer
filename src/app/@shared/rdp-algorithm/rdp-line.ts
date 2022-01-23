import { RdpPoint } from './rdp-point';

export class RdpLine {
  constructor(public p1: RdpPoint, public p2: RdpPoint) {}

  public get rise(): number {
    return this.p2.coord[1] - this.p1.coord[1];
  }

  public get run(): number {
    return this.p2.coord[0] - this.p1.coord[0];
  }

  public get slope(): number {
    return this.rise / this.run;
  }

  public get yIntercept(): number {
    return this.p1.coord[1] - this.p1.coord[0] * this.slope;
  }

  public get isVertical(): boolean {
    return !isFinite(this.slope);
  }

  public get isHorizontal(): boolean {
    return this.p1.coord[1] === this.p2.coord[1];
  }

  public perpendicularDistance(point: RdpPoint): number {
    if (this.isVertical) {
      return this._perpendicularDistanceVertical(point);
    } else if (this.isHorizontal) {
      return this._perpendicularDistanceHorizontal(point);
    } else {
      return this._perpendicularDistanceHasSlope(point);
    }
  }

  private _perpendicularDistanceHorizontal(point: RdpPoint): number {
    return Math.abs(this.p1.coord[1] - point.coord[1]);
  }

  private _perpendicularDistanceVertical(point: RdpPoint): number {
    return Math.abs(this.p1.coord[0] - point.coord[0]);
  }

  private _perpendicularDistanceHasSlope(point: RdpPoint): number {
    const slope = this.slope;
    const y_intercept = this.yIntercept;

    return (
      Math.abs(slope * point.coord[0] - point.coord[1] + y_intercept) /
      Math.sqrt(Math.pow(slope, 2) + 1)
    );
  }
}

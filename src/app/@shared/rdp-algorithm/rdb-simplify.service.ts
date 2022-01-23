import { RdpLine } from './rdp-line';
import { RdpPoint } from './rdp-point';

export class RdpSimplify {
  private constructor() {
    // private constructor
  }

  public static applyAlgorithm(points: number[][], tolerance = 0): number[][] {
    let dmax = 0;
    let index = 0;
    for (let i = 1; i <= points.length - 2; i++) {
      const d = new RdpLine(
        new RdpPoint(points[0][0], points[0][1]),
        new RdpPoint(points[points.length - 1][0], points[points.length - 1][1])
      ).perpendicularDistance(new RdpPoint(points[i][0], points[i][1]));
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }
    let results;
    if (dmax > tolerance) {
      const results_one = RdpSimplify.applyAlgorithm(
        points.slice(0, index),
        tolerance
      );
      const results_two = RdpSimplify.applyAlgorithm(
        points.slice(index, points.length),
        tolerance
      );
      results = results_one.concat(results_two);
    } else if (points.length > 1) {
      results = [points[0], points[points.length - 1]];
    } else {
      results = [points[0]];
    }
    return results;
  }
}

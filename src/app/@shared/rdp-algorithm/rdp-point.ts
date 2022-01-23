export class RdpPoint {
  constructor(public x: number, public y: number) {}

  get coord(): number[] {
    return [this.x, this.y];
  }
}

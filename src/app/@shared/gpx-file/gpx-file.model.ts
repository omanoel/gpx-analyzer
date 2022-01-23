export interface GpxFile {
  id?: number;
  title: string;
  data: any;
  original: TrackData;
  statistics: TrackData;
  interpolated: TrackData;
  rdpSimplified: TrackData; // Ramer Douglas Peucker algorithm
  date: Date;
}

export interface TrackData {
  title: string;
  distance: number;
  delayTotal: number;
  delayMove: number;
  speedTotal: number;
  speedMove: number;
  speedMax: number;
  altitudeMin: number;
  altitudeMax: number;
  ascendingElevation: number;
  descendingElevation: number;
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  points: number;
  trkPoints: TrackPoint[];
  colors: number[];
}

export interface TrackPoint {
  lon: number; // WGS84
  lat: number; // WGS84
  altitude: number;
  x: number;
  y: number;
  datetime: number; // milliseconds / UTC
  speed: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  deltaDistance: number;
  deltaDatetime: number;
  deltaX0: number;
  deltaY0: number;
  deltaZ0: number;
  deltaDistance0: number;
  deltaDatetime0: number;
  temperature: number;
  windSpeed: number;
  windDirection: WindDirectionEnum;
  [key: string]: number | WindDirectionEnum;
}

export enum WindDirectionEnum {
  N = 'N',
  E = 'E',
  W = 'W',
  S = 'S',
  NE = 'NE',
  NW = 'NW',
  SE = 'SE',
  SW = 'SW'
}

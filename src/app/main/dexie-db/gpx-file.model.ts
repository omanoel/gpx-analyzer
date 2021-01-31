import { TrackStatistics } from '../track/track.model';

export interface GpxFile {
  id?: number;
  title: string;
  data: any;
  statistics: TrackStatistics;
  date: Date;
}

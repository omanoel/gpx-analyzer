import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { DexieDbService } from './dexie-db.service';
import { GpxFile } from './gpx-file.model';

@Injectable({
  providedIn: 'root'
})
export class GpxFileDbService {
  table: Dexie.Table<GpxFile, number>;

  constructor(private dexieService: DexieDbService) {
    this.table = this.dexieService.table('gpx');
  }

  public getAll(): Promise<GpxFile[]> {
    return this.table.toArray();
  }

  public add(data: GpxFile): Promise<number> {
    return this.table.add(data);
  }

  public update(id: number, data: GpxFile): Promise<number> {
    return this.table.update(id, data);
  }

  public remove(id: number): Promise<void> {
    return this.table.delete(id);
  }
}

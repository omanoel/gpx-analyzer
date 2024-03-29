import {
  Component,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input
} from '@angular/core';
import { GpxFileDbService } from '../../@shared/gpx-file/gpx-file-db.service';
import { TranslateService } from '@ngx-translate/core';
import { GpxFileService } from 'src/app/@shared/gpx-file/gpx-file.service';
import { MainComponentModel } from 'src/app/@main/main.component.model';
import { X2jOptionsOptional, XMLParser } from 'fast-xml-parser';
@Component({
  selector: 'app-files-uploader',
  templateUrl: './files-uploader.component.html',
  styleUrls: ['./files-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesUploaderComponent {
  @Input()
  public model: MainComponentModel;
  @Output() onAdd: EventEmitter<void> = new EventEmitter();
  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef;
  files: any[] = [];

  constructor(
    public translate: TranslateService,
    private _gpxFileDbService: GpxFileDbService,
    private _gpxFileService: GpxFileService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  /**
   * on file drop handler
   */
  onFileDropped($event: any): void {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler($event: any): void {
    const element = $event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    const files: any[] = [];
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        files.push(fileList.item(i));
      }
      this.prepareFilesList(files);
    }
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number): void {
    if (this.files[index].progress < 100) {
      return;
    }
    this.files.splice(index, 1);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number): void {
    const reader = new FileReader();
    reader.readAsText(this.files[index]);

    reader.onprogress = (event: ProgressEvent<FileReader>) => {
      this.files[index].progress = (event.loaded / event.total) * 100;
      this._changeDetectorRef.detectChanges();
    };

    reader.onloadend = () => {
      const xmlToJson = this._transformXmlToJson(reader.result);
      this._gpxFileDbService
        .add(
          this._gpxFileService.buildGpxFile(
            this.files[index],
            xmlToJson,
            this.model.interpolationStepFc
          )
        )
        .then((id) => {
          index++;
          if (index < this.files.length) {
            this.uploadFilesSimulator(index);
          } else {
            this.onAdd.emit();
          }
        });
    };
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>): void {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
    this.fileDropEl.nativeElement.value = '';
    this.uploadFilesSimulator(0);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  private _transformXmlToJson(data: any): any {
    const defaultOptions: X2jOptionsOptional = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      allowBooleanAttributes: false
    };
    return new XMLParser(defaultOptions).parse(<string>data);
  }
}

import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { MainComponentModel } from '../main.component.model';

import * as XmlParser from 'fast-xml-parser';

@Injectable({
  providedIn: 'root'
})
export class GpxLoaderService {
  public load$(
    mainComponentModel: MainComponentModel,
    url: string
  ): Promise<void> {
    mainComponentModel.average = 'Loading objects...';
    return new Promise((resolve, reject) => {
      new THREE.FileLoader().load(
        // resource URL
        url,

        // Function when resource is loaded
        (response: string | ArrayBuffer) => {
          mainComponentModel.tracks.push(this._transform(response));
          resolve();
        },

        // Function called when download progresses
        (progress: ProgressEvent) => {
          mainComponentModel.average = this._displaySize(progress.loaded);
        },

        // Function called when download errors
        () => {
          reject();
        }
      );
    });
  }

  private _transform(data: string | ArrayBuffer): THREE.Object3D {
    const track = new THREE.Object3D();
    const defaultOptions: XmlParser.J2xOptions = {
      attributeNamePrefix: '@_',
      attrNodeName: '@', //default is false
      textNodeName: '#text',
      ignoreAttributes: false,
      cdataTagName: '__cdata', //default is false
      cdataPositionChar: '\\c',
      format: false,
      indentBy: '  ',
      supressEmptyNode: false,
      tagValueProcessor: (a: string) => a, // default is a=>a
      attrValueProcessor: (a) => a
    };
    const jsonData = XmlParser.parse(<string>data, defaultOptions);
    track.userData['gpx'] = jsonData;
    return track;
  }

  private _displaySize(size: number): string {
    return size + '...';
  }
}

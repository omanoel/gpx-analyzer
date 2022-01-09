import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { WEBGL } from 'three/examples/jsm/WebGL';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private _isWebGLAvailable = true;

  constructor(
    public translate: TranslateService,
    private _element: ElementRef
  ) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  ngOnInit(): void {
    if (!WEBGL.isWebGLAvailable()) {
      this._isWebGLAvailable = false;
      const warning = WEBGL.getWebGLErrorMessage();
      this._element.nativeElement.appendChild(warning);
    }
  }
  ngOnDestroy(): void {
    //
  }

  public get isWebGLAvailable(): boolean {
    return this._isWebGLAvailable;
  }
}

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MainComponentModel } from '../@main/main.component.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  //
  @Input()
  model: MainComponentModel;

  constructor(public translate: TranslateService) {}

  ngOnInit(): void {
    //
    this.model.menu.isGpxFilesDisplayed = false;
  }

  ngOnDestroy(): void {
    // unsubsribe
  }

  showGpxFiles(): void {
    this.model.menu.isGpxFilesDisplayed = !this.model.menu.isGpxFilesDisplayed;
  }

  showFromTopView(): void {
    this.model.camera.position.setX(this.model.target.axesHelper.position.x);
    this.model.camera.position.setY(this.model.target.axesHelper.position.y);
    this.model.camera.position.setZ(50000);
    this.model.camera.up.setX(0);
    this.model.camera.up.setY(1);
    this.model.camera.up.setZ(0);
  }
}

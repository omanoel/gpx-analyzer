import {
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { MainComponentModel } from './main.component.model';
import { MainComponentService } from './main.component.service';
import { Clock, Object3D, WebGLRenderer } from 'three';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnChanges, OnDestroy {
  private _mainComponentModel: MainComponentModel;

  initDist: number;
  mouseDown = false;
  isHelpDisplayed = false;

  clock: Clock = new Clock();

  currentIntersected: Object3D;

  renderer: WebGLRenderer = new WebGLRenderer({
    antialias: true
  });

  constructor(
    public translate: TranslateService,
    private _element: ElementRef,
    private _mainComponentService: MainComponentService
  ) {
    // Empty
  }

  public ngOnInit(): void {
    this._mainComponentModel = this._mainComponentService.initModel(
      this._element
    );
    this._mainComponentService.resetWidthHeight(
      this.mainComponentModel,
      window.innerWidth,
      window.innerHeight
    );
    this._mainComponentService.initComponent(this.mainComponentModel);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this._mainComponentService.onChanges(this.mainComponentModel, changes);
  }

  public ngOnDestroy(): void {
    if (this.mainComponentModel.frameId != null) {
      cancelAnimationFrame(this.mainComponentModel.frameId);
    }
  }

  public displayHelp(status: boolean): void {
    this.isHelpDisplayed = status;
  }

  public get mainComponentModel(): MainComponentModel {
    return this._mainComponentModel;
  }

  public set mainComponentModel(model: MainComponentModel) {
    this._mainComponentModel = model;
  }
}

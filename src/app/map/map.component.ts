import { Component, HostListener, Input } from '@angular/core';

import { MainComponentModel } from '../@main/main.component.model';
import { MainComponentService } from '../@main/main.component.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  private _mouseDown = false;
  @Input()
  model!: MainComponentModel;

  constructor(private _mainComponentService: MainComponentService) {}

  @HostListener('window:resize')
  resetWidthHeight(): void {
    this._mainComponentService.resetWidthHeight(
      this.model,
      window.innerWidth,
      window.innerHeight
    );
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent): void {
    event.preventDefault();
    if (!this._mouseDown) {
      this.model.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.model.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event: MouseEvent): void {
    event.preventDefault();
    this._mouseDown = true;
  }

  @HostListener('mouseup', ['$event'])
  onMouseup(event: MouseEvent): void {
    event.preventDefault();
    // this.model.target.targetOnClick = null;
    this._mouseDown = false;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    this._mainComponentService.gotoTarget(this.model);
  }
}

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MainComponentModel } from '../@main/main.component.model';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit, OnDestroy {
  //
  @Input()
  model: MainComponentModel;
  toolsForm: FormGroup;

  constructor(public translate: TranslateService) {}

  ngOnInit(): void {
    this.toolsForm = new FormGroup({
      zScaleFc: new FormControl(1, Validators.required),
      interpolationStepFc: new FormControl(10, Validators.required)
    });
    // subscriptions
    this.toolsForm.get('zScaleFc').valueChanges.subscribe((value: number) => {
      this.model.zScale = value;
      this.model.needsUpdate = true;
      this.model.needsRemove = true;
    });
    this.toolsForm
      .get('interpolationStepFc')
      .valueChanges.subscribe((value: number) => {
        this.model.interpolationStepFc = value;
        this.model.needsUpdate = true;
        this.model.needsRemove = true;
      });
  }

  ngOnDestroy(): void {
    // unsubsribe
  }

  public get tracks(): THREE.Object3D[] {
    return this.model.track3ds;
  }
}

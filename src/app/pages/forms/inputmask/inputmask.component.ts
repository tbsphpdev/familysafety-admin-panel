import { Component } from '@angular/core';

@Component({
    selector: 'app-inputmask',
    templateUrl: './inputmask.component.html',
    styleUrls: ['./inputmask.component.scss'],
    standalone: false
})
export class InputmaskComponent {
  // bread crum items
  breadCrumbItems!: Array<{}>;

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Forms' }, { label: 'Input Masks', active: true }];
  }
}

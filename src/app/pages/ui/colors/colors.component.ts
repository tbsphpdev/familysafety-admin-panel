import { Component } from '@angular/core';

@Component({
    selector: 'app-colors',
    templateUrl: './colors.component.html',
    styleUrls: ['./colors.component.scss'],
    standalone: false
})
export class ColorsComponent {
  breadCrumbItems!: Array<{}>;

  ngOnInit() {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Base UI' },
      { label: 'Colors', active: true }
    ];
  }

}

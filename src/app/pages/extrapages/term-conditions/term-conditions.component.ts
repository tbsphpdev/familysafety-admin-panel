import { Component } from '@angular/core';

@Component({
    selector: 'app-term-conditions',
    templateUrl: './term-conditions.component.html',
    styleUrls: ['./term-conditions.component.scss'],
    standalone: false
})
  
// Term & Condition Comoponent
export class TermConditionsComponent {
    // bread crumb items
    breadCrumbItems!: Array<{}>;
  
    ngOnInit(): void {
      /**
       * BreadCrumb
       */
      this.breadCrumbItems = [
        { label: 'Pages', active: true },
        { label: 'Term & Conditions', active: true }
      ];
    }
}

import { Component } from '@angular/core';

@Component({
    selector: 'app-privacy-policy',
    templateUrl: './privacy-policy.component.html',
    styleUrls: ['./privacy-policy.component.scss'],
    standalone: false
})
  
// Privacy Policy component
export class PrivacyPolicyComponent {
    // bread crumb items
    breadCrumbItems!: Array<{}>;
  
    ngOnInit(): void {
      document.documentElement.setAttribute('data-preloader', 'disable');

      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        preloader.style.display = 'none';
      }

      /**
       * BreadCrumb
       */
      this.breadCrumbItems = [
        { label: 'Pages', active: true },
        { label: 'Privacy Policy', active: true }
      ];
    }
}

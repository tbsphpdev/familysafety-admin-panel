import { Component } from '@angular/core';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss'],
    standalone: false
})

// Signin Component
export class SigninComponent {
  // set the currenr year
  year: number = new Date().getFullYear();
  fieldTextType!: boolean;

  constructor() {
  }

    /**
   * Password Hide/Show
   */
    toggleFieldTextType() {
      this.fieldTextType = !this.fieldTextType;
    }
}

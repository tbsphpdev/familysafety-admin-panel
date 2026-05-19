import { Component } from '@angular/core';

@Component({
    selector: 'app-maintenance',
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.scss'],
    standalone: false
})
  
// Maintenance Component
export class MaintenanceComponent {
  // set the currenr year
  year: number = new Date().getFullYear();
}

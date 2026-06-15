import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GlobalComponent } from 'src/app/global-component';
import { Dashboard } from 'src/app/store/Dashboard/dashboard.model';

const API_URL = GlobalComponent.API_URL;
const DASHBOARD_ENDPOINT = 'dashboard/';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) { }

  private createHeaders() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
    };
  }

  getDashboard(): Observable<{ success: boolean; data: Dashboard }> {
    const url = API_URL + DASHBOARD_ENDPOINT;
    return this.http.get<{ success: boolean; data: Dashboard }>(url, this.createHeaders()).pipe(
      catchError((error) => throwError(() => error?.error || error?.message || 'Unable to load dashboard data'))
    );
  }
}

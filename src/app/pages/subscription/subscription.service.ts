import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GlobalComponent } from '../../global-component';

const API_URL = GlobalComponent.API_URL;

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(private http: HttpClient) { }

  getSubscriptions(token: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    const url = API_URL + 'subscriptions/';

    return this.http.get<any>(url, httpOptions).pipe(
      map((response: any) => {
        if (response && response.status === 200) {
          return response;
        }
        return { subscriptions: [] };
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  suspendUser(token: String, id: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    const url = API_URL + `subscriptions/activity/${id}/`;

    return this.http.post<any>(url, {}, httpOptions).pipe(
      map((response: any) => {
        if (response && response.status === 200) {
          return response;
        }
        return {};
      }),
      catchError((error: any) => throwError(() => error))
    );
  }
}

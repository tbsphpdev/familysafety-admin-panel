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

  private createHeaders(token: string) {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private parseApiError(error: any): string {
    if (!error) {
      return 'Something went wrong';
    }
    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    const payload = error.error ?? error;
    if (payload) {
      if (typeof payload === 'string' && payload.trim()) {
        return payload;
      }
      if (payload.message) {
        return payload.message;
      }
      if (payload.detail) {
        return payload.detail;
      }
      if (payload.error) {
        return typeof payload.error === 'string' ? payload.error : payload.error.message || JSON.stringify(payload.error);
      }
    }
    return 'Something went wrong';
  }

  private handleApiResponse(response: any, expectedStatus: number | number[] = 200): any {
    if (response && typeof response.status !== 'undefined') {
      const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
      if (!expectedStatuses.includes(response.status)) {
        const message = response.message || response.error || `Request failed with status ${response.status}`;
        throw new Error(message);
      }
      return response;
    }
    return response;
  }

  private handleError(error: any) {
    const message = this.parseApiError(error);
    return throwError(() => message);
  }

  getSubscriptions(token: string): Observable<any> {
    const url = API_URL + 'subscriptions/';
    return this.http.get<any>(url, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  suspendUser(token: string, id: any): Observable<any> {
    const url = API_URL + `subscriptions/activity/${id}/`;
    return this.http.post<any>(url, {}, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  createSubscription(token: string, payload: any): Observable<any> {
    const url = API_URL + 'subscriptions/';
    return this.http.post<any>(url, payload, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 201)),
      catchError((error: any) => this.handleError(error))
    );
  }

  getSubscription(token: string, id: any, language?: string): Observable<any> {
    let url = API_URL + `subscriptions/${id}/`;
    if (language) {
      url += `?lang=${language}`;
    }

    return this.http.get<any>(url, this.createHeaders(token)).pipe(
      map((response: any) => {
        return this.handleApiResponse(response, 200);
      }),
      catchError((error: any) => this.handleError(error))
    );
  }

  updateSubscription(token: string, id: any, payload: any): Observable<any> {
    const url = API_URL + `subscriptions/${id}/`;
    return this.http.patch<any>(url, payload, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, [200, 201])),
      catchError((error: any) => this.handleError(error))
    );
  }

  deleteSubscription(token: string, id: any): Observable<any> {
    const url = API_URL + `subscriptions/${id}/`;
    return this.http.delete<any>(url, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  getLanguages(token: string): Observable<any> {
    const url = API_URL + `languages/`;
    return this.http.get<any>(url, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  translateToAllLanguages(token: string, id: any): Observable<any> {
    const url = API_URL + `subscriptions/translate/${id}/`;
    return this.http.post<any>(url, {}, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { GlobalComponent } from '../../global-component';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface MonitoringListResponse {
  items: any[];
  current_page: number;
  total_pages: number;
  total_items: number;
}

@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  private apiUrl = GlobalComponent.API_URL;

  constructor(private http: HttpClient) { }

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

  private normalizeResponse(response: any, slug: string): MonitoringListResponse {
    if (response && typeof response.status !== 'undefined' && response.status !== 200) {
      throw new Error(response.message || response.error || `Request failed with status ${response.status}`);
    }

    let items: any[] = [];
    if (Array.isArray(response?.data)) {
      items = response.data;
    } else if (slug === 'geofence_events' && Array.isArray(response?.events)) {
      items = response.events;
    } else if (slug === 'sos_alerts' && Array.isArray(response?.alerts)) {
      items = response.alerts;
    } else if (Array.isArray(response?.[slug])) {
      items = response[slug];
    } else if (Array.isArray(response?.items)) {
      items = response.items;
    } else if (Array.isArray(response?.results)) {
      items = response.results;
    } else if (Array.isArray(response)) {
      items = response;
    }

    const current_page = response?.current_page ?? response?.page ?? 1;
    const total_pages = response?.total_pages ?? response?.totalPages ?? 1;
    const total_items = response?.count ?? response?.total_alerts ?? response?.total_events ?? response?.total_items ?? response?.totalItems ?? items.length;

    return {
      items,
      current_page,
      total_pages,
      total_items,
    };
  }

  getMonitoringList(slug: string, page?: number, search?: string, filterParams?: { [key: string]: string }): Observable<MonitoringListResponse> {
    const token = localStorage.getItem('token') || '';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    let params = new HttpParams();
    if (page) {
      params = params.set('page', page.toString());
    }
    if (search) {
      params = params.set('search', search);
    }
    if (filterParams) {
      Object.keys(filterParams).forEach(key => {
        const value = filterParams[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value);
        }
      });
    }

    const url = `${this.apiUrl}${slug}`;
    return this.http.get<any>(url, { ...httpOptions, params }).pipe(
      map((response: any) => this.normalizeResponse(response, slug)),
      catchError((error: any) => throwError(() => this.parseApiError(error)))
    );
  }

  getPaymentHistory(page?: number, search?: string, filterParams?: { [key: string]: string }): Observable<MonitoringListResponse> {
    return this.getMonitoringList('payment-history/', page, search, filterParams);
  }
}

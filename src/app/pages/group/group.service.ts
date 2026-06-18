import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { GlobalComponent } from '../../global-component';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface GroupListResponse {
  groups: any[];
  currentPage: number;
  totalPages: number;
  totalGroups: number;
}

@Injectable({ providedIn: 'root' })
export class GroupService {
  private apiUrl = GlobalComponent.API_URL;

  constructor(private http: HttpClient) { }

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  }

  private parseError(error: any): string {
    const payload = error?.error ?? error;
    return payload?.detail ?? payload?.message ?? payload?.error ?? 'Something went wrong';
  }

  getGroups(page = 1, search = '', perPage = 10): Observable<GroupListResponse> {
    let params = new HttpParams().set('page', page.toString()).set('per_page', perPage.toString());
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${this.apiUrl}groups/`, { headers: this.headers, params }).pipe(
      map((response: any) => {
        const groups: any[] = response?.groups ?? response?.data ?? response?.results ?? [];
        const currentPage = response?.current_page ?? response?.page ?? 1;
        const totalPages = response?.total_pages ?? 1;
        const totalGroups = response?.total_groups ?? response?.total_items ?? groups.length;
        return { groups, currentPage, totalPages, totalGroups };
      }),
      catchError((error: any) => throwError(() => this.parseError(error)))
    );
  }

  getGroup(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}groups/${id}/`, { headers: this.headers }).pipe(
      map((response: any) => response?.group ?? response?.data ?? response),
      catchError((error: any) => throwError(() => this.parseError(error)))
    );
  }
}



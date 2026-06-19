import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../store/Users/user.model';
import { GlobalComponent } from "../../global-component";
import { catchError, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

const API_URL = GlobalComponent.API_URL;

@Injectable({ providedIn: 'root' })
export class UserService {

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

  private handleApiResponse(response: any, expectedStatus: number = 200): any {
    if (response && typeof response.status !== 'undefined' && response.status !== expectedStatus) {
      throw new Error(response.message || response.error || `Request failed with status ${response.status}`);
    }
    return response;
  }

  private handleError(error: any) {
    return throwError(() => this.parseApiError(error));
  }

  getUsers(token: string, page?: number, search?: string, per_page?: number, ordering?: string, is_minor?: string, status?: string): Observable<any> {
    let url = API_URL + 'user_list';
    const params: string[] = [];
    if (page) {
      params.push(`page=${page}`);
    }
    if (per_page) {
      params.push(`per_page=${per_page}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (ordering) {
      params.push(`ordering=${encodeURIComponent(ordering)}`);
    }
    if (is_minor !== undefined && is_minor !== '') {
      params.push(`is_minor=${is_minor}`);
    }
    if (status !== undefined && status !== '') {
      params.push(`status=${status}`);
    }
    if (params.length) {
      url += '?' + params.join('&');
    }

    return this.http.get<any>(url, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  suspendUser(token: string, id: any): Observable<any> {
    const url = API_URL + 'suspend_user/' + id + '/';

    return this.http.post<any>(url, null, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  getUser(token: string, id: any): Observable<any> {
    const url = API_URL + `user_list/${id}/`;
    return this.http.get<any>(url, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  updateUser(token: string, id: any, payload: any): Observable<any> {
    const url = API_URL + `update_user/${id}/`;
    return this.http.patch<any>(url, payload, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  unsuspendUser(token: string, id: any): Observable<any> {
    const url = API_URL + 'unsuspend_user/' + id + '/';

    return this.http.post<any>(url, null, this.createHeaders(token)).pipe(
      map((response: any) => this.handleApiResponse(response, 200)),
      catchError((error: any) => this.handleError(error))
    );
  }

  deleteUser(token: string, id: any): Observable<any> {
    const url = API_URL + 'delete_user/' + id + '/';
    return this.http.delete<any>(url, this.createHeaders(token)).pipe(
      catchError((error: any) => this.handleError(error))
    );
  }
}

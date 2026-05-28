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

  getUsers(token: string, page?: number, search?: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    let url = API_URL + 'user_list';
    const params: string[] = [];
    if (page) {
      params.push(`page=${page}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (params.length) {
      url += '?' + params.join('&');
    }

    return this.http.get<any>(url, httpOptions).pipe(
      map((response: any) => {
        if (response && response.status === 200) {
          return response;
        }
        return { users: [] };
      }),
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  suspendUser(token: string, id: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    const url = API_URL + 'suspend_user/' + id + '/';

    return this.http.post<any>(url, null, httpOptions).pipe(
      map((response: any) => {
        if (response && response.status === 200) {
          return response;
        }
        return { data: [] };
      }),
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  getUser(token: string, id: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    const url = API_URL + `user_list/${id}/`;
    return this.http.get<any>(url, httpOptions).pipe(
      map((response: any) => {
        if (response && response.status === 200) {
          return response;
        }
        return { user: null };
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  updateUser(token: string, id: any, payload: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    const url = API_URL + `update_user/${id}/`;
    return this.http.patch<any>(url, payload, httpOptions).pipe(
      map((response: any) => {
        if (response && response.status === 200) {
          return response;
        }
        return { user: null };
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  unsuspendUser(token: string, id: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    const url = API_URL + 'unsuspend_user/' + id + '/';

    return this.http.post<any>(url, null, httpOptions).pipe(
      map((response: any) => {
        if (response && response.status === 200) {
          return response;
        }
        return { data: [] };
      }),
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }
}

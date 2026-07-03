import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { GlobalComponent } from '../../global-component';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface SurveyListResponse {
  items: any[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private apiUrl = GlobalComponent.API_URL;

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  }

  private parseError(error: any): string {
    const payload = error?.error ?? error;
    return payload?.detail ?? payload?.message ?? payload?.error ?? 'Something went wrong';
  }

  getSurveyQuestions(page = 1, search = '', perPage = 10): Observable<SurveyListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${this.apiUrl}onboarding_questions/`, { headers: this.headers, params }).pipe(
      map((response: any) => {
        const items: any[] =
          response?.results ?? response?.items ?? response?.data ?? response?.questions ?? [];
        const currentPage = response?.current_page ?? response?.page ?? 1;
        const totalPages = response?.total_pages ?? 1;
        const totalItems =
          response?.total_records ?? response?.total_items ?? response?.count ?? items.length;
        return { items, currentPage, totalPages, totalItems };
      }),
      catchError((error: any) => throwError(() => this.parseError(error)))
    );
  }

  getSurveyQuestion(id: number, language?: string): Observable<any> {
    let url = `${this.apiUrl}onboarding_questions/${id}/`;
    if (language) {
      url += `?lang=${language}`;
    }
    return this.http
      .get<any>(url, { headers: this.headers })
      .pipe(
        map((response: any) => {
          // API returns { data: [ {...} ], message, status }
          if (Array.isArray(response?.data) && response.data.length > 0) {
            return response.data[0];
          }
          return response?.data ?? response;
        }),
        catchError((error: any) => throwError(() => this.parseError(error)))
      );
  }

  getLanguages(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}languages/`, { headers: this.headers })
      .pipe(catchError((error: any) => throwError(() => this.parseError(error))));
  }

  getSurveyQuestionStats(id: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}onboarding_questions/stats/${id}/`, { headers: this.headers })
      .pipe(
        map((response: any) => response?.data ?? response),
        catchError((error: any) => throwError(() => this.parseError(error)))
      );
  }

  createSurveyQuestion(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}onboarding_questions/`, data, { headers: this.headers })
      .pipe(catchError((error: any) => throwError(() => this.parseError(error))));
  }

  updateSurveyQuestion(id: number, data: any): Observable<any> {
    return this.http
      .patch<any>(`${this.apiUrl}onboarding_questions/${id}/`, data, { headers: this.headers })
      .pipe(catchError((error: any) => throwError(() => this.parseError(error))));
  }

  deleteSurveyQuestion(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}onboarding_questions/${id}/`, { headers: this.headers })
      .pipe(catchError((error: any) => throwError(() => this.parseError(error))));
  }

  reorderQuestions(items: { id: number; order: number }[]): Observable<any> {
    return this.http
      .patch<any>(`${this.apiUrl}onboarding_questions/reorder/`, items, { headers: this.headers })
      .pipe(catchError((error: any) => throwError(() => this.parseError(error))));
  }
}

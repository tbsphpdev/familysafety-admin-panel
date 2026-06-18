import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as SurveyActions from './survey.actions';
import { SurveyService } from 'src/app/pages/survey/survey.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class SurveyEffects {

  loadSurveyQuestions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.loadSurveyQuestions),
      concatMap(({ page, per_page, search }) =>
        this.surveyService.getSurveyQuestions(page ?? 1, search ?? '', per_page ?? 10).pipe(
          map(({ items, currentPage, totalPages, totalItems }) =>
            SurveyActions.loadSurveyQuestionsSuccess({ items, currentPage, totalPages, totalItems })
          ),
          catchError(error => of(SurveyActions.loadSurveyQuestionsFailure({ error })))
        )
      )
    )
  );

  getSurvey$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.getSurvey),
      concatMap(({ id }) =>
        this.surveyService.getSurveyQuestion(id).pipe(
          map((survey) => SurveyActions.getSurveySuccess({ survey })),
          catchError(error => of(SurveyActions.getSurveyFailure({ error })))
        )
      )
    )
  );

  createSurvey$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.createSurvey),
      concatMap((action: any) =>
        this.surveyService.createSurveyQuestion(action.payload).pipe(
          switchMap((res: any) => [
            SurveyActions.createSurveySuccess({ response: res }),
            SurveyActions.loadSurveyQuestions({ page: action.page, per_page: action.per_page, search: action.search })
          ]),
          catchError((error) => of(SurveyActions.createSurveyFailure({ error })))
        )
      )
    )
  );

  createSurveySuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.createSurveySuccess),
      tap(() => {
        try {
          this.toastr.success('Question created successfully', 'Success');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  createSurveyFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.createSurveyFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to create question', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updateSurvey$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.updateSurvey),
      concatMap((action: any) =>
        this.surveyService.updateSurveyQuestion(action.id, action.payload).pipe(
          switchMap((res: any) => [
            SurveyActions.updateSurveySuccess({ response: res }),
            SurveyActions.loadSurveyQuestions({ page: action.page, per_page: action.per_page, search: action.search })
          ]),
          catchError((error) => of(SurveyActions.updateSurveyFailure({ error })))
        )
      )
    )
  );

  updateSurveySuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.updateSurveySuccess),
      tap(() => {
        try {
          this.toastr.success('Question updated successfully', 'Success');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updateSurveyFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.updateSurveyFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to update question', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  deleteSurvey$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.deleteSurvey),
      concatMap((action: any) =>
        this.surveyService.deleteSurveyQuestion(action.id).pipe(
          switchMap((res: any) => [
            SurveyActions.deleteSurveySuccess({ success: res, id: action.id }),
            SurveyActions.loadSurveyQuestions({ page: action.page, per_page: action.per_page, search: action.search })
          ]),
          catchError((error) => of(SurveyActions.deleteSurveyFailure({ error })))
        )
      )
    )
  );

  deleteSurveySuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.deleteSurveySuccess),
      tap(() => {
        try {
          this.toastr.success('Question deleted successfully', 'Success');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  deleteSurveyFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.deleteSurveyFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to delete question', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  getSurveyFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.getSurveyFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to fetch question', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  loadSurveyStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.loadSurveyStats),
      concatMap(({ id }) =>
        this.surveyService.getSurveyQuestionStats(id).pipe(
          map((stats) => SurveyActions.loadSurveyStatsSuccess({ stats })),
          catchError((error) => of(SurveyActions.loadSurveyStatsFailure({ error })))
        )
      )
    )
  );

  loadSurveyStatsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SurveyActions.loadSurveyStatsFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to load question stats', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  constructor(private actions$: Actions, private surveyService: SurveyService, private toastr: ToastrService) { }
}

import { createAction, props } from '@ngrx/store';

export const loadSurveyQuestions = createAction(
  '[Survey] Load Survey Questions',
  props<{ page?: number; per_page?: number; search?: string }>()
);

export const loadSurveyQuestionsSuccess = createAction(
  '[Survey] Load Survey Questions Success',
  props<{ items: any[]; currentPage: number; totalPages: number; totalItems: number }>()
);

export const loadSurveyQuestionsFailure = createAction(
  '[Survey] Load Survey Questions Failure',
  props<{ error: any }>()
);

export const getSurvey = createAction(
  '[Survey] Get Survey',
  props<{ id: number }>()
);

export const getSurveySuccess = createAction(
  '[Survey] Get Survey Success',
  props<{ survey: any }>()
);

export const getSurveyFailure = createAction(
  '[Survey] Get Survey Failure',
  props<{ error: any }>()
);

export const createSurvey = createAction(
  '[Survey] Create Survey',
  props<{ payload: any; page?: number; per_page?: number; search?: string }>()
);

export const createSurveySuccess = createAction(
  '[Survey] Create Survey Success',
  props<{ response: any }>()
);

export const createSurveyFailure = createAction(
  '[Survey] Create Survey Failure',
  props<{ error: any }>()
);

export const updateSurvey = createAction(
  '[Survey] Update Survey',
  props<{ id: number; payload: any; page?: number; per_page?: number; search?: string }>()
);

export const updateSurveySuccess = createAction(
  '[Survey] Update Survey Success',
  props<{ response: any }>()
);

export const updateSurveyFailure = createAction(
  '[Survey] Update Survey Failure',
  props<{ error: any }>()
);

export const deleteSurvey = createAction(
  '[Survey] Delete Survey',
  props<{ id: number; page?: number; per_page?: number; search?: string }>()
);

export const deleteSurveySuccess = createAction(
  '[Survey] Delete Survey Success',
  props<{ success: any; id: number }>()
);

export const deleteSurveyFailure = createAction(
  '[Survey] Delete Survey Failure',
  props<{ error: any }>()
);

export const loadSurveyStats = createAction(
  '[Survey] Load Survey Stats',
  props<{ id: number }>()
);

export const loadSurveyStatsSuccess = createAction(
  '[Survey] Load Survey Stats Success',
  props<{ stats: any }>()
);

export const loadSurveyStatsFailure = createAction(
  '[Survey] Load Survey Stats Failure',
  props<{ error: any }>()
);

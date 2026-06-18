import { createReducer, on } from '@ngrx/store';
import {
  loadSurveyQuestions,
  loadSurveyQuestionsSuccess,
  loadSurveyQuestionsFailure,
  getSurveySuccess,
  getSurveyFailure,
  loadSurveyStats,
  loadSurveyStatsSuccess,
  loadSurveyStatsFailure,
} from './survey.actions';

export const surveyFeatureKey = 'survey';

export interface SurveyState {
  items: any[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  loading: boolean;
  error: any;
  selectedItem: any | null;
  stats: any | null;
  statsLoading: boolean;
}

const initialState: SurveyState = {
  items: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10,
  loading: false,
  error: null,
  selectedItem: null,
  stats: null,
  statsLoading: false,
};

export const surveyReducer = createReducer(
  initialState,
  on(loadSurveyQuestions, (state, action) => ({
    ...state,
    loading: true,
    error: null,
    pageSize: action.per_page ?? state.pageSize,
  })),
  on(loadSurveyQuestionsSuccess, (state, action) => ({
    ...state,
    items: action.items,
    currentPage: action.currentPage,
    totalPages: action.totalPages,
    totalItems: action.totalItems,
    loading: false,
    error: null,
    selectedItem: state.selectedItem
  })),
  on(loadSurveyQuestionsFailure, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  }))
  , on(getSurveySuccess, (state, action) => ({
    ...state,
    selectedItem: action.survey,
    error: null,
  })),
  on(getSurveyFailure, (state, action) => ({
    ...state,
    selectedItem: null,
    error: action.error,
  })),
  on(loadSurveyStats, (state) => ({
    ...state,
    stats: null,
    statsLoading: true,
  })),
  on(loadSurveyStatsSuccess, (state, action) => ({
    ...state,
    stats: action.stats,
    statsLoading: false,
  })),
  on(loadSurveyStatsFailure, (state) => ({
    ...state,
    stats: null,
    statsLoading: false,
  }))
);

const selectSurveyMeta = (state: any): SurveyState => state[surveyFeatureKey];

export const selectSurveyItems = (state: any) => selectSurveyMeta(state)?.items || [];
export const selectSurveyCurrentPage = (state: any) => selectSurveyMeta(state)?.currentPage || 1;
export const selectSurveyTotalPages = (state: any) => selectSurveyMeta(state)?.totalPages || 1;
export const selectSurveyTotalItems = (state: any) => selectSurveyMeta(state)?.totalItems || 0;
export const selectSurveyPageSize = (state: any) => selectSurveyMeta(state)?.pageSize || 10;
export const selectSurveyLoading = (state: any) => selectSurveyMeta(state)?.loading || false;
export const selectSurveyError = (state: any) => selectSurveyMeta(state)?.error || null;
export const selectSurveySelectedItem = (state: any) => selectSurveyMeta(state)?.selectedItem || null;
export const selectSurveyStats = (state: any) => selectSurveyMeta(state)?.stats || null;
export const selectSurveyStatsLoading = (state: any) => selectSurveyMeta(state)?.statsLoading || false;

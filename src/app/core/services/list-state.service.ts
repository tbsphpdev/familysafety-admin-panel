import { Injectable } from '@angular/core';

export interface ListState {
  page: number;
  per_page: number;
  search?: string;
  ordering?: string;
}

type ListStateKey = 'users' | 'subscriptions' | 'group';

@Injectable({ providedIn: 'root' })
export class ListStateService {
  private readonly defaults: Record<ListStateKey, ListState> = {
    users: { page: 1, per_page: 10, search: '', ordering: '' },
    subscriptions: { page: 1, per_page: 10, search: '' },
    group: { page: 1, per_page: 10, search: '' }
  };

  private readonly states: Record<ListStateKey, ListState> = {
    users: { ...this.defaults.users },
    subscriptions: { ...this.defaults.subscriptions },
    group: { ...this.defaults.group }
  };

  getState(key: ListStateKey): ListState {
    return { ...this.states[key] };
  }

  setState(key: ListStateKey, state: Partial<ListState>): void {
    this.states[key] = {
      ...this.states[key],
      ...state,
      page: Number(state.page ?? this.states[key].page) || this.defaults[key].page,
      per_page: Number(state.per_page ?? this.states[key].per_page) || this.defaults[key].per_page
    };
  }

  resetState(key: ListStateKey): void {
    this.states[key] = { ...this.defaults[key] };
  }
}

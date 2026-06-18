import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// Toastr handled in effects
import { Actions, ofType } from '@ngrx/effects';
import Swal from 'sweetalert2';
import {
  loadSurveyQuestions,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  createSurveySuccess,
  createSurveyFailure,
  updateSurveySuccess,
  updateSurveyFailure,
  deleteSurveySuccess,
  deleteSurveyFailure,
  getSurveySuccess,
  getSurveyFailure,
  loadSurveyStats,
} from 'src/app/store/Survey/survey.actions';
import {
  selectSurveyItems,
  selectSurveyLoading,
  selectSurveySelectedItem,
  selectSurveyStats,
  selectSurveyStatsLoading,
} from 'src/app/store/Survey/survey.reducer';

@Component({
  standalone: true,
  selector: 'app-survey-list',
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
})
export class SurveyListComponent implements OnInit, OnDestroy {
  breadCrumbItems: Array<{}> = [];
  title = 'Survey Questions';

  surveyList: any[] = [];
  isLoading = false;
  pageSize = 10;
  pageSizeOptions = [10, 50, 100];

  // Create/Edit modal state
  showModal = false;
  isEditing = false;
  modalLoading = false;
  editId: number | null = null;
  form!: FormGroup;

  // Stats modal state
  showStatsModal = false;
  statsData: any = null;
  statsLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Survey Questions', active: true },
    ];

    this.store.select(selectSurveyItems).pipe(takeUntil(this.destroy$)).subscribe(items => this.surveyList = items);
    this.store.select(selectSurveyLoading).pipe(takeUntil(this.destroy$)).subscribe(loading => this.isLoading = loading);

    // listen for effect outcomes to control modal loading/visibility
    this.actions$.pipe(
      ofType(createSurveySuccess, createSurveyFailure, updateSurveySuccess, updateSurveyFailure, deleteSurveySuccess, deleteSurveyFailure),
      takeUntil(this.destroy$)
    ).subscribe((action: any) => {
      // ensure modal preloader is hidden after create/update
      this.modalLoading = false;
      if (action && action.type === createSurveySuccess.type) {
        this.showModal = false;
      }
      if (action && action.type === updateSurveySuccess.type) {
        this.showModal = false;
      }
    });

    // when a single survey is loaded for editing, populate form
    this.store.select(selectSurveySelectedItem).pipe(takeUntil(this.destroy$)).subscribe(item => {
      if (item && this.isEditing && this.editId === item.id) {
        this.form = this.buildForm(item);
        this.modalLoading = false;
      }
    });

    // stats modal
    this.store.select(selectSurveyStatsLoading).pipe(takeUntil(this.destroy$)).subscribe(l => (this.statsLoading = l));
    this.store.select(selectSurveyStats).pipe(takeUntil(this.destroy$)).subscribe(stats => (this.statsData = stats));

    this.loadPage();
  }

  // ── List ────────────────────────────────────────────────────────────────────

  private loadPage(): void {
    this.store.dispatch(loadSurveyQuestions({}));
  }

  onPageSizeChange(size: number | string): void {
    this.pageSize = Number(size) || this.pageSize;
    this.loadPage();
  }

  getRowNumber(index: number): number {
    return index + 1;
  }


  // ── Modal ───────────────────────────────────────────────────────────────────

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  private buildForm(data?: any): FormGroup {
    return this.fb.group({
      text: [data?.text ?? '', Validators.required],
      order: [data?.order ?? 1],
      is_active: [data?.is_active ?? true],
      options: this.fb.array(
        (data?.options ?? []).map((o: any) =>
          this.fb.group({
            id: [o.id ?? null],
            text: [o.text ?? '', Validators.required],
            order: [o.order ?? 1],
          })
        )
      ),
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editId = null;
    this.form = this.buildForm();
    this.showModal = true;
  }

  openEditModal(id: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.isEditing = true;
    this.editId = id;
    this.form = this.buildForm();
    this.modalLoading = true;
    this.showModal = true;
    this.store.dispatch(getSurvey({ id }));
  }


  closeModal(): void {
    this.showModal = false;
    this.modalLoading = false;
  }

  addOption(): void {
    this.options.push(
      this.fb.group({ id: [null], text: ['', Validators.required], order: [this.options.length + 1] })
    );
  }

  removeOption(index: number, event: Event): void {
    event.stopPropagation();
    this.options.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.modalLoading = true;
    const raw = this.form.value;

    if (this.isEditing && this.editId) {
      // PATCH: include top-level id; options keep their id (null for new ones)
      const payload = {
        id: this.editId,
        text: raw.text,
        order: raw.order,
        is_active: raw.is_active,
        options: raw.options.map((o: any) => ({
          id: o.id ?? null,
          text: o.text,
          order: o.order,
        })),
      };
      this.store.dispatch(updateSurvey({ id: this.editId, payload }));
      return;
    } else {
      // POST: no id fields at any level
      const payload = {
        text: raw.text,
        order: raw.order,
        options: raw.options.map((o: any) => ({
          text: o.text,
          order: o.order,
        })),
      };
      this.store.dispatch(createSurvey({ payload }));
      return;
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  deleteQuestion(id: number, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Delete Question',
      text: 'Are you sure you want to delete this question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
    }).then(result => {
      if (result.isConfirmed) {
        this.store.dispatch(deleteSurvey({ id }));
      }
    });
  }

  openStatsModal(id: number, event: Event): void {
    event.stopPropagation();
    this.statsData = null;
    this.showStatsModal = true;
    this.store.dispatch(loadSurveyStats({ id }));
  }

  closeStatsModal(): void {
    this.showStatsModal = false;
  }

  toggleStatus(item: any, event: Event): void {
    event.stopPropagation();
    const newStatus = !item.is_active;
    this.store.dispatch(updateSurvey({ id: item.id, payload: { is_active: newStatus } }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

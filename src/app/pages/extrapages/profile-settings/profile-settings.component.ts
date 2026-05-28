import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { updateProfile, updateProfileSuccess, updateProfileFailure, changePassword, changePasswordSuccess, changePasswordFailure, uploadProfileImage } from '../../../store/ProfileSetting/profile-setting.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfileSettingsService } from './profile-settings.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
  standalone: false
})

// Profile Setting component
export class ProfileSettingsComponent implements OnDestroy {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  fieldTextType!: boolean;
  fieldTextType1!: boolean;
  fieldTextType2!: boolean;
  bsConfig?: Partial<BsDatepickerConfig>;

  formGroups: FormGroup[] = [];
  profileUpdateForm!: FormGroup;
  changePasswordForm!: FormGroup;
  userId!: number;
  loading = false;
  imageUploading = false;
  currentTab = 'personalDetails';
  private actionsSubscription?: Subscription;

  userData: any;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private store: Store, private actions$: Actions, private router: Router, private toastr: ToastrService, private profileSettingsService: ProfileSettingsService) { }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Dashboard', active: true },
      { label: 'Profile Settings', active: true }
    ];

    let userData = localStorage.getItem('currentUser');
    if (userData) {
      this.userData = JSON.parse(userData);
    } else {
      this.router.navigate(['/login']);
    }

    this.profileUpdateForm = this.fb.group({
      full_name: [this.userData.full_name, Validators.required],
      email: [this.userData.email, [Validators.required, Validators.email]],
      phone_number: [this.userData.phone_number, Validators.required],
      date_of_birth: [this.userData.date_of_birth],
    });

    this.changePasswordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [
        Validators.required
      ]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });

    this.actionsSubscription = this.actions$.pipe(
      ofType(updateProfileSuccess, updateProfileFailure, changePasswordSuccess, changePasswordFailure)
    ).subscribe((action) => {
      this.loading = false;
      if (action.type === changePasswordSuccess.type) {
        this.changePasswordForm.reset();
      }
    });
  }

  ngOnDestroy(): void {
    this.actionsSubscription?.unsubscribe();
  }

  getInitials(name?: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }


  // Change Tab Content
  changeTab(tab: string) {
    this.currentTab = tab;
  }

  // File Upload
  imageURL: any;
  fileChange(event: any, id: any) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.toastr.error('Please upload a valid image file', 'Error');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      if (id == '0') {
        document.querySelectorAll('#cover-img').forEach((element: any) => {
          element.src = this.imageURL;
        });
      }
      if (id == '1') {
        document.querySelectorAll('#user-img').forEach((element: any) => {
          element.src = this.imageURL;
        });
      }
    }

    // reader.readAsDataURL(file);

    if (id == '1') {
      this.store.dispatch(uploadProfileImage({ image: file }));
    }
  }

  /**
  * Password Hide/Show
  */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
  toggleFieldTextType1() {
    this.fieldTextType1 = !this.fieldTextType1
  }
  toggleFieldTextType2() {
    this.fieldTextType2 = !this.fieldTextType2;
  }

  profileUpdate() {
    if (this.profileUpdateForm.invalid) {
      this.profileUpdateForm.markAllAsTouched();
      return;
    }
    const changes = this.profileUpdateForm.value;
    this.loading = true;
    // Pass user id and changes as expected by effect/service
    this.store.dispatch(updateProfile({ userDetails: changes }));
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }
    const changes = this.changePasswordForm.value;
    this.loading = true;
    if (changes.new_password !== changes.confirm_password) {
      this.changePasswordForm.get('confirm_password')?.setErrors({ passwordMismatch: true });
      this.changePasswordForm.get('confirm_password')?.markAsTouched();
      this.toastr.error('New password and confirm password do not match', 'Error');
      this.loading = false;
      return;
    }
    // Pass user id and password data as expected by effect/service
    this.store.dispatch(changePassword({
      id: this.userData.id, data: {
        password: changes.current_password,
        new_password: changes.new_password
      }
    }));
  }

  isInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!control && control.touched && control.invalid;
  }

  hasError(form: FormGroup, controlName: string, errorName: string): boolean {
    return !!form.get(controlName)?.errors?.[errorName];
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('new_password')?.value;
    const confirmPassword = control.get('confirm_password')?.value;

    if (!newPassword || !confirmPassword || newPassword === confirmPassword) {
      return null;
    }

    return { passwordMismatch: true };
  }

}



import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../store/Authentication/auth.models';
import { getFirebaseBackend } from 'src/app/authUtils';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { GlobalComponent } from "../../global-component";

// Action
import { login, loginSuccess, loginFailure, logout, logoutSuccess, RegisterSuccess } from '../../store/Authentication/authentication.actions';

// Firebase
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { isString } from 'lodash';



const AUTH_API = GlobalComponent.AUTH_API;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    user!: User;
    currentUserValue: any;

    private currentUserSubject: BehaviorSubject<User>;

    constructor(private http: HttpClient, private store: Store, private afAuth: AngularFireAuth, private toastr: ToastrService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
    }

    // Sign in with Google provider
    signInWithGoogle(): Promise<User> {
        const provider = new firebase.auth.GoogleAuthProvider();
        return this.signInWithPopup(provider);
    }

    // Sign in with Facebook provider
    signInWithFacebook(): Promise<User> {
        const provider = new firebase.auth.FacebookAuthProvider();
        return this.signInWithPopup(provider);
    }

    // Sign in with a popup for the specified provider
    private async signInWithPopup(provider: firebase.auth.AuthProvider): Promise<User> {
        try {
            const result = await this.afAuth.signInWithPopup(provider);
            const user = result.user;
            return {
                //     uid: user.uid,
                //     displayName: user.displayName,
                //     email: user.email,
                //     // Add other user properties as needed
            };
        } catch (error) {
            throw new Error('Failed to sign in with the specified provider.');
        }
    }

    // Sign out the current user
    signOut(): Promise<void> {
        return this.afAuth.signOut();
    }


    register(email: string, first_name: string, password: string) {
        return this.http.post(AUTH_API + 'signup', {
            email,
            first_name,
            password,
        }, httpOptions).pipe(
            map((response: any) => {
                // Check if response status is 200
                if (response && response.status === 200) {
                    const user = response;
                    this.store.dispatch(RegisterSuccess({ user }));
                    this.toastr.success('Registration successful', 'Success');
                    return user;
                } else {
                    // If status is not 200, extract message and show toast
                    const errorMessage = response && response.message ? response.message : 'Registration failed';
                    this.toastr.error(errorMessage, 'Error');
                    this.store.dispatch(loginFailure({ error: errorMessage }));
                    throw new Error(errorMessage);
                }
            }),
            catchError((error: any) => {
                // Extract error message from response if available
                let errorMessage = 'Registration failed';
                if (error && error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else if (error && error.message) {
                    errorMessage = error.message;
                }
                this.toastr.error(errorMessage, 'Error');
                this.store.dispatch(loginFailure({ error: errorMessage }));
                return throwError(() => errorMessage);
            })
        );
    }

    login(email: string, password: string) {
        this.store.dispatch(login({ email, password }));

        return this.http.post(AUTH_API + 'log_in/', {
            email,
            password
        }, httpOptions).pipe(
            map((response: any) => {
                if (response && response.status === 200) {
                    const user = response;
                    this.store.dispatch(loginSuccess({ user }));
                    this.toastr.success('Login successful', 'Success');
                    return user;
                } else {
                    const errorMessage = response && response.message ? response.message : 'Login failed';
                    this.toastr.error(errorMessage, 'Error');
                    this.store.dispatch(loginFailure({ error: errorMessage }));
                    throw new Error(errorMessage);
                }
            }),
            catchError((error: any) => {
                let errorMessage = 'Login failed';
                if (error && error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else if (error && error.message) {
                    errorMessage = error.message;
                } else if (isString(error)) {
                    errorMessage = error;
                }
                this.toastr.error(errorMessage, 'Error');
                this.store.dispatch(loginFailure({ error: errorMessage }));
                return throwError(() => errorMessage);
            })
        );
    }

    logout(): Observable<void> {
        this.store.dispatch(logout());

        const token = localStorage.getItem('token') || '';
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            })
        };

        return this.http.post(AUTH_API + 'log_out/', {}, httpOptions).pipe(
            map((response: any) => {
                if (response && response.status === 200) {
                    this.toastr.success('Logout successful', 'Success');
                } else {
                    const errorMessage = response && response.message ? response.message : 'Logout failed';
                    this.toastr.error(errorMessage, 'Error');
                }
                return undefined;
            }),
            tap(() => {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                this.currentUserSubject.next(null!);
                this.store.dispatch(logoutSuccess());
            }),
            catchError((error: any) => {
                let errorMessage = 'Logout failed';
                if (error && error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else if (error && error.message) {
                    errorMessage = error.message;
                }
                this.toastr.error(errorMessage, 'Error');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                this.currentUserSubject.next(null!);
                this.store.dispatch(logoutSuccess());
                return of(undefined);
            })
        );
    }

    sendOTP(phone: string) {

        return this.http.post(AUTH_API + 'forget_password_email/', { phone_number: phone }, httpOptions).pipe(
            map((response: any) => {
                console.log(response);
                if (response && response.status === 200) {
                    this.toastr.success('OTP sent successfully', 'Success');
                    return response;
                } else {
                    let errorMessage = 'Failed to send OTP';
                    if (isString(response)) {
                        errorMessage = response;
                    } else if (response && response.message) {
                        errorMessage = response.message;
                    }
                    this.toastr.error(errorMessage, 'Error');
                    throw new Error(errorMessage);
                }
            }),
            catchError((error: any) => {
                let errorMessage = 'Failed to send OTP';
                if (isString(error)) {
                    errorMessage = error;
                } else if (error && error.message) {
                    errorMessage = error.message;
                }
                this.toastr.error(errorMessage, 'Error');
                throw new Error(errorMessage);
            })
        );
    }

    verifyOTP(phone: string, otp: string) {
        return this.http.post(AUTH_API + 'verify_otp/', { phone_number: phone, otp: otp }, httpOptions).pipe(
            map((response: any) => {
                console.log(response);
                if (response && response.status === 200) {
                    this.toastr.success('OTP verified successfully', 'Success');
                    return response;
                } else {
                    let errorMessage = 'Failed to verify OTP';
                    if (isString(response)) {
                        errorMessage = response;
                    } else if (response && response.message) {
                        errorMessage = response.message;
                    }
                    this.toastr.error(errorMessage, 'Error');
                    throw new Error(errorMessage);
                }
            }),
            catchError((error: any) => {
                let errorMessage = 'Failed to send OTP';
                if (isString(error)) {
                    errorMessage = error;
                } else if (error && error.message) {
                    errorMessage = error.message;
                }
                this.toastr.error(errorMessage, 'Error');
                throw new Error(errorMessage);
            })
        );
    }

    passChange(phone: String, password: String) {
        return this.http.post(AUTH_API + 'reset_password/', { phone_number: phone, password: password }, httpOptions).pipe(
            map((response: any) => {
                console.log(response);
                if (response && response.status === 200) {
                    this.toastr.success('Password changed successfully', 'Success');
                    return response;
                } else {
                    let errorMessage = 'Failed to change password';
                    if (isString(response)) {
                        errorMessage = response;
                    } else if (response && response.message) {
                        errorMessage = response.message;
                    }
                    this.toastr.error(errorMessage, 'Error');
                    throw new Error(errorMessage);
                }
            }),
            catchError((error: any) => {
                let errorMessage = 'Failed to send OTP';
                if (isString(error)) {
                    errorMessage = error;
                } else if (error && error.message) {
                    errorMessage = error.message;
                }
                this.toastr.error(errorMessage, 'Error');
                throw new Error(errorMessage);
            })
        );
    }

    /**
 * Returns the current user
 */
    public currentUser(): any {
        return getFirebaseBackend()!.getAuthenticatedUser();
    }
}
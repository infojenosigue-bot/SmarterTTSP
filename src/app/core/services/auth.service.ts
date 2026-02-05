import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, catchError, of } from 'rxjs';
import { User, AuthResponse } from '../models/chat.models';

const API_URL = 'http://srb096189:8081/api/Auth/userprofile';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        this.login();
    }

    login() {
        this.http.get<AuthResponse>(API_URL, { withCredentials: true }).pipe(
            tap(response => {
                // API returns the user object directly based on sample
                if (response && response.domainAccount) {
                    const user: User = {
                        ...response,
                        isAuthenticated: true,
                        // UI Compat mappings
                        id: response.domainAccount,
                        name: response.fullName,
                        email: response.companyEmail,
                        avatarUrl: undefined // Optional: generate avatar from name if needed
                    };
                    this.currentUserSubject.next(user);
                } else {
                    console.warn('Auth API returned unexpected format', response);
                    this.handleAuthFail();
                }
            }),
            catchError(err => {
                console.warn('Auth failed', err);
                this.handleAuthFail();
                return of(null);
            })
        ).subscribe();
    }

    private handleAuthFail() {
        // Fallback Mock User for development
        this.currentUserSubject.next({
            domainAccount: 'dev\\local',
            fullName: 'Local Developer',
            companyEmail: 'dev@local',
            department: 'Development',
            team: 'Dev Team',
            teamId: 0,
            role: 'Developer',
            employeeId: 0,
            isAuthenticated: true,
            id: 'local',
            name: 'Local Developer',
            email: 'dev@local'
        });
    }

    logout() {
        this.currentUserSubject.next(null);
    }
}

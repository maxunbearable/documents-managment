import {DestroyRef, inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, switchMap, tap} from 'rxjs';
import {AuthResponse, LoginRequest, RegisterRequest, User} from '../models';
import {environment} from '../../../shared';
import {TokenService} from '../../../shared/services';
import {Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  private tokenService = inject(TokenService);

  constructor(private http: HttpClient, private router: Router, private destroyRef: DestroyRef) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = this.tokenService.getAuthToken();
    if (token) {
      this.getCurrentUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => this.tokenService.setToken(response.access_token)),
      switchMap(() => this.getCurrentUser())
    );
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/user/register`, data).pipe(
      tap(response => this.tokenService.setToken(response.access_token)),
      switchMap(() => this.getCurrentUser())
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/user`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/user/users`);
  }

  logout(): void {
    this.tokenService.clearToken();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.tokenService.getAuthToken();
  }
}

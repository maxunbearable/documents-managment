import { DestroyRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../index';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TokenService } from './token.service';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private destroyRef: DestroyRef,
    private tokenService: TokenService,
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = this.tokenService.getAuthToken();
    if (token) {
      this.getCurrentUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => this.tokenService.setToken(response.access_token)),
    );
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/user/register`, data);
  }

  getCurrentUser(): Observable<User> {
    this.router.navigate(['/documents']);

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
}

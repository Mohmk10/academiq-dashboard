import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UtilisateurResponse
} from '../models/auth.model';
import { Role } from '../models/user.model';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API_URL = environment.apiUrl;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private notification: NotificationService
  ) {
    this.loadUserFromToken();
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/login`, request).pipe(
      tap(response => {
        if (response.success) {
          this.storeTokens(response.data);
          this.currentUserSubject.next(response.data);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/register`, request).pipe(
      tap(response => {
        if (response.success) {
          this.storeTokens(response.data);
          this.currentUserSubject.next(response.data);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  handleSessionExpired(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.notification.warning('Votre session a expire. Veuillez vous reconnecter.');
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.success) {
          this.storeTokens(response.data);
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  getProfile(): Observable<ApiResponse<UtilisateurResponse>> {
    return this.http.get<ApiResponse<UtilisateurResponse>>(`${this.API_URL}/auth/me`);
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.API_URL}/auth/change-password`, request);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  getCurrentUserRole(): Role | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = this.decodeToken(token);
      return payload.role as Role;
    } catch {
      return null;
    }
  }

  getCurrentUserName(): string {
    const user = this.currentUserSubject.value;
    if (user) return `${user.prenom} ${user.nom}`;

    const token = this.getAccessToken();
    if (!token) return '';
    try {
      const payload = this.decodeToken(token);
      return `${payload.prenom ?? ''} ${payload.nom ?? ''}`.trim();
    } catch {
      return '';
    }
  }

  hasRole(role: Role): boolean {
    const currentRole = this.getCurrentUserRole();
    if (currentRole === 'SUPER_ADMIN') return true;
    return currentRole === role;
  }

  hasAnyRole(roles: Role[]): boolean {
    const currentRole = this.getCurrentUserRole();
    if (currentRole === 'SUPER_ADMIN') return true;
    return currentRole !== null && roles.includes(currentRole);
  }

  isExactRole(role: Role): boolean {
    return this.getCurrentUserRole() === role;
  }

  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private storeTokens(auth: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, auth.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, auth.refreshToken);
  }

  private loadUserFromToken(): void {
    const token = this.getAccessToken();
    if (!token || this.isTokenExpired(token)) {
      this.isLoggedInSubject.next(false);
      return;
    }
    try {
      const payload = this.decodeToken(token);
      this.currentUserSubject.next({
        accessToken: token,
        refreshToken: this.getRefreshToken() ?? '',
        nom: payload.nom ?? '',
        prenom: payload.prenom ?? '',
        email: payload.sub ?? payload.email ?? '',
        role: payload.role ?? ''
      });
      this.isLoggedInSubject.next(true);
      this.refreshProfileFromBackend();
    } catch {
      this.isLoggedInSubject.next(false);
    }
  }

  private refreshProfileFromBackend(): void {
    this.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const current = this.currentUserSubject.value;
          if (current) {
            this.currentUserSubject.next({
              ...current,
              nom: res.data.nom ?? current.nom,
              prenom: res.data.prenom ?? current.prenom,
              email: res.data.email ?? current.email
            });
          }
        }
      },
      error: () => {}
    });
  }
}

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginResponse } from '../models/user.model';
import { UserRole } from '../models/role.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'bt_token';
  private readonly USER_KEY = 'bt_user';

  currentUser = signal<User | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

/**
   * Verifies that the backend is reachable. Returns true only when the backend
   * responds successfully. Used to block login when the backend is not running.
   * The backend exposes /health at the root (not under /api/v1).
   */
  checkBackend(): Observable<boolean> {
    const baseUrl = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
    return this.http.get<{ status: string }>(`${baseUrl}/health`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

login(credentials: { email: string; password: string; rememberMe?: boolean }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

validateSession(): Observable<boolean> {
    const token = this.getToken();
    const user = this.currentUser();

    if (!token || !user) {
      this.clearSession();
      return of(false);
    }

    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(profile => this.setSession({ token, user: { ...profile, token } })),
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  register(userData: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { password });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }

  switchRole(role: UserRole): void {
    const current = this.currentUser();
    if (current) {
      this.setSession({ token: this.getToken() || '', user: { ...current, role } });
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): UserRole | null {
    return this.currentUser()?.role || null;
  }

isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.currentUser();
    if (!token || !user) {
      this.clearSession();
      return false;
    }
    // A session is only valid if the backend can be reached. The token and
    // stored user alone are not enough — a real backend response is required.
    return true;
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    this.currentUser.set(authResult.user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      this.clearSession();
      return null;
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }

  updateProfileState(updated: Partial<User>): void {
    const current = this.currentUser();
    if (current) {
      const merged = { ...current, ...updated };
      localStorage.setItem(this.USER_KEY, JSON.stringify(merged));
      this.currentUser.set(merged);
    }
  }
}

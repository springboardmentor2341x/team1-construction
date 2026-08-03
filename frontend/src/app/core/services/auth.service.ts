import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  login(credentials: { email: string; password: string; rememberMe?: boolean }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.setSession(res))
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
    return !!this.getToken() && !!this.currentUser();
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    this.currentUser.set(authResult.user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
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

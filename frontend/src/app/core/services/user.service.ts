import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserRead } from '../models/user.model';
import { UserRole } from '../models/role.enum';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(role?: string): Observable<UserRead[]> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }

    return this.http.get<UserRead[]>(this.apiUrl, { params });
  }

  getUsersByRole(role: UserRole | string): Observable<User[]> {
    return this.getUsers(role).pipe(
      map(users => users.map(user => ({ ...user, role: user.role as UserRole })))
    );
  }

  getUserById(id: string): Observable<UserRead> {
    return this.http.get<UserRead>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, updates: Partial<UserRead>): Observable<UserRead> {
    return this.http.put<UserRead>(`${this.apiUrl}/${id}`, updates);
  }

  toggleUserStatus(id: string, active: boolean): Observable<UserRead> {
    return this.http.patch<UserRead>(`${this.apiUrl}/${id}/status`, null, { params: { active: active.toString() } });
  }
}

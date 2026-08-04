import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getProfile(): Observable<User | null> {
    return this.http.get<User>(this.apiUrl).pipe(
      tap(profile => this.authService.updateProfileState(profile))
    );
  }

  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(this.apiUrl, profileData).pipe(
      tap(updated => this.authService.updateProfileState(updated))
    );
  }

  uploadProfilePicture(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/avatar`, formData);
  }
}

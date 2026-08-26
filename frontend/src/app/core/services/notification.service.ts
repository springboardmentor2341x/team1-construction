import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  time: string;
  read: boolean;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  markRead(id: string): Observable<NotificationItem> {
    return this.http.patch<NotificationItem>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllRead(): Observable<NotificationItem[]> {
    return this.http.post<NotificationItem[]>(`${this.apiUrl}/read-all`, {});
  }

  clearAll(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}


import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface NotificationItem {
  id: string;
  userId?: string;
  projectId?: string;
  title: string;
  message?: string;
  type: string;
  notificationType: 'info' | 'warning' | 'success' | 'danger' | string;
  time: string;
  read: boolean;
  isRead: boolean;
  category: string;
  referenceModule?: string;
  referenceId?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(unreadOnly: boolean = false, typeFilter?: string): Observable<NotificationItem[]> {
    let params = new HttpParams();
    if (unreadOnly) {
      params = params.set('unread_only', 'true');
    }
    if (typeFilter && typeFilter !== 'all') {
      params = params.set('type', typeFilter);
    }

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(items => (items || []).map(n => ({
        id: n.id,
        userId: n.userId,
        projectId: n.projectId,
        title: n.title,
        message: n.message || '',
        type: n.type || 'SYSTEM',
        notificationType: n.notificationType || 'info',
        time: n.time || '',
        read: n.isRead !== undefined ? n.isRead : n.read,
        isRead: n.isRead !== undefined ? n.isRead : n.read,
        category: n.category || 'System',
        referenceModule: n.referenceModule,
        referenceId: n.referenceId,
        createdAt: n.createdAt
      }))),
      catchError(() => of([]))
    );
  }

  getUnreadCount(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(`${this.apiUrl}/unread-count`).pipe(
      catchError(() => of({ unread_count: 0 }))
    );
  }

  markRead(id: string): Observable<NotificationItem> {
    return this.http.patch<NotificationItem>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllRead(): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/read-all`, {}).pipe(
      catchError(() => this.http.post<any>(`${this.apiUrl}/read-all`, {}))
    );
  }

  clearAll(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      catchError(() => of(void 0))
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProjectSchedule } from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  getSchedulesByProject(projectId: string): Observable<ProjectSchedule[]> {
    return this.http.get<ProjectSchedule[]>(`${this.apiUrl}?projectId=${projectId}`).pipe(
      catchError(() => of([]))
    );
  }

  createSchedule(schedule: Partial<ProjectSchedule>): Observable<ProjectSchedule> {
    return this.http.post<ProjectSchedule>(this.apiUrl, schedule);
  }

  updateSchedule(id: string, updates: Partial<ProjectSchedule>): Observable<ProjectSchedule> {
    return this.http.put<ProjectSchedule>(`${this.apiUrl}/${id}`, updates);
  }

  deleteSchedule(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(false))
    );
  }
}

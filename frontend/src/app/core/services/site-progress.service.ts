import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DailyProgressReport,
  WeeklyProgressReport,
  WorkCompletionStatus,
  DelayTracking,
  SiteActivityLog,
  ProgressPhotograph,
  SiteProgressDashboard,
} from '../models/site-progress.model';

@Injectable({
  providedIn: 'root',
})
export class SiteProgressService {
  private apiUrl = `${environment.apiUrl}/site-progress`;

  constructor(private http: HttpClient) {}

  // ------------------------------------------------------------------
  // Daily Progress Reports
  // ------------------------------------------------------------------
  getDailyReports(projectId?: string): Observable<DailyProgressReport[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<DailyProgressReport[]>(`${this.apiUrl}/daily-reports`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getDailyReport(id: string): Observable<DailyProgressReport> {
    return this.http.get<DailyProgressReport>(`${this.apiUrl}/daily-reports/${id}`);
  }

  createDailyReport(report: Partial<DailyProgressReport>): Observable<DailyProgressReport> {
    return this.http.post<DailyProgressReport>(`${this.apiUrl}/daily-reports`, report);
  }

  updateDailyReport(id: string, updates: Partial<DailyProgressReport>): Observable<DailyProgressReport> {
    return this.http.put<DailyProgressReport>(`${this.apiUrl}/daily-reports/${id}`, updates);
  }

  deleteDailyReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/daily-reports/${id}`);
  }

  // ------------------------------------------------------------------
  // Weekly Progress Reports
  // ------------------------------------------------------------------
  getWeeklyReports(projectId?: string): Observable<WeeklyProgressReport[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<WeeklyProgressReport[]>(`${this.apiUrl}/weekly-reports`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getWeeklyReport(id: string): Observable<WeeklyProgressReport> {
    return this.http.get<WeeklyProgressReport>(`${this.apiUrl}/weekly-reports/${id}`);
  }

  createWeeklyReport(report: Partial<WeeklyProgressReport>): Observable<WeeklyProgressReport> {
    return this.http.post<WeeklyProgressReport>(`${this.apiUrl}/weekly-reports`, report);
  }

  deleteWeeklyReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/weekly-reports/${id}`);
  }

  // ------------------------------------------------------------------
  // Work Completion Status
  // ------------------------------------------------------------------
  getCompletionStatus(projectId?: string): Observable<WorkCompletionStatus[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<WorkCompletionStatus[]>(`${this.apiUrl}/completion-status`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  recomputeCompletion(projectId: string): Observable<WorkCompletionStatus> {
    return this.http.post<WorkCompletionStatus>(`${this.apiUrl}/completion-status/recompute/${projectId}`, {});
  }

  // ------------------------------------------------------------------
  // Milestone Tracking
  // ------------------------------------------------------------------
  getMilestoneTracking(projectId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<any[]>(`${this.apiUrl}/milestone-tracking`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  syncMilestones(projectId: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/milestone-tracking/sync/${projectId}`, {});
  }

  updateMilestone(id: string, updates: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/milestone-tracking/${id}`, updates);
  }

  // ------------------------------------------------------------------
  // Delay Tracking
  // ------------------------------------------------------------------
  getDelays(projectId?: string): Observable<DelayTracking[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<DelayTracking[]>(`${this.apiUrl}/delays`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  createDelay(delay: Partial<DelayTracking>): Observable<DelayTracking> {
    return this.http.post<DelayTracking>(`${this.apiUrl}/delays`, delay);
  }

  updateDelay(id: string, updates: Partial<DelayTracking>): Observable<DelayTracking> {
    return this.http.put<DelayTracking>(`${this.apiUrl}/delays/${id}`, updates);
  }

  deleteDelay(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delays/${id}`);
  }

  // ------------------------------------------------------------------
  // Site Activity Logs
  // ------------------------------------------------------------------
  getSiteActivityLogs(projectId?: string): Observable<SiteActivityLog[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<SiteActivityLog[]>(`${this.apiUrl}/activity-logs`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  createSiteActivityLog(log: Partial<SiteActivityLog>): Observable<SiteActivityLog> {
    return this.http.post<SiteActivityLog>(`${this.apiUrl}/activity-logs`, log);
  }

  updateSiteActivityLog(id: string, updates: Partial<SiteActivityLog>): Observable<SiteActivityLog> {
    return this.http.put<SiteActivityLog>(`${this.apiUrl}/activity-logs/${id}`, updates);
  }

  deleteSiteActivityLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/activity-logs/${id}`);
  }

  // ------------------------------------------------------------------
  // Progress Photographs
  // ------------------------------------------------------------------
  getPhotographs(reportId: string): Observable<ProgressPhotograph[]> {
    return this.http.get<ProgressPhotograph[]>(`${this.apiUrl}/photographs?reportId=${reportId}`).pipe(
      catchError(() => of([]))
    );
  }

  addPhotograph(photo: Partial<ProgressPhotograph>): Observable<ProgressPhotograph> {
    return this.http.post<ProgressPhotograph>(`${this.apiUrl}/photographs`, photo);
  }

  deletePhotograph(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/photographs/${id}`);
  }

  // ------------------------------------------------------------------
  // Dashboard
  // ------------------------------------------------------------------
  getDashboard(projectId: string): Observable<SiteProgressDashboard> {
    return this.http.get<SiteProgressDashboard>(`${this.apiUrl}/dashboard?projectId=${projectId}`).pipe(
      catchError(() => of({} as SiteProgressDashboard))
    );
  }

  // ------------------------------------------------------------------
  // Meta data (dropdown values)
  // ------------------------------------------------------------------
  getProgressCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/meta/progress-categories`).pipe(
      catchError(() => of([]))
    );
  }

  getActivityEventTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/meta/activity-event-types`).pipe(
      catchError(() => of([]))
    );
  }
}

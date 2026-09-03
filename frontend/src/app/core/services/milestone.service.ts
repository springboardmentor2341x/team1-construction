import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Milestone } from '../models/milestone.model';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {
  private apiUrl = `${environment.apiUrl}/milestones`;

  constructor(private http: HttpClient) {}

  getMilestonesByProject(projectId: string): Observable<Milestone[]> {
    return this.http.get<Milestone[]>(`${this.apiUrl}?projectId=${projectId}`).pipe(
      catchError(() => of([]))
    );
  }

  createMilestone(milestone: Partial<Milestone>): Observable<Milestone> {
    return this.http.post<Milestone>(this.apiUrl, milestone);
  }

  updateMilestone(id: string, updates: Partial<Milestone>): Observable<Milestone> {
    return this.http.put<Milestone>(`${this.apiUrl}/${id}`, updates);
  }

  deleteMilestone(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(false))
    );
  }
}

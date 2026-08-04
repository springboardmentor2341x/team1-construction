import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getProjects(search?: string, category?: string, priority?: string, status?: string): Observable<Project[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    if (priority) params = params.set('priority', priority);
    if (status) params = params.set('status', status);

    return this.http.get<Project[]>(this.apiUrl, { params }).pipe(
      catchError(() => {
        throw new Error('Backend unavailable');
      })
    );
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }

  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: string, updates: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, updates);
  }

  deleteProject(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}

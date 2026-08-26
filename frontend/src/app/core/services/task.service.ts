import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  project: string;
  assignedTo: string;
  priority: string;
  status: string;
  dueDate: string;
  location?: string;
  progress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

createTask(task: Partial<TaskItem>): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, task);
  }

  updateTaskStatus(id: string, status: string): Observable<TaskItem> {
    return this.http.patch<TaskItem>(`${this.apiUrl}/${id}`, { status });
  }
}

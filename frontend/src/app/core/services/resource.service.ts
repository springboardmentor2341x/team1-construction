import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Resource {
  id: string;
  name: string;
  resource_type: string;
  project_id?: string;
  status: string;
  utilization_percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiUrl = `${environment.apiUrl}/resources`;

  constructor(private http: HttpClient) {}

  getResources(projectId?: string): Observable<Resource[]> {
    let url = this.apiUrl;
    if (projectId) {
      url += `?project_id=${projectId}`;
    }
    return this.http.get<Resource[]>(url);
  }

  createResource(data: Partial<Resource>): Observable<Resource> {
    return this.http.post<Resource>(this.apiUrl, data);
  }

  updateResource(id: string, data: Partial<Resource>): Observable<Resource> {
    return this.http.put<Resource>(`${this.apiUrl}/${id}`, data);
  }

  deleteResource(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

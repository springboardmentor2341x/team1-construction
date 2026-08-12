import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ContractorWorker {
  id: string;
  contractorId: string;
  workerId: string;
  workerName: string;
  workerEmail: string;
  trade?: string;
  employeeId?: string;
  projectId?: string;
  projectName?: string;
  assignedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContractorService {
  private apiUrl = `${environment.apiUrl}/contractors`;

  constructor(private http: HttpClient) {}

  getAssignedWorkers(contractorId: string): Observable<ContractorWorker[]> {
    return this.http.get<ContractorWorker[]>(`${this.apiUrl}/${contractorId}/workers`);
  }

  assignWorker(contractorId: string, workerId: string, projectId?: string): Observable<ContractorWorker> {
    return this.http.post<ContractorWorker>(`${this.apiUrl}/${contractorId}/workers`, { workerId, projectId });
  }

  removeWorker(contractorId: string, workerId: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${contractorId}/workers/${workerId}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}

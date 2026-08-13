import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProcurementRequest {
  id: string;
  title: string;
  supplier?: string;
  material_name?: string;
  expected_delivery_date?: string;
  po_number?: string;
  amount: number;
  project_id?: string;
  material_id?: string;
  quantity: number;
  status: string;
  requested_by?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProcurementService {
  private apiUrl = `${environment.apiUrl}/procurements`;

  constructor(private http: HttpClient) {}

  getProcurements(projectId?: string): Observable<ProcurementRequest[]> {
    let url = this.apiUrl;
    if (projectId) {
      url += `?project_id=${projectId}`;
    }
    return this.http.get<ProcurementRequest[]>(url);
  }

  createProcurement(data: Partial<ProcurementRequest>): Observable<ProcurementRequest> {
    return this.http.post<ProcurementRequest>(this.apiUrl, data);
  }

  updateProcurement(id: string, data: Partial<ProcurementRequest>): Observable<ProcurementRequest> {
    return this.http.put<ProcurementRequest>(`${this.apiUrl}/${id}`, data);
  }

  issuePO(id: string): Observable<ProcurementRequest> {
    return this.http.put<ProcurementRequest>(`${this.apiUrl}/${id}/issue-po`, {});
  }

  markReceived(id: string): Observable<ProcurementRequest> {
    return this.http.put<ProcurementRequest>(`${this.apiUrl}/${id}/mark-received`, {});
  }

  deleteProcurement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

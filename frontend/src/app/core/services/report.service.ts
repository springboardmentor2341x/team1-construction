import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProjectProgressReport {
  project_id: string;
  project_code: string;
  project_name: string;
  category: string;
  status: string;
  start_date?: string;
  expected_completion_date?: string;
  overall_progress: number;
  project_manager_name: string;
  total_milestones: number;
  completed_milestones: number;
  pending_milestones: number;
  delayed_milestones: number;
  milestone_velocity: number;
  milestones: any[];
  daily_reports_count: number;
  weekly_reports_count: number;
  delay_incidents_count: number;
  recent_daily_reports: any[];
  delay_incidents: any[];
}

export interface ResourceUtilizationReport {
  project_id: string;
  project_code: string;
  project_name: string;
  total_allocated_equipment: number;
  active_equipment_count: number;
  available_equipment_count: number;
  maintenance_count: number;
  utilization_rate_percentage: number;
  allocated_resources: any[];
  equipment_fleet: any[];
}

export interface WorkforceReport {
  project_id: string;
  project_code: string;
  project_name: string;
  total_assigned_workers: number;
  present_today_count: number;
  absent_today_count: number;
  attendance_rate_percentage: number;
  attendance_status: string;
  assigned_workers: any[];
  recent_attendance: any[];
  payroll_summary: any[];
}

export interface ProcurementReport {
  project_id: string;
  project_code: string;
  project_name: string;
  total_requests: number;
  pending_approval_count: number;
  approved_requests_count: number;
  purchase_orders_count: number;
  purchase_orders_total_amount: number;
  total_invoices_count: number;
  requests: any[];
  purchase_orders: any[];
}

export interface BudgetReport {
  project_id: string;
  project_code: string;
  project_name: string;
  estimated_budget: number;
  total_procurement_spent: number;
  total_purchase_orders_spent: number;
  utilized_budget: number;
  remaining_budget: number;
  utilization_percentage: number;
  budget_status: string;
  purchase_order_expenses: any[];
  module_11_notice: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getProjectProgressReport(projectId: string, statusFilter?: string, search?: string): Observable<ProjectProgressReport> {
    let params = new HttpParams();
    if (statusFilter && statusFilter !== 'All') params = params.set('statusFilter', statusFilter);
    if (search) params = params.set('search', search);
    return this.http.get<ProjectProgressReport>(`${this.apiUrl}/projects/${projectId}/progress`, { params });
  }

  getResourceUtilizationReport(projectId: string, statusFilter?: string, search?: string): Observable<ResourceUtilizationReport> {
    let params = new HttpParams();
    if (statusFilter && statusFilter !== 'All') params = params.set('statusFilter', statusFilter);
    if (search) params = params.set('search', search);
    return this.http.get<ResourceUtilizationReport>(`${this.apiUrl}/projects/${projectId}/resources`, { params });
  }

  getWorkforceReport(projectId: string, statusFilter?: string, search?: string): Observable<WorkforceReport> {
    let params = new HttpParams();
    if (statusFilter && statusFilter !== 'All') params = params.set('statusFilter', statusFilter);
    if (search) params = params.set('search', search);
    return this.http.get<WorkforceReport>(`${this.apiUrl}/projects/${projectId}/workforce`, { params });
  }

  getProcurementReport(projectId: string, statusFilter?: string, search?: string): Observable<ProcurementReport> {
    let params = new HttpParams();
    if (statusFilter && statusFilter !== 'All') params = params.set('statusFilter', statusFilter);
    if (search) params = params.set('search', search);
    return this.http.get<ProcurementReport>(`${this.apiUrl}/projects/${projectId}/procurement`, { params });
  }

  getBudgetReport(projectId: string, statusFilter?: string, search?: string): Observable<BudgetReport> {
    let params = new HttpParams();
    if (statusFilter && statusFilter !== 'All') params = params.set('statusFilter', statusFilter);
    if (search) params = params.set('search', search);
    return this.http.get<BudgetReport>(`${this.apiUrl}/projects/${projectId}/budget`, { params });
  }

  downloadPdfReport(projectId: string, reportType: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/projects/${projectId}/${reportType}/pdf`, {
      responseType: 'blob'
    });
  }

  downloadExcelReport(projectId: string, reportType: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/projects/${projectId}/${reportType}/excel`, {
      responseType: 'blob'
    });
  }
}

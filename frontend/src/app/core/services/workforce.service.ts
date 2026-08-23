import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  WorkforceCategory,
  Worker,
  PaginatedWorkersResponse,
  WorkerBulkImportItem,
  WorkerBulkImportResult,
  WorkerProjectAssignment,
  WorkerTransferRequest,
  Shift,
  Attendance,
  AttendanceSummary,
  ShiftAttendanceComparison,
  WorkforcePayroll,
  WorkforcePayrollSummary,
  WorkforceDashboardStats,
} from '../models/workforce.model';

@Injectable({
  providedIn: 'root'
})
export class WorkforceService {
  private apiUrl = `${environment.apiUrl}/workforce`;

  constructor(private http: HttpClient) {}

  // --- Categories ---
  getCategories(): Observable<WorkforceCategory[]> {
    return this.http.get<WorkforceCategory[]>(`${this.apiUrl}/categories`);
  }

  // --- Workers ---
  getWorkers(filters?: {
    search?: string;
    categoryId?: string;
    contractorId?: string;
    projectId?: string;
    workerStatus?: string;
    skill?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedWorkersResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
      if (filters.contractorId) params = params.set('contractorId', filters.contractorId);
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.workerStatus) params = params.set('workerStatus', filters.workerStatus);
      if (filters.skill) params = params.set('skill', filters.skill);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }
    return this.http.get<PaginatedWorkersResponse>(`${this.apiUrl}/workers`, { params });
  }

  getWorkerById(id: string): Observable<Worker> {
    return this.http.get<Worker>(`${this.apiUrl}/workers/${id}`);
  }

  createWorker(workerData: Partial<Worker>): Observable<Worker> {
    return this.http.post<Worker>(`${this.apiUrl}/workers`, workerData);
  }

  updateWorker(id: string, workerData: Partial<Worker>): Observable<Worker> {
    return this.http.put<Worker>(`${this.apiUrl}/workers/${id}`, workerData);
  }

  changeWorkerStatus(id: string, workerStatus: string): Observable<Worker> {
    return this.http.put<Worker>(`${this.apiUrl}/workers/${id}/status`, { workerStatus });
  }

  bulkImportWorkers(workers: WorkerBulkImportItem[]): Observable<WorkerBulkImportResult> {
    return this.http.post<WorkerBulkImportResult>(`${this.apiUrl}/workers/bulk-import`, { workers });
  }

  // --- Assignments ---
  getAssignments(filters?: { projectId?: string; contractorId?: string; workerId?: string; assignmentStatus?: string }): Observable<WorkerProjectAssignment[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.contractorId) params = params.set('contractorId', filters.contractorId);
      if (filters.workerId) params = params.set('workerId', filters.workerId);
      if (filters.assignmentStatus) params = params.set('assignmentStatus', filters.assignmentStatus);
    }
    return this.http.get<WorkerProjectAssignment[]>(`${this.apiUrl}/assignments`, { params });
  }

  createAssignment(data: Partial<WorkerProjectAssignment>): Observable<WorkerProjectAssignment> {
    return this.http.post<WorkerProjectAssignment>(`${this.apiUrl}/assignments`, data);
  }

  transferWorker(assignmentId: string, req: WorkerTransferRequest): Observable<WorkerProjectAssignment> {
    return this.http.post<WorkerProjectAssignment>(`${this.apiUrl}/assignments/${assignmentId}/transfer`, req);
  }

  getWorkerAssignmentHistory(workerId: string): Observable<WorkerProjectAssignment[]> {
    return this.http.get<WorkerProjectAssignment[]>(`${this.apiUrl}/assignments/history/${workerId}`);
  }

  // --- Shifts ---
  getShifts(filters?: { projectId?: string; shiftDate?: string; shiftStatus?: string }): Observable<Shift[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.shiftDate) params = params.set('shiftDate', filters.shiftDate);
      if (filters.shiftStatus) params = params.set('shiftStatus', filters.shiftStatus);
    }
    return this.http.get<Shift[]>(`${this.apiUrl}/shifts`, { params });
  }

  createShift(shiftData: { shiftName: string; startTime: string; endTime: string; projectId?: string; shiftDate: string; shiftStatus?: string; location?: string; assignedWorkerIds?: string[] }): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/shifts`, shiftData);
  }

  updateShift(id: string, shiftData: Partial<Shift>): Observable<Shift> {
    return this.http.put<Shift>(`${this.apiUrl}/shifts/${id}`, shiftData);
  }

  assignWorkersToShift(shiftId: string, workerIds: string[]): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/shifts/${shiftId}/workers`, { workerIds });
  }

  removeWorkerFromShift(shiftId: string, workerId: string): Observable<Shift> {
    return this.http.delete<Shift>(`${this.apiUrl}/shifts/${shiftId}/workers/${workerId}`);
  }

  // --- Attendance ---
  getAttendance(filters?: { projectId?: string; contractorId?: string; attendanceDate?: string; categoryId?: string; workerId?: string }): Observable<Attendance[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.contractorId) params = params.set('contractorId', filters.contractorId);
      if (filters.attendanceDate) params = params.set('attendanceDate', filters.attendanceDate);
      if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
      if (filters.workerId) params = params.set('workerId', filters.workerId);
    }
    return this.http.get<Attendance[]>(`${this.apiUrl}/attendance`, { params });
  }

  createAttendance(data: Partial<Attendance>): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/attendance`, data);
  }

  updateAttendance(id: string, data: Partial<Attendance>): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.apiUrl}/attendance/${id}`, data);
  }

  getAttendanceSummary(filters?: { projectId?: string; contractorId?: string; attendanceDate?: string; categoryId?: string }): Observable<AttendanceSummary> {
    let params = new HttpParams();
    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.contractorId) params = params.set('contractorId', filters.contractorId);
      if (filters.attendanceDate) params = params.set('attendanceDate', filters.attendanceDate);
      if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    }
    return this.http.get<AttendanceSummary>(`${this.apiUrl}/attendance/summary`, { params });
  }

  getShiftAttendanceComparison(projectId: string, shiftDate: string): Observable<ShiftAttendanceComparison[]> {
    const params = new HttpParams().set('projectId', projectId).set('shiftDate', shiftDate);
    return this.http.get<ShiftAttendanceComparison[]>(`${this.apiUrl}/attendance/shift-comparison`, { params });
  }

  // --- Payroll ---
  getPayrolls(filters?: { projectId?: string; workerId?: string; payrollStatus?: string }): Observable<WorkforcePayroll[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.workerId) params = params.set('workerId', filters.workerId);
      if (filters.payrollStatus) params = params.set('payrollStatus', filters.payrollStatus);
    }
    return this.http.get<WorkforcePayroll[]>(`${this.apiUrl}/payroll`, { params });
  }

  createOrUpdatePayroll(data: Partial<WorkforcePayroll>): Observable<WorkforcePayroll> {
    return this.http.post<WorkforcePayroll>(`${this.apiUrl}/payroll`, data);
  }

  updatePayrollStatus(id: string, status: string): Observable<WorkforcePayroll> {
    const params = new HttpParams().set('status', status);
    return this.http.put<WorkforcePayroll>(`${this.apiUrl}/payroll/${id}/status`, {}, { params });
  }

  getPayrollSummary(projectId?: string): Observable<WorkforcePayrollSummary> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<WorkforcePayrollSummary>(`${this.apiUrl}/payroll/summary`, { params });
  }

  // --- Dashboard ---
  getDashboardStats(projectId?: string, contractorId?: string): Observable<WorkforceDashboardStats> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    if (contractorId) params = params.set('contractorId', contractorId);
    return this.http.get<WorkforceDashboardStats>(`${this.apiUrl}/dashboard`, { params });
  }
}

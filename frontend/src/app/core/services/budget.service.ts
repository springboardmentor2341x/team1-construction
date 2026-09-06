import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoryAllocation {
  id?: string;
  category: string;
  allocated_amount: number;
  notes?: string;
}

export interface ProjectBudget {
  id: string;
  project_id: string;
  overall_budget: number;
  currency: string;
  notes?: string;
  allocations: CategoryAllocation[];
  created_at?: string;
  updated_at?: string;
}

export interface CostEstimate {
  id: string;
  estimate_code: string;
  project_id: string;
  category: string;
  amount: number;
  description: string;
  task_reference?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ActualExpense {
  id: string;
  expense_code: string;
  project_id: string;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  source_reference?: string;
  worker_id?: string;
  worker_name?: string;
  material_id?: string;
  material_name?: string;
  equipment_id?: string;
  equipment_name?: string;
  purchase_order_id?: string;
  po_number?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryComparison {
  category: string;
  planned_amount: number;
  estimated_amount: number;
  actual_amount: number;
  remaining_amount: number;
  utilization_percentage: number;
}

export interface ProjectFinancialSummary {
  project_id: string;
  project_code: string;
  project_name: string;
  planned_budget: number;
  total_estimated_cost: number;
  total_actual_cost: number;
  remaining_budget: number;
  budget_utilization_percentage: number;
  estimated_variance: number;
  actual_variance: number;
  budget_status: string;
  category_summaries: CategoryComparison[];
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = `${environment.apiUrl}/budget`;

  constructor(private http: HttpClient) {}

  getProjectBudget(projectId: string): Observable<ProjectBudget> {
    return this.http.get<ProjectBudget>(`${this.apiUrl}/projects/${projectId}`);
  }

  saveProjectBudget(projectId: string, data: { overall_budget: number; currency?: string; notes?: string; category_allocations: CategoryAllocation[] }): Observable<ProjectBudget> {
    return this.http.post<ProjectBudget>(`${this.apiUrl}/projects/${projectId}`, data);
  }

  getFinancialSummary(projectId: string): Observable<ProjectFinancialSummary> {
    return this.http.get<ProjectFinancialSummary>(`${this.apiUrl}/projects/${projectId}/summary`);
  }

  getCostEstimates(projectId: string, category?: string): Observable<CostEstimate[]> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<CostEstimate[]>(`${this.apiUrl}/projects/${projectId}/estimates`, { params });
  }

  createCostEstimate(projectId: string, data: { category: string; amount: number; description: string; task_reference?: string }): Observable<CostEstimate> {
    return this.http.post<CostEstimate>(`${this.apiUrl}/projects/${projectId}/estimates`, data);
  }

  updateCostEstimate(estimateId: string, data: { category?: string; amount?: number; description?: string; task_reference?: string }): Observable<CostEstimate> {
    return this.http.put<CostEstimate>(`${this.apiUrl}/estimates/${estimateId}`, data);
  }

  deleteCostEstimate(estimateId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/estimates/${estimateId}`);
  }

  getActualExpenses(projectId: string, category?: string): Observable<ActualExpense[]> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<ActualExpense[]>(`${this.apiUrl}/projects/${projectId}/expenses`, { params });
  }

  createActualExpense(projectId: string, data: any): Observable<ActualExpense> {
    return this.http.post<ActualExpense>(`${this.apiUrl}/projects/${projectId}/expenses`, data);
  }

  updateActualExpense(expenseId: string, data: any): Observable<ActualExpense> {
    return this.http.put<ActualExpense>(`${this.apiUrl}/expenses/${expenseId}`, data);
  }

  deleteActualExpense(expenseId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${expenseId}`);
  }
}

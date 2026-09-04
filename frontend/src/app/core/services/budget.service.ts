import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CostCategory,
  ProjectBudget,
  BudgetAllocation,
  CostEstimate,
  ProjectExpense,
  FinancialSummary,
  BudgetCreate,
  BudgetUpdate,
  BudgetAllocationCreate,
  BudgetAllocationUpdate,
  CostEstimateCreate,
  CostEstimateUpdate,
  ExpenseCreate,
  ExpenseUpdate
} from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = `${environment.apiUrl}/budget`;

  constructor(private http: HttpClient) {}

  // ========================================
  // Cost Categories
  // ========================================
  getCategories(): Observable<CostCategory[]> {
    return this.http.get<CostCategory[]>(`${this.apiUrl}/categories`).pipe(
      catchError(() => of([]))
    );
  }

  // ========================================
  // Budget Management
  // ========================================
  createBudget(data: BudgetCreate): Observable<ProjectBudget> {
    return this.http.post<ProjectBudget>(`${this.apiUrl}/budgets`, data);
  }

  getProjectBudget(projectId: string): Observable<ProjectBudget> {
    return this.http.get<ProjectBudget>(`${this.apiUrl}/budgets/${projectId}`).pipe(
      catchError(() => of(null as any))
    );
  }

  updateBudget(projectId: string, data: BudgetUpdate): Observable<ProjectBudget> {
    return this.http.put<ProjectBudget>(`${this.apiUrl}/budgets/${projectId}`, data);
  }

  // ========================================
  // Budget Allocations
  // ========================================
  createBudgetAllocation(projectId: string, data: BudgetAllocationCreate): Observable<BudgetAllocation> {
    return this.http.post<BudgetAllocation>(`${this.apiUrl}/budgets/${projectId}/allocations`, data);
  }

  updateBudgetAllocation(allocationId: string, data: BudgetAllocationUpdate): Observable<BudgetAllocation> {
    return this.http.put<BudgetAllocation>(`${this.apiUrl}/allocations/${allocationId}`, data);
  }

  deleteBudgetAllocation(allocationId: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/allocations/${allocationId}`).pipe(
      catchError(() => of(false)),
      map(() => true)
    );
  }

  // ========================================
  // Cost Estimates
  // ========================================
  createCostEstimate(data: CostEstimateCreate): Observable<CostEstimate> {
    return this.http.post<CostEstimate>(`${this.apiUrl}/estimates`, data);
  }

  getProjectEstimates(projectId: string): Observable<CostEstimate[]> {
    return this.http.get<CostEstimate[]>(`${this.apiUrl}/estimates?projectId=${projectId}`).pipe(
      catchError(() => of([]))
    );
  }

  getCostEstimateById(estimateId: string): Observable<CostEstimate> {
    return this.http.get<CostEstimate>(`${this.apiUrl}/estimates/${estimateId}`).pipe(
      catchError(() => of(null as any))
    );
  }

  updateCostEstimate(estimateId: string, data: CostEstimateUpdate): Observable<CostEstimate> {
    return this.http.put<CostEstimate>(`${this.apiUrl}/estimates/${estimateId}`, data);
  }

  deleteCostEstimate(estimateId: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/estimates/${estimateId}`).pipe(
      catchError(() => of(false)),
      map(() => true)
    );
  }

  // ========================================
  // Expenses
  // ========================================
  createExpense(data: ExpenseCreate): Observable<ProjectExpense> {
    return this.http.post<ProjectExpense>(`${this.apiUrl}/expenses`, data);
  }

  getProjectExpenses(projectId: string): Observable<ProjectExpense[]> {
    return this.http.get<ProjectExpense[]>(`${this.apiUrl}/expenses?projectId=${projectId}`).pipe(
      catchError(() => of([]))
    );
  }

  getExpenseById(expenseId: string): Observable<ProjectExpense> {
    return this.http.get<ProjectExpense>(`${this.apiUrl}/expenses/${expenseId}`).pipe(
      catchError(() => of(null as any))
    );
  }

  updateExpense(expenseId: string, data: ExpenseUpdate): Observable<ProjectExpense> {
    return this.http.put<ProjectExpense>(`${this.apiUrl}/expenses/${expenseId}`, data);
  }

  deleteExpense(expenseId: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${expenseId}`).pipe(
      catchError(() => of(false)),
      map(() => true)
    );
  }

  // ========================================
  // Financial Summary
  // ========================================
  getFinancialSummary(projectId: string): Observable<FinancialSummary> {
    return this.http.get<FinancialSummary>(`${this.apiUrl}/summary/${projectId}`).pipe(
      catchError(() => of(null as any))
    );
  }
}

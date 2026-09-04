import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { BudgetService } from '../../../core/services/budget.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { FinancialSummary } from '../../../core/models/budget.model';
import { Project } from '../../../core/models/project.model';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-budget-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <!-- Page Header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-warning text-dark px-2 py-1 uppercase fw-bold">Module 11</span>
                <h2 class="fw-bold text-dark mb-0">Budget & Cost Management Dashboard</h2>
              </div>
              <p class="text-muted small mb-0">Real-time financial oversight with budget tracking, cost estimation, and expense monitoring.</p>
            </div>
          </div>

          <!-- Project Filter Bar -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-6">
                <label class="form-label small fw-bold text-muted mb-1">Select Project for Financial Overview</label>
                <select class="form-select" [(ngModel)]="selectedProjectId" (change)="loadFinancialSummary()">
                  <option value="">-- Select Project --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted mt-2 small">Loading financial data...</p>
          </div>

          <!-- No Project Selected State -->
          <div *ngIf="!loading && !selectedProjectId" class="text-center py-5">
            <div class="card card-custom border-0 p-5">
              <i class="bi bi-wallet2 fs-1 text-warning d-block mb-3"></i>
              <h5 class="fw-bold text-dark mb-2">Select a Project to View Financial Summary</h5>
              <p class="text-muted small">Choose a project from the dropdown above to see its budget, costs, and financial metrics.</p>
            </div>
          </div>

          <!-- Financial Summary Dashboard -->
          <div *ngIf="!loading && selectedProjectId && summary">
            <!-- Top Financial Metrics Row -->
            <div class="row g-3 mb-4">
              <div class="col-xl-3 col-md-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Total Budget</span>
                      <h3 class="fw-bold text-primary mb-0 mt-1">\${{ summary.totalBudget | number }}</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-primary-subtle text-primary fs-4">
                      <i class="bi bi-wallet-fill"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">Approved project budget</div>
                </div>
              </div>

              <div class="col-xl-3 col-md-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Total Estimated Cost</span>
                      <h3 class="fw-bold text-info mb-0 mt-1">\${{ summary.totalEstimatedCost | number }}</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-info-subtle text-info fs-4">
                      <i class="bi bi-calculator-fill"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">Sum of cost estimates</div>
                </div>
              </div>

              <div class="col-xl-3 col-md-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Actual Amount Spent</span>
                      <h3 class="fw-bold text-danger mb-0 mt-1">\${{ summary.actualAmountSpent | number }}</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-danger-subtle text-danger fs-4">
                      <i class="bi bi-cash-coin"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">Total recorded expenses</div>
                </div>
              </div>

              <div class="col-xl-3 col-md-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Remaining Budget</span>
                      <h3 class="fw-bold text-success mb-0 mt-1">\${{ summary.remainingBudget | number }}</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-success-subtle text-success fs-4">
                      <i class="bi bi-piggy-bank-fill"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">Budget - Actual Spent</div>
                </div>
              </div>
            </div>

            <!-- Budget Utilization & Category Breakdown -->
            <div class="row g-4 mb-4">
              <!-- Budget Utilization Card -->
              <div class="col-lg-4">
                <div class="card card-custom border-0 p-4 h-100">
                  <h5 class="fw-bold text-dark mb-3"><i class="bi bi-graph-up-arrow me-2 text-warning"></i> Budget Utilization</h5>
                  <div class="text-center mb-3">
                    <div class="display-4 fw-bold" [ngClass]="getUtilizationColorClass()">
                      {{ summary.budgetUtilizationPercentage !== null ? summary.budgetUtilizationPercentage?.toFixed(1) : 'N/A' }}%
                    </div>
                    <div class="text-muted small">of total budget utilized</div>
                  </div>
                  <div class="progress mb-2" style="height: 20px;">
                    <div class="progress-bar" 
                         [ngClass]="getUtilizationBarClass()"
                         [style.width.%]="summary.budgetUtilizationPercentage || 0"></div>
                  </div>
                  <div class="d-flex justify-content-between extra-small text-muted">
                    <span>\${{ summary.actualAmountSpent | number }} spent</span>
                    <span>of \${{ summary.totalBudget | number }} budget</span>
                  </div>
                </div>
              </div>

              <!-- Category-wise Breakdown -->
              <div class="col-lg-8">
                <div class="card card-custom border-0 p-4 h-100">
                  <h5 class="fw-bold text-dark mb-3"><i class="bi bi-tags-fill me-2 text-warning"></i> Category-wise Financial Breakdown</h5>
                  <div class="table-responsive">
                    <table class="table table-hover align-middle small">
                      <thead class="table-light text-muted">
                        <tr>
                          <th>Category</th>
                          <th>Budget Allocated</th>
                          <th>Estimated Cost</th>
                          <th>Actual Expense</th>
                          <th>Remaining</th>
                          <th>Utilization</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let cat of summary.categoryBreakdown">
                          <td class="fw-semibold text-dark">{{ cat.categoryName }}</td>
                          <td>\${{ cat.budgetAllocated | number }}</td>
                          <td>\${{ cat.estimatedCost | number }}</td>
                          <td>\${{ cat.actualExpense | number }}</td>
                          <td [ngClass]="cat.remainingBudget >= 0 ? 'text-success' : 'text-danger'">
                            \${{ cat.remainingBudget | number }}
                          </td>
                          <td>
                            <div class="d-flex align-items-center gap-2">
                              <div class="progress flex-grow-1" style="height: 6px;">
                                <div class="progress-bar" 
                                     [ngClass]="getCategoryUtilizationBarClass(cat.utilizationPercentage)"
                                     [style.width.%]="cat.utilizationPercentage || 0"></div>
                              </div>
                              <span class="small fw-bold">{{ cat.utilizationPercentage !== null ? cat.utilizationPercentage?.toFixed(1) : 'N/A' }}%</span>
                            </div>
                          </td>
                        </tr>
                        <tr *ngIf="summary.categoryBreakdown.length === 0">
                          <td colspan="6" class="text-center py-3 text-muted">No category breakdown data available</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="card card-custom border-0 p-4">
              <h5 class="fw-bold text-dark mb-3"><i class="bi bi-lightning-fill me-2 text-warning"></i> Quick Actions</h5>
              <div class="row g-3">
                <div class="col-md-3">
                  <a [routerLink]="['/budget/planning']" [queryParams]="{projectId: selectedProjectId}" 
                     class="btn btn-outline-warning w-100 d-flex align-items-center justify-content-center gap-2">
                    <i class="bi bi-pencil-square"></i> Manage Budget
                  </a>
                </div>
                <div class="col-md-3">
                  <a [routerLink]="['/budget/estimates']" [queryParams]="{projectId: selectedProjectId}"
                     class="btn btn-outline-info w-100 d-flex align-items-center justify-content-center gap-2">
                    <i class="bi bi-calculator"></i> Cost Estimates
                  </a>
                </div>
                <div class="col-md-3">
                  <a [routerLink]="['/budget/expenses']" [queryParams]="{projectId: selectedProjectId}"
                     class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
                    <i class="bi bi-receipt"></i> Expenses
                  </a>
                </div>
                <div class="col-md-3">
                  <a [routerLink]="['/budget/monitoring']" [queryParams]="{projectId: selectedProjectId}"
                     class="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2">
                    <i class="bi bi-graph-up"></i> Budget Monitoring
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.76rem; }
    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class BudgetDashboardComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  summary: FinancialSummary | null = null;
  loading = false;

  UserRole = UserRole;

  constructor(
    private budgetService: BudgetService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  loadFinancialSummary(): void {
    if (!this.selectedProjectId) {
      this.summary = null;
      return;
    }

    this.loading = true;
    this.budgetService.getFinancialSummary(this.selectedProjectId).subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => {
        this.summary = null;
        this.loading = false;
      }
    });
  }

  getUtilizationColorClass(): string {
    if (!this.summary || this.summary.budgetUtilizationPercentage === null) return 'text-muted';
    const pct = this.summary.budgetUtilizationPercentage;
    if (pct !== undefined && pct >= 90) return 'text-danger';
    if (pct !== undefined && pct >= 70) return 'text-warning';
    return 'text-success';
  }

  getUtilizationBarClass(): string {
    if (!this.summary || this.summary.budgetUtilizationPercentage === null) return 'bg-secondary';
    const pct = this.summary.budgetUtilizationPercentage;
    if (pct !== undefined && pct >= 90) return 'bg-danger';
    if (pct !== undefined && pct >= 70) return 'bg-warning';
    return 'bg-success';
  }

  getCategoryUtilizationBarClass(percentage?: number): string {
    if (percentage === null || percentage === undefined) return 'bg-secondary';
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  }
}

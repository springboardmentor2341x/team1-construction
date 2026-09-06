import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../core/services/project.service';
import { BudgetService, ProjectFinancialSummary } from '../../core/services/budget.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-budget-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <!-- Sidebar Navigation -->
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <!-- Main Content Area -->
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          
          <!-- Top Title & Action Header -->
          <div class="card card-custom mb-4 border-0 shadow-sm bg-dark text-white">
            <div class="card-body p-4 d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3">
              <div class="d-flex align-items-center gap-3">
                <div class="stat-icon-wrapper bg-warning text-dark rounded-3 flex-shrink-0">
                  <i class="bi bi-cash-coin fs-3"></i>
                </div>
                <div>
                  <h2 class="mb-1 text-white fw-bold fs-3">Budget & Cost Management Dashboard</h2>
                  <p class="text-secondary mb-0 small">Real-Time PostgreSQL Financial Tracking, Cost Estimation & Expense Monitoring</p>
                </div>
              </div>

              <!-- Project Selector Dropdown -->
              <div class="d-flex align-items-center gap-2 bg-white bg-opacity-10 p-2 rounded-3">
                <label class="text-white small fw-bold text-nowrap mb-0 ms-1">Project:</label>
                <select 
                  class="form-select form-select-sm border-0 fw-semibold text-dark shadow-none style-select"
                  [(ngModel)]="selectedProjectId"
                  (change)="onProjectChange()">
                  <option *ngFor="let proj of projects" [value]="proj.id">
                    {{ proj.projectName }} ({{ proj.projectCode }})
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Alert / Access Error Banner -->
          <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 shadow-sm mb-4" role="alert">
            <i class="bi bi-exclamation-octagon-fill fs-4"></i>
            <div>{{ errorMessage }}</div>
          </div>

          <!-- Module Navigation Quick Links -->
          <div class="d-flex flex-wrap gap-2 mb-4">
            <a routerLink="/budget/planning" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-sliders"></i> Budget Planning
            </a>
            <a routerLink="/budget/estimates" class="btn btn-outline-dark d-flex align-items-center gap-2 bg-white shadow-sm">
              <i class="bi bi-calculator"></i> Cost Estimates
            </a>
            <a routerLink="/budget/expenses" class="btn btn-outline-dark d-flex align-items-center gap-2 bg-white shadow-sm">
              <i class="bi bi-receipt"></i> Actual Expenses
            </a>
            <a routerLink="/budget/monitoring" class="btn btn-outline-dark d-flex align-items-center gap-2 bg-white shadow-sm">
              <i class="bi bi-graph-up-arrow"></i> Financial Monitoring
            </a>
            <a routerLink="/reports" class="btn btn-outline-secondary d-flex align-items-center gap-2 bg-white ms-auto shadow-sm">
              <i class="bi bi-file-earmark-pdf"></i> Budget Reports
            </a>
          </div>

          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status">
              <span class="visually-hidden">Loading financial data...</span>
            </div>
            <p class="text-muted small mt-2">Computing live financial summary from database...</p>
          </div>

          <ng-container *ngIf="!isLoading && summary">
            <!-- Top KPI Grid -->
            <div class="row g-3 mb-4">
              <!-- KPI 1: Planned Budget -->
              <div class="col-6 col-xl-3">
                <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="text-muted small fw-bold text-uppercase">Planned Budget</span>
                    <div class="stat-icon-wrapper bg-primary-subtle text-primary fs-5" style="width:38px; height:38px;">
                      <i class="bi bi-wallet2"></i>
                    </div>
                  </div>
                  <div class="fs-4 fw-bold text-dark">₹{{ summary.planned_budget | number:'1.2-2' }}</div>
                  <span class="badge bg-light text-muted border mt-2 align-self-start">Approved Baseline</span>
                </div>
              </div>

              <!-- KPI 2: Total Estimated Cost -->
              <div class="col-6 col-xl-3">
                <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="text-muted small fw-bold text-uppercase">Estimated Cost</span>
                    <div class="stat-icon-wrapper bg-info-subtle text-info fs-5" style="width:38px; height:38px;">
                      <i class="bi bi-calculator"></i>
                    </div>
                  </div>
                  <div class="fs-4 fw-bold text-info">₹{{ summary.total_estimated_cost | number:'1.2-2' }}</div>
                  <span class="badge bg-info-subtle text-info border border-info-subtle mt-2 align-self-start">
                    Variance: ₹{{ summary.estimated_variance | number:'1.2-2' }}
                  </span>
                </div>
              </div>

              <!-- KPI 3: Amount Spent (Actual) -->
              <div class="col-6 col-xl-3">
                <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="text-muted small fw-bold text-uppercase">Actual Spent</span>
                    <div class="stat-icon-wrapper bg-danger-subtle text-danger fs-5" style="width:38px; height:38px;">
                      <i class="bi bi-cart-check"></i>
                    </div>
                  </div>
                  <div class="fs-4 fw-bold text-danger">₹{{ summary.total_actual_cost | number:'1.2-2' }}</div>
                  <span class="badge bg-danger-subtle text-danger border border-danger-subtle mt-2 align-self-start">
                    Actual Ledger Sum
                  </span>
                </div>
              </div>

              <!-- KPI 4: Remaining Reserve -->
              <div class="col-6 col-xl-3">
                <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="text-muted small fw-bold text-uppercase">Remaining Reserve</span>
                    <div class="stat-icon-wrapper bg-success-subtle text-success fs-5" style="width:38px; height:38px;">
                      <i class="bi bi-piggy-bank"></i>
                    </div>
                  </div>
                  <div class="fs-4 fw-bold" [ngClass]="summary.remaining_budget >= 0 ? 'text-success' : 'text-danger'">
                    ₹{{ summary.remaining_budget | number:'1.2-2' }}
                  </div>
                  <span class="badge mt-2 align-self-start" 
                        [ngClass]="summary.budget_status === 'Over Budget' ? 'bg-danger text-white' : summary.budget_status === 'Near Budget Cap' ? 'bg-warning text-dark' : 'bg-success-subtle text-success'">
                    {{ summary.budget_status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Overall Budget Utilization Progress Bar -->
            <div class="card card-custom border-0 p-4 shadow-sm mb-4 bg-white">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <h6 class="fw-bold text-dark mb-0">Budget Utilization Meter</h6>
                  <span class="text-muted small">Actual Expenses vs Total Planned Budget</span>
                </div>
                <div class="fs-5 fw-bold text-warning">{{ summary.budget_utilization_percentage }}% Utilized</div>
              </div>
              <div class="progress rounded-pill mb-2" style="height: 14px;">
                <div 
                  class="progress-bar rounded-pill"
                  [ngClass]="summary.budget_utilization_percentage > 100 ? 'bg-danger' : summary.budget_utilization_percentage >= 90 ? 'bg-warning' : 'bg-success'"
                  [style.width.%]="mathMin(summary.budget_utilization_percentage, 100)">
                </div>
              </div>
              <div class="d-flex justify-content-between text-muted extra-small">
                <span>₹0.00</span>
                <span>Cap: ₹{{ summary.planned_budget | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- 6 Category Breakdown Cards Grid -->
            <h5 class="fw-bold text-dark mb-3"><i class="bi bi-grid-3x3-gap-fill me-2 text-warning"></i>Category-wise Financial Allocation & Expenditure</h5>
            <div class="row g-3 mb-4">
              <div *ngFor="let cat of summary.category_summaries" class="col-md-6 col-xl-4">
                <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h6 class="fw-bold text-dark mb-0"><i class="bi bi-tag-fill me-1 text-warning"></i> {{ cat.category }}</h6>
                    <span class="badge bg-light text-dark border">{{ cat.utilization_percentage }}%</span>
                  </div>

                  <div class="row g-2 text-center my-2">
                    <div class="col-4">
                      <div class="p-2 bg-light rounded border">
                        <span class="text-muted extra-small d-block">Planned</span>
                        <strong class="small text-dark">₹{{ cat.planned_amount | number:'1.0-0' }}</strong>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="p-2 bg-light rounded border">
                        <span class="text-muted extra-small d-block">Estimated</span>
                        <strong class="small text-info">₹{{ cat.estimated_amount | number:'1.0-0' }}</strong>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="p-2 bg-light rounded border">
                        <span class="text-muted extra-small d-block">Actual</span>
                        <strong class="small text-danger">₹{{ cat.actual_amount | number:'1.0-0' }}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="progress mb-2" style="height: 6px;">
                    <div 
                      class="progress-bar"
                      [ngClass]="cat.utilization_percentage > 100 ? 'bg-danger' : 'bg-warning'"
                      [style.width.%]="mathMin(cat.utilization_percentage, 100)">
                    </div>
                  </div>

                  <div class="d-flex justify-content-between extra-small text-muted">
                    <span>Remaining: <strong [ngClass]="cat.remaining_amount >= 0 ? 'text-success' : 'text-danger'">₹{{ cat.remaining_amount | number:'1.0-0' }}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .style-select { min-width: 240px; }
    .extra-small { font-size: 0.75rem; }
  `]
})
export class BudgetDashboardComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId: string = '';
  summary: ProjectFinancialSummary | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private projectService: ProjectService,
    private budgetService: BudgetService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        if (data.length > 0) {
          this.selectedProjectId = data[0].id;
          this.loadFinancialSummary();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load authorized projects.';
      }
    });
  }

  onProjectChange(): void {
    if (this.selectedProjectId) {
      this.loadFinancialSummary();
    }
  }

  loadFinancialSummary(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.budgetService.getFinancialSummary(this.selectedProjectId).subscribe({
      next: (res) => {
        this.summary = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.errorMessage = 'HTTP 403 Forbidden: You do not have authorization to access budget records for this project.';
        } else {
          this.errorMessage = err?.error?.detail || 'Failed to load financial summary.';
        }
      }
    });
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}

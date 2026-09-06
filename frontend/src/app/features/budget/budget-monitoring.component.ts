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
  selector: 'app-budget-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          
          <!-- Header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb small mb-1">
                  <li class="breadcrumb-item"><a routerLink="/budget" class="text-decoration-none text-warning">Budget</a></li>
                  <li class="breadcrumb-item active">Financial Monitoring</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-graph-up-arrow me-2 text-warning"></i>Financial Monitoring & Category Comparison Ledger</h2>
              <p class="text-muted small mb-0">Cross-category financial audit matrix comparing Planned vs Estimated vs Actual costs in real time.</p>
            </div>

            <div class="d-flex align-items-center gap-2">
              <label class="small fw-bold text-muted mb-0">Select Project:</label>
              <select 
                class="form-select form-select-sm border-secondary-subtle fw-semibold shadow-sm"
                style="min-width: 240px;"
                [(ngModel)]="selectedProjectId"
                (change)="onProjectChange()">
                <option *ngFor="let proj of projects" [value]="proj.id">
                  {{ proj.projectName }} ({{ proj.projectCode }})
                </option>
              </select>

              <button class="btn btn-outline-dark d-flex align-items-center gap-2 bg-white shadow-sm" (click)="loadFinancialSummary()">
                <i class="bi bi-arrow-clockwise"></i> Refresh Matrix
              </button>
            </div>
          </div>

          <!-- Alert / Error Banner -->
          <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 shadow-sm mb-4" role="alert">
            <i class="bi bi-exclamation-octagon-fill fs-4"></i>
            <div>{{ errorMessage }}</div>
          </div>

          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted small mt-2">Computing category variance ledger from PostgreSQL...</p>
          </div>

          <ng-container *ngIf="!isLoading && summary">
            <!-- Overall Variance Summary Bar -->
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100">
                  <span class="text-muted extra-small fw-bold text-uppercase">Total Planned Baseline</span>
                  <div class="fs-4 fw-bold text-dark mt-1">₹{{ summary.planned_budget | number:'1.2-2' }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100">
                  <span class="text-muted extra-small fw-bold text-uppercase">Estimated Variance (Planned - Estimated)</span>
                  <div class="fs-4 fw-bold" [ngClass]="summary.estimated_variance >= 0 ? 'text-info' : 'text-danger'">
                    ₹{{ summary.estimated_variance | number:'1.2-2' }}
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100">
                  <span class="text-muted extra-small fw-bold text-uppercase">Actual Variance (Estimated - Actual)</span>
                  <div class="fs-4 fw-bold" [ngClass]="summary.actual_variance >= 0 ? 'text-success' : 'text-danger'">
                    ₹{{ summary.actual_variance | number:'1.2-2' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Full Category Comparison Matrix Table -->
            <div class="card card-custom border-0 p-4 shadow-sm bg-white mb-4">
              <h5 class="fw-bold text-dark mb-3"><i class="bi bi-table me-2 text-warning"></i> Category-wise Financial Monitoring Matrix</h5>
              <div class="table-responsive">
                <table class="table table-bordered table-hover align-middle mb-0">
                  <thead class="table-dark text-white small">
                    <tr>
                      <th>Cost Category</th>
                      <th class="text-end">Planned Budget (₹)</th>
                      <th class="text-end">Estimated Cost (₹)</th>
                      <th class="text-end">Actual Cost Spent (₹)</th>
                      <th class="text-end">Remaining Reserve (₹)</th>
                      <th class="text-center">Utilization %</th>
                    </tr>
                  </thead>
                  <tbody class="small">
                    <tr *ngFor="let c of summary.category_summaries">
                      <td class="fw-bold text-dark">
                        <i class="bi bi-tag-fill me-2 text-warning"></i>{{ c.category }}
                      </td>
                      <td class="text-end fw-bold text-dark">₹{{ c.planned_amount | number:'1.2-2' }}</td>
                      <td class="text-end fw-semibold text-info">₹{{ c.estimated_amount | number:'1.2-2' }}</td>
                      <td class="text-end fw-bold text-danger">₹{{ c.actual_amount | number:'1.2-2' }}</td>
                      <td class="text-end fw-bold" [ngClass]="c.remaining_amount >= 0 ? 'text-success' : 'text-danger'">
                        ₹{{ c.remaining_amount | number:'1.2-2' }}
                      </td>
                      <td class="text-center">
                        <span class="badge px-2 py-1" 
                              [ngClass]="c.utilization_percentage > 100 ? 'bg-danger' : c.utilization_percentage >= 90 ? 'bg-warning text-dark' : 'bg-success-subtle text-success border border-success-subtle'">
                          {{ c.utilization_percentage }}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="table-light fw-bold fs-6">
                    <tr>
                      <td>Total Project Portfolio:</td>
                      <td class="text-end text-dark">₹{{ summary.planned_budget | number:'1.2-2' }}</td>
                      <td class="text-end text-info">₹{{ summary.total_estimated_cost | number:'1.2-2' }}</td>
                      <td class="text-end text-danger">₹{{ summary.total_actual_cost | number:'1.2-2' }}</td>
                      <td class="text-end" [ngClass]="summary.remaining_budget >= 0 ? 'text-success' : 'text-danger'">
                        ₹{{ summary.remaining_budget | number:'1.2-2' }}
                      </td>
                      <td class="text-center text-warning">
                        {{ summary.budget_utilization_percentage }}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.75rem; }
  `]
})
export class BudgetMonitoringComponent implements OnInit {
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
          this.errorMessage = 'HTTP 403 Forbidden: You do not have authorization to access budget monitoring records for this project.';
        } else {
          this.errorMessage = err?.error?.detail || 'Failed to load financial summary.';
        }
      }
    });
  }
}

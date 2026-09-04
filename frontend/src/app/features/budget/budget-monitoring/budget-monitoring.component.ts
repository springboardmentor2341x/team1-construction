import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { BudgetService } from '../../../core/services/budget.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { FinancialSummary } from '../../../core/models/budget.model';
import { Project } from '../../../core/models/project.model';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-budget-monitoring',
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
                <h2 class="fw-bold text-dark mb-0">Budget Monitoring & Analysis</h2>
              </div>
              <p class="text-muted small mb-0">Detailed financial oversight with budget vs estimated vs actual cost tracking.</p>
            </div>
            <a routerLink="/budget/dashboard" class="btn btn-outline-dark">
              <i class="bi bi-arrow-left me-1"></i> Back to Dashboard
            </a>
          </div>

          <!-- Project Selection -->
          <div class="card card-custom border-0 p-4 mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-6">
                <label class="form-label small fw-bold text-muted mb-1">Select Project for Detailed Monitoring</label>
                <select class="form-select" [(ngModel)]="selectedProjectId" (change)="loadFinancialData()">
                  <option value="">-- Select Project --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted mt-2 small">Loading financial monitoring data...</p>
          </div>

          <!-- No Project Selected State -->
          <div *ngIf="!loading && !selectedProjectId" class="text-center py-5">
            <div class="card card-custom border-0 p-5">
              <i class="bi bi-graph-up-arrow fs-1 text-warning d-block mb-3"></i>
              <h5 class="fw-bold text-dark mb-2">Select a Project for Budget Monitoring</h5>
              <p class="text-muted small">Choose a project from the dropdown above to see detailed budget vs actual tracking.</p>
            </div>
          </div>

          <!-- Financial Monitoring Dashboard -->
          <div *ngIf="!loading && selectedProjectId && summary">
            <!-- Over-Budget Alert -->
            <div *ngIf="isOverBudget" class="alert alert-danger border-0 p-3 mb-4">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-exclamation-triangle-fill fs-4"></i>
                <div>
                  <strong class="text-danger">Over-Budget Alert!</strong>
                  <div class="small">Actual expenses (\${{ summary.actualAmountSpent | number }}) exceed total budget (\${{ summary.totalBudget | number }}) by \${{ overBudgetAmount | number }}.</div>
                </div>
              </div>
            </div>

            <!-- Main Financial Comparison -->
            <div class="card card-custom border-0 p-4 mb-4">
              <h5 class="fw-bold text-dark mb-3">
                <i class="bi bi-bar-chart-fill me-2 text-warning"></i>
                Budget vs Estimated vs Actual Comparison
              </h5>
              
              <div class="row g-4">
                <!-- Comparison Chart -->
                <div class="col-lg-8">
                  <div class="space-y-3">
                    <!-- Budget Bar -->
                    <div>
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-semibold text-dark small">Total Budget</span>
                        <span class="fw-bold text-primary">\${{ summary.totalBudget | number }}</span>
                      </div>
                      <div class="progress" style="height: 24px;">
                        <div class="progress-bar bg-primary" style="width: 100%"></div>
                      </div>
                    </div>

                    <!-- Estimated Cost Bar -->
                    <div>
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-semibold text-dark small">Total Estimated Cost</span>
                        <span class="fw-bold text-info">\${{ summary.totalEstimatedCost | number }}</span>
                      </div>
                      <div class="progress" style="height: 24px;">
                        <div class="progress-bar bg-info" [style.width.%]="estimatedPercentage"></div>
                      </div>
                      <div class="extra-small text-muted mt-1">{{ estimatedPercentage }}% of budget</div>
                    </div>

                    <!-- Actual Spent Bar -->
                    <div>
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-semibold text-dark small">Actual Amount Spent</span>
                        <span class="fw-bold" [ngClass]="isOverBudget ? 'text-danger' : 'text-success'">\${{ summary.actualAmountSpent | number }}</span>
                      </div>
                      <div class="progress" style="height: 24px;">
                        <div class="progress-bar" [ngClass]="getActualBarClass()" [style.width.%]="actualPercentage"></div>
                      </div>
                      <div class="extra-small text-muted mt-1">{{ actualPercentage }}% of budget</div>
                    </div>

                    <!-- Remaining Budget Bar -->
                    <div>
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-semibold text-dark small">Remaining Budget</span>
                        <span class="fw-bold" [ngClass]="summary.remainingBudget >= 0 ? 'text-success' : 'text-danger'">\${{ summary.remainingBudget | number }}</span>
                      </div>
                      <div class="progress" style="height: 24px;">
                        <div class="progress-bar" [ngClass]="getRemainingBarClass()" [style.width.%]="remainingPercentage"></div>
                      </div>
                      <div class="extra-small text-muted mt-1">{{ remainingPercentage }}% of budget</div>
                    </div>
                  </div>
                </div>

                <!-- Key Metrics Panel -->
                <div class="col-lg-4">
                  <div class="card bg-light border-0 p-4 h-100">
                    <h6 class="fw-bold text-dark mb-3">Key Performance Indicators</h6>
                    
                    <div class="space-y-3">
                      <div class="d-flex justify-content-between align-items-center pb-2 border-bottom">
                        <span class="text-muted small">Budget Utilization</span>
                        <span class="fw-bold" [ngClass]="getUtilizationClass()">
                          {{ summary.budgetUtilizationPercentage !== null ? summary.budgetUtilizationPercentage?.toFixed(1) : 'N/A' }}%
                        </span>
                      </div>
                      
                      <div class="d-flex justify-content-between align-items-center pb-2 border-bottom">
                        <span class="text-muted small">Variance (Est. vs Actual)</span>
                        <span class="fw-bold" [ngClass]="getVarianceClass()">
                          \${{ varianceAmount | number }}
                        </span>
                      </div>
                      
                      <div class="d-flex justify-content-between align-items-center pb-2 border-bottom">
                        <span class="text-muted small">Estimate Accuracy</span>
                        <span class="fw-bold text-info">
                          {{ estimateAccuracy }}%
                        </span>
                      </div>
                      
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted small">Budget Health</span>
                        <span class="badge" [ngClass]="getBudgetHealthClass()">
                          {{ budgetHealthText }}
                        </span>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-top">
                      <div class="extra-small text-muted">
                        <i class="bi bi-info-circle me-1"></i>
                        Variance = Estimated - Actual Spent
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Category-wise Monitoring -->
            <div class="card card-custom border-0 p-4 mb-4">
              <h5 class="fw-bold text-dark mb-3">
                <i class="bi bi-tags-fill me-2 text-warning"></i>
                Category-wise Budget Monitoring
              </h5>
              
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
                      <th>Over-Budget</th>
                      <th>Status</th>
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
                          <div class="progress flex-grow-1" style="height: 8px;">
                            <div class="progress-bar" 
                                 [ngClass]="getCategoryUtilizationBarClass(cat.utilizationPercentage)"
                                 [style.width.%]="cat.utilizationPercentage || 0"></div>
                          </div>
                          <span class="small fw-bold">{{ cat.utilizationPercentage !== null ? cat.utilizationPercentage?.toFixed(1) : 'N/A' }}%</span>
                        </div>
                      </td>
                      <td>
                        <span *ngIf="cat.actualExpense > cat.budgetAllocated" class="badge bg-danger">
                          \${{ (cat.actualExpense - cat.budgetAllocated) | number }}
                        </span>
                        <span *ngIf="cat.actualExpense <= cat.budgetAllocated" class="text-muted">-</span>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="getCategoryStatusClass(cat)">
                          {{ getCategoryStatusText(cat) }}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="summary.categoryBreakdown.length === 0">
                      <td colspan="8" class="text-center py-3 text-muted">No category breakdown data available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Budget Health Summary -->
            <div class="card card-custom border-0 p-4">
              <h5 class="fw-bold text-dark mb-3">
                <i class="bi bi-heart-pulse-fill me-2 text-warning"></i>
                Budget Health Analysis
              </h5>
              
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="p-3 rounded border" [ngClass]="getHealthCardClass('overall')">
                    <div class="text-muted small">Overall Health</div>
                    <div class="fw-bold fs-5">{{ budgetHealthText }}</div>
                  </div>
                </div>
                
                <div class="col-md-3">
                  <div class="p-3 rounded border" [ngClass]="getHealthCardClass('variance')">
                    <div class="text-muted small">Cost Variance</div>
                    <div class="fw-bold fs-5" [ngClass]="getVarianceClass()">
                      \${{ varianceAmount | number }}
                    </div>
                  </div>
                </div>
                
                <div class="col-md-3">
                  <div class="p-3 rounded border" [ngClass]="getHealthCardClass('categories')">
                    <div class="text-muted small">Categories Over Budget</div>
                    <div class="fw-bold fs-5" [ngClass]="overBudgetCategories > 0 ? 'text-danger' : 'text-success'">
                      {{ overBudgetCategories }}
                    </div>
                  </div>
                </div>
                
                <div class="col-md-3">
                  <div class="p-3 rounded border" [ngClass]="getHealthCardClass('remaining')">
                    <div class="text-muted small">Remaining Budget</div>
                    <div class="fw-bold fs-5" [ngClass]="summary.remainingBudget >= 0 ? 'text-success' : 'text-danger'">
                      \${{ summary.remainingBudget | number }}
                    </div>
                  </div>
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
    .space-y-3 > * + * { margin-top: 0.75rem; }
  `]
})
export class BudgetMonitoringComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  selectedProject: Project | null = null;
  summary: FinancialSummary | null = null;
  loading = false;

  UserRole = UserRole;

  constructor(
    private budgetService: BudgetService,
    private projectService: ProjectService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });

    // Check for projectId in query params
    this.route.queryParams.subscribe(params => {
      if (params['projectId']) {
        this.selectedProjectId = params['projectId'];
        this.loadFinancialData();
      }
    });
  }

  get isOverBudget(): boolean {
    return this.summary !== null && this.summary.actualAmountSpent > this.summary.totalBudget;
  }

  get overBudgetAmount(): number {
    if (!this.summary) return 0;
    return Math.max(0, this.summary.actualAmountSpent - this.summary.totalBudget);
  }

  get estimatedPercentage(): number {
    if (!this.summary || this.summary.totalBudget === 0) return 0;
    return Math.min(100, (this.summary.totalEstimatedCost / this.summary.totalBudget) * 100);
  }

  get actualPercentage(): number {
    if (!this.summary || this.summary.totalBudget === 0) return 0;
    return Math.min(100, (this.summary.actualAmountSpent / this.summary.totalBudget) * 100);
  }

  get remainingPercentage(): number {
    if (!this.summary || this.summary.totalBudget === 0) return 0;
    return Math.max(0, (this.summary.remainingBudget / this.summary.totalBudget) * 100);
  }

  get varianceAmount(): number {
    if (!this.summary) return 0;
    return this.summary.totalEstimatedCost - this.summary.actualAmountSpent;
  }

  get estimateAccuracy(): number {
    if (!this.summary || this.summary.totalEstimatedCost === 0) return 0;
    const accuracy = (this.summary.actualAmountSpent / this.summary.totalEstimatedCost) * 100;
    return Math.min(100, Math.max(0, accuracy));
  }

  get budgetHealthText(): string {
    if (!this.summary) return 'Unknown';
    if (this.isOverBudget) return 'Critical';
    if (this.summary.budgetUtilizationPercentage === null) return 'Unknown';
    const pct = this.summary.budgetUtilizationPercentage;
    if (pct !== undefined && pct >= 90) return 'Warning';
    if (pct !== undefined && pct >= 70) return 'Good';
    return 'Excellent';
  }

  get overBudgetCategories(): number {
    if (!this.summary) return 0;
    return this.summary.categoryBreakdown.filter(cat => cat.actualExpense > cat.budgetAllocated).length;
  }

  getActualBarClass(): string {
    if (!this.summary) return 'bg-secondary';
    const pct = this.actualPercentage;
    if (pct >= 100) return 'bg-danger';
    if (pct >= 80) return 'bg-warning';
    return 'bg-success';
  }

  getRemainingBarClass(): string {
    if (!this.summary) return 'bg-secondary';
    if (this.summary.remainingBudget < 0) return 'bg-danger';
    const pct = this.remainingPercentage;
    if (pct <= 10) return 'bg-warning';
    return 'bg-success';
  }

  getUtilizationClass(): string {
    if (!this.summary || this.summary.budgetUtilizationPercentage === null) return 'text-muted';
    const pct = this.summary.budgetUtilizationPercentage;
    if (pct !== undefined && pct >= 90) return 'text-danger';
    if (pct !== undefined && pct >= 70) return 'text-warning';
    return 'text-success';
  }

  getVarianceClass(): string {
    const variance = this.varianceAmount;
    if (variance > 0) return 'text-success';
    if (variance < 0) return 'text-danger';
    return 'text-muted';
  }

  getBudgetHealthClass(): string {
    const health = this.budgetHealthText;
    switch (health) {
      case 'Critical': return 'bg-danger';
      case 'Warning': return 'bg-warning text-dark';
      case 'Good': return 'bg-info text-dark';
      case 'Excellent': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getCategoryUtilizationBarClass(percentage?: number): string {
    if (percentage === null || percentage === undefined) return 'bg-secondary';
    if (percentage >= 100) return 'bg-danger';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  }

  getCategoryStatusClass(category: any): string {
    if (category.actualExpense > category.budgetAllocated) return 'bg-danger';
    if (category.actualExpense >= category.budgetAllocated * 0.8) return 'bg-warning text-dark';
    return 'bg-success';
  }

  getCategoryStatusText(category: any): string {
    if (category.actualExpense > category.budgetAllocated) return 'Over Budget';
    if (category.actualExpense >= category.budgetAllocated * 0.8) return 'Near Limit';
    return 'On Track';
  }

  getHealthCardClass(type: string): string {
    switch (type) {
      case 'overall':
        switch (this.budgetHealthText) {
          case 'Critical': return 'bg-danger text-white';
          case 'Warning': return 'bg-warning text-dark';
          case 'Good': return 'bg-info text-white';
          case 'Excellent': return 'bg-success text-white';
          default: return 'bg-light';
        }
      case 'variance':
        return this.varianceAmount >= 0 ? 'bg-success text-white' : 'bg-danger text-white';
      case 'categories':
        return this.overBudgetCategories > 0 ? 'bg-danger text-white' : 'bg-success text-white';
      case 'remaining':
        return this.summary && this.summary.remainingBudget >= 0 ? 'bg-success text-white' : 'bg-danger text-white';
      default:
        return 'bg-light';
    }
  }

  loadFinancialData(): void {
    if (!this.selectedProjectId) {
      this.summary = null;
      this.selectedProject = null;
      return;
    }

    this.selectedProject = this.projects.find(p => p.id === this.selectedProjectId) || null;
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
}

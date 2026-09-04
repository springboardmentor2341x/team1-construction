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
import { 
  CostEstimate, 
  CostCategory, 
  CostEstimateCreate, 
  CostEstimateUpdate 
} from '../../../core/models/budget.model';
import { Project } from '../../../core/models/project.model';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-cost-estimation',
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
                <h2 class="fw-bold text-dark mb-0">Cost Estimation Management</h2>
              </div>
              <p class="text-muted small mb-0">Create and manage project cost estimates by category.</p>
            </div>
            <a routerLink="/budget/dashboard" class="btn btn-outline-dark">
              <i class="bi bi-arrow-left me-1"></i> Back to Dashboard
            </a>
          </div>

          <!-- Project Selection -->
          <div class="card card-custom border-0 p-4 mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-6">
                <label class="form-label small fw-bold text-muted mb-1">Select Project</label>
                <select class="form-select" [(ngModel)]="selectedProjectId" (change)="loadEstimates()">
                  <option value="">-- Select Project --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
              <div class="col-md-6 d-flex align-items-end">
                <button class="btn btn-bt-accent w-100" (click)="showEstimateForm = !showEstimateForm" [disabled]="!selectedProjectId">
                  <i class="bi bi-plus-circle me-1"></i> {{ showEstimateForm ? 'Cancel' : 'Add New Estimate' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted mt-2 small">Loading cost estimates...</p>
          </div>

          <!-- No Project Selected State -->
          <div *ngIf="!loading && !selectedProjectId" class="text-center py-5">
            <div class="card card-custom border-0 p-5">
              <i class="bi bi-calculator fs-1 text-warning d-block mb-3"></i>
              <h5 class="fw-bold text-dark mb-2">Select a Project to Manage Cost Estimates</h5>
              <p class="text-muted small">Choose a project from the dropdown above to view and manage its cost estimates.</p>
            </div>
          </div>

          <!-- Add/Edit Estimate Form -->
          <div *ngIf="showEstimateForm && selectedProjectId" class="card card-custom border-0 p-4 mb-4">
            <h5 class="fw-bold text-dark mb-3">
              <i class="bi bi-plus-circle me-2 text-warning"></i>
              {{ editingEstimate ? 'Update Cost Estimate' : 'Add New Cost Estimate' }}
            </h5>
            
            <form (ngSubmit)="saveEstimate()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Cost Category</label>
                  <select class="form-select" 
                          [(ngModel)]="estimateForm.costCategoryId" 
                          name="costCategoryId" required>
                    <option value="">Select Category</option>
                    <option *ngFor="let cat of costCategories" [value]="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Estimate Title</label>
                  <input type="text" 
                         class="form-control" 
                         [(ngModel)]="estimateForm.estimateTitle" 
                         name="estimateTitle"
                         required
                         placeholder="e.g., Foundation Materials">
                </div>
                
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Estimated Amount</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" 
                           class="form-control" 
                           [(ngModel)]="estimateForm.estimatedAmount" 
                           name="estimatedAmount"
                           min="0" 
                           step="0.01" 
                           required
                           placeholder="0.00">
                  </div>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Estimate Date</label>
                  <input type="date" 
                         class="form-control" 
                         [(ngModel)]="estimateForm.estimateDate" 
                         name="estimateDate"
                         required>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Remarks (Optional)</label>
                  <input type="text" 
                         class="form-control" 
                         [(ngModel)]="estimateForm.remarks" 
                         name="remarks"
                         placeholder="Additional notes...">
                </div>
                
                <div class="col-12 d-flex gap-2">
                  <button type="submit" 
                          class="btn btn-bt-accent"
                          [disabled]="saving">
                    <i class="bi bi-save me-1"></i> {{ saving ? 'Saving...' : (editingEstimate ? 'Update' : 'Create') }}
                  </button>
                  <button type="button" 
                          class="btn btn-outline-secondary" 
                          (click)="cancelEdit()">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Cost Estimates List -->
          <div *ngIf="!loading && selectedProjectId">
            <div class="card card-custom border-0 p-4">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold text-dark mb-0">
                  <i class="bi bi-list-check me-2 text-warning"></i>
                  Cost Estimates for {{ selectedProject?.projectName }}
                </h5>
                <div class="text-muted small">
                  Total Estimates: {{ estimates.length }} | 
                  Total Amount: <strong>\${{ totalEstimatedAmount | number }}</strong>
                </div>
              </div>

              <div class="table-responsive" *ngIf="estimates.length > 0; else noEstimates">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Category</th>
                      <th>Estimate Title</th>
                      <th>Estimated Amount</th>
                      <th>Estimate Date</th>
                      <th>Remarks</th>
                      <th>Created</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let estimate of estimates">
                      <td>
                        <span class="badge bg-light text-dark">{{ estimate.costCategory.name }}</span>
                      </td>
                      <td class="fw-semibold">{{ estimate.estimateTitle }}</td>
                      <td class="fw-bold text-success">\${{ estimate.estimatedAmount | number }}</td>
                      <td>{{ estimate.estimateDate }}</td>
                      <td>{{ estimate.remarks || '-' }}</td>
                      <td class="extra-small">{{ estimate.createdAt | date:'short' }}</td>
                      <td class="text-end">
                        <div class="btn-group">
                          <button class="btn btn-sm btn-outline-warning" (click)="editEstimate(estimate)" title="Edit">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" (click)="deleteEstimate(estimate.id)" title="Delete">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noEstimates>
                <div class="text-muted small py-5 text-center">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                  No cost estimates found for this project. Click "Add New Estimate" to create one.
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.76rem; }
  `]
})
export class CostEstimationComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  selectedProject: Project | null = null;
  estimates: CostEstimate[] = [];
  costCategories: CostCategory[] = [];
  loading = false;
  saving = false;
  showEstimateForm = false;
  editingEstimate: CostEstimate | null = null;

  estimateForm: CostEstimateCreate = {
    projectId: '',
    costCategoryId: '',
    estimateTitle: '',
    estimatedAmount: 0,
    estimateDate: '',
    remarks: ''
  };

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

    this.budgetService.getCategories().subscribe(categories => {
      this.costCategories = categories;
    });

    // Set default estimate date to today
    const today = new Date().toISOString().split('T')[0];
    this.estimateForm.estimateDate = today;

    // Check for projectId in query params
    this.route.queryParams.subscribe(params => {
      if (params['projectId']) {
        this.selectedProjectId = params['projectId'];
        this.loadEstimates();
      }
    });
  }

  get totalEstimatedAmount(): number {
    return this.estimates.reduce((sum, est) => sum + est.estimatedAmount, 0);
  }

  loadEstimates(): void {
    if (!this.selectedProjectId) {
      this.estimates = [];
      this.selectedProject = null;
      return;
    }

    this.selectedProject = this.projects.find(p => p.id === this.selectedProjectId) || null;
    this.loading = true;
    this.budgetService.getProjectEstimates(this.selectedProjectId).subscribe({
      next: (estimates) => {
        this.estimates = estimates;
        this.loading = false;
      },
      error: () => {
        this.estimates = [];
        this.loading = false;
      }
    });
  }

  saveEstimate(): void {
    if (!this.selectedProjectId || !this.estimateForm.costCategoryId || 
        !this.estimateForm.estimateTitle || this.estimateForm.estimatedAmount <= 0) {
      return;
    }

    this.saving = true;
    this.estimateForm.projectId = this.selectedProjectId;

    if (this.editingEstimate) {
      // Update existing estimate
      const updateData: CostEstimateUpdate = {
        estimateTitle: this.estimateForm.estimateTitle,
        estimatedAmount: this.estimateForm.estimatedAmount,
        estimateDate: this.estimateForm.estimateDate,
        remarks: this.estimateForm.remarks
      };
      this.budgetService.updateCostEstimate(this.editingEstimate.id, updateData).subscribe({
        next: () => {
          this.saving = false;
          this.cancelEdit();
          this.loadEstimates();
        },
        error: () => {
          this.saving = false;
        }
      });
    } else {
      // Create new estimate
      this.budgetService.createCostEstimate(this.estimateForm).subscribe({
        next: () => {
          this.saving = false;
          this.cancelEdit();
          this.loadEstimates();
        },
        error: () => {
          this.saving = false;
        }
      });
    }
  }

  editEstimate(estimate: CostEstimate): void {
    this.editingEstimate = estimate;
    this.estimateForm = {
      projectId: estimate.projectId,
      costCategoryId: estimate.costCategory.id,
      estimateTitle: estimate.estimateTitle,
      estimatedAmount: estimate.estimatedAmount,
      estimateDate: estimate.estimateDate,
      remarks: estimate.remarks || ''
    };
    this.showEstimateForm = true;
  }

  deleteEstimate(estimateId: string): void {
    if (!confirm('Are you sure you want to delete this cost estimate?')) return;

    this.budgetService.deleteCostEstimate(estimateId).subscribe({
      next: () => {
        this.loadEstimates();
      },
      error: () => {
        // Handle error
      }
    });
  }

  cancelEdit(): void {
    this.editingEstimate = null;
    this.showEstimateForm = false;
    this.estimateForm = {
      projectId: this.selectedProjectId,
      costCategoryId: '',
      estimateTitle: '',
      estimatedAmount: 0,
      estimateDate: new Date().toISOString().split('T')[0],
      remarks: ''
    };
  }
}

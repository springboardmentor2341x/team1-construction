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
  ProjectBudget, 
  BudgetAllocation, 
  CostCategory, 
  BudgetCreate, 
  BudgetUpdate,
  BudgetAllocationCreate 
} from '../../../core/models/budget.model';
import { Project } from '../../../core/models/project.model';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-budget-planning',
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
                <h2 class="fw-bold text-dark mb-0">Budget Planning & Allocation</h2>
              </div>
              <p class="text-muted small mb-0">Create project budgets and manage category-wise financial allocations.</p>
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
                <select class="form-select" [(ngModel)]="selectedProjectId" (change)="loadProjectBudget()">
                  <option value="">-- Select Project --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted mt-2 small">Loading budget data...</p>
          </div>

          <!-- No Project Selected State -->
          <div *ngIf="!loading && !selectedProjectId" class="text-center py-5">
            <div class="card card-custom border-0 p-5">
              <i class="bi bi-wallet2 fs-1 text-warning d-block mb-3"></i>
              <h5 class="fw-bold text-dark mb-2">Select a Project to Plan Budget</h5>
              <p class="text-muted small">Choose a project from the dropdown above to create or manage its budget.</p>
            </div>
          </div>

          <!-- Budget Planning Form -->
          <div *ngIf="!loading && selectedProjectId">
            <!-- Budget Details Form -->
            <div class="card card-custom border-0 p-4 mb-4">
              <h5 class="fw-bold text-dark mb-3">
                <i class="bi bi-wallet-fill me-2 text-warning"></i>
                {{ existingBudget ? 'Update Budget' : 'Create New Budget' }}
              </h5>
              
              <form (ngSubmit)="saveBudget()">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label small fw-bold text-muted">Total Budget Amount</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input type="number" 
                             class="form-control" 
                             [(ngModel)]="budgetForm.totalBudget" 
                             name="totalBudget"
                             min="0" 
                             step="0.01" 
                             required
                             placeholder="0.00">
                    </div>
                  </div>
                  
                  <div class="col-md-3">
                    <label class="form-label small fw-bold text-muted">Currency</label>
                    <select class="form-select" 
                            [(ngModel)]="budgetForm.currency" 
                            name="currency">
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </select>
                  </div>
                  
                  <div class="col-md-3">
                    <label class="form-label small fw-bold text-muted">Budget Status</label>
                    <select class="form-select" 
                            [(ngModel)]="budgetForm.status" 
                            name="status">
                      <option value="Draft">Draft</option>
                      <option value="Approved">Approved</option>
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                  
                  <div class="col-md-2 d-flex align-items-end">
                    <button type="submit" 
                            class="btn btn-bt-accent w-100"
                            [disabled]="saving">
                      <i class="bi bi-save me-1"></i> {{ saving ? 'Saving...' : (existingBudget ? 'Update' : 'Create') }}
                    </button>
                  </div>
                </div>
                
                <div class="row g-3 mt-2">
                  <div class="col-12">
                    <label class="form-label small fw-bold text-muted">Notes (Optional)</label>
                    <textarea class="form-control" 
                              [(ngModel)]="budgetForm.notes" 
                              name="notes"
                              rows="2" 
                              placeholder="Additional budget notes or justifications..."></textarea>
                  </div>
                </div>
              </form>
            </div>

            <!-- Category Allocations -->
            <div class="card card-custom border-0 p-4 mb-4" *ngIf="existingBudget">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold text-dark mb-0">
                  <i class="bi bi-tags-fill me-2 text-warning"></i>
                  Category-wise Allocations
                </h5>
                <button class="btn btn-sm btn-outline-success" (click)="showAllocationForm = !showAllocationForm">
                  <i class="bi bi-plus-circle me-1"></i> Add Allocation
                </button>
              </div>

              <!-- Add Allocation Form -->
              <div *ngIf="showAllocationForm" class="card bg-light p-3 mb-3">
                <h6 class="fw-bold text-dark mb-2">New Category Allocation</h6>
                <form (ngSubmit)="addAllocation()">
                  <div class="row g-2">
                    <div class="col-md-4">
                      <select class="form-select form-select-sm" 
                              [(ngModel)]="allocationForm.costCategoryId" 
                              name="costCategoryId" required>
                        <option value="">Select Category</option>
                        <option *ngFor="let cat of availableCategories" [value]="cat.id">{{ cat.name }}</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <div class="input-group input-group-sm">
                        <span class="input-group-text">$</span>
                        <input type="number" 
                               class="form-control" 
                               [(ngModel)]="allocationForm.allocatedAmount" 
                               name="allocatedAmount"
                               min="0" 
                               step="0.01" 
                               required
                               placeholder="0.00">
                      </div>
                    </div>
                    <div class="col-md-4">
                      <input type="text" 
                             class="form-control form-control-sm" 
                             [(ngModel)]="allocationForm.notes" 
                             name="notes"
                             placeholder="Notes (optional)">
                    </div>
                    <div class="col-md-1">
                      <button type="submit" class="btn btn-sm btn-success w-100">
                        <i class="bi bi-check"></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <!-- Existing Allocations Table -->
              <div class="table-responsive" *ngIf="existingBudget.allocations.length > 0; else noAllocations">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Category</th>
                      <th>Allocated Amount</th>
                      <th>Notes</th>
                      <th>Created</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let alloc of existingBudget.allocations">
                      <td class="fw-semibold">{{ alloc.costCategory.name }}</td>
                      <td>\${{ alloc.allocatedAmount | number }}</td>
                      <td>{{ alloc.notes || '-' }}</td>
                      <td class="extra-small">{{ alloc.createdAt | date:'short' }}</td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" (click)="deleteAllocation(alloc.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noAllocations>
                <div class="text-muted small py-3 text-center">No category allocations yet. Click "Add Allocation" to create one.</div>
              </ng-template>
            </div>

            <!-- Budget Summary -->
            <div class="card card-custom border-0 p-4" *ngIf="existingBudget">
              <h5 class="fw-bold text-dark mb-3">
                <i class="bi bi-pie-chart-fill me-2 text-warning"></i>
                Budget Summary
              </h5>
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="p-3 bg-light rounded border">
                    <div class="text-muted small">Total Budget</div>
                    <div class="fw-bold text-dark fs-5">\${{ existingBudget.totalBudget | number }}</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 bg-light rounded border">
                    <div class="text-muted small">Total Allocated</div>
                    <div class="fw-bold text-info fs-5">\${{ totalAllocated | number }}</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 bg-light rounded border">
                    <div class="text-muted small">Unallocated</div>
                    <div class="fw-bold text-warning fs-5">\${{ (existingBudget.totalBudget - totalAllocated) | number }}</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 bg-light rounded border">
                    <div class="text-muted small">Allocation Status</div>
                    <div class="fw-bold" [ngClass]="allocationStatusClass">
                      {{ allocationStatusText }}
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
  `]
})
export class BudgetPlanningComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  existingBudget: ProjectBudget | null = null;
  costCategories: CostCategory[] = [];
  loading = false;
  saving = false;
  showAllocationForm = false;

  budgetForm: BudgetCreate = {
    projectId: '',
    totalBudget: 0,
    currency: 'USD',
    status: 'Draft',
    notes: ''
  };

  allocationForm: BudgetAllocationCreate = {
    costCategoryId: '',
    allocatedAmount: 0,
    notes: ''
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

    // Check for projectId in query params
    this.route.queryParams.subscribe(params => {
      if (params['projectId']) {
        this.selectedProjectId = params['projectId'];
        this.loadProjectBudget();
      }
    });
  }

  get availableCategories(): CostCategory[] {
    if (!this.existingBudget) return this.costCategories;
    const allocatedCategoryIds = this.existingBudget.allocations.map(a => a.costCategory.id);
    return this.costCategories.filter(cat => !allocatedCategoryIds.includes(cat.id));
  }

  get totalAllocated(): number {
    if (!this.existingBudget) return 0;
    return this.existingBudget.allocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
  }

  get allocationStatusText(): string {
    if (!this.existingBudget) return 'N/A';
    const allocated = this.totalAllocated;
    const total = this.existingBudget.totalBudget;
    if (allocated === 0) return 'Not Started';
    if (allocated >= total) return 'Fully Allocated';
    if (allocated >= total * 0.8) return 'Mostly Allocated';
    return 'Partially Allocated';
  }

  get allocationStatusClass(): string {
    const status = this.allocationStatusText;
    switch (status) {
      case 'Fully Allocated': return 'text-success';
      case 'Mostly Allocated': return 'text-info';
      case 'Partially Allocated': return 'text-warning';
      default: return 'text-muted';
    }
  }

  loadProjectBudget(): void {
    if (!this.selectedProjectId) {
      this.existingBudget = null;
      this.budgetForm = { projectId: '', totalBudget: 0, currency: 'USD', status: 'Draft', notes: '' };
      return;
    }

    this.loading = true;
    this.budgetService.getProjectBudget(this.selectedProjectId).subscribe({
      next: (budget) => {
        this.existingBudget = budget;
        if (budget) {
          this.budgetForm = {
            projectId: budget.projectId,
            totalBudget: budget.totalBudget,
            currency: budget.currency,
            status: budget.status,
            notes: budget.notes || ''
          };
        } else {
          this.budgetForm = {
            projectId: this.selectedProjectId,
            totalBudget: 0,
            currency: 'USD',
            status: 'Draft',
            notes: ''
          };
        }
        this.loading = false;
      },
      error: () => {
        this.existingBudget = null;
        this.budgetForm = {
          projectId: this.selectedProjectId,
          totalBudget: 0,
          currency: 'USD',
          status: 'Draft',
          notes: ''
        };
        this.loading = false;
      }
    });
  }

  saveBudget(): void {
    if (!this.selectedProjectId || this.budgetForm.totalBudget <= 0) return;

    this.saving = true;
    this.budgetForm.projectId = this.selectedProjectId;

    if (this.existingBudget) {
      // Update existing budget
      const updateData: BudgetUpdate = {
        totalBudget: this.budgetForm.totalBudget,
        currency: this.budgetForm.currency,
        status: this.budgetForm.status,
        notes: this.budgetForm.notes
      };
      this.budgetService.updateBudget(this.selectedProjectId, updateData).subscribe({
        next: () => {
          this.saving = false;
          this.loadProjectBudget();
        },
        error: () => {
          this.saving = false;
        }
      });
    } else {
      // Create new budget
      this.budgetService.createBudget(this.budgetForm).subscribe({
        next: () => {
          this.saving = false;
          this.loadProjectBudget();
        },
        error: () => {
          this.saving = false;
        }
      });
    }
  }

  addAllocation(): void {
    if (!this.selectedProjectId || !this.allocationForm.costCategoryId || this.allocationForm.allocatedAmount <= 0) return;

    this.budgetService.createBudgetAllocation(this.selectedProjectId, this.allocationForm).subscribe({
      next: () => {
        this.showAllocationForm = false;
        this.allocationForm = { costCategoryId: '', allocatedAmount: 0, notes: '' };
        this.loadProjectBudget();
      },
      error: () => {
        // Handle error
      }
    });
  }

  deleteAllocation(allocationId: string): void {
    if (!confirm('Are you sure you want to delete this allocation?')) return;

    this.budgetService.deleteBudgetAllocation(allocationId).subscribe({
      next: () => {
        this.loadProjectBudget();
      },
      error: () => {
        // Handle error
      }
    });
  }
}

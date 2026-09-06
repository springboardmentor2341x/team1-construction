import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../core/services/project.service';
import { BudgetService, CostEstimate } from '../../core/services/budget.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-cost-estimation',
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
                  <li class="breadcrumb-item active">Cost Estimation</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-calculator me-2 text-warning"></i>Project Cost Estimates Management</h2>
              <p class="text-muted small mb-0">Record and track itemized activity cost projections across the 6 cost categories.</p>
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

              <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm text-nowrap" (click)="openCreateModal()">
                <i class="bi bi-plus-circle-fill"></i> Add Cost Estimate
              </button>
            </div>
          </div>

          <!-- Alert Messages -->
          <div *ngIf="successMessage" class="alert alert-success d-flex align-items-center gap-2 shadow-sm mb-4" role="alert">
            <i class="bi bi-check-circle-fill fs-5"></i>
            <div>{{ successMessage }}</div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 shadow-sm mb-4" role="alert">
            <i class="bi bi-exclamation-octagon-fill fs-5"></i>
            <div>{{ errorMessage }}</div>
          </div>

          <!-- Summary & Filter Controls -->
          <div class="row g-3 mb-4">
            <div class="col-md-6 col-lg-4">
              <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100">
                <span class="text-muted extra-small fw-bold text-uppercase">Total Estimated Cost (Sum)</span>
                <div class="fs-4 fw-bold text-info mt-1">₹{{ totalEstimatedCost | number:'1.2-2' }}</div>
                <span class="badge bg-info-subtle text-info border border-info-subtle mt-2 align-self-start">
                  {{ estimates.length }} Itemized Estimates
                </span>
              </div>
            </div>

            <div class="col-md-6 col-lg-8">
              <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100 d-flex flex-row align-items-center justify-content-between">
                <div>
                  <h6 class="fw-bold text-dark mb-1">Filter by Category</h6>
                  <p class="text-muted extra-small mb-0">Select category to refine itemized estimate list</p>
                </div>
                <select class="form-select form-select-sm style-select border-secondary-subtle" [(ngModel)]="selectedCategory" (change)="loadEstimates()">
                  <option value="">All 6 Categories</option>
                  <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                </select>
              </div>
            </div>
          </div>

          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted small mt-2">Loading cost estimates...</p>
          </div>

          <!-- Estimates Table -->
          <div *ngIf="!isLoading" class="card card-custom border-0 p-4 shadow-sm bg-white">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light text-muted small">
                  <tr>
                    <th>Estimate Code</th>
                    <th>Category</th>
                    <th>Task / Activity Reference</th>
                    <th>Description</th>
                    <th>Estimated Amount (₹)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let est of estimates">
                    <td class="fw-bold text-warning">{{ est.estimate_code }}</td>
                    <td><span class="badge bg-light text-dark border">{{ est.category }}</span></td>
                    <td class="text-muted">{{ est.task_reference || '—' }}</td>
                    <td class="fw-semibold text-dark">{{ est.description }}</td>
                    <td class="fw-bold text-info">₹{{ est.amount | number:'1.2-2' }}</td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-warning py-0 px-2" (click)="openEditModal(est)">
                          <i class="bi bi-pencil-square"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger py-0 px-2" (click)="deleteEstimate(est.id)">
                          <i class="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="estimates.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">
                      <i class="bi bi-inbox fs-3 d-block mb-1"></i>
                      No cost estimates recorded for this project.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Create / Edit Modal -->
          <div *ngIf="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold">
                    <i class="bi bi-calculator me-2 text-warning"></i>
                    {{ isEditing ? 'Edit Cost Estimate' : 'Add New Cost Estimate' }}
                  </h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <form (ngSubmit)="saveEstimate()">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-muted">Cost Category *</label>
                      <select class="form-select" [(ngModel)]="modalData.category" name="category" required>
                        <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold text-muted">Estimated Amount (₹) *</label>
                      <div class="input-group">
                        <span class="input-group-text">₹</span>
                        <input type="number" class="form-control fw-bold" [(ngModel)]="modalData.amount" name="amount" required min="1" placeholder="e.g. 50000">
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold text-muted">Estimate Description *</label>
                      <textarea class="form-control" [(ngModel)]="modalData.description" name="description" required rows="2" placeholder="e.g. Structural steel framework estimate"></textarea>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold text-muted">Task / Milestone Reference</label>
                      <input type="text" class="form-control" [(ngModel)]="modalData.task_reference" name="task_reference" placeholder="e.g. Milestone 2 - Substructure">
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-light border" (click)="showModal = false">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4 fw-bold" [disabled]="isSaving">
                        <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                        Save Estimate
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .style-select { min-width: 200px; }
    .extra-small { font-size: 0.75rem; }
  `]
})
export class CostEstimationComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId: string = '';
  selectedCategory: string = '';
  estimates: CostEstimate[] = [];
  categories: string[] = ['Labor', 'Material', 'Equipment', 'Transportation', 'Maintenance', 'Administrative'];

  totalEstimatedCost: number = 0;
  isLoading: boolean = false;
  isSaving: boolean = false;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingId: string = '';

  modalData = {
    category: 'Labor',
    amount: 0,
    description: '',
    task_reference: ''
  };

  successMessage: string = '';
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
          this.loadEstimates();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load authorized projects.';
      }
    });
  }

  onProjectChange(): void {
    if (this.selectedProjectId) {
      this.loadEstimates();
    }
  }

  loadEstimates(): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.budgetService.getCostEstimates(this.selectedProjectId, this.selectedCategory).subscribe({
      next: (res) => {
        this.estimates = res;
        this.totalEstimatedCost = res.reduce((sum, item) => sum + (item.amount || 0), 0);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.errorMessage = 'HTTP 403 Forbidden: You do not have authorization to access estimates for this project.';
        } else {
          this.errorMessage = err?.error?.detail || 'Failed to load cost estimates.';
        }
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = '';
    this.modalData = { category: 'Labor', amount: 0, description: '', task_reference: '' };
    this.showModal = true;
  }

  openEditModal(est: CostEstimate): void {
    this.isEditing = true;
    this.editingId = est.id;
    this.modalData = {
      category: est.category,
      amount: est.amount,
      description: est.description,
      task_reference: est.task_reference || ''
    };
    this.showModal = true;
  }

  saveEstimate(): void {
    if (this.modalData.amount <= 0) {
      alert('Estimated amount must be greater than zero.');
      return;
    }
    if (!this.modalData.description.trim()) {
      alert('Description is required.');
      return;
    }

    this.isSaving = true;

    if (this.isEditing) {
      this.budgetService.updateCostEstimate(this.editingId, this.modalData).subscribe({
        next: () => {
          this.isSaving = false;
          this.showModal = false;
          this.successMessage = 'Cost estimate successfully updated!';
          this.loadEstimates();
        },
        error: (err) => {
          this.isSaving = false;
          alert(err?.error?.detail || 'Failed to update cost estimate.');
        }
      });
    } else {
      this.budgetService.createCostEstimate(this.selectedProjectId, this.modalData).subscribe({
        next: () => {
          this.isSaving = false;
          this.showModal = false;
          this.successMessage = 'New cost estimate successfully recorded!';
          this.loadEstimates();
        },
        error: (err) => {
          this.isSaving = false;
          alert(err?.error?.detail || 'Failed to create cost estimate.');
        }
      });
    }
  }

  deleteEstimate(id: string): void {
    if (!confirm('Are you sure you want to delete this cost estimate?')) return;

    this.budgetService.deleteCostEstimate(id).subscribe({
      next: () => {
        this.successMessage = 'Cost estimate deleted.';
        this.loadEstimates();
      },
      error: (err) => {
        alert(err?.error?.detail || 'Failed to delete cost estimate.');
      }
    });
  }
}

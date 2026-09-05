import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../core/services/project.service';
import { BudgetService, CategoryAllocation } from '../../core/services/budget.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-budget-planning',
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
                  <li class="breadcrumb-item active">Budget Planning</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-sliders me-2 text-warning"></i>Project Budget Planning & Category Allocation</h2>
              <p class="text-muted small mb-0">Set overall project baseline budget and allocate funds across the 6 cost accounting categories.</p>
            </div>

            <!-- Project Selector Dropdown -->
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
            </div>
          </div>

          <!-- Alert / Success Messages -->
          <div *ngIf="successMessage" class="alert alert-success d-flex align-items-center gap-2 shadow-sm mb-4" role="alert">
            <i class="bi bi-check-circle-fill fs-5"></i>
            <div>{{ successMessage }}</div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 shadow-sm mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{{ errorMessage }}</div>
          </div>

          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted small mt-2">Loading budget details...</p>
          </div>

          <ng-container *ngIf="!isLoading">
            <!-- Equivalence Validation Banner -->
            <div class="alert d-flex align-items-center justify-content-between p-3 mb-4 shadow-sm"
                 [ngClass]="isBudgetValid ? 'alert-success border-success' : 'alert-danger border-danger'">
              <div class="d-flex align-items-center gap-2">
                <i class="bi fs-4" [ngClass]="isBudgetValid ? 'bi-shield-check text-success' : 'bi-shield-x text-danger'"></i>
                <div>
                  <strong class="d-block">{{ isBudgetValid ? 'Single Source of Truth Verified' : 'Budget Allocation Mismatch' }}</strong>
                  <span class="small">
                    Overall Budget (₹{{ overallBudget | number:'1.2-2' }}) 
                    <span [ngClass]="isBudgetValid ? 'text-success fw-bold' : 'text-danger fw-bold'">
                      {{ isBudgetValid ? '=' : '≠' }}
                    </span> 
                    Sum of Allocations (₹{{ totalCategoryAllocations | number:'1.2-2' }})
                  </span>
                </div>
              </div>

              <div class="text-end">
                <span class="badge px-3 py-2 fs-6" [ngClass]="isBudgetValid ? 'bg-success' : 'bg-danger'">
                  {{ isBudgetValid ? 'Valid' : 'Invalid Balance: ₹' + mathAbs(overallBudget - totalCategoryAllocations) }}
                </span>
              </div>
            </div>

            <!-- Planning Form Card -->
            <div class="card card-custom border-0 p-4 shadow-sm bg-white mb-4">
              <h5 class="fw-bold text-dark mb-3"><i class="bi bi-wallet2 me-2 text-warning"></i> 1. Overall Planned Baseline Budget</h5>
              <div class="row g-3 align-items-center mb-4">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Total Planned Budget Amount (₹) *</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light fw-bold">₹</span>
                    <input 
                      type="number" 
                      class="form-control form-control-lg fw-bold text-dark" 
                      [(ngModel)]="overallBudget" 
                      (input)="calculateAllocationsTotal()"
                      placeholder="e.g. 1000000">
                  </div>
                  <span class="extra-small text-muted mt-1 d-block">This represents the master baseline budget for the project.</span>
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Budget Notes / Remarks</label>
                  <input type="text" class="form-control" [(ngModel)]="budgetNotes" placeholder="Optional budget justification or notes">
                </div>
              </div>

              <hr class="my-4">

              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="bi bi-pie-chart-fill me-2 text-warning"></i> 2. Category Allocations (Must Sum to Overall Budget)</h5>
                <button type="button" class="btn btn-sm btn-outline-warning" (click)="autoDistributeBudget()">
                  <i class="bi bi-magic me-1"></i> Auto-Balance Categories
                </button>
              </div>

              <div class="table-responsive mb-4">
                <table class="table table-bordered align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 25%;">Category Name</th>
                      <th style="width: 35%;">Allocated Amount (₹)</th>
                      <th style="width: 40%;">Category Notes / Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let alloc of categoryAllocations; let i = index">
                      <td class="fw-bold text-dark">
                        <i class="bi bi-tag-fill me-2 text-warning"></i>{{ alloc.category }}
                      </td>
                      <td>
                        <div class="input-group input-group-sm">
                          <span class="input-group-text bg-light">₹</span>
                          <input 
                            type="number" 
                            class="form-control fw-bold"
                            [(ngModel)]="alloc.allocated_amount"
                            (input)="calculateAllocationsTotal()"
                            min="0"
                            placeholder="0.00">
                        </div>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          class="form-control form-control-sm"
                          [(ngModel)]="alloc.notes"
                          placeholder="Category scope or notes">
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="table-light fw-bold">
                    <tr>
                      <td>Total Category Allocations:</td>
                      <td [ngClass]="isBudgetValid ? 'text-success' : 'text-danger'" class="fs-6">
                        ₹{{ totalCategoryAllocations | number:'1.2-2' }}
                      </td>
                      <td class="small text-muted">
                        Target: ₹{{ overallBudget | number:'1.2-2' }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Action Submit Button -->
              <div class="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  class="btn btn-bt-accent px-4 py-2 fw-bold shadow-sm"
                  [disabled]="isSaving || !isBudgetValid"
                  (click)="saveBudget()">
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i *ngIf="!isSaving" class="bi bi-check-circle-fill me-2"></i>
                  Save & Validate Budget
                </button>
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
export class BudgetPlanningComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId: string = '';
  overallBudget: number = 0;
  budgetNotes: string = '';
  categoryAllocations: CategoryAllocation[] = [
    { category: 'Labor', allocated_amount: 0, notes: 'Workforce pay & sub-contract labor' },
    { category: 'Material', allocated_amount: 0, notes: 'Raw material procurement & stock' },
    { category: 'Equipment', allocated_amount: 0, notes: 'Machinery rental & operational costs' },
    { category: 'Transportation', allocated_amount: 0, notes: 'Site logistics & haulage' },
    { category: 'Maintenance', allocated_amount: 0, notes: 'Equipment servicing & site repairs' },
    { category: 'Administrative', allocated_amount: 0, notes: 'Site office expenses & compliance' }
  ];

  totalCategoryAllocations: number = 0;
  isBudgetValid: boolean = true;
  isLoading: boolean = false;
  isSaving: boolean = false;
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
          this.loadBudgetDetails();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load authorized projects.';
      }
    });
  }

  onProjectChange(): void {
    if (this.selectedProjectId) {
      this.loadBudgetDetails();
    }
  }

  loadBudgetDetails(): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.budgetService.getProjectBudget(this.selectedProjectId).subscribe({
      next: (res) => {
        this.overallBudget = res.overall_budget || 0;
        this.budgetNotes = res.notes || '';

        if (res.allocations && res.allocations.length > 0) {
          const allocMap = new Map<string, CategoryAllocation>();
          res.allocations.forEach(a => allocMap.set(a.category.toLowerCase(), a));

          this.categoryAllocations.forEach(c => {
            const found = allocMap.get(c.category.toLowerCase());
            if (found) {
              c.allocated_amount = found.allocated_amount;
              c.notes = found.notes || c.notes;
            }
          });
        }
        this.calculateAllocationsTotal();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.errorMessage = 'HTTP 403 Forbidden: You do not have authorization to access budget records for this project.';
        } else {
          this.errorMessage = err?.error?.detail || 'Failed to load budget details.';
        }
      }
    });
  }

  calculateAllocationsTotal(): void {
    this.totalCategoryAllocations = this.categoryAllocations.reduce((sum, item) => sum + (item.allocated_amount || 0), 0);
    this.isBudgetValid = Math.abs(this.overallBudget - this.totalCategoryAllocations) < 0.01;
  }

  autoDistributeBudget(): void {
    if (this.overallBudget <= 0) return;
    const equalShare = Math.floor((this.overallBudget / 6) * 100) / 100;
    const remainder = Math.round((this.overallBudget - (equalShare * 6)) * 100) / 100;

    this.categoryAllocations.forEach((cat, idx) => {
      cat.allocated_amount = idx === 0 ? equalShare + remainder : equalShare;
    });
    this.calculateAllocationsTotal();
  }

  saveBudget(): void {
    this.calculateAllocationsTotal();

    if (!this.isBudgetValid) {
      this.errorMessage = `Overall budget (₹${this.overallBudget}) must equal the sum of category allocations (₹${this.totalCategoryAllocations}).`;
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      overall_budget: this.overallBudget,
      notes: this.budgetNotes,
      category_allocations: this.categoryAllocations
    };

    this.budgetService.saveProjectBudget(this.selectedProjectId, payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.successMessage = 'Project budget and category allocations successfully saved and validated!';
        this.loadBudgetDetails();
      },
      error: (err) => {
        this.isSaving = false;
        if (err.status === 403) {
          this.errorMessage = 'HTTP 403 Forbidden: You do not have authorization to modify budget records for this project.';
        } else {
          this.errorMessage = err?.error?.detail || 'Failed to save project budget.';
        }
      }
    });
  }

  mathAbs(val: number): number {
    return Math.abs(Math.round(val * 100) / 100);
  }
}

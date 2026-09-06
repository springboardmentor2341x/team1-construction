import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../core/services/project.service';
import { BudgetService, ActualExpense } from '../../core/services/budget.service';
import { WorkforceService } from '../../core/services/workforce.service';
import { MaterialService } from '../../core/services/material.service';
import { ResourceService } from '../../core/services/resource.service';
import { ProcurementService } from '../../core/services/procurement.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-expense-management',
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
                  <li class="breadcrumb-item active">Expense Management</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-receipt me-2 text-warning"></i>Actual Expense Tracking & Ledger</h2>
              <p class="text-muted small mb-0">Record actual financial disbursements with module cross-references to Workforce, Materials, Equipment, and Procurement.</p>
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
                <i class="bi bi-plus-circle-fill"></i> Add Actual Expense
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
                <span class="text-muted extra-small fw-bold text-uppercase">Total Actual Expenses (Sum)</span>
                <div class="fs-4 fw-bold text-danger mt-1">₹{{ totalActualExpenses | number:'1.2-2' }}</div>
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle mt-2 align-self-start">
                  {{ expenses.length }} Actual Transactions
                </span>
              </div>
            </div>

            <div class="col-md-6 col-lg-8">
              <div class="card card-custom p-3 border-0 bg-white shadow-sm h-100 d-flex flex-row align-items-center justify-content-between">
                <div>
                  <h6 class="fw-bold text-dark mb-1">Filter by Category</h6>
                  <p class="text-muted extra-small mb-0">Select category to refine expense ledger list</p>
                </div>
                <select class="form-select form-select-sm style-select border-secondary-subtle" [(ngModel)]="selectedCategory" (change)="loadExpenses()">
                  <option value="">All 6 Categories</option>
                  <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                </select>
              </div>
            </div>
          </div>

          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted small mt-2">Loading expense ledger...</p>
          </div>

          <!-- Expenses Table -->
          <div *ngIf="!isLoading" class="card card-custom border-0 p-4 shadow-sm bg-white">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light text-muted small">
                  <tr>
                    <th>Expense Code</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Source / Module Link</th>
                    <th>Amount (₹)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let exp of expenses">
                    <td class="fw-bold text-warning">{{ exp.expense_code }}</td>
                    <td class="text-nowrap">{{ exp.expense_date }}</td>
                    <td><span class="badge bg-light text-dark border">{{ exp.category }}</span></td>
                    <td class="fw-semibold text-dark">{{ exp.description }}</td>
                    <td>
                      <span *ngIf="exp.worker_name" class="badge bg-info-subtle text-info border me-1"><i class="bi bi-person me-1"></i>{{ exp.worker_name }}</span>
                      <span *ngIf="exp.material_name" class="badge bg-success-subtle text-success border me-1"><i class="bi bi-box-seam me-1"></i>{{ exp.material_name }}</span>
                      <span *ngIf="exp.equipment_name" class="badge bg-warning-subtle text-dark border me-1"><i class="bi bi-truck me-1"></i>{{ exp.equipment_name }}</span>
                      <span *ngIf="exp.po_number" class="badge bg-primary-subtle text-primary border me-1"><i class="bi bi-receipt me-1"></i>{{ exp.po_number }}</span>
                      <span *ngIf="!exp.worker_name && !exp.material_name && !exp.equipment_name && !exp.po_number" class="text-muted extra-small">{{ exp.source_reference || 'Direct Entry' }}</span>
                    </td>
                    <td class="fw-bold text-danger">₹{{ exp.amount | number:'1.2-2' }}</td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-warning py-0 px-2" (click)="openEditModal(exp)">
                          <i class="bi bi-pencil-square"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger py-0 px-2" (click)="deleteExpense(exp.id)">
                          <i class="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="expenses.length === 0">
                    <td colspan="7" class="text-center py-4 text-muted">
                      <i class="bi bi-inbox fs-3 d-block mb-1"></i>
                      No actual expenses recorded for this project.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Create / Edit Expense Modal -->
          <div *ngIf="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold">
                    <i class="bi bi-receipt me-2 text-warning"></i>
                    {{ isEditing ? 'Edit Expense Record' : 'Record New Actual Expense' }}
                  </h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <form (ngSubmit)="saveExpense()">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted">Cost Category *</label>
                        <select class="form-select" [(ngModel)]="modalData.category" name="category" required>
                          <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted">Expense Date *</label>
                        <input type="date" class="form-control" [(ngModel)]="modalData.expense_date" name="expense_date" required>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted">Actual Expense Amount (₹) *</label>
                        <div class="input-group">
                          <span class="input-group-text fw-bold">₹</span>
                          <input type="number" class="form-control fw-bold" [(ngModel)]="modalData.amount" name="amount" required min="1" placeholder="e.g. 200000">
                        </div>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted">Source / Voucher Reference</label>
                        <input type="text" class="form-control" [(ngModel)]="modalData.source_reference" name="source_reference" placeholder="e.g. VOUCHER-901 / Invoice #402">
                      </div>

                      <div class="col-12">
                        <label class="form-label small fw-bold text-muted">Expense Description *</label>
                        <textarea class="form-control" [(ngModel)]="modalData.description" name="description" required rows="2" placeholder="e.g. Ready mix concrete delivery batch 4"></textarea>
                      </div>

                      <hr class="my-3">
                      <h6 class="fw-bold text-dark mb-2 small"><i class="bi bi-link-45deg me-1 text-warning"></i> Optional Module Cross-References</h6>

                      <div class="col-md-6">
                        <label class="form-label extra-small text-muted">Worker Reference (Workforce)</label>
                        <select class="form-select form-select-sm" [(ngModel)]="modalData.worker_id" name="worker_id">
                          <option value="">-- No Worker Link --</option>
                          <option *ngFor="let w of workers" [value]="w.id">{{ w.worker_name }} ({{ w.worker_id }})</option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label extra-small text-muted">Material Reference (Inventory)</label>
                        <select class="form-select form-select-sm" [(ngModel)]="modalData.material_id" name="material_id">
                          <option value="">-- No Material Link --</option>
                          <option *ngFor="let m of materials" [value]="m.id">{{ m.name }} ({{ m.material_code }})</option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label extra-small text-muted">Equipment Reference (Resource Fleet)</label>
                        <select class="form-select form-select-sm" [(ngModel)]="modalData.equipment_id" name="equipment_id">
                          <option value="">-- No Equipment Link --</option>
                          <option *ngFor="let eq of equipmentList" [value]="eq.id">{{ eq.name }} ({{ eq.equipment_code }})</option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label extra-small text-muted">Purchase Order Reference (Procurement)</label>
                        <select class="form-select form-select-sm" [(ngModel)]="modalData.purchase_order_id" name="purchase_order_id">
                          <option value="">-- No PO Link --</option>
                          <option *ngFor="let po of purchaseOrders" [value]="po.id">{{ po.purchase_order_id }} (₹{{ po.total_amount | number:'1.0-0' }})</option>
                        </select>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-light border" (click)="showModal = false">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4 fw-bold" [disabled]="isSaving">
                        <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                        Save Expense Record
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
export class ExpenseManagementComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId: string = '';
  selectedCategory: string = '';
  expenses: ActualExpense[] = [];
  categories: string[] = ['Labor', 'Material', 'Equipment', 'Transportation', 'Maintenance', 'Administrative'];

  workers: any[] = [];
  materials: any[] = [];
  equipmentList: any[] = [];
  purchaseOrders: any[] = [];

  totalActualExpenses: number = 0;
  isLoading: boolean = false;
  isSaving: boolean = false;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingId: string = '';

  modalData = {
    category: 'Material',
    amount: 0,
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    source_reference: '',
    worker_id: '',
    material_id: '',
    equipment_id: '',
    purchase_order_id: ''
  };

  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private projectService: ProjectService,
    private budgetService: BudgetService,
    private workforceService: WorkforceService,
    private materialService: MaterialService,
    private resourceService: ResourceService,
    private procurementService: ProcurementService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadDropdownReferences();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        if (data.length > 0) {
          this.selectedProjectId = data[0].id;
          this.loadExpenses();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load authorized projects.';
      }
    });
  }

  loadDropdownReferences(): void {
    this.workforceService.getWorkers().subscribe({ next: (data: any) => this.workers = data?.items || data || [], error: () => {} });
    this.materialService.getMaterials().subscribe({ next: (data: any) => this.materials = data?.items || data || [], error: () => {} });
    this.resourceService.getResources().subscribe({ next: (data: any) => this.equipmentList = data?.items || data || [], error: () => {} });
    this.procurementService.getPurchaseOrders().subscribe({ next: (data: any) => this.purchaseOrders = data?.items || data || [], error: () => {} });
  }

  onProjectChange(): void {
    if (this.selectedProjectId) {
      this.loadExpenses();
    }
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.budgetService.getActualExpenses(this.selectedProjectId, this.selectedCategory).subscribe({
      next: (res) => {
        this.expenses = res;
        this.totalActualExpenses = res.reduce((sum, item) => sum + (item.amount || 0), 0);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.errorMessage = 'HTTP 403 Forbidden: You do not have authorization to access expenses for this project.';
        } else {
          this.errorMessage = err?.error?.detail || 'Failed to load actual expenses.';
        }
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = '';
    this.modalData = {
      category: 'Material',
      amount: 0,
      description: '',
      expense_date: new Date().toISOString().split('T')[0],
      source_reference: '',
      worker_id: '',
      material_id: '',
      equipment_id: '',
      purchase_order_id: ''
    };
    this.showModal = true;
  }

  openEditModal(exp: ActualExpense): void {
    this.isEditing = true;
    this.editingId = exp.id;
    this.modalData = {
      category: exp.category,
      amount: exp.amount,
      description: exp.description,
      expense_date: exp.expense_date,
      source_reference: exp.source_reference || '',
      worker_id: exp.worker_id || '',
      material_id: exp.material_id || '',
      equipment_id: exp.equipment_id || '',
      purchase_order_id: exp.purchase_order_id || ''
    };
    this.showModal = true;
  }

  saveExpense(): void {
    if (this.modalData.amount <= 0) {
      alert('Expense amount must be greater than zero.');
      return;
    }
    if (!this.modalData.description.trim()) {
      alert('Description is required.');
      return;
    }

    this.isSaving = true;

    const payload = {
      ...this.modalData,
      worker_id: this.modalData.worker_id || null,
      material_id: this.modalData.material_id || null,
      equipment_id: this.modalData.equipment_id || null,
      purchase_order_id: this.modalData.purchase_order_id || null
    };

    if (this.isEditing) {
      this.budgetService.updateActualExpense(this.editingId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showModal = false;
          this.successMessage = 'Actual expense record successfully updated!';
          this.loadExpenses();
        },
        error: (err) => {
          this.isSaving = false;
          alert(err?.error?.detail || 'Failed to update actual expense.');
        }
      });
    } else {
      this.budgetService.createActualExpense(this.selectedProjectId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showModal = false;
          this.successMessage = 'New actual expense record successfully saved!';
          this.loadExpenses();
        },
        error: (err) => {
          this.isSaving = false;
          alert(err?.error?.detail || 'Failed to create actual expense.');
        }
      });
    }
  }

  deleteExpense(id: string): void {
    if (!confirm('Are you sure you want to delete this actual expense record?')) return;

    this.budgetService.deleteActualExpense(id).subscribe({
      next: () => {
        this.successMessage = 'Actual expense record deleted.';
        this.loadExpenses();
      },
      error: (err) => {
        alert(err?.error?.detail || 'Failed to delete actual expense.');
      }
    });
  }
}

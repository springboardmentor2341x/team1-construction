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
  ProjectExpense, 
  CostCategory, 
  ExpenseCreate, 
  ExpenseUpdate 
} from '../../../core/models/budget.model';
import { Project } from '../../../core/models/project.model';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-expense-management',
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
                <h2 class="fw-bold text-dark mb-0">Expense Management</h2>
              </div>
              <p class="text-muted small mb-0">Track and manage actual project expenses by category.</p>
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
                <select class="form-select" [(ngModel)]="selectedProjectId" (change)="loadExpenses()">
                  <option value="">-- Select Project --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
              <div class="col-md-6 d-flex align-items-end">
                <button class="btn btn-bt-accent w-100" (click)="showExpenseForm = !showExpenseForm" [disabled]="!selectedProjectId">
                  <i class="bi bi-plus-circle me-1"></i> {{ showExpenseForm ? 'Cancel' : 'Add New Expense' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted mt-2 small">Loading expenses...</p>
          </div>

          <!-- No Project Selected State -->
          <div *ngIf="!loading && !selectedProjectId" class="text-center py-5">
            <div class="card card-custom border-0 p-5">
              <i class="bi bi-receipt fs-1 text-warning d-block mb-3"></i>
              <h5 class="fw-bold text-dark mb-2">Select a Project to Manage Expenses</h5>
              <p class="text-muted small">Choose a project from the dropdown above to view and manage its expenses.</p>
            </div>
          </div>

          <!-- Add/Edit Expense Form -->
          <div *ngIf="showExpenseForm && selectedProjectId" class="card card-custom border-0 p-4 mb-4">
            <h5 class="fw-bold text-dark mb-3">
              <i class="bi bi-plus-circle me-2 text-warning"></i>
              {{ editingExpense ? 'Update Expense Record' : 'Add New Expense' }}
            </h5>
            
            <form (ngSubmit)="saveExpense()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Cost Category</label>
                  <select class="form-select" 
                          [(ngModel)]="expenseForm.costCategoryId" 
                          name="costCategoryId" required>
                    <option value="">Select Category</option>
                    <option *ngFor="let cat of costCategories" [value]="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Expense Title</label>
                  <input type="text" 
                         class="form-control" 
                         [(ngModel)]="expenseForm.expenseTitle" 
                         name="expenseTitle"
                         required
                         placeholder="e.g., Steel Material Purchase">
                </div>
                
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Amount</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" 
                           class="form-control" 
                           [(ngModel)]="expenseForm.amount" 
                           name="amount"
                           min="0.01" 
                           step="0.01" 
                           required
                           placeholder="0.00">
                  </div>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Expense Date</label>
                  <input type="date" 
                         class="form-control" 
                         [(ngModel)]="expenseForm.expenseDate" 
                         name="expenseDate"
                         required>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Status</label>
                  <select class="form-select" 
                          [(ngModel)]="expenseForm.status" 
                          name="status">
                    <option value="Recorded">Recorded</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Vendor/Payee (Optional)</label>
                  <input type="text" 
                         class="form-control" 
                         [(ngModel)]="expenseForm.vendorOrPayee" 
                         name="vendorOrPayee"
                         placeholder="Vendor name or payee">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Reference No (Optional)</label>
                  <input type="text" 
                         class="form-control" 
                         [(ngModel)]="expenseForm.referenceNo" 
                         name="referenceNo"
                         placeholder="Invoice or reference number">
                </div>
                
                <div class="col-12">
                  <label class="form-label small fw-bold text-muted">Notes (Optional)</label>
                  <textarea class="form-control" 
                            [(ngModel)]="expenseForm.notes" 
                            name="notes"
                            rows="2" 
                            placeholder="Additional notes or description..."></textarea>
                </div>
                
                <div class="col-12 d-flex gap-2">
                  <button type="submit" 
                          class="btn btn-bt-accent"
                          [disabled]="saving">
                    <i class="bi bi-save me-1"></i> {{ saving ? 'Saving...' : (editingExpense ? 'Update' : 'Create') }}
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

          <!-- Expenses List -->
          <div *ngIf="!loading && selectedProjectId">
            <div class="card card-custom border-0 p-4">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold text-dark mb-0">
                  <i class="bi bi-receipt-cutoff me-2 text-warning"></i>
                  Expenses for {{ selectedProject?.projectName }}
                </h5>
                <div class="text-muted small">
                  Total Expenses: {{ expenses.length }} | 
                  Total Amount: <strong>\${{ totalExpenseAmount | number }}</strong>
                </div>
              </div>

              <div class="table-responsive" *ngIf="expenses.length > 0; else noExpenses">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Category</th>
                      <th>Expense Title</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Vendor/Payee</th>
                      <th>Status</th>
                      <th>Reference</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let expense of expenses">
                      <td>
                        <span class="badge bg-light text-dark">{{ expense.costCategory.name }}</span>
                      </td>
                      <td class="fw-semibold">{{ expense.expenseTitle }}</td>
                      <td class="fw-bold text-danger">\${{ expense.amount | number }}</td>
                      <td>{{ expense.expenseDate }}</td>
                      <td>{{ expense.vendorOrPayee || '-' }}</td>
                      <td>
                        <span class="badge" [ngClass]="getExpenseStatusClass(expense.status)">
                          {{ expense.status }}
                        </span>
                      </td>
                      <td class="extra-small">{{ expense.referenceNo || '-' }}</td>
                      <td class="text-end">
                        <div class="btn-group">
                          <button class="btn btn-sm btn-outline-warning" (click)="editExpense(expense)" title="Edit">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" (click)="deleteExpense(expense.id)" title="Delete">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noExpenses>
                <div class="text-muted small py-5 text-center">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                  No expenses found for this project. Click "Add New Expense" to create one.
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
export class ExpenseManagementComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  selectedProject: Project | null = null;
  expenses: ProjectExpense[] = [];
  costCategories: CostCategory[] = [];
  loading = false;
  saving = false;
  showExpenseForm = false;
  editingExpense: ProjectExpense | null = null;

  expenseForm: ExpenseCreate = {
    projectId: '',
    costCategoryId: '',
    expenseTitle: '',
    amount: 0,
    expenseDate: '',
    vendorOrPayee: '',
    referenceNo: '',
    notes: '',
    status: 'Recorded',
    sourceType: 'Manual',
    sourceId: ''
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

    // Set default expense date to today
    const today = new Date().toISOString().split('T')[0];
    this.expenseForm.expenseDate = today;

    // Check for projectId in query params
    this.route.queryParams.subscribe(params => {
      if (params['projectId']) {
        this.selectedProjectId = params['projectId'];
        this.loadExpenses();
      }
    });
  }

  get totalExpenseAmount(): number {
    return this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  getExpenseStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-success';
      case 'Pending': return 'bg-warning text-dark';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  loadExpenses(): void {
    if (!this.selectedProjectId) {
      this.expenses = [];
      this.selectedProject = null;
      return;
    }

    this.selectedProject = this.projects.find(p => p.id === this.selectedProjectId) || null;
    this.loading = true;
    this.budgetService.getProjectExpenses(this.selectedProjectId).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.loading = false;
      },
      error: () => {
        this.expenses = [];
        this.loading = false;
      }
    });
  }

  saveExpense(): void {
    if (!this.selectedProjectId || !this.expenseForm.costCategoryId || 
        !this.expenseForm.expenseTitle || this.expenseForm.amount <= 0) {
      return;
    }

    this.saving = true;
    this.expenseForm.projectId = this.selectedProjectId;

    if (this.editingExpense) {
      // Update existing expense
      const updateData: ExpenseUpdate = {
        expenseTitle: this.expenseForm.expenseTitle,
        amount: this.expenseForm.amount,
        expenseDate: this.expenseForm.expenseDate,
        vendorOrPayee: this.expenseForm.vendorOrPayee,
        referenceNo: this.expenseForm.referenceNo,
        notes: this.expenseForm.notes,
        status: this.expenseForm.status
      };
      this.budgetService.updateExpense(this.editingExpense.id, updateData).subscribe({
        next: () => {
          this.saving = false;
          this.cancelEdit();
          this.loadExpenses();
        },
        error: () => {
          this.saving = false;
        }
      });
    } else {
      // Create new expense
      this.budgetService.createExpense(this.expenseForm).subscribe({
        next: () => {
          this.saving = false;
          this.cancelEdit();
          this.loadExpenses();
        },
        error: () => {
          this.saving = false;
        }
      });
    }
  }

  editExpense(expense: ProjectExpense): void {
    this.editingExpense = expense;
    this.expenseForm = {
      projectId: expense.projectId,
      costCategoryId: expense.costCategory.id,
      expenseTitle: expense.expenseTitle,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      vendorOrPayee: expense.vendorOrPayee || '',
      referenceNo: expense.referenceNo || '',
      notes: expense.notes || '',
      status: expense.status,
      sourceType: expense.sourceType,
      sourceId: expense.sourceId || ''
    };
    this.showExpenseForm = true;
  }

  deleteExpense(expenseId: string): void {
    if (!confirm('Are you sure you want to delete this expense record?')) return;

    this.budgetService.deleteExpense(expenseId).subscribe({
      next: () => {
        this.loadExpenses();
      },
      error: () => {
        // Handle error
      }
    });
  }

  cancelEdit(): void {
    this.editingExpense = null;
    this.showExpenseForm = false;
    this.expenseForm = {
      projectId: this.selectedProjectId,
      costCategoryId: '',
      expenseTitle: '',
      amount: 0,
      expenseDate: new Date().toISOString().split('T')[0],
      vendorOrPayee: '',
      referenceNo: '',
      notes: '',
      status: 'Recorded',
      sourceType: 'Manual',
      sourceId: ''
    };
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { WorkerDialogComponent } from '../worker-dialog/worker-dialog.component';
import { BulkImportDialogComponent } from '../bulk-import-dialog/bulk-import-dialog.component';
import { WorkforceService } from '../../../core/services/workforce.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { Worker, WorkforceCategory, PaginatedWorkersResponse } from '../../../core/models/workforce.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-worker-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    SidebarComponent,
    WorkerDialogComponent,
    BulkImportDialogComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <!-- Page Title & Actions -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb small mb-1">
                  <li class="breadcrumb-item"><a routerLink="/workforce/dashboard" class="text-decoration-none text-warning">Workforce</a></li>
                  <li class="breadcrumb-item active">Worker Directory</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-person-vcard-fill me-2 text-warning"></i>Worker Directory & Personnel Registry</h2>
              <p class="text-muted small mb-0">Search, filter, manage, and register workforce personnel with server-side pagination.</p>
            </div>

            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-dark d-flex align-items-center gap-2 shadow-sm" (click)="showBulkDialog = true">
                <i class="bi bi-file-earmark-spreadsheet-fill text-warning"></i> Bulk Import CSV
              </button>
              <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" (click)="openAddDialog()">
                <i class="bi bi-person-plus-fill"></i> Add New Worker
              </button>
            </div>
          </div>

          <!-- Alert Messages -->
          <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> {{ successMessage }}
            <button type="button" class="btn-close" (click)="successMessage = ''"></button>
          </div>

          <!-- Search & Filter Controls -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-3 align-items-center">
              <!-- Search -->
              <div class="col-xl-3 col-md-6">
                <div class="input-group">
                  <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control" placeholder="Search ID, Name, or Skill..." [(ngModel)]="search" (keyup.enter)="onSearch()">
                </div>
              </div>

              <!-- Category Filter -->
              <div class="col-xl-3 col-md-6">
                <select class="form-select" [(ngModel)]="selectedCategoryId" (change)="onSearch()">
                  <option value="">-- All Categories --</option>
                  <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>

              <!-- Project Filter -->
              <div class="col-xl-3 col-md-6">
                <select class="form-select" [(ngModel)]="selectedProjectId" (change)="onSearch()">
                  <option value="">-- All Projects --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>

              <!-- Status Filter -->
              <div class="col-xl-2 col-md-4">
                <select class="form-select" [(ngModel)]="selectedStatus" (change)="onSearch()">
                  <option value="">-- All Statuses --</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <!-- Reset -->
              <div class="col-xl-1 col-md-2 text-end">
                <button class="btn btn-outline-secondary w-100" (click)="resetFilters()" title="Reset Filters">
                  <i class="bi bi-arrow-counterclockwise"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Workers Table -->
          <div class="card card-custom border-0 p-4">
            <div *ngIf="loading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div>
              <p class="text-muted mt-2 small">Fetching workforce records...</p>
            </div>

            <div *ngIf="!loading">
              <div class="table-responsive" *ngIf="response && response.items.length; else noWorkers">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Worker ID</th>
                      <th>Worker Name</th>
                      <th>Category</th>
                      <th>Skill / Work Type</th>
                      <th>Contractor</th>
                      <th>Current Project</th>
                      <th>Status</th>
                      <th>Pay Rate</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let w of response.items">
                      <td class="fw-bold text-dark">
                        <span class="badge bg-light text-dark border font-monospace">{{ w.workerId }}</span>
                      </td>
                      <td>
                        <div class="fw-bold">
                          <a [routerLink]="['/workforce/workers', w.id]" class="text-dark text-decoration-none hover-warning">
                            {{ w.workerName }}
                          </a>
                        </div>
                        <div class="extra-small text-muted" *ngIf="w.contactInformation">{{ w.contactInformation }}</div>
                      </td>
                      <td><span class="badge bg-warning text-dark">{{ w.categoryName }}</span></td>
                      <td>{{ w.skillOrWorkType || 'General Labor' }}</td>
                      <td>{{ w.contractorName || 'Direct Hire' }}</td>
                      <td>
                        <span *ngIf="w.currentProjectName" class="badge bg-info-subtle text-info border">
                          <i class="bi bi-building me-1"></i>{{ w.currentProjectName }}
                        </span>
                        <span *ngIf="!w.currentProjectName" class="text-muted italic">Unassigned</span>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-success': w.workerStatus === 'Active',
                          'bg-secondary': w.workerStatus === 'Inactive',
                          'bg-warning text-dark': w.workerStatus === 'On Leave',
                          'bg-danger': w.workerStatus === 'Terminated'
                        }">{{ w.workerStatus }}</span>
                      </td>
                      <td class="fw-semibold">₹{{ w.payRate | number }} / day</td>
                      <td class="text-end">
                        <div class="btn-group btn-group-sm">
                          <a [routerLink]="['/workforce/workers', w.id]" class="btn btn-outline-dark" title="View 360 Worker Details">
                            <i class="bi bi-eye"></i> Details
                          </a>
                          <button class="btn btn-outline-primary" (click)="openEditDialog(w)" title="Edit Worker">
                            <i class="bi bi-pencil"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <ng-template #noWorkers>
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-people d-block fs-1 opacity-50 mb-2"></i>
                  <h5>No Worker Records Found</h5>
                  <p class="small mb-3">No workforce personnel match your current filter parameters.</p>
                  <button class="btn btn-bt-accent btn-sm" (click)="openAddDialog()">Register First Worker</button>
                </div>
              </ng-template>

              <!-- Server-side Pagination -->
              <div *ngIf="response && response.totalPages > 1" class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <span class="small text-muted">
                  Showing page <strong>{{ response.page }}</strong> of <strong>{{ response.totalPages }}</strong> (Total <strong>{{ response.total }}</strong> workers)
                </span>
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" [class.disabled]="response.page === 1">
                    <button class="page-link" (click)="changePage(response.page - 1)">Previous</button>
                  </li>
                  <li *ngFor="let p of getPagesArray(response.totalPages)" class="page-item" [class.active]="p === response.page">
                    <button class="page-link" (click)="changePage(p)">{{ p }}</button>
                  </li>
                  <li class="page-item" [class.disabled]="response.page === response.totalPages">
                    <button class="page-link" (click)="changePage(response.page + 1)">Next</button>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          <!-- Dialog Modals -->
          <app-worker-dialog *ngIf="showWorkerDialog" [workerToEdit]="selectedWorkerToEdit" (close)="showWorkerDialog = false" (saved)="onWorkerSaved($event)"></app-worker-dialog>
          <app-bulk-import-dialog *ngIf="showBulkDialog" (close)="showBulkDialog = false" (completed)="onBulkCompleted()"></app-bulk-import-dialog>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.76rem; }
  `]
})
export class WorkerListComponent implements OnInit {
  response: PaginatedWorkersResponse | null = null;
  loading = true;

  search = '';
  selectedCategoryId = '';
  selectedProjectId = '';
  selectedStatus = '';
  currentPage = 1;
  pageSize = 10;

  categories: WorkforceCategory[] = [];
  projects: Project[] = [];

  showWorkerDialog = false;
  showBulkDialog = false;
  selectedWorkerToEdit: Worker | null = null;
  successMessage = '';

  constructor(
    private workforceService: WorkforceService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.workforceService.getCategories().subscribe(cats => this.categories = cats);
    this.projectService.getProjects().subscribe(p => this.projects = p);
    this.loadWorkers();
  }

  loadWorkers(): void {
    this.loading = true;
    this.workforceService.getWorkers({
      search: this.search,
      categoryId: this.selectedCategoryId,
      projectId: this.selectedProjectId,
      workerStatus: this.selectedStatus,
      page: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        this.response = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadWorkers();
  }

  resetFilters(): void {
    this.search = '';
    this.selectedCategoryId = '';
    this.selectedProjectId = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadWorkers();
  }

  changePage(newPage: number): void {
    if (this.response && newPage >= 1 && newPage <= this.response.totalPages) {
      this.currentPage = newPage;
      this.loadWorkers();
    }
  }

  getPagesArray(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  openAddDialog(): void {
    this.selectedWorkerToEdit = null;
    this.showWorkerDialog = true;
  }

  openEditDialog(w: Worker): void {
    this.selectedWorkerToEdit = w;
    this.showWorkerDialog = true;
  }

  onWorkerSaved(w: Worker): void {
    this.showWorkerDialog = false;
    this.successMessage = `Worker ${w.workerName} (${w.workerId}) saved successfully!`;
    this.loadWorkers();
  }

  onBulkCompleted(): void {
    this.showBulkDialog = false;
    this.successMessage = 'Bulk worker registration completed successfully!';
    this.loadWorkers();
  }
}

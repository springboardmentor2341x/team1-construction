import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { WorkforceService } from '../../../core/services/workforce.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { Worker, WorkerProjectAssignment, WorkerTransferRequest } from '../../../core/models/workforce.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-workforce-allocation',
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
          <!-- Header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb small mb-1">
                  <li class="breadcrumb-item"><a routerLink="/workforce/dashboard" class="text-decoration-none text-warning">Workforce</a></li>
                  <li class="breadcrumb-item active">Workforce Allocation</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-diagram-3-fill me-2 text-warning"></i>Workforce Allocation & Project Deployment</h2>
              <p class="text-muted small mb-0">Assign workers to construction projects/contractors and perform worker transfers preserving assignment history.</p>
            </div>

            <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" (click)="showAssignModal = true">
              <i class="bi bi-plus-circle-fill"></i> New Project Assignment
            </button>
          </div>

          <!-- Alert Messages -->
          <div *ngIf="message" class="alert alert-success alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> {{ message }}
            <button type="button" class="btn-close" (click)="message = ''"></button>
          </div>
          <div *ngIf="error" class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
            <button type="button" class="btn-close" (click)="error = ''"></button>
          </div>

          <!-- Filters -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-4">
                <select class="form-select" [(ngModel)]="filterProjectId" (change)="loadAssignments()">
                  <option value="">-- All Projects --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
              <div class="col-md-4">
                <select class="form-select" [(ngModel)]="filterContractorId" (change)="loadAssignments()">
                  <option value="">-- All Contractors --</option>
                  <option *ngFor="let c of contractors" [value]="c.id">{{ c.fullName }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <select class="form-select" [(ngModel)]="filterStatus" (change)="loadAssignments()">
                  <option value="">-- All Statuses --</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Assignments Table -->
          <div class="card card-custom border-0 p-4">
            <div *ngIf="loading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div>
              <p class="text-muted mt-2 small">Loading project workforce assignments...</p>
            </div>

            <div *ngIf="!loading">
              <div class="table-responsive" *ngIf="assignments.length; else noAssign">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Worker</th>
                      <th>Project</th>
                      <th>Contractor</th>
                      <th>Work Activity</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let a of assignments">
                      <td class="fw-bold">
                        <a [routerLink]="['/workforce/workers', a.workerId]" class="text-dark text-decoration-none hover-warning">
                          {{ a.workerName }} ({{ a.workerCode }})
                        </a>
                      </td>
                      <td>{{ a.projectName }}</td>
                      <td>{{ a.contractorName || 'Direct Hire' }}</td>
                      <td><span class="badge bg-light text-dark border">{{ a.workActivity || 'General Labor' }}</span></td>
                      <td>{{ a.assignmentStartDate }}</td>
                      <td>{{ a.assignmentEndDate || 'Ongoing' }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-success': a.assignmentStatus === 'Active',
                          'bg-secondary': a.assignmentStatus === 'Completed',
                          'bg-info text-dark': a.assignmentStatus === 'Transferred',
                          'bg-danger': a.assignmentStatus === 'Cancelled'
                        }">{{ a.assignmentStatus }}</span>
                      </td>
                      <td class="text-end">
                        <button *ngIf="a.assignmentStatus === 'Active'" class="btn btn-sm btn-outline-warning" (click)="openTransferModal(a)">
                          <i class="bi bi-arrow-left-right me-1"></i> Transfer Worker
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noAssign>
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-diagram-3 d-block fs-1 opacity-50 mb-2"></i>
                  <h5>No Workforce Assignments Found</h5>
                  <p class="small mb-3">No active or historical project allocations match the selected criteria.</p>
                  <button class="btn btn-bt-accent btn-sm" (click)="showAssignModal = true">Assign Worker to Project</button>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Assign Worker Modal -->
          <div *ngIf="showAssignModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-person-plus-fill me-2 text-warning"></i>Assign Worker to Project</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showAssignModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <form (ngSubmit)="submitAssign()">
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Select Worker <span class="text-danger">*</span></label>
                      <select class="form-select" [(ngModel)]="newAssign.workerId" name="workerId" required>
                        <option value="">-- Choose Worker --</option>
                        <option *ngFor="let w of allWorkers" [value]="w.id">{{ w.workerName }} ({{ w.workerId }}) - {{ w.categoryName }}</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Target Project <span class="text-danger">*</span></label>
                      <select class="form-select" [(ngModel)]="newAssign.projectId" name="projectId" required>
                        <option value="">-- Choose Project --</option>
                        <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Contractor Agency</label>
                      <select class="form-select" [(ngModel)]="newAssign.contractorId" name="contractorId">
                        <option value="">-- Direct Site Hire --</option>
                        <option *ngFor="let c of contractors" [value]="c.id">{{ c.fullName }}</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Work Activity / Role</label>
                      <input type="text" class="form-control" [(ngModel)]="newAssign.workActivity" name="workActivity" placeholder="e.g. Foundation Masonry, Rebar Tying">
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Assignment Start Date <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" [(ngModel)]="newAssign.assignmentStartDate" name="assignmentStartDate" required>
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="showAssignModal = false">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4" [disabled]="saving">Assign Worker</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- Transfer Worker Modal -->
          <div *ngIf="showTransferModal && selectedAssign" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-arrow-left-right me-2 text-warning"></i>Transfer Worker to New Project</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showTransferModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <p class="small text-muted mb-3">
                    Transferring <strong>{{ selectedAssign.workerName }}</strong> will mark the current assignment ({{ selectedAssign.projectName }}) as <code>Transferred</code> and open a new active assignment record.
                  </p>

                  <form (ngSubmit)="submitTransfer()">
                    <div class="mb-3">
                      <label class="form-label small fw-bold">New Project Destination <span class="text-danger">*</span></label>
                      <select class="form-select" [(ngModel)]="transferReq.newProjectId" name="newProjectId" required>
                        <option value="">-- Choose New Project --</option>
                        <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">New Contractor Agency</label>
                      <select class="form-select" [(ngModel)]="transferReq.newContractorId" name="newContractorId">
                        <option value="">-- Keep Current / Direct --</option>
                        <option *ngFor="let c of contractors" [value]="c.id">{{ c.fullName }}</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">New Work Activity</label>
                      <input type="text" class="form-control" [(ngModel)]="transferReq.newWorkActivity" name="newWorkActivity" placeholder="e.g. Electrical Rough-in">
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Transfer Effective Date <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" [(ngModel)]="transferReq.transferDate" name="transferDate" required>
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="showTransferModal = false">Cancel</button>
                      <button type="submit" class="btn btn-warning px-4" [disabled]="saving">Execute Transfer</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class WorkforceAllocationComponent implements OnInit {
  assignments: WorkerProjectAssignment[] = [];
  allWorkers: Worker[] = [];
  projects: Project[] = [];
  contractors: any[] = [];

  loading = true;
  saving = false;

  filterProjectId = '';
  filterContractorId = '';
  filterStatus = '';

  message = '';
  error = '';

  showAssignModal = false;
  showTransferModal = false;

  newAssign: Partial<WorkerProjectAssignment> = {
    workerId: '',
    projectId: '',
    contractorId: '',
    workActivity: '',
    assignmentStartDate: new Date().toISOString().split('T')[0],
    assignmentStatus: 'Active'
  };

  selectedAssign: WorkerProjectAssignment | null = null;
  transferReq: WorkerTransferRequest = {
    newProjectId: '',
    newContractorId: '',
    newWorkActivity: '',
    transferDate: new Date().toISOString().split('T')[0]
  };

  constructor(
    private workforceService: WorkforceService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(p => this.projects = p);
    this.userService.getUsers('Contractor').subscribe(c => this.contractors = c);
    this.workforceService.getWorkers({ pageSize: 500 }).subscribe(w => this.allWorkers = w.items);
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.loading = true;
    this.workforceService.getAssignments({
      projectId: this.filterProjectId,
      contractorId: this.filterContractorId,
      assignmentStatus: this.filterStatus
    }).subscribe({
      next: (data) => {
        this.assignments = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  submitAssign(): void {
    if (!this.newAssign.workerId || !this.newAssign.projectId) return;

    this.saving = true;
    this.error = '';
    this.message = '';

    this.workforceService.createAssignment(this.newAssign).subscribe({
      next: () => {
        this.saving = false;
        this.showAssignModal = false;
        this.message = 'Worker project assignment successfully created!';
        this.loadAssignments();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Failed to create worker assignment.';
      }
    });
  }

  openTransferModal(a: WorkerProjectAssignment): void {
    this.selectedAssign = a;
    this.transferReq = {
      newProjectId: '',
      newContractorId: a.contractorId || '',
      newWorkActivity: a.workActivity || '',
      transferDate: new Date().toISOString().split('T')[0]
    };
    this.showTransferModal = true;
  }

  submitTransfer(): void {
    if (!this.selectedAssign || !this.transferReq.newProjectId) return;

    this.saving = true;
    this.error = '';
    this.message = '';

    this.workforceService.transferWorker(this.selectedAssign.id, this.transferReq).subscribe({
      next: () => {
        this.saving = false;
        this.showTransferModal = false;
        this.message = `Worker ${this.selectedAssign?.workerName} transferred successfully while preserving history!`;
        this.loadAssignments();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Failed to transfer worker.';
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { WorkforceService } from '../../../core/services/workforce.service';
import { ProjectService } from '../../../core/services/project.service';
import { Shift, Worker } from '../../../core/models/workforce.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-shift-management',
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
                  <li class="breadcrumb-item active">Shift Management</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-clock-history me-2 text-warning"></i>Shift Scheduling & Worker Roster Management</h2>
              <p class="text-muted small mb-0">Schedule site work shifts, assign workforce crews, and manage shift statuses.</p>
            </div>

            <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" (click)="showCreateModal = true">
              <i class="bi bi-plus-circle-fill"></i> Create New Shift
            </button>
          </div>

          <!-- Alert Messages -->
          <div *ngIf="message" class="alert alert-success alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> {{ message }}
            <button type="button" class="btn-close" (click)="message = ''"></button>
          </div>

          <!-- Filter Controls -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-4">
                <select class="form-select" [(ngModel)]="filterProjectId" (change)="loadShifts()">
                  <option value="">-- All Projects --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <input type="date" class="form-control" [(ngModel)]="filterShiftDate" (change)="loadShifts()">
              </div>
              <div class="col-md-4">
                <select class="form-select" [(ngModel)]="filterStatus" (change)="loadShifts()">
                  <option value="">-- All Shift Statuses --</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Shifts Grid -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
          </div>

          <div *ngIf="!loading">
            <div class="row g-4" *ngIf="shifts.length; else noShifts">
              <div *ngFor="let s of shifts" class="col-lg-6">
                <div class="card card-custom border-0 p-4 h-100 shadow-sm">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h5 class="fw-bold text-dark mb-0">{{ s.shiftName }}</h5>
                    <span class="badge" [ngClass]="{
                      'bg-warning text-dark': s.shiftStatus === 'Scheduled',
                      'bg-success': s.shiftStatus === 'Active',
                      'bg-secondary': s.shiftStatus === 'Completed',
                      'bg-danger': s.shiftStatus === 'Cancelled'
                    }">{{ s.shiftStatus }}</span>
                  </div>

                  <div class="small text-muted mb-3">
                    <i class="bi bi-building me-1 text-warning"></i>Project: <strong>{{ s.projectName || 'General Site' }}</strong>
                    <span class="ms-3"><i class="bi bi-calendar3 me-1"></i>Date: {{ s.shiftDate }}</span>
                  </div>

                  <div class="p-3 bg-light rounded-3 mb-3">
                    <div class="row text-center g-2">
                      <div class="col-6 border-end">
                        <span class="extra-small text-muted d-block">Shift Hours</span>
                        <strong class="text-dark">{{ s.startTime }} - {{ s.endTime }}</strong>
                      </div>
                      <div class="col-6">
                        <span class="extra-small text-muted d-block">Assigned Workers</span>
                        <strong class="text-warning fs-6">{{ s.assignedWorkerCount }} Personnel</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Roster List -->
                  <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="fw-bold small text-muted text-uppercase extra-small">Assigned Shift Crew:</span>
                      <button class="btn btn-sm btn-outline-warning py-0 px-2" (click)="openAssignModal(s)">+ Assign Crew</button>
                    </div>

                    <div *ngIf="s.assignedWorkers && s.assignedWorkers.length; else noWorkersInShift" class="d-flex flex-wrap gap-1">
                      <span *ngFor="let w of s.assignedWorkers" class="badge bg-white text-dark border p-2 d-inline-flex align-items-center gap-2">
                        <i class="bi bi-person-fill text-warning"></i>
                        {{ w.workerName }} ({{ w.workerCode }})
                        <i class="bi bi-x-circle text-danger ms-1 cursor-pointer" (click)="removeWorkerFromShift(s.id, w.workerId)" title="Remove worker from shift"></i>
                      </span>
                    </div>
                    <ng-template #noWorkersInShift>
                      <span class="extra-small text-muted italic">No workers assigned to this shift roster yet.</span>
                    </ng-template>
                  </div>

                  <div class="d-flex justify-content-end gap-2 border-top pt-3">
                    <button *ngIf="s.shiftStatus === 'Scheduled'" class="btn btn-sm btn-outline-success" (click)="updateStatus(s.id, 'Active')">Start Shift</button>
                    <button *ngIf="s.shiftStatus === 'Active'" class="btn btn-sm btn-outline-secondary" (click)="updateStatus(s.id, 'Completed')">Mark Completed</button>
                    <button *ngIf="s.shiftStatus !== 'Cancelled' && s.shiftStatus !== 'Completed'" class="btn btn-sm btn-outline-danger" (click)="updateStatus(s.id, 'Cancelled')">Cancel Shift</button>
                  </div>

                </div>
              </div>
            </div>

            <ng-template #noShifts>
              <div class="text-center py-5 text-muted card card-custom border-0 p-5">
                <i class="bi bi-clock-history d-block fs-1 opacity-50 mb-2"></i>
                <h5>No Shift Rosters Found</h5>
                <p class="small mb-3">Create shift schedules for your project sites to assign worker crews.</p>
                <button class="btn btn-bt-accent btn-sm" (click)="showCreateModal = true">Create First Shift</button>
              </div>
            </ng-template>
          </div>

          <!-- Create Shift Modal -->
          <div *ngIf="showCreateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-plus-circle-fill me-2 text-warning"></i>Create New Shift Schedule</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showCreateModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <form (ngSubmit)="submitCreateShift()">
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Shift Name <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" [(ngModel)]="newShift.shiftName" name="shiftName" required placeholder="e.g. Morning Pouring Shift">
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Target Project</label>
                      <select class="form-select" [(ngModel)]="newShift.projectId" name="projectId">
                        <option value="">-- General Site Shift --</option>
                        <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Shift Date <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" [(ngModel)]="newShift.shiftDate" name="shiftDate" required>
                    </div>

                    <div class="row g-2 mb-3">
                      <div class="col-6">
                        <label class="form-label small fw-bold">Start Time <span class="text-danger">*</span></label>
                        <input type="time" class="form-control" [(ngModel)]="newShift.startTime" name="startTime" required>
                      </div>
                      <div class="col-6">
                        <label class="form-label small fw-bold">End Time <span class="text-danger">*</span></label>
                        <input type="time" class="form-control" [(ngModel)]="newShift.endTime" name="endTime" required>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Location / Zone</label>
                      <input type="text" class="form-control" [(ngModel)]="newShift.location" name="location" placeholder="e.g. Block A Level 4">
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="showCreateModal = false">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4">Create Shift</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- Assign Crew to Shift Modal -->
          <div *ngIf="showAssignModal && selectedShift" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-person-plus-fill me-2 text-warning"></i>Assign Crew to {{ selectedShift.shiftName }}</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showAssignModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <div class="mb-3">
                    <label class="form-label small fw-bold">Select Workers to Add to Roster</label>
                    <div class="card p-3 border" style="max-height: 250px; overflow-y: auto;">
                      <div *ngFor="let w of availableWorkers" class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" [value]="w.id" [id]="'chk_' + w.id" (change)="toggleWorkerSelection(w.id)">
                        <label class="form-check-label small" [for]="'chk_' + w.id">
                          <strong>{{ w.workerName }}</strong> ({{ w.workerId }}) - <span class="badge bg-light text-dark border">{{ w.categoryName }}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" class="btn btn-outline-secondary" (click)="showAssignModal = false">Cancel</button>
                    <button type="button" class="btn btn-warning px-4" (click)="submitAssignCrew()">Assign Selected Crew</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ShiftManagementComponent implements OnInit {
  shifts: Shift[] = [];
  projects: Project[] = [];
  availableWorkers: Worker[] = [];

  filterProjectId = '';
  filterShiftDate = new Date().toISOString().split('T')[0];
  filterStatus = '';

  loading = true;
  message = '';

  showCreateModal = false;
  showAssignModal = false;

  newShift = {
    shiftName: 'Morning Shift',
    startTime: '08:00',
    endTime: '17:00',
    projectId: '',
    shiftDate: new Date().toISOString().split('T')[0],
    shiftStatus: 'Scheduled',
    location: 'Main Yard'
  };

  selectedShift: Shift | null = null;
  selectedWorkerIds: string[] = [];

  constructor(
    private workforceService: WorkforceService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(p => this.projects = p);
    this.workforceService.getWorkers({ pageSize: 500 }).subscribe(w => this.availableWorkers = w.items);
    this.loadShifts();
  }

  loadShifts(): void {
    this.loading = true;
    this.workforceService.getShifts({
      projectId: this.filterProjectId,
      shiftDate: this.filterShiftDate,
      shiftStatus: this.filterStatus
    }).subscribe({
      next: (data) => {
        this.shifts = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  submitCreateShift(): void {
    if (!this.newShift.shiftName || !this.newShift.shiftDate) return;

    this.workforceService.createShift(this.newShift).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.message = 'New shift schedule created successfully!';
        this.loadShifts();
      }
    });
  }

  openAssignModal(s: Shift): void {
    this.selectedShift = s;
    this.selectedWorkerIds = [];
    this.showAssignModal = true;
  }

  toggleWorkerSelection(workerId: string): void {
    const idx = this.selectedWorkerIds.indexOf(workerId);
    if (idx >= 0) {
      this.selectedWorkerIds.splice(idx, 1);
    } else {
      this.selectedWorkerIds.push(workerId);
    }
  }

  submitAssignCrew(): void {
    if (!this.selectedShift || !this.selectedWorkerIds.length) return;

    this.workforceService.assignWorkersToShift(this.selectedShift.id, this.selectedWorkerIds).subscribe({
      next: () => {
        this.showAssignModal = false;
        this.message = 'Workers assigned to shift roster successfully!';
        this.loadShifts();
      }
    });
  }

  removeWorkerFromShift(shiftId: string, workerId: string): void {
    this.workforceService.removeWorkerFromShift(shiftId, workerId).subscribe({
      next: () => {
        this.message = 'Worker removed from shift roster.';
        this.loadShifts();
      }
    });
  }

  updateStatus(shiftId: string, status: string): void {
    this.workforceService.updateShift(shiftId, { shiftStatus: status }).subscribe({
      next: () => {
        this.message = `Shift status updated to ${status}.`;
        this.loadShifts();
      }
    });
  }
}

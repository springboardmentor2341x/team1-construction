import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { SiteProgressService } from '../../../core/services/site-progress.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.enum';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-milestone-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent, StatusBadgeComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-flag-fill me-2 text-warning"></i>Milestone Tracking</h2>
              <p class="text-muted small mb-0">Milestones are auto-synced from daily progress reports and can be manually verified.</p>
            </div>
            <button (click)="syncMilestones()" class="btn btn-outline-warning btn-sm d-flex align-items-center gap-2">
              <i class="bi bi-arrow-repeat"></i> Sync from Progress
            </button>
          </div>

          <!-- Project Filter -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row align-items-center">
              <div class="col-md-6">
                <label class="form-label fw-semibold small mb-1">Select Project</label>
                <select (change)="onProjectSelect($event)" class="form-select">
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Status Summary Cards -->
          <div class="row g-3 mb-4">
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Pending</span>
                <h3 class="fw-bold text-warning mb-0 mt-1">{{ pendingCount }}</h3>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">In Progress</span>
                <h3 class="fw-bold text-primary mb-0 mt-1">{{ inProgressCount }}</h3>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Completed</span>
                <h3 class="fw-bold text-success mb-0 mt-1">{{ completedCount }}</h3>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Delayed</span>
                <h3 class="fw-bold text-danger mb-0 mt-1">{{ delayedCount }}</h3>
              </div>
            </div>
          </div>

          <!-- Milestones List -->
          <div class="card card-custom border-0 p-4">
            <h6 class="fw-bold mb-3"><i class="bi bi-list-check me-2 text-success"></i>Project Milestones <span class="badge bg-secondary ms-1">{{ milestones().length }}</span></h6>
            <div class="row g-3">
              <div class="col-12" *ngFor="let m of milestones()">
                <div class="border rounded-3 p-3 bg-white">
                  <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <h6 class="fw-bold text-dark mb-0">{{ m.milestoneName }}</h6>
                      <app-status-badge [status]="m.status"></app-status-badge>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <span *ngIf="m.category" class="badge bg-light text-dark border">{{ m.category }}</span>
                      <button *ngIf="canManage()" (click)="openUpdateModal(m)" class="btn btn-sm btn-outline-warning" title="Verify & Edit Milestone">
                        <i class="bi bi-pencil-square me-1"></i> Verify / Update
                      </button>
                    </div>
                  </div>
                  <p class="text-muted small mb-2">{{ m.description }}</p>
                  <div class="progress mb-2" style="height: 10px;">
                    <div class="progress-bar" [ngClass]="getProgressClass(m.status)" [style.width.%]="m.completionPercentage">
                      {{ m.completionPercentage }}%
                    </div>
                  </div>
                  <div class="d-flex flex-wrap justify-content-between extra-small text-muted border-top pt-2">
                    <span>Planned Target: <strong>{{ m.plannedDate }}</strong></span>
                    <span>Actual Completion: <strong>{{ m.actualCompletionDate || 'Pending' }}</strong></span>
                    <span>Progress: <strong>{{ m.completionPercentage }}%</strong></span>
                  </div>
                </div>
              </div>
              <div *ngIf="milestones().length === 0" class="col-12 text-center py-4 text-muted">
                <i class="bi bi-flag d-block fs-3 mb-2"></i>
                No milestones created for this project.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Verify / Update Milestone Modal -->
    <div class="modal fade show d-block bg-dark bg-opacity-50" tabindex="-1" *ngIf="selectedMilestone">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-check2-circle me-2 text-success"></i>Verify & Update Milestone</h5>
            <button type="button" class="btn-close" (click)="selectedMilestone = null"></button>
          </div>
          <form [formGroup]="msForm" (ngSubmit)="submitMilestoneUpdate()">
            <div class="modal-body p-4 small">
              <h6 class="fw-bold mb-3 text-dark">{{ selectedMilestone.milestoneName }}</h6>
              <div class="mb-3">
                <label class="form-label fw-semibold">Completion Percentage *</label>
                <input type="number" min="0" max="100" class="form-control form-control-sm" formControlName="completionPercentage">
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Status *</label>
                <select class="form-select form-select-sm" formControlName="status">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Planned Date</label>
                <input type="date" class="form-control form-control-sm" formControlName="plannedDate">
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Actual Completion Date</label>
                <input type="date" class="form-control form-control-sm" formControlName="actualCompletionDate">
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" (click)="selectedMilestone = null">Cancel</button>
              <button type="submit" class="btn btn-bt-accent btn-sm" [disabled]="msForm.invalid || updating()">
                <span *ngIf="updating()" class="spinner-border spinner-border-sm me-1"></span>
                Save Verification
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: ['.extra-small { font-size: 0.78rem; }']
})
export class MilestoneTrackingComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  milestones = signal<any[]>([]);

  selectedMilestone: any = null;
  msForm: FormGroup;
  updating = signal(false);

  constructor(
    private fb: FormBuilder,
    private siteProgressService: SiteProgressService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {
    this.msForm = this.fb.group({
      completionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      status: ['Pending', Validators.required],
      plannedDate: [''],
      actualCompletionDate: ['']
    });
  }

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projs => {
      this.projects = projs;
      if (projs.length) {
        this.selectedProjectId = projs[0].id;
        this.loadMilestones();
      }
    });
  }

  onProjectSelect(event: any): void {
    this.selectedProjectId = event.target.value;
    this.loadMilestones();
  }

  loadMilestones(): void {
    this.siteProgressService.getMilestoneTracking(this.selectedProjectId).subscribe(m => this.milestones.set(m));
  }

  syncMilestones(): void {
    if (!this.selectedProjectId) return;
    this.siteProgressService.syncMilestones(this.selectedProjectId).subscribe(m => this.milestones.set(m));
  }

  openUpdateModal(milestone: any): void {
    this.selectedMilestone = milestone;
    this.msForm.patchValue({
      completionPercentage: milestone.completionPercentage,
      status: milestone.status,
      plannedDate: milestone.plannedDate || '',
      actualCompletionDate: milestone.actualCompletionDate || ''
    });
  }

  submitMilestoneUpdate(): void {
    if (this.msForm.invalid || !this.selectedMilestone) return;
    this.updating.set(true);
    const val = this.msForm.value;
    const updates: any = {
      completionPercentage: Number(val.completionPercentage) || 0,
      status: val.status,
      plannedDate: val.plannedDate || null,
      actualCompletionDate: val.actualCompletionDate || null
    };

    if (updates.completionPercentage >= 100 || updates.status === 'Completed') {
      updates.status = 'Completed';
      if (!updates.actualCompletionDate) {
        updates.actualCompletionDate = new Date().toISOString().split('T')[0];
      }
    }

    this.siteProgressService.updateMilestone(this.selectedMilestone.id, updates).subscribe({
      next: () => {
        this.loadMilestones();
        this.selectedMilestone = null;
        this.updating.set(false);
      },
      error: () => this.updating.set(false)
    });
  }

  canManage(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.SITE_ENGINEER || role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  get pendingCount(): number { return this.milestones().filter(m => m.status === 'Pending').length; }
  get inProgressCount(): number { return this.milestones().filter(m => m.status === 'In Progress').length; }
  get completedCount(): number { return this.milestones().filter(m => m.status === 'Completed').length; }
  get delayedCount(): number { return this.milestones().filter(m => m.status === 'Delayed').length; }

  getProgressClass(status: string): string {
    return { Completed: 'bg-success', 'In Progress': 'bg-warning', Pending: 'bg-secondary', Delayed: 'bg-danger' }[status] || 'bg-warning';
  }
}

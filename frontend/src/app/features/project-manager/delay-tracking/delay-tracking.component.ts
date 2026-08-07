import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { SiteProgressService } from '../../../core/services/site-progress.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.enum';
import { Project } from '../../../core/models/project.model';
import { DelayTracking } from '../../../core/models/site-progress.model';

@Component({
  selector: 'app-delay-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
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
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-exclamation-octagon me-2 text-danger"></i>Delay Tracking</h2>
              <p class="text-muted small mb-0">Record project delays, reasons, durations, impacted work category, and timeline impact.</p>
            </div>
            <button *ngIf="canManage()" (click)="openForm()" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-plus-lg"></i> Log Delay
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

          <!-- Summary Cards -->
          <div class="row g-3 mb-4">
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Total Delays</span>
                <h3 class="fw-bold text-dark mb-0 mt-1">{{ delays().length }}</h3>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Open</span>
                <h3 class="fw-bold text-danger mb-0 mt-1">{{ openCount }}</h3>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Resolved</span>
                <h3 class="fw-bold text-success mb-0 mt-1">{{ resolvedCount }}</h3>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Total Impact (Days)</span>
                <h3 class="fw-bold text-warning mb-0 mt-1">{{ totalDurationDays }}</h3>
              </div>
            </div>
          </div>

          <!-- Create Form -->
          <div class="card card-custom border-0 p-4 mb-4" *ngIf="showForm()">
            <h6 class="fw-bold mb-3"><i class="bi bi-pencil-square me-2 text-danger"></i>Log New Delay</h6>
            <form [formGroup]="delayForm" (ngSubmit)="submitDelay()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Delay Reason *</label>
                  <input type="text" class="form-control form-control-sm" formControlName="reason" placeholder="e.g. Material supply shortage">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Duration (Days) *</label>
                  <input type="number" min="0" class="form-control form-control-sm" formControlName="durationDays">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Reported Date *</label>
                  <input type="date" class="form-control form-control-sm" formControlName="reportedDate">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Affected Work Category *</label>
                  <select class="form-select form-select-sm" formControlName="affectedWorkCategory">
                    <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Status</label>
                  <select class="form-select form-select-sm" formControlName="status">
                    <option value="Open">Open</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Impact on Timeline</label>
                  <input type="text" class="form-control form-control-sm" formControlName="impactOnTimeline" placeholder="e.g. 2-day slip on structural phase">
                </div>
                <div class="col-12 d-flex gap-2 justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-bt-accent btn-sm" [disabled]="delayForm.invalid || submitting()">
                    <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-1"></span>
                    Save Delay
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Delays List -->
          <div class="card card-custom border-0 p-4">
            <h6 class="fw-bold mb-3"><i class="bi bi-list-ul me-2 text-warning"></i>Recorded Delays <span class="badge bg-secondary ms-1">{{ delays().length }}</span></h6>
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Reason</th><th>Category</th><th>Days</th><th>Reported Date</th><th>Timeline Impact</th><th>Status</th><th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of delays()">
                    <td class="fw-semibold">{{ d.reason }}</td>
                    <td><span class="badge bg-light text-dark border">{{ d.affectedWorkCategory }}</span></td>
                    <td><span class="badge bg-warning text-dark">{{ d.durationDays }}d</span></td>
                    <td>{{ d.reportedDate }}</td>
                    <td class="text-muted" style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ d.impactOnTimeline || 'N/A' }}</td>
                    <td><span class="badge rounded-pill" [ngClass]="d.status === 'Open' ? 'bg-danger' : 'bg-success'">{{ d.status }}</span></td>
                    <td class="text-end">
                      <button *ngIf="canManage() && d.status === 'Open'" (click)="resolveDelay(d)" class="btn btn-sm btn-outline-success me-1" title="Mark Resolved"><i class="bi bi-check2-circle"></i></button>
                      <button *ngIf="canDelete()" (click)="deleteDelay(d.id)" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                  <tr *ngIf="delays().length === 0">
                    <td colspan="7" class="text-center py-4 text-muted"><i class="bi bi-check2-all d-block fs-3 mb-2"></i>No delays recorded for this project.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DelayTrackingComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  categories: string[] = [];
  delayForm: FormGroup;
  showForm = signal(false);
  submitting = signal(false);
  delays = signal<DelayTracking[]>([]);

  constructor(
    private fb: FormBuilder,
    private siteProgressService: SiteProgressService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {
    this.delayForm = this.fb.group({
      reason: ['', Validators.required],
      durationDays: [1, [Validators.required, Validators.min(0)]],
      affectedWorkCategory: ['Foundation', Validators.required],
      impactOnTimeline: [''],
      reportedDate: [new Date().toISOString().split('T')[0], Validators.required],
      status: ['Open']
    });
  }

  ngOnInit(): void {
    this.siteProgressService.getProgressCategories().subscribe(c => {
      this.categories = c.length ? c : ['Foundation', 'Structural Work', 'Electrical Work', 'Plumbing Work', 'Finishing Work', 'Inspection Work'];
    });
    this.projectService.getProjects().subscribe(projs => {
      this.projects = projs;
      if (projs.length) {
        this.selectedProjectId = projs[0].id;
        this.loadDelays();
      }
    });
  }

  onProjectSelect(event: any): void {
    this.selectedProjectId = event.target.value;
    this.loadDelays();
  }

  loadDelays(): void {
    this.siteProgressService.getDelays(this.selectedProjectId).subscribe(d => this.delays.set(d));
  }

  openForm(): void {
    this.delayForm.reset({
      reason: '',
      durationDays: 1,
      affectedWorkCategory: 'Foundation',
      impactOnTimeline: '',
      reportedDate: new Date().toISOString().split('T')[0],
      status: 'Open'
    });
    this.showForm.set(true);
  }

  submitDelay(): void {
    if (this.delayForm.invalid || !this.selectedProjectId) return;
    this.submitting.set(true);
    const payload = {
      projectId: this.selectedProjectId,
      ...this.delayForm.value,
      durationDays: Number(this.delayForm.value.durationDays) || 0
    };
    this.siteProgressService.createDelay(payload).subscribe({
      next: () => {
        this.loadDelays();
        this.showForm.set(false);
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }

  resolveDelay(d: DelayTracking): void {
    this.siteProgressService.updateDelay(d.id, { status: 'Resolved' }).subscribe(() => this.loadDelays());
  }

  deleteDelay(id: string): void {
    if (confirm('Delete this delay record?')) {
      this.siteProgressService.deleteDelay(id).subscribe(() => this.loadDelays());
    }
  }

  canManage(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.SITE_ENGINEER || role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  canDelete(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  get openCount(): number { return this.delays().filter(d => d.status === 'Open').length; }
  get resolvedCount(): number { return this.delays().filter(d => d.status === 'Resolved').length; }
  get totalDurationDays(): number { return this.delays().reduce((sum, d) => sum + (d.durationDays || 0), 0); }
}

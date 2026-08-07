import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { SiteProgressService } from '../../../core/services/site-progress.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.enum';
import { Project } from '../../../core/models/project.model';
import { SiteActivityLog } from '../../../core/models/site-progress.model';

@Component({
  selector: 'app-site-activity-logs',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
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
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-clipboard-data me-2 text-warning"></i>Site Activity Logs</h2>
              <p class="text-muted small mb-0">Log important site events: material deliveries, inspections, safety meetings, client visits, and more.</p>
            </div>
            <button *ngIf="canManage()" (click)="openForm()" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-plus-lg"></i> Log Site Event
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

          <!-- Event Filter -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row align-items-center">
              <div class="col-md-6">
                <label class="form-label fw-semibold small mb-1">Filter by Event Type</label>
                <select class="form-select" [(ngModel)]="typeFilter" [ngModelOptions]="{standalone: true}">
                  <option value="">All Events</option>
                  <option *ngFor="let t of eventTypes" [value]="t">{{ t }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Create Form -->
          <div class="card card-custom border-0 p-4 mb-4" *ngIf="showForm()">
            <h6 class="fw-bold mb-3"><i class="bi bi-pencil-square me-2 text-warning"></i>Log New Site Event</h6>
            <form [formGroup]="logForm" (ngSubmit)="submitLog()">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Date *</label>
                  <input type="date" class="form-control form-control-sm" formControlName="activityDate">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Time</label>
                  <input type="time" class="form-control form-control-sm" formControlName="activityTime">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Event Type *</label>
                  <select class="form-select form-select-sm" formControlName="eventType">
                    <option *ngFor="let t of eventTypes" [value]="t">{{ t }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Responsible Person *</label>
                  <input type="text" class="form-control form-control-sm" formControlName="responsiblePerson" placeholder="e.g. James Watson">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold">Description *</label>
                  <textarea class="form-control form-control-sm" rows="3" formControlName="description" placeholder="Describe the site event..."></textarea>
                </div>
                <div class="col-12 d-flex gap-2 justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-bt-accent btn-sm" [disabled]="logForm.invalid || submitting()">
                    <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-1"></span>
                    Save Event
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Activity Logs List -->
          <div class="card card-custom border-0 p-4">
            <h6 class="fw-bold mb-3"><i class="bi bi-journal-text me-2 text-success"></i>Site Activity Timeline <span class="badge bg-secondary ms-1">{{ filteredLogs().length }}</span></h6>
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Date</th><th>Time</th><th>Event Type</th><th>Description</th><th>Responsible</th><th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let log of filteredLogs()">
                    <td class="fw-semibold">{{ log.activityDate }}</td>
                    <td>{{ log.activityTime || '—' }}</td>
                    <td><span class="badge" [ngClass]="getEventBadge(log.eventType)">{{ log.eventType }}</span></td>
                    <td class="text-muted" style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ log.description }}</td>
                    <td><i class="bi bi-person me-1"></i>{{ log.responsiblePerson }}</td>
                    <td class="text-end">
                      <button *ngIf="canDelete()" (click)="deleteLog(log.id)" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredLogs().length === 0">
                    <td colspan="6" class="text-center py-4 text-muted"><i class="bi bi-journal-x d-block fs-3 mb-2"></i>No site activity logs recorded.</td>
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
export class SiteActivityLogsComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  eventTypes: string[] = [];
  logForm: FormGroup;
  showForm = signal(false);
  submitting = signal(false);
  typeFilter = '';
  logs = signal<SiteActivityLog[]>([]);

  constructor(
    private fb: FormBuilder,
    private siteProgressService: SiteProgressService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {
    this.logForm = this.fb.group({
      activityDate: [new Date().toISOString().split('T')[0], Validators.required],
      activityTime: [''],
      eventType: ['Material Delivery', Validators.required],
      description: ['', Validators.required],
      responsiblePerson: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.siteProgressService.getActivityEventTypes().subscribe(t => {
      this.eventTypes = t.length ? t : ['Material Delivery', 'Machinery Maintenance', 'Safety Meeting', 'Inspection', 'Client Visit', 'Quality Audit', 'Accident', 'Contractor Meeting'];
    });
    this.projectService.getProjects().subscribe(projs => {
      this.projects = projs;
      if (projs.length) {
        this.selectedProjectId = projs[0].id;
        this.loadLogs();
      }
    });
  }

  onProjectSelect(event: any): void {
    this.selectedProjectId = event.target.value;
    this.loadLogs();
  }

  loadLogs(): void {
    this.siteProgressService.getSiteActivityLogs(this.selectedProjectId).subscribe(l => this.logs.set(l));
  }

  openForm(): void {
    this.logForm.reset({
      activityDate: new Date().toISOString().split('T')[0],
      activityTime: '',
      eventType: 'Material Delivery',
      description: '',
      responsiblePerson: ''
    });
    this.showForm.set(true);
  }

  submitLog(): void {
    if (this.logForm.invalid || !this.selectedProjectId) return;
    this.submitting.set(true);
    const payload = { projectId: this.selectedProjectId, ...this.logForm.value };
    this.siteProgressService.createSiteActivityLog(payload).subscribe({
      next: () => {
        this.loadLogs();
        this.showForm.set(false);
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }

  deleteLog(id: string): void {
    if (confirm('Delete this activity log?')) {
      this.siteProgressService.deleteSiteActivityLog(id).subscribe(() => this.loadLogs());
    }
  }

  filteredLogs(): SiteActivityLog[] {
    if (!this.typeFilter) return this.logs();
    return this.logs().filter(l => l.eventType === this.typeFilter);
  }

  canManage(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.SITE_ENGINEER || role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  canDelete(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  getEventBadge(type: string): string {
    const map: Record<string, string> = {
      'Material Delivery': 'bg-primary',
      'Machinery Maintenance': 'bg-secondary',
      'Safety Meeting': 'bg-success',
      'Inspection': 'bg-info text-dark',
      'Client Visit': 'bg-warning text-dark',
      'Quality Audit': 'bg-dark',
      'Accident': 'bg-danger',
      'Contractor Meeting': 'bg-purple'
    };
    return map[type] || 'bg-light text-dark';
  }
}

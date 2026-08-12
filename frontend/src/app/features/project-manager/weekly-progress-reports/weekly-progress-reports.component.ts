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
import { WeeklyProgressReport } from '../../../core/models/site-progress.model';

@Component({
  selector: 'app-weekly-progress-reports',
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
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-calendar3-range me-2 text-warning"></i>Weekly Progress Reports</h2>
              <p class="text-muted small mb-0">Generate weekly summaries from actual PostgreSQL daily progress reports.</p>
            </div>
            <button *ngIf="canGenerate()" (click)="openForm()" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-file-earmark-plus"></i> Generate Weekly Report
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

          <!-- Generate Form -->
          <div class="card card-custom border-0 p-4 mb-4" *ngIf="showForm()">
            <h6 class="fw-bold mb-3"><i class="bi bi-magic me-2 text-warning"></i>Generate Weekly Summary</h6>
            <form [formGroup]="weeklyForm" (ngSubmit)="generate()">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Week Start *</label>
                  <input type="date" class="form-control form-control-sm" formControlName="weekStartDate">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Week End *</label>
                  <input type="date" class="form-control form-control-sm" formControlName="weekEndDate">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Overall Status</label>
                  <select class="form-select form-select-sm" formControlName="overallStatus">
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Ahead">Ahead</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Weekly Progress %</label>
                  <input type="number" min="0" max="100" class="form-control form-control-sm" formControlName="weeklyProgressPercentage">
                </div>
                <div class="col-md-12">
                  <label class="form-label small fw-semibold">Safety Incidents / Notes</label>
                  <input type="text" class="form-control form-control-sm" formControlName="safetyIncidents" placeholder="e.g. No safety incidents recorded this week.">
                </div>
                <div class="col-12 d-flex gap-2 justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-bt-accent btn-sm" [disabled]="weeklyForm.invalid || generating()">
                    <span *ngIf="generating()" class="spinner-border spinner-border-sm me-1"></span>
                    Generate & Save
                  </button>
                </div>
              </div>
            </form>
            <p class="text-muted small mt-3 mb-0">
              <i class="bi bi-info-circle me-1"></i>
              Completed work, worker-hours, worker count, major activities, and delays are auto-aggregated from daily progress reports in the selected week.
            </p>
          </div>

          <!-- Weekly Reports List -->
          <div class="card card-custom border-0 p-4">
            <h6 class="fw-bold mb-3"><i class="bi bi-collection me-2 text-success"></i>Generated Weekly Reports <span class="badge bg-secondary ms-1">{{ reports().length }}</span></h6>
            <div class="row g-3">
              <div class="col-12" *ngFor="let w of reports()">
                <div class="border rounded-3 p-3 bg-white">
                  <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <div>
                      <h6 class="fw-bold text-dark mb-0"><i class="bi bi-calendar-week me-1 text-warning"></i>{{ w.weekStartDate }} → {{ w.weekEndDate }}</h6>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge" [ngClass]="getOverallBadge(w.overallStatus)">{{ w.overallStatus }}</span>
                      <button *ngIf="canGenerate()" (click)="deleteReport(w.id)" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="progress flex-grow-1" style="height:10px">
                      <div class="progress-bar bg-warning" [style.width.%]="w.weeklyProgressPercentage">{{ w.weeklyProgressPercentage }}%</div>
                    </div>
                    <strong class="small">{{ w.weeklyProgressPercentage }}%</strong>
                  </div>
                  <div class="row g-2 small">
                    <div class="col-md-6">
                      <div class="text-muted mb-1"><i class="bi bi-check2-square me-1 text-success"></i><strong>Completed Work:</strong></div>
                      <pre class="bg-light rounded-3 p-2 mb-0" style="white-space:pre-wrap">{{ w.completedWork }}</pre>
                    </div>
                    <div class="col-md-6">
                      <div class="text-muted mb-1"><i class="bi bi-flag me-1 text-primary"></i><strong>Major Activities:</strong></div>
                      <div class="bg-light rounded-3 p-2 mb-2">{{ w.majorActivities || 'N/A' }}</div>
                      <div class="text-muted mb-1"><i class="bi bi-exclamation-triangle me-1 text-danger"></i><strong>Delays:</strong></div>
                      <div class="bg-light rounded-3 p-2">{{ w.delays || 'None' }}</div>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap justify-content-between align-items-center extra-small text-muted border-top pt-2 mt-2 gap-2">
                    <span><i class="bi bi-person me-1"></i>Generated by: <strong>{{ w.generatedBy }}</strong></span>
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge bg-primary-subtle text-primary"><i class="bi bi-clock me-1"></i>{{ w.workerHours || 0 }} worker-hrs</span>
                      <span class="badge bg-info-subtle text-info"><i class="bi bi-people me-1"></i>{{ w.workerCount || 0 }} total workers</span>
                      <span class="badge bg-success-subtle text-success"><i class="bi bi-shield-check me-1"></i>{{ w.safetyIncidents || 'No safety incidents' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div *ngIf="reports().length === 0" class="col-12 text-center py-4 text-muted">
                <i class="bi bi-calendar-x d-block fs-3 mb-2"></i>No weekly reports generated yet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ['.extra-small { font-size: 0.78rem; }']
})
export class WeeklyProgressReportsComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  weeklyForm: FormGroup;
  showForm = signal(false);
  generating = signal(false);
  reports = signal<WeeklyProgressReport[]>([]);

  constructor(
    private fb: FormBuilder,
    private siteProgressService: SiteProgressService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {
    this.weeklyForm = this.fb.group({
      weekStartDate: ['', Validators.required],
      weekEndDate: ['', Validators.required],
      weeklyProgressPercentage: [0, [Validators.min(0), Validators.max(100)]],
      safetyIncidents: ['No major safety incidents recorded.'],
      overallStatus: ['On Track']
    });
  }

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projs => {
      this.projects = projs;
      if (projs.length) {
        this.selectedProjectId = projs[0].id;
        this.loadReports();
      }
    });
  }

  onProjectSelect(event: any): void {
    this.selectedProjectId = event.target.value;
    this.loadReports();
  }

  loadReports(): void {
    this.siteProgressService.getWeeklyReports(this.selectedProjectId).subscribe(r => this.reports.set(r));
  }

  openForm(): void {
    const today = new Date();
    const monday = new Date(today);
    const day = (today.getDay() + 6) % 7;
    monday.setDate(today.getDate() - day);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    this.weeklyForm.reset({
      weekStartDate: fmt(monday),
      weekEndDate: fmt(sunday),
      weeklyProgressPercentage: 0,
      safetyIncidents: 'No major safety incidents recorded.',
      overallStatus: 'On Track'
    });
    this.showForm.set(true);
  }

  generate(): void {
    if (this.weeklyForm.invalid || !this.selectedProjectId) return;
    this.generating.set(true);
    const payload = {
      projectId: this.selectedProjectId,
      ...this.weeklyForm.value,
      weeklyProgressPercentage: Number(this.weeklyForm.value.weeklyProgressPercentage) || 0
    };
    this.siteProgressService.createWeeklyReport(payload).subscribe({
      next: () => {
        this.loadReports();
        this.showForm.set(false);
        this.generating.set(false);
      },
      error: () => this.generating.set(false)
    });
  }

  deleteReport(id: string): void {
    if (confirm('Delete this weekly report?')) {
      this.siteProgressService.deleteWeeklyReport(id).subscribe(() => this.loadReports());
    }
  }

  canGenerate(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.PROJECT_MANAGER || role === UserRole.ADMINISTRATOR;
  }

  getOverallBadge(status: string): string {
    return {
      'On Track': 'bg-success',
      'Ahead': 'bg-info text-dark',
      'At Risk': 'bg-warning text-dark',
      'Delayed': 'bg-danger'
    }[status] || 'bg-secondary';
  }
}

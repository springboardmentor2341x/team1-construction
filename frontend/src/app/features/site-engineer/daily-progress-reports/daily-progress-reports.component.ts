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
import { DailyProgressReport } from '../../../core/models/site-progress.model';

@Component({
  selector: 'app-daily-progress-reports',
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
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-journal-plus me-2 text-warning"></i>Daily Progress Reports</h2>
              <p class="text-muted small mb-0">Record daily site execution, progress %, weather, safety, QC remarks and photographs.</p>
            </div>
            <button *ngIf="canManage()" (click)="openForm()" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-plus-lg"></i> New Daily Report
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

          <!-- Create Report Form -->
          <div class="card card-custom border-0 p-4 mb-4" *ngIf="showForm()">
            <h6 class="fw-bold mb-3"><i class="bi bi-pencil-square me-2 text-warning"></i>New Daily Progress Report</h6>
            <form [formGroup]="reportForm" (ngSubmit)="submitReport()">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Report Date *</label>
                  <input type="date" class="form-control form-control-sm" formControlName="reportDate">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Progress Category *</label>
                  <select class="form-select form-select-sm" formControlName="progressCategory">
                    <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Progress Percentage *</label>
                  <input type="number" min="0" max="100" class="form-control form-control-sm" formControlName="progressPercentage">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Weather Conditions</label>
                  <select class="form-select form-select-sm" formControlName="weatherConditions">
                    <option value="Sunny">☀️ Sunny</option>
                    <option value="Cloudy">⛅ Cloudy</option>
                    <option value="Rainy">🌧️ Rainy</option>
                    <option value="Windy">💨 Windy</option>
                    <option value="Storm">⛈️ Storm</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Work Completed *</label>
                  <textarea class="form-control form-control-sm" rows="2" formControlName="workCompleted" placeholder="Describe the work executed..."></textarea>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Contractor</label>
                  <input type="text" class="form-control form-control-sm" formControlName="contractor" placeholder="e.g. Marcus Brody">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Worker Attendance</label>
                  <input type="text" class="form-control form-control-sm" formControlName="workerAttendance" placeholder="e.g. 42 workers (Morning)">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Machinery Used</label>
                  <input type="text" class="form-control form-control-sm" formControlName="machineryUsed" placeholder="e.g. Tower Crane TC-480">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Materials Consumed</label>
                  <input type="text" class="form-control form-control-sm" formControlName="materialsConsumed" placeholder="e.g. Rebar 12T, concrete 64 m3">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Safety Observations</label>
                  <input type="text" class="form-control form-control-sm" formControlName="safetyObservations">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Quality Inspection Remarks</label>
                  <input type="text" class="form-control form-control-sm" formControlName="qualityInspectionRemarks">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Photo URL</label>
                  <input type="text" class="form-control form-control-sm" formControlName="photoUrl" placeholder="https://... (optional)">
                </div>
                <div class="col-md-4">
                  <div class="form-check form-switch mt-4">
                    <input class="form-check-input" type="checkbox" id="delaysSwitch" formControlName="delays">
                    <label class="form-check-label small fw-semibold" for="delaysSwitch">Delays Occurred</label>
                  </div>
                </div>
                <div class="col-md-8">
                  <label class="form-label small fw-semibold">Delay Reasons</label>
                  <input type="text" class="form-control form-control-sm" formControlName="delayReasons">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold">Comments</label>
                  <textarea class="form-control form-control-sm" rows="2" formControlName="comments"></textarea>
                </div>
                <div class="col-12 d-flex gap-2 justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-bt-accent btn-sm" [disabled]="reportForm.invalid || submitting()">
                    <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-1"></span>
                    Save Report
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Reports Table -->
          <div class="card card-custom border-0 p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0"><i class="bi bi-database-check me-2 text-success"></i>Submitted Reports <span class="badge bg-secondary ms-1">{{ reports().length }}</span></h6>
            </div>
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Date</th><th>Category</th><th>Work Completed</th><th>%</th><th>Weather</th><th>Delays</th><th>Status</th><th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of reports()">
                    <td class="fw-semibold">{{ r.reportDate }}</td>
                    <td><span class="badge bg-light text-dark border">{{ r.progressCategory }}</span></td>
                    <td class="text-muted" style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ r.workCompleted }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-1">
                        <div class="progress flex-grow-1" style="height:6px;width:60px">
                          <div class="progress-bar bg-warning" [style.width.%]="r.progressPercentage"></div>
                        </div>
                        <span class="fw-bold">{{ r.progressPercentage }}%</span>
                      </div>
                    </td>
                    <td>{{ r.weatherConditions }}</td>
                    <td>
                      <span *ngIf="r.delays" class="badge bg-danger-subtle text-danger"><i class="bi bi-exclamation-triangle me-1"></i>Yes</span>
                      <span *ngIf="!r.delays" class="badge bg-success-subtle text-success">No</span>
                    </td>
                    <td><span class="badge rounded-pill" [ngClass]="getStatusClass(r.status)">{{ r.status }}</span></td>
<td class="text-end">
                      <button *ngIf="r.photographs?.length" class="btn btn-sm btn-outline-info me-1" title="Photos"><i class="bi bi-images"></i> {{ r.photographs!.length }}</button>
                      <button *ngIf="canDelete()" (click)="deleteReport(r.id)" class="btn btn-sm btn-outline-danger" title="Delete"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                  <tr *ngIf="reports().length === 0">
                    <td colspan="8" class="text-center py-4 text-muted"><i class="bi bi-journal-x d-block fs-3 mb-2"></i>No daily progress reports yet.</td>
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
export class DailyProgressReportsComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  categories: string[] = [];
  reportForm: FormGroup;
  showForm = signal(false);
  submitting = signal(false);
  reports = signal<DailyProgressReport[]>([]);

  constructor(
    private fb: FormBuilder,
    private siteProgressService: SiteProgressService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {
    this.reportForm = this.fb.group({
      reportDate: [new Date().toISOString().split('T')[0], Validators.required],
      progressCategory: ['Foundation', Validators.required],
      workCompleted: ['', Validators.required],
      progressPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      contractor: [''],
      workerAttendance: [''],
      machineryUsed: [''],
      materialsConsumed: [''],
      weatherConditions: ['Sunny'],
      safetyObservations: [''],
      qualityInspectionRemarks: [''],
      delays: [false],
      delayReasons: [''],
      comments: [''],
      photoUrl: ['']
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
        this.loadReports();
      }
    });
  }

  onProjectSelect(event: any): void {
    this.selectedProjectId = event.target.value;
    this.loadReports();
  }

  loadReports(): void {
    this.siteProgressService.getDailyReports(this.selectedProjectId).subscribe(r => this.reports.set(r));
  }

  openForm(): void {
    this.showForm.set(true);
    this.reportForm.reset({
      reportDate: new Date().toISOString().split('T')[0],
      progressCategory: 'Foundation',
      workCompleted: '',
      progressPercentage: 0,
      weatherConditions: 'Sunny',
      delays: false
    });
  }

  submitReport(): void {
    if (this.reportForm.invalid || !this.selectedProjectId) return;
    this.submitting.set(true);
    const value = this.reportForm.value;
    const payload: any = {
      projectId: this.selectedProjectId,
      reportDate: value.reportDate,
      progressCategory: value.progressCategory,
      workCompleted: value.workCompleted,
      progressPercentage: Number(value.progressPercentage) || 0,
      contractor: value.contractor,
      workerAttendance: value.workerAttendance,
      machineryUsed: value.machineryUsed,
      materialsConsumed: value.materialsConsumed,
      weatherConditions: value.weatherConditions,
      safetyObservations: value.safetyObservations,
      qualityInspectionRemarks: value.qualityInspectionRemarks,
      delays: !!value.delays,
      delayReasons: value.delayReasons,
      comments: value.comments
    };
    if (value.photoUrl) payload.photographUrls = [value.photoUrl];

    this.siteProgressService.createDailyReport(payload).subscribe({
      next: () => {
        this.loadReports();
        this.showForm.set(false);
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }

  deleteReport(id: string): void {
    if (confirm('Delete this daily progress report?')) {
      this.siteProgressService.deleteDailyReport(id).subscribe(() => this.loadReports());
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

  getStatusClass(status: string): string {
    return { Approved: 'bg-success', Pending: 'bg-warning text-dark', Rejected: 'bg-danger' }[status] || 'bg-secondary';
  }
}

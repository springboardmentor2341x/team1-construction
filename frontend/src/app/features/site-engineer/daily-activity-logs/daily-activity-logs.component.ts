import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { environment } from '../../../../environments/environment';

export interface ActivityLog {
  id: string;
  date: string;
  location: string;
  activity: string;
  progressNotes?: string;
  weatherCondition: string;
  workersPresent: number;
  issues?: string;
  submittedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

@Component({
  selector: 'app-daily-activity-logs',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block"><app-sidebar></app-sidebar></div>
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">

          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <nav aria-label="breadcrumb"><ol class="breadcrumb small mb-1">
                <li class="breadcrumb-item"><a routerLink="/dashboard/site-engineer" class="text-decoration-none text-warning">Engineering Hub</a></li>
                <li class="breadcrumb-item active">Daily Activity Logs</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-journal-check me-2 text-warning"></i>Daily Activity Logs</h2>
              <p class="text-muted small mb-0">Submit and review daily site activity logs stored live in PostgreSQL database.</p>
            </div>
            <button class="btn btn-bt-accent shadow-sm" (click)="showForm.set(!showForm())">
              <i class="bi" [ngClass]="showForm() ? 'bi-x' : 'bi-plus-lg'"></i>
              {{ showForm() ? 'Cancel' : 'New Log Entry' }}
            </button>
          </div>

          <!-- Log Submission Form -->
          <div class="card card-custom border-0 p-4 mb-4" *ngIf="showForm()">
            <h6 class="fw-bold mb-3"><i class="bi bi-pencil-square me-2 text-warning"></i>New Activity Log Entry</h6>
            <form [formGroup]="logForm" (ngSubmit)="submitLog()">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Date *</label>
                  <input class="form-control form-control-sm" type="date" formControlName="date" [class.is-invalid]="submitted && logForm.get('date')?.invalid">
                  <div class="invalid-feedback small">Date is required.</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Site Location *</label>
                  <input class="form-control form-control-sm" type="text" placeholder="e.g. Block B - Floor 12" formControlName="location" [class.is-invalid]="submitted && logForm.get('location')?.invalid">
                  <div class="invalid-feedback small">Location is required.</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Weather Condition</label>
                  <select class="form-select form-select-sm" formControlName="weatherCondition">
                    <option value="Sunny">☀️ Sunny</option>
                    <option value="Cloudy">⛅ Cloudy</option>
                    <option value="Rainy">🌧️ Rainy</option>
                    <option value="Windy">💨 Windy</option>
                    <option value="Storm">⛈️ Storm Warning</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Activity Description *</label>
                  <textarea class="form-control form-control-sm" rows="3" placeholder="Describe the main work activities performed..." formControlName="activity" [class.is-invalid]="submitted && logForm.get('activity')?.invalid"></textarea>
                  <div class="invalid-feedback small">Activity description is required.</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Progress Notes</label>
                  <textarea class="form-control form-control-sm" rows="3" placeholder="Any observations, measurements, or QC notes..." formControlName="progressNotes"></textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Workers Present</label>
                  <input class="form-control form-control-sm" type="number" min="0" formControlName="workersPresent">
                </div>
                <div class="col-md-8">
                  <label class="form-label small fw-semibold">Issues / Delays Noted</label>
                  <input class="form-control form-control-sm" type="text" placeholder="Any issues, safety concerns, or delays..." formControlName="issues">
                </div>
                <div class="col-12 d-flex gap-2 justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-bt-accent btn-sm" [disabled]="submitting()">
                    <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-1"></span>
                    Save to Database
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Logs Table -->
          <div class="card card-custom border-0 p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0"><i class="bi bi-database-check me-2 text-success"></i>Live Database Logs <span class="badge bg-secondary ms-1">{{ filteredLogs().length }}</span></h6>
              <div class="d-flex gap-2">
                <input type="date" class="form-control form-control-sm" style="width:150px" [(ngModel)]="dateFilter" [ngModelOptions]="{standalone: true}">
                <button class="btn btn-sm btn-outline-secondary" (click)="dateFilter = ''">Clear</button>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Date</th><th>Location</th><th>Activity Summary</th><th>Weather</th><th>Workers</th><th>Status</th><th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let log of filteredLogs()">
                    <td class="fw-semibold">{{ log.date }}</td>
                    <td>{{ log.location }}</td>
                    <td class="text-muted" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ log.activity }}</td>
                    <td>{{ log.weatherCondition }}</td>
                    <td><span class="badge bg-light text-dark">{{ log.workersPresent }}</span></td>
                    <td><span class="badge rounded-pill" [ngClass]="getStatusClass(log.status)">{{ log.status }}</span></td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-eye"></i></button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredLogs().length === 0">
                    <td colspan="7" class="text-center py-4 text-muted"><i class="bi bi-journal-x d-block fs-3 mb-2"></i>No activity logs found in database.</td>
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
export class DailyActivityLogsComponent implements OnInit {
  logForm: FormGroup;
  showForm = signal(false);
  submitting = signal(false);
  submitted = false;
  dateFilter = '';

  activityLogs = signal<ActivityLog[]>([]);

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.logForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      location: ['', Validators.required],
      activity: ['', Validators.required],
      progressNotes: [''],
      weatherCondition: ['Sunny'],
      workersPresent: [0],
      issues: ['']
    });
  }

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.http.get<ActivityLog[]>(`${environment.apiUrl}/activity-logs`).subscribe({
      next: (data) => this.activityLogs.set(data),
      error: () => {}
    });
  }

  filteredLogs() {
    if (!this.dateFilter) return this.activityLogs();
    return this.activityLogs().filter(l => l.date === this.dateFilter);
  }

  submitLog(): void {
    this.submitted = true;
    if (this.logForm.invalid) return;
    this.submitting.set(true);

    this.http.post<ActivityLog>(`${environment.apiUrl}/activity-logs`, this.logForm.value).subscribe({
      next: (newLog) => {
        this.activityLogs.update(logs => [newLog, ...logs]);
        this.logForm.reset({ date: new Date().toISOString().split('T')[0], weatherCondition: 'Sunny', workersPresent: 0 });
        this.showForm.set(false);
        this.submitting.set(false);
        this.submitted = false;
      },
      error: () => {
        this.submitting.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    return { Approved: 'bg-success', Pending: 'bg-warning text-dark', Rejected: 'bg-danger' }[status] || 'bg-secondary';
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
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
  status: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  serialNo: string;
  location: string;
  operator: string;
  status: string;
}

@Component({
  selector: 'app-site-engineer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-info text-dark px-2 py-1 uppercase">Site Engineering</span>
                <h2 class="fw-bold text-dark mb-0">Site Engineer Operations Hub</h2>
              </div>
              <p class="text-muted small mb-0">Daily progress logging, machinery status, site quality, and field engineering logs.</p>
            </div>
            <a routerLink="/site-activity" class="btn btn-bt-accent btn-sm d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-journal-plus"></i> Log Today's Site Progress
            </a>
          </div>

          <!-- Top Metric Cards -->
          <div class="row g-3 mb-4">
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Activity Logs</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1">{{ activityLogs().length }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-info-subtle text-info"><i class="bi bi-building"></i></div>
                </div>
                <div class="mt-2 small text-muted">live from backend</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Approved Logs</span>
                    <h3 class="fw-bold text-success mb-0 mt-1">{{ approvedCount }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-success-subtle text-success"><i class="bi bi-check2-circle"></i></div>
                </div>
                <div class="mt-2 small text-muted">approved activity</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Equipment Units</span>
                    <h3 class="fw-bold text-warning mb-0 mt-1">{{ equipment().length }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-warning-subtle text-warning"><i class="bi bi-graph-up text-warning"></i></div>
                </div>
                <div class="mt-2 small text-muted">on site</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Operational</span>
                    <h3 class="fw-bold text-primary mb-0 mt-1">{{ operationalCount }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-primary-subtle text-primary"><i class="bi bi-truck"></i></div>
                </div>
                <div class="mt-2 small text-muted">equipment operational</div>
              </div>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="row g-4">
            <!-- Left Column: Site Activity Logs -->
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-journal-text text-warning me-2"></i> Recent Site Activity Logs</h5>

                <div class="timeline space-y-3">
                  <div class="p-3 bg-light rounded-3 border-start border-4" [ngClass]="getBorderClass(log.status)" *ngFor="let log of activityLogs().slice(0, 5)">
                    <div class="d-flex justify-content-between extra-small text-muted mb-1">
                      <span><i class="bi bi-clock me-1"></i> {{ log.date }} - {{ log.location }}</span>
                      <span class="badge" [ngClass]="getStatusBadge(log.status)">{{ log.status }}</span>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">{{ log.activity }}</h6>
                    <p class="small text-muted mb-0">{{ log.progressNotes }}</p>
                  </div>
                  <div *ngIf="activityLogs().length === 0" class="text-center py-4 text-muted">
                    No activity logs available yet. Connect the backend to load site logs.
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Equipment Status -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-gear-wide-connected text-primary me-2"></i> Equipment Status</h5>
                <div class="extra-small space-y-2">
                  <div class="d-flex justify-content-between py-2 border-bottom" *ngFor="let e of equipment()">
                    <span>{{ e.name }}:</span>
                    <span class="badge" [ngClass]="getEquipBadge(e.status)">{{ e.status }}</span>
                  </div>
                  <div *ngIf="equipment().length === 0" class="text-muted">No equipment available yet.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.78rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
  `]
})
export class SiteEngineerDashboardComponent implements OnInit {
  activityLogs = signal<ActivityLog[]>([]);
  equipment = signal<Equipment[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<ActivityLog[]>(`${environment.apiUrl}/activity-logs`).subscribe({
      next: (data) => this.activityLogs.set(data),
      error: () => this.activityLogs.set([])
    });
    this.http.get<Equipment[]>(`${environment.apiUrl}/equipment`).subscribe({
      next: (data) => this.equipment.set(data),
      error: () => this.equipment.set([])
    });
  }

  get approvedCount(): number {
    return this.activityLogs().filter(l => l.status === 'Approved').length;
  }

  get operationalCount(): number {
    return this.equipment().filter(e => e.status === 'Operational').length;
  }

  getBorderClass(status: string): string {
    return { 'Approved': 'border-success', 'Pending': 'border-warning', 'Rejected': 'border-danger' }[status] || 'border-secondary';
  }

  getStatusBadge(status: string): string {
    return { 'Approved': 'bg-success', 'Pending': 'bg-warning text-dark', 'Rejected': 'bg-danger' }[status] || 'bg-secondary';
  }

  getEquipBadge(status: string): string {
    return { 'Operational': 'bg-success', 'Under Maintenance': 'bg-warning text-dark', 'Out of Service': 'bg-danger', 'Idle': 'bg-secondary' }[status] || 'bg-secondary';
  }
}

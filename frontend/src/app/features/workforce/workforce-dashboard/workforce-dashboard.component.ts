import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { WorkforceService } from '../../../core/services/workforce.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { WorkforceDashboardStats } from '../../../core/models/workforce.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-workforce-dashboard',
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
          <!-- Page Header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-warning text-dark px-2 py-1 uppercase fw-bold">Workforce</span>
                <h2 class="fw-bold text-dark mb-0">Workforce Management Dashboard</h2>
              </div>
              <p class="text-muted small mb-0">Centralized governance for site personnel, allocations, shifts, attendance, & payroll monitoring.</p>
            </div>
            
            <div class="d-flex align-items-center gap-2">
              <a routerLink="/workforce/workers" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm">
                <i class="bi bi-people-fill"></i> Manage Workers
              </a>
              <a routerLink="/workforce/attendance" class="btn btn-outline-dark d-flex align-items-center gap-2 shadow-sm">
                <i class="bi bi-calendar-check-fill"></i> Daily Attendance
              </a>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status">
              <span class="visually-hidden">Loading workforce statistics...</span>
            </div>
            <p class="text-muted mt-2 small">Loading live workforce statistics...</p>
          </div>

          <div *ngIf="!loading && stats">
            <!-- Project / Contractor Filter Bar -->
            <div class="card card-custom border-0 p-3 mb-4">
              <div class="row g-3 align-items-center">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted mb-1">Filter Statistics by Project</label>
                  <select class="form-select" [(ngModel)]="selectedProjectId" (change)="loadStats()">
                    <option value="">-- All Projects --</option>
                    <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted mb-1">Filter Statistics by Contractor</label>
                  <select class="form-select" [(ngModel)]="selectedContractorId" (change)="loadStats()">
                    <option value="">-- All Contractors --</option>
                    <option *ngFor="let c of contractors" [value]="c.id">{{ c.fullName }} ({{ c.email }})</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Top Stats Row (5 Key Metrics) -->
            <div class="row g-3 mb-4">
              <div class="col-xl-2 col-md-4 col-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Total Workers</span>
                      <h3 class="fw-bold text-dark mb-0 mt-1">{{ stats.totalWorkers }}</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-primary-subtle text-primary fs-4">
                      <i class="bi bi-person-lines-fill"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">Registered in database</div>
                </div>
              </div>

              <div class="col-xl-2 col-md-4 col-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Active Workers</span>
                      <h3 class="fw-bold text-success mb-0 mt-1">{{ stats.activeWorkers }}</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-success-subtle text-success fs-4">
                      <i class="bi bi-check-circle-fill"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">Deployment ready</div>
                </div>
              </div>

              <div class="col-xl-2 col-md-4 col-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Present Today</span>
                      <h3 class="fw-bold text-info mb-0 mt-1">{{ stats.presentToday }}</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-info-subtle text-info fs-4">
                      <i class="bi bi-person-check-fill"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">Checked-in on site</div>
                </div>
              </div>

              <div class="col-xl-3 col-md-6 col-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Absent / On Leave</span>
                      <h3 class="fw-bold text-danger mb-0 mt-1">{{ stats.absentToday }} <span class="fs-6 text-muted">/ {{ stats.onLeaveToday }} Leave</span></h3>
                    </div>
                    <div class="stat-icon-wrapper bg-danger-subtle text-danger fs-4">
                      <i class="bi bi-person-x-fill"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">Absenteeism tracked</div>
                </div>
              </div>

              <div class="col-xl-3 col-md-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Attendance Rate</span>
                      <h3 class="fw-bold text-warning mb-0 mt-1">{{ stats.attendancePercentage }}%</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-warning-subtle text-warning fs-4">
                      <i class="bi bi-pie-chart-fill"></i>
                    </div>
                  </div>
                  <div class="progress mt-2" style="height: 6px;">
                    <div class="progress-bar bg-warning" [style.width]="stats.attendancePercentage + '%'"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Workforce Categories & Contractor Breakdown -->
            <div class="row g-4 mb-4">
              <!-- Workforce by Category -->
              <div class="col-lg-6">
                <div class="card card-custom border-0 p-4 h-100">
                  <h5 class="fw-bold text-dark mb-3"><i class="bi bi-tags-fill me-2 text-warning"></i> Workforce Category Distribution</h5>
                  <div class="space-y-3">
                    <div *ngFor="let cat of stats.categoryBreakdown" class="p-2 border-bottom">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-semibold text-dark small">{{ cat.category }}</span>
                        <span class="badge bg-secondary rounded-pill">{{ cat.count }} Workers</span>
                      </div>
                      <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-warning" [style.width]="getCategoryPercent(cat.count) + '%'"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Workforce by Project -->
              <div class="col-lg-6">
                <div class="card card-custom border-0 p-4 h-100">
                  <h5 class="fw-bold text-dark mb-3"><i class="bi bi-building me-2 text-warning"></i> Workforce Allocation by Project</h5>
                  <div class="table-responsive">
                    <table class="table table-hover align-middle small mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Project</th>
                          <th class="text-center">Assigned Workers</th>
                          <th class="text-end">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let pb of stats.projectBreakdown">
                          <td class="fw-semibold">{{ pb.projectName }}</td>
                          <td class="text-center"><span class="badge bg-warning text-dark px-2">{{ pb.count }}</span></td>
                          <td class="text-end"><span class="badge bg-success-subtle text-success">Active Site</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Workforce Assignments Table -->
            <div class="card card-custom border-0 p-4 mb-4">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold text-dark mb-0"><i class="bi bi-clock-history me-2 text-warning"></i> Recent Project Assignments</h5>
                <a routerLink="/workforce/allocations" class="btn btn-sm btn-outline-dark">View All Allocations</a>
              </div>

              <div class="table-responsive" *ngIf="stats.recentAssignments.length; else noAssign">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Worker</th>
                      <th>Project</th>
                      <th>Contractor</th>
                      <th>Activity</th>
                      <th>Start Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let a of stats.recentAssignments">
                      <td class="fw-bold">
                        <a [routerLink]="['/workforce/workers', a.workerId]" class="text-dark text-decoration-none hover-warning">
                          {{ a.workerName }} ({{ a.workerCode }})
                        </a>
                      </td>
                      <td>{{ a.projectName }}</td>
                      <td>{{ a.contractorName || 'Direct Labor' }}</td>
                      <td><span class="badge bg-light text-dark border">{{ a.workActivity || 'General' }}</span></td>
                      <td>{{ a.assignmentStartDate }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-success': a.assignmentStatus === 'Active',
                          'bg-secondary': a.assignmentStatus === 'Completed',
                          'bg-info text-dark': a.assignmentStatus === 'Transferred'
                        }">{{ a.assignmentStatus }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noAssign>
                <div class="text-muted small py-3 text-center">No recent project assignments found.</div>
              </ng-template>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.76rem; }
    .space-y-3 > * + * { margin-top: 0.5rem; }
  `]
})
export class WorkforceDashboardComponent implements OnInit {
  stats: WorkforceDashboardStats | null = null;
  loading = true;

  projects: Project[] = [];
  contractors: any[] = [];

  selectedProjectId = '';
  selectedContractorId = '';

  constructor(
    private workforceService: WorkforceService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: () => this.projects = []
    });

    this.userService.getUsers('Contractor').subscribe({
      next: (data) => this.contractors = data,
      error: () => this.contractors = []
    });

    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.workforceService.getDashboardStats(this.selectedProjectId, this.selectedContractorId).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getCategoryPercent(count: number): number {
    if (!this.stats || !this.stats.totalWorkers) return 0;
    return Math.round((count / this.stats.totalWorkers) * 100);
  }
}

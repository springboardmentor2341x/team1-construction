import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { DashboardService, AdminDashboardData } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, StatusBadgeComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
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
                <span class="badge bg-danger text-white px-2 py-1 uppercase">Admin Access</span>
                <h2 class="fw-bold text-dark mb-0">Executive Administrator Control Tower</h2>
              </div>
              <p class="text-muted small mb-0">System-wide monitoring of users, project execution, financial budget, and audit trails.</p>
            </div>
            <div class="d-flex gap-2">
              <a routerLink="/users" class="btn btn-outline-dark btn-sm"><i class="bi bi-people-fill me-1"></i> User Management</a>
              <a routerLink="/projects/create" class="btn btn-bt-accent btn-sm"><i class="bi bi-plus-lg me-1"></i> Create Project</a>
            </div>
          </div>

          <!-- Section 1: System Analytics Overview Cards -->
          <div class="row g-3 mb-4">
            <!-- 1. User Management Stat -->
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Total System Users</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1">{{ dashboard()?.userManagement?.totalUsers || 0 }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-primary-subtle text-primary"><i class="bi bi-people-fill"></i></div>
                </div>
                <div class="mt-2 small text-muted d-flex justify-content-between">
                  <span>Active: <strong>{{ dashboard()?.userManagement?.activeUsers || 0 }}</strong></span>
                  <a routerLink="/users" class="text-primary text-decoration-none fw-bold">Manage Users &rarr;</a>
                </div>
              </div>
            </div>

            <!-- 2. Project Monitoring Stat -->
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">System Projects</span>
                    <h3 class="fw-bold text-success mb-0 mt-1">{{ dashboard()?.projectMonitoring?.totalProjects || 0 }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-success-subtle text-success"><i class="bi bi-building"></i></div>
                </div>
                <div class="mt-2 small text-muted d-flex justify-content-between">
                  <span>In Progress: <strong>{{ dashboard()?.projectMonitoring?.inProgressProjects || 0 }}</strong></span>
                  <span class="fw-bold text-success">{{ dashboard()?.projectMonitoring?.averageCompletionPercentage || 0 }}% Avg Progress</span>
                </div>
              </div>
            </div>

            <!-- 3. System Financials & Budget -->
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Total System Budget</span>
                    <h3 class="fw-bold text-warning mb-0 mt-1">₹{{ (dashboard()?.projectMonitoring?.totalSystemBudget || 0) | number:'1.0-0' }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-warning-subtle text-warning"><i class="bi bi-currency-rupee"></i></div>
                </div>
                <div class="mt-2 small text-muted d-flex justify-content-between">
                  <span>Spent: ₹{{ (dashboard()?.systemAnalytics?.totalProcurementSpent || 0) | number:'1.0-0' }}</span>
                  <span class="fw-bold text-dark">Procurement Ledger</span>
                </div>
              </div>
            </div>

            <!-- 4. System Health Status -->
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">System Health</span>
                    <h3 class="fw-bold text-info mb-0 mt-1">{{ dashboard()?.systemAnalytics?.systemHealthStatus || 'Not Available' }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-info-subtle text-info"><i class="bi bi-heart-pulse-fill"></i></div>
                </div>
                <div class="mt-2 small text-muted d-flex justify-content-between">
                  <span>Workers: <strong>{{ dashboard()?.systemAnalytics?.totalRegisteredWorkers || 0 }}</strong></span>
                  <span class="badge bg-success-subtle text-success">DB Verified</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 1.5: Executive Dynamic Charts -->
          <div class="row g-3 mb-4">
            <!-- Chart 1: Project Status Distribution Bar Chart -->
            <div class="col-lg-4">
              <div class="card card-custom p-4 border-0 h-100">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-kanban text-primary me-2"></i>Project Status Distribution</h6>
                <div class="my-2">
                  <div class="d-flex justify-content-between small fw-bold mb-1">
                    <span>In Progress</span>
                    <span class="text-warning">{{ dashboard()?.projectMonitoring?.inProgressProjects || 0 }}</span>
                  </div>
                  <div class="progress mb-2" style="height:8px;">
                    <div class="progress-bar bg-warning" [style.width.%]="getProjectStatusPercentage('In Progress')"></div>
                  </div>
                  <div class="d-flex justify-content-between small fw-bold mb-1">
                    <span>Planning</span>
                    <span class="text-info">{{ dashboard()?.projectMonitoring?.planningProjects || 0 }}</span>
                  </div>
                  <div class="progress mb-2" style="height:8px;">
                    <div class="progress-bar bg-info" [style.width.%]="getProjectStatusPercentage('Planning')"></div>
                  </div>
                  <div class="d-flex justify-content-between small fw-bold mb-1">
                    <span>Completed</span>
                    <span class="text-success">{{ dashboard()?.projectMonitoring?.completedProjects || 0 }}</span>
                  </div>
                  <div class="progress" style="height:8px;">
                    <div class="progress-bar bg-success" [style.width.%]="getProjectStatusPercentage('Completed')"></div>
                  </div>
                </div>
                <div class="small text-muted border-top pt-2 mt-auto">
                  <span>Total System Projects: <strong>{{ dashboard()?.projectMonitoring?.totalProjects || 0 }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Chart 2: User Role Distribution Visual Multi-Bar -->
            <div class="col-lg-4">
              <div class="card card-custom p-4 border-0 h-100">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-people text-secondary me-2"></i>User Role Breakdown Chart</h6>
                <div class="my-2" style="max-height: 120px; overflow-y: auto;">
                  <div *ngFor="let item of getRoleBreakdownList()" class="mb-2">
                    <div class="d-flex justify-content-between small fw-semibold">
                      <span>{{ item.role }}</span>
                      <span>{{ item.count }}</span>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div class="progress-bar bg-primary" [style.width.%]="getRolePercentage(item.count)"></div>
                    </div>
                  </div>
                </div>
                <div class="small text-muted border-top pt-2 mt-auto">
                  <span>Active System Users: <strong>{{ dashboard()?.userManagement?.activeUsers || 0 }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Chart 3: Active User Engagement Ring -->
            <div class="col-lg-4">
              <div class="card card-custom p-4 border-0 h-100">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-shield-check text-success me-2"></i>Active User Engagement Ring</h6>
                <div class="d-flex align-items-center justify-content-center my-2 position-relative" style="height: 130px;">
                  <svg viewBox="0 0 36 36" class="w-100 h-100" style="max-height: 120px;">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e9ecef" stroke-width="3.8"/>
                    <path [attr.stroke-dasharray]="getActiveUserDashArray()" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#dc3545" stroke-width="3.8" stroke-linecap="round"/>
                    <text x="18" y="20.35" text-anchor="middle" font-size="8px" font-weight="bold" fill="#dc3545">{{ dashboard()?.userManagement?.activeUsers || 0 }}/{{ dashboard()?.userManagement?.totalUsers || 0 }}</text>
                  </svg>
                </div>
                <div class="d-flex justify-content-around small text-muted mt-2 border-top pt-2">
                  <span class="text-danger fw-semibold"><i class="bi bi-circle-fill me-1"></i>Active: {{ dashboard()?.userManagement?.activeUsers || 0 }}</span>
                  <span class="text-secondary fw-semibold"><i class="bi bi-circle-fill me-1"></i>Total: {{ dashboard()?.userManagement?.totalUsers || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="row g-4 mb-4">
            
            <!-- Left Column: Project Monitoring Table & User Management Breakdown -->
            <div class="col-lg-8">
              
              <!-- Section 2: Project Monitoring Table -->
              <div class="card card-custom border-0 p-4 mb-4">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h6 class="fw-bold text-dark mb-0"><i class="bi bi-kanban me-2 text-warning"></i>Project Monitoring & Executive Oversight</h6>
                  <span class="badge bg-light text-dark border">{{ dashboard()?.projectMonitoring?.totalProjects || 0 }} Total Projects</span>
                </div>
                
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small">
                      <tr>
                        <th>Code</th>
                        <th>Project Name</th>
                        <th>Project Manager</th>
                        <th>Status</th>
                        <th>Budget</th>
                        <th>Completion</th>
                      </tr>
                    </thead>
                    <tbody class="small">
                      <tr *ngFor="let p of dashboard()?.projectMonitoring?.projects">
                        <td class="fw-bold text-warning">{{ p.code }}</td>
                        <td class="fw-semibold text-dark">{{ p.name }}</td>
                        <td class="text-muted"><i class="bi bi-person me-1"></i>{{ p.projectManagerName }}</td>
                        <td><app-status-badge [status]="p.status"></app-status-badge></td>
                        <td class="fw-semibold">₹{{ p.budget | number:'1.0-0' }}</td>
                        <td style="width:140px">
                          <div class="d-flex align-items-center gap-2">
                            <div class="progress flex-grow-1" style="height:6px">
                              <div class="progress-bar bg-warning" [style.width.%]="p.completionPercentage"></div>
                            </div>
                            <span class="fw-bold small">{{ p.completionPercentage }}%</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Section 1 Details: User Management & Role Breakdown -->
              <div class="card card-custom border-0 p-4">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-shield-lock me-2 text-warning"></i>User Management & Role Distribution Overview</h6>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <div *ngFor="let item of getRoleBreakdownList()" class="px-3 py-2 bg-light rounded-3 border d-flex align-items-center gap-2">
                    <span class="badge bg-secondary rounded-pill">{{ item.count }}</span>
                    <span class="fw-semibold text-dark small">{{ item.role }}</span>
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <a routerLink="/users" class="btn btn-sm btn-outline-dark"><i class="bi bi-person-gear me-1"></i> Open User Management Panel &rarr;</a>
                </div>
              </div>

            </div>

            <!-- Right Column: Reports Management & Activity Monitoring -->
            <div class="col-lg-4">
              
              <!-- Section 4: Reports Management Summary -->
              <div class="card card-custom border-0 p-4 mb-4">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-file-earmark-bar-graph me-2 text-warning"></i>Reports Management & Export Center</h6>
                <div class="list-group list-group-flush small">
                  <a routerLink="/daily-progress-reports" class="list-group-item list-group-item-action px-0 d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-journal-text me-2 text-warning"></i>Daily Progress Reports</span>
                    <span class="badge bg-primary rounded-pill">{{ dashboard()?.reportsManagement?.totalDailyReports || 0 }}</span>
                  </a>
                  <a routerLink="/weekly-progress-reports" class="list-group-item list-group-item-action px-0 d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-card-checklist me-2 text-success"></i>Weekly Progress Reports</span>
                    <span class="badge bg-success rounded-pill">{{ dashboard()?.reportsManagement?.totalWeeklyReports || 0 }}</span>
                  </a>
                  <a routerLink="/delay-tracking" class="list-group-item list-group-item-action px-0 d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-exclamation-triangle me-2 text-danger"></i>Delay Tracking Reports</span>
                    <span class="badge bg-danger rounded-pill">{{ dashboard()?.reportsManagement?.totalDelayIncidents || 0 }}</span>
                  </a>
                  <a routerLink="/projects/milestones" class="list-group-item list-group-item-action px-0 d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-flag me-2 text-info"></i>Project Milestones Tracked</span>
                    <span class="badge bg-info rounded-pill">{{ dashboard()?.reportsManagement?.totalMilestonesTracked || 0 }}</span>
                  </a>
                </div>
              </div>

              <!-- Section 5: Activity Monitoring Audit Feed -->
              <div class="card card-custom border-0 p-4">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-clock-history me-2 text-warning"></i>System Activity Monitoring Feed</h6>
                <div class="timeline small">
                  <div *ngFor="let log of dashboard()?.activityLogs" class="mb-3 border-bottom pb-2">
                    <div class="d-flex align-items-center justify-content-between">
                      <strong class="text-dark">{{ log.action }}</strong>
                      <span class="badge bg-light text-dark border" style="font-size:0.65rem">{{ log.project }}</span>
                    </div>
                    <div class="text-muted mt-1" style="font-size:0.75rem">{{ log.details }}</div>
                    <div class="text-warning fw-semibold mt-1" style="font-size:0.7rem"><i class="bi bi-clock me-1"></i>{{ log.timestamp }}</div>
                  </div>
                  <div *ngIf="!dashboard()?.activityLogs || dashboard()?.activityLogs?.length === 0" class="text-muted text-center py-2">
                    No recent activity logs found.
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
export class AdminDashboardComponent implements OnInit {
  dashboard = signal<AdminDashboardData | null>(null);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => this.dashboard.set(data),
      error: () => {}
    });
  }

  getRoleBreakdownList(): { role: string; count: number }[] {
    const rb = this.dashboard()?.userManagement?.roleBreakdown;
    if (!rb) return [];
    return Object.keys(rb).map(role => ({ role, count: rb[role] }));
  }

  getProjectStatusPercentage(status: string): number {
    const pm = this.dashboard()?.projectMonitoring;
    if (!pm || !pm.totalProjects) return 0;
    let count = 0;
    if (status === 'In Progress') count = pm.inProgressProjects;
    else if (status === 'Planning') count = pm.planningProjects;
    else if (status === 'Completed') count = pm.completedProjects;
    return Math.round((count / pm.totalProjects) * 100);
  }

  getRolePercentage(count: number): number {
    const total = this.dashboard()?.userManagement?.totalUsers;
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }

  getActiveUserDashArray(): string {
    const u = this.dashboard()?.userManagement;
    if (!u || !u.totalUsers) return '0, 100';
    const pct = Math.round((u.activeUsers / u.totalUsers) * 100);
    return `${pct}, 100`;
  }
}

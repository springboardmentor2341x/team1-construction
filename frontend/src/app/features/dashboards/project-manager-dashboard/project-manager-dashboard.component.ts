import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { DashboardService, PmDashboardData } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-project-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent, StatusBadgeComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <!-- Top Header & Project Selector Filter -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-warning text-dark px-2 py-1 uppercase">PM Workspace</span>
                <h2 class="fw-bold text-dark mb-0">Project Manager Control Board</h2>
              </div>
              <p class="text-muted small mb-0">Real database monitoring for schedules, budget utilization, workforce, resources & procurement.</p>
            </div>
            
            <div class="d-flex align-items-center gap-3">
              <!-- Project Dropdown Selector -->
              <div class="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-3 shadow-sm border">
                <i class="bi bi-funnel-fill text-warning"></i>
                <span class="small fw-semibold text-muted">Project:</span>
                <select class="form-select form-select-sm border-0 bg-transparent fw-bold" style="width:210px; cursor:pointer" [(ngModel)]="selectedProjectId" (change)="onProjectFilterChange()">
                  <option value="">All Assigned Projects</option>
                  <option *ngFor="let p of dashboard()?.assignedProjects" [value]="p.id">{{ p.name }}</option>
                </select>
              </div>

              <div class="d-flex gap-2">
                <a routerLink="/projects/schedules" class="btn btn-outline-dark btn-sm"><i class="bi bi-calendar3-range me-1"></i> Schedules</a>
                <a routerLink="/tasks" class="btn btn-bt-accent btn-sm"><i class="bi bi-card-checklist me-1"></i> Assign Task</a>
              </div>
            </div>
          </div>

          <!-- Section 1: Top Metric Overview Cards -->
          <div class="row g-3 mb-4">
            <!-- 1. Overall Completion Progress -->
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Overall Progress</span>
                    <h3 class="fw-bold text-primary mb-0 mt-1">{{ dashboard()?.projectProgress?.overallCompletionPercentage || 0 }}%</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-primary-subtle text-primary"><i class="bi bi-speedometer2"></i></div>
                </div>
                <div class="progress mt-2" style="height:6px">
                  <div class="progress-bar bg-primary" [style.width.%]="dashboard()?.projectProgress?.overallCompletionPercentage || 0"></div>
                </div>
                <div class="mt-2 small text-muted d-flex justify-content-between">
                  <span>{{ dashboard()?.projectProgress?.totalProjects || 0 }} active project(s)</span>
                  <span class="fw-bold text-success">{{ dashboard()?.projectProgress?.milestoneVelocity || 0 }}% velocity</span>
                </div>
              </div>
            </div>

            <!-- 2. Budget Utilization -->
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Budget Utilization</span>
                    <h3 class="fw-bold text-warning mb-0 mt-1">₹{{ (dashboard()?.budgetUtilization?.totalUtilized || 0) | number:'1.0-0' }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-warning-subtle text-warning"><i class="bi bi-currency-rupee"></i></div>
                </div>
                <div class="progress mt-2" style="height:6px">
                  <div class="progress-bar bg-warning" [style.width.%]="dashboard()?.budgetUtilization?.utilizationPercentage || 0"></div>
                </div>
                <div class="mt-2 small text-muted d-flex justify-content-between">
                  <span>Planned: ₹{{ (dashboard()?.budgetUtilization?.totalPlannedBudget || 0) | number:'1.0-0' }}</span>
                  <span class="fw-bold text-dark">{{ dashboard()?.budgetUtilization?.utilizationPercentage || 0 }}% used</span>
                </div>
              </div>
            </div>

            <!-- 3. Workforce Status -->
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Workforce Status</span>
                    <h3 class="fw-bold text-success mb-0 mt-1">{{ dashboard()?.workforceStatus?.totalAssignedWorkers || 0 }} Workers</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-success-subtle text-success"><i class="bi bi-people-fill"></i></div>
                </div>
                <div class="progress mt-2" style="height:6px">
                  <div class="progress-bar bg-success" [style.width.%]="dashboard()?.workforceStatus?.attendanceRatePercentage || 0"></div>
                </div>
                <div class="mt-2 small text-muted d-flex justify-content-between">
                  <span>Present Today: <strong>{{ dashboard()?.workforceStatus?.presentTodayCount || 0 }}</strong></span>
                  <span class="badge bg-success-subtle text-success">{{ dashboard()?.workforceStatus?.attendanceRatePercentage || 0 }}% attendance</span>
                </div>
              </div>
            </div>

            <!-- 4. Procurement Alerts -->
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Procurement Pending</span>
                    <h3 class="fw-bold text-danger mb-0 mt-1">{{ dashboard()?.procurementOverview?.pendingApprovalCount || 0 }} Requests</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-danger-subtle text-danger"><i class="bi bi-cart-check-fill"></i></div>
                </div>
                <div class="mt-2 small text-muted d-flex justify-content-between">
                  <span>Total POs: {{ dashboard()?.procurementOverview?.totalRequests || 0 }}</span>
                  <a routerLink="/procurement/requests" class="fw-bold text-danger text-decoration-none">Approve Requisitions &rarr;</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 1.5: Dynamic Analytics Charts -->
          <div class="row g-3 mb-4">
            <!-- Chart 1: Milestone Progress Donut Chart -->
            <div class="col-lg-4">
              <div class="card card-custom p-4 border-0 h-100">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-pie-chart-fill text-primary me-2"></i>Milestone Progress Breakdown</h6>
                <div class="d-flex align-items-center justify-content-center my-2 position-relative" style="height: 140px;">
                  <svg viewBox="0 0 36 36" class="w-100 h-100" style="max-height: 130px;">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e9ecef" stroke-width="3.8"/>
                    <path [attr.stroke-dasharray]="getMilestoneDashArray()" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0d6efd" stroke-width="3.8" stroke-linecap="round"/>
                    <text x="18" y="20.35" text-anchor="middle" font-size="8px" font-weight="bold" fill="#0d6efd">{{ dashboard()?.projectProgress?.completedMilestones || 0 }}/{{ dashboard()?.projectProgress?.totalMilestones || 0 }}</text>
                  </svg>
                </div>
                <div class="d-flex justify-content-around small text-muted mt-2 border-top pt-2">
                  <span class="text-primary fw-semibold"><i class="bi bi-circle-fill me-1"></i>Completed: {{ dashboard()?.projectProgress?.completedMilestones || 0 }}</span>
                  <span class="text-danger fw-semibold"><i class="bi bi-circle-fill me-1"></i>Delayed: {{ dashboard()?.projectProgress?.delayedMilestones || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Chart 2: Financial Budget Utilization Bar Chart -->
            <div class="col-lg-4">
              <div class="card card-custom p-4 border-0 h-100">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-bar-chart-line-fill text-warning me-2"></i>Financial Budget Utilization</h6>
                <div class="my-3">
                  <div class="d-flex justify-content-between small fw-bold mb-1">
                    <span class="text-muted">Utilized Funds</span>
                    <span class="text-warning">₹{{ (dashboard()?.budgetUtilization?.totalUtilized || 0) | number:'1.0-0' }} ({{ dashboard()?.budgetUtilization?.utilizationPercentage || 0 }}%)</span>
                  </div>
                  <div class="progress mb-3" style="height: 12px;">
                    <div class="progress-bar bg-warning" [style.width.%]="dashboard()?.budgetUtilization?.utilizationPercentage || 0"></div>
                  </div>
                  <div class="d-flex justify-content-between small fw-bold mb-1">
                    <span class="text-muted">Remaining Budget</span>
                    <span class="text-success">₹{{ (dashboard()?.budgetUtilization?.remainingBudget || 0) | number:'1.0-0' }}</span>
                  </div>
                  <div class="progress" style="height: 12px;">
                    <div class="progress-bar bg-success" [style.width.%]="100 - (dashboard()?.budgetUtilization?.utilizationPercentage || 0)"></div>
                  </div>
                </div>
                <div class="small text-muted border-top pt-2">
                  <span>Total Planned: <strong>₹{{ (dashboard()?.budgetUtilization?.totalPlannedBudget || 0) | number:'1.0-0' }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Chart 3: Workforce Attendance Ring Chart -->
            <div class="col-lg-4">
              <div class="card card-custom p-4 border-0 h-100">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-person-check-fill text-success me-2"></i>Workforce Attendance Ring</h6>
                <div class="d-flex align-items-center justify-content-center my-2 position-relative" style="height: 140px;">
                  <svg viewBox="0 0 36 36" class="w-100 h-100" style="max-height: 130px;">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e9ecef" stroke-width="3.8"/>
                    <path [attr.stroke-dasharray]="getAttendanceDashArray()" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#198754" stroke-width="3.8" stroke-linecap="round"/>
                    <text x="18" y="20.35" text-anchor="middle" font-size="8px" font-weight="bold" fill="#198754">{{ dashboard()?.workforceStatus?.attendanceRatePercentage || 0 }}%</text>
                  </svg>
                </div>
                <div class="d-flex justify-content-around small text-muted mt-2 border-top pt-2">
                  <span class="text-success fw-semibold"><i class="bi bi-circle-fill me-1"></i>Present: {{ dashboard()?.workforceStatus?.presentTodayCount || 0 }}</span>
                  <span class="text-secondary fw-semibold"><i class="bi bi-circle-fill me-1"></i>Absent: {{ dashboard()?.workforceStatus?.absentTodayCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Grid (5 Core Modules Summary) -->
          <div class="row g-4 mb-4">
            
            <!-- Left Column: Project Progress & Budget Details -->
            <div class="col-lg-8">
              <!-- Section 1 Details: Assigned Projects & Progress -->
              <div class="card card-custom border-0 p-4 mb-4">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h6 class="fw-bold text-dark mb-0"><i class="bi bi-kanban me-2 text-warning"></i>Project Progress & Milestone Status</h6>
                  <span class="badge bg-light text-dark border">{{ dashboard()?.assignedProjects?.length || 0 }} Assigned Projects</span>
                </div>
                
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small">
                      <tr>
                        <th>Project Code</th>
                        <th>Project Name</th>
                        <th>Status</th>
                        <th>Budget</th>
                        <th>Completion</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody class="small">
                      <tr *ngFor="let proj of dashboard()?.assignedProjects">
                        <td class="fw-bold text-warning">{{ proj.code }}</td>
                        <td class="fw-semibold text-dark">{{ proj.name }}</td>
                        <td><app-status-badge [status]="proj.status"></app-status-badge></td>
                        <td class="fw-semibold">₹{{ proj.budget | number:'1.0-0' }}</td>
                        <td style="width:160px">
                          <div class="d-flex align-items-center gap-2">
                            <div class="progress flex-grow-1" style="height:6px">
                              <div class="progress-bar bg-warning" [style.width.%]="proj.completionPercentage"></div>
                            </div>
                            <span class="fw-bold small">{{ proj.completionPercentage }}%</span>
                          </div>
                        </td>
                        <td>
                          <a [routerLink]="['/projects', proj.id]" class="btn btn-sm btn-outline-warning py-0 px-2">View &rarr;</a>
                        </td>
                      </tr>
                      <tr *ngIf="!dashboard()?.assignedProjects || dashboard()?.assignedProjects?.length === 0">
                        <td colspan="6" class="text-center py-4 text-muted">No projects assigned to this Project Manager.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Section 2 Details: Financial & Budget Breakdown -->
              <div class="card card-custom border-0 p-4">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-wallet2 me-2 text-warning"></i>Budget Utilization & Expenditure Breakdown</h6>
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded-3 border">
                      <span class="text-muted small">Total Planned Budget</span>
                      <h4 class="fw-bold text-dark mb-0 mt-1">₹{{ (dashboard()?.budgetUtilization?.totalPlannedBudget || 0) | number:'1.0-0' }}</h4>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-3 bg-warning-subtle rounded-3 border border-warning-subtle">
                      <span class="text-warning-emphasis small fw-semibold">Procurement & PO Spent</span>
                      <h4 class="fw-bold text-warning-emphasis mb-0 mt-1">₹{{ (dashboard()?.budgetUtilization?.totalUtilized || 0) | number:'1.0-0' }}</h4>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-3 bg-success-subtle rounded-3 border border-success-subtle">
                      <span class="text-success-emphasis small fw-semibold">Remaining Funds</span>
                      <h4 class="fw-bold text-success-emphasis mb-0 mt-1">₹{{ (dashboard()?.budgetUtilization?.remainingBudget || 0) | number:'1.0-0' }}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Resource & Procurement Overview -->
            <div class="col-lg-4">
              <!-- Section 4 Details: Resource Utilization -->
              <div class="card card-custom border-0 p-4 mb-4">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-truck me-2 text-warning"></i>Resource & Machinery Utilization</h6>
                <div class="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mb-3 border">
                  <div>
                    <span class="text-muted small">Allocated Equipment</span>
                    <h4 class="fw-bold text-dark mb-0">{{ dashboard()?.resourceUtilization?.totalAllocatedEquipment || 0 }} Machines</h4>
                  </div>
                  <div class="text-end">
                    <span class="badge bg-success mb-1">{{ dashboard()?.resourceUtilization?.activeEquipmentCount || 0 }} Active</span>
                    <div class="small text-muted">{{ dashboard()?.resourceUtilization?.utilizationRatePercentage || 0 }}% Operational</div>
                  </div>
                </div>
                <a routerLink="/resources/utilization" class="btn btn-sm btn-outline-dark w-100"><i class="bi bi-eye me-1"></i> View Equipment Logs</a>
              </div>

              <!-- Section 5 Details: Procurement Overview -->
              <div class="card card-custom border-0 p-4 mb-4">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-cart3 me-2 text-warning"></i>Procurement & Requisition Overview</h6>
                <div class="list-group list-group-flush small">
                  <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <span class="text-muted">Total Requisitions</span>
                    <span class="fw-bold text-dark">{{ dashboard()?.procurementOverview?.totalRequests || 0 }}</span>
                  </div>
                  <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <span class="text-muted">Pending PM Approvals</span>
                    <span class="badge bg-danger rounded-pill">{{ dashboard()?.procurementOverview?.pendingApprovalCount || 0 }}</span>
                  </div>
                  <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <span class="text-muted">Approved Requisitions</span>
                    <span class="badge bg-success rounded-pill">{{ dashboard()?.procurementOverview?.approvedRequestsCount || 0 }}</span>
                  </div>
                  <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <span class="text-muted">Purchase Order Value</span>
                    <span class="fw-bold text-dark">₹{{ (dashboard()?.procurementOverview?.purchaseOrderTotalAmount || 0) | number:'1.0-0' }}</span>
                  </div>
                </div>
                <a routerLink="/procurement/requests" class="btn btn-sm btn-bt-accent w-100 mt-3"><i class="bi bi-check2-circle me-1"></i> Process Procurement Requisitions</a>
              </div>

              <!-- Recent Site Activities -->
              <div class="card card-custom border-0 p-4">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-activity me-2 text-warning"></i>Recent Site Activity Logs</h6>
                <div class="timeline small">
                  <div *ngFor="let act of dashboard()?.recentActivities" class="mb-3 border-bottom pb-2">
                    <div class="fw-bold text-dark">{{ act.action }}</div>
                    <div class="text-muted" style="font-size:0.75rem">{{ act.details }}</div>
                    <div class="text-warning fw-semibold mt-1" style="font-size:0.7rem"><i class="bi bi-clock me-1"></i>{{ act.time }}</div>
                  </div>
                  <div *ngIf="!dashboard()?.recentActivities || dashboard()?.recentActivities?.length === 0" class="text-muted text-center py-2">
                    No recent site activity recorded.
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
export class ProjectManagerDashboardComponent implements OnInit {
  dashboard = signal<PmDashboardData | null>(null);
  selectedProjectId: string = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.dashboardService.getPmDashboard(this.selectedProjectId).subscribe({
      next: (data) => this.dashboard.set(data),
      error: () => {}
    });
  }

  onProjectFilterChange(): void {
    this.loadDashboard();
  }

  getMilestoneDashArray(): string {
    const p = this.dashboard()?.projectProgress;
    if (!p || !p.totalMilestones) return '0, 100';
    const pct = Math.round((p.completedMilestones / p.totalMilestones) * 100);
    return `${pct}, 100`;
  }

  getAttendanceDashArray(): string {
    const w = this.dashboard()?.workforceStatus;
    if (!w) return '0, 100';
    const pct = Math.round(w.attendanceRatePercentage);
    return `${pct}, 100`;
  }
}

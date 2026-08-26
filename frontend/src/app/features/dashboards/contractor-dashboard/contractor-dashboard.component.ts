import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TaskService, TaskItem } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-contractor-dashboard',
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
                <span class="badge bg-purple text-white px-2 py-1 uppercase" style="background-color: #8B5CF6;">Contractor Hub</span>
                <h2 class="fw-bold text-dark mb-0">Subcontractor & Crew Operations</h2>
              </div>
              <p class="text-muted small mb-0">Manage crew shifts, attendance roster, work completion targets, and trade tasks.</p>
            </div>
            <button class="btn btn-bt-accent btn-sm d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-clock-history"></i> Log Shift Attendance
            </button>
          </div>

          <!-- Top Stats -->
          <div class="row g-3 mb-4">
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Assigned Tasks</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1">{{ tasks.length }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-purple-subtle text-purple" style="background-color: #F3E8FF; color: #7C3AED;"><i class="bi bi-card-checklist"></i></div>
                </div>
                <div class="mt-2 small text-muted">{{ inProgressCount }} in progress</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Worker Roster</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1">{{ workers.length }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-info-subtle text-info"><i class="bi bi-people-fill"></i></div>
                </div>
                <div class="mt-2 small text-muted">{{ activeWorkers }} active</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Attendance Rate</span>
                    <h3 class="fw-bold text-success mb-0 mt-1">{{ attendanceRate }}%</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-success-subtle text-success"><i class="bi bi-person-check"></i></div>
                </div>
                <div class="mt-2 small text-muted">calculated from roster</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Work Completion</span>
                    <h3 class="fw-bold text-warning mb-0 mt-1">{{ completionRate }}%</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-warning-subtle text-warning"><i class="bi bi-pie-chart-fill"></i></div>
                </div>
                <div class="mt-2 small text-muted">task completion status</div>
              </div>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="row g-4">
            <!-- Left: Assigned Trade Tasks -->
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-list-task me-2 text-warning"></i> Assigned Trade Tasks</h5>
                <div class="space-y-3">
                  <div class="p-3 border rounded-3 bg-white d-flex justify-content-between align-items-center" *ngFor="let t of tasks">
                    <div>
                      <h6 class="fw-bold text-dark mb-1">{{ t.title }}</h6>
                      <p class="small text-muted mb-0">Project: {{ t.project }} | Location: {{ t.location }}</p>
                    </div>
                    <span class="badge" [ngClass]="getStatusBadge(t.status)">{{ t.status }}</span>
                  </div>
                  <div *ngIf="tasks.length === 0" class="text-center py-4 text-muted">
                    No tasks available yet. Connect the backend to load assigned tasks.
                  </div>
                </div>
              </div>

              <!-- Worker Shift Schedule -->
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-clock-history me-2 text-warning"></i> Active Worker Roster</h5>
                <div class="table-responsive">
                  <table class="table table-hover align-middle extra-small">
                    <thead class="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Trade</th>
                        <th>Employee ID</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let w of workers">
                        <td class="fw-bold">{{ w.fullName }}</td>
                        <td>{{ w.department }}</td>
                        <td><span class="badge bg-light text-dark font-monospace">{{ w.employeeId }}</span></td>
                        <td><span class="badge" [ngClass]="w.isActive ? 'bg-success' : 'bg-secondary'">{{ w.isActive ? 'Active' : 'Inactive' }}</span></td>
                      </tr>
                      <tr *ngIf="workers.length === 0">
                        <td colspan="4" class="text-center py-4 text-muted">No workers available yet.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Right Sidebar -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-person-badge text-warning me-2"></i> Trade Worker Roster</h5>
                <div class="extra-small text-muted">
                  Worker details will load from the backend roster.
                </div>
              </div>

              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-bell text-warning me-2"></i> Contractor Alerts</h5>
                <div class="extra-small text-muted">
                  Alerts will appear here once the backend provides them.
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
export class ContractorDashboardComponent implements OnInit {
  tasks: TaskItem[] = [];
  workers: any[] = [];

  constructor(
    private taskService: TaskService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(t => this.tasks = t);
    this.userService.getUsersByRole(UserRole.WORKER).subscribe(w => this.workers = w);
  }

  get inProgressCount(): number {
    return this.tasks.filter(t => t.status === 'In Progress').length;
  }

  get activeWorkers(): number {
    return this.workers.filter(w => w.isActive).length;
  }

  get attendanceRate(): number {
    return this.workers.length ? Math.round((this.activeWorkers / this.workers.length) * 100) : 0;
  }

  get completionRate(): number {
    if (!this.tasks.length) return 0;
    return Math.round((this.tasks.filter(t => t.status === 'Completed').length / this.tasks.length) * 100);
  }

  getStatusBadge(status: string): string {
    return { 'Open': 'bg-primary', 'In Progress': 'bg-warning text-dark', 'Completed': 'bg-success', 'On Hold': 'bg-secondary' }[status] || 'bg-secondary';
  }
}

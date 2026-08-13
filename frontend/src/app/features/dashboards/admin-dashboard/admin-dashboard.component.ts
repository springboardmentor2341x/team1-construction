import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { ProcurementService } from '../../../core/services/procurement.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, StatusBadgeComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <!-- Page Title -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-danger text-white px-2 py-1 uppercase">Admin Access</span>
                <h2 class="fw-bold text-dark mb-0">Executive Administrator Dashboard</h2>
              </div>
              <p class="text-muted small mb-0">Centralized control tower for projects, budget allocations, user governance, & site activities.</p>
            </div>
            <a routerLink="/projects/create" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-plus-lg"></i> Create New Project
            </a>
          </div>

          <!-- Top Stats Row (9 Key Indicators) -->
          <div class="row g-3 mb-4">
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Total Projects</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1">{{ projects.length }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-primary-subtle text-primary">
                    <i class="bi bi-building"></i>
                  </div>
                </div>
                <div class="mt-2 small text-muted">Live project count from the backend</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Active Projects</span>
                    <h3 class="fw-bold text-success mb-0 mt-1">{{ activeProjectsCount }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-success-subtle text-success">
                    <i class="bi bi-play-circle"></i>
                  </div>
                </div>
                <div class="mt-2 small text-muted">Execution on track</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
<span class="text-muted small fw-semibold">Total Users</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1">{{ totalUsersCount }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-warning-subtle text-warning">
                    <i class="bi bi-people"></i>
                  </div>
                </div>
                <div class="mt-2 small text-muted">users synced from backend</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
<span class="text-muted small fw-semibold">Active Site Workers</span>
                    <h3 class="fw-bold text-info mb-0 mt-1">{{ activeWorkersCount }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-info-subtle text-info">
                    <i class="bi bi-person-workspace"></i>
                  </div>
                </div>
                <div class="mt-2 small text-muted">active workers currently tracked</div>
              </div>
            </div>
          </div>

          <!-- Second Stats Row: Budget & Procurement -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
<div class="card card-custom p-4 border-0">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h5 class="fw-bold text-dark mb-0"><i class="bi bi-currency-rupee me-1 text-warning"></i> Budget Utilization</h5>
                  <span class="fw-bold text-dark">₹{{ portfolioTotal | number }} Portfolio Total</span>
                </div>
                <div class="progress mb-2" style="height: 12px;">
                  <div class="progress-bar bg-warning" role="progressbar" [style.width]="portfolioUtilization + '%'" [attr.aria-valuenow]="portfolioUtilization" aria-valuemin="0" aria-valuemax="100">{{ portfolioUtilization }}% Utilized</div>
                </div>
                <div class="small text-muted">
                  Portfolio budget across all active projects.
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="card card-custom p-4 border-0">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h5 class="fw-bold text-dark mb-0"><i class="bi bi-cart-check me-1 text-primary"></i> Procurement Requests</h5>
                  <span class="badge bg-primary rounded-pill">{{ procurementCount }} Pending Approval</span>
                </div>
                <div class="small text-muted border-top pt-2">
                  Live procurement data synced from backend.
                </div>
              </div>
            </div>
          </div>

          <!-- Main Grid: Project Summary & Activity Logs -->
          <div class="row g-4">
            <!-- Projects Table -->
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h5 class="fw-bold text-dark mb-0"><i class="bi bi-kanban me-2 text-warning"></i> Project Status Summary</h5>
                  <a routerLink="/projects" class="btn btn-sm btn-outline-dark">Manage All Projects</a>
                </div>

                <div class="table-responsive" *ngIf="projects.length; else noProjects">
                  <table class="table table-hover align-middle">
                    <thead class="table-light small text-muted">
                      <tr>
                        <th>Project Name</th>
                        <th>Code</th>
                        <th>Category</th>
                        <th>Manager</th>
                        <th>Status</th>
                        <th>Budget</th>
                      </tr>
                    </thead>
                    <tbody class="small">
                      <tr *ngFor="let p of projects">
                        <td class="fw-bold">
                          <a [routerLink]="['/projects', p.id]" class="text-dark text-decoration-none hover-warning">
                            {{ p.projectName }}
                          </a>
                        </td>
                        <td><span class="badge bg-light text-dark font-monospace">{{ p.projectCode }}</span></td>
                        <td>{{ p.category }}</td>
                        <td>{{ p.projectManagerName }}</td>
                        <td><app-status-badge [status]="p.status"></app-status-badge></td>
                        <td class="fw-semibold">₹{{ p.estimatedBudget | number }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ng-template #noProjects>
                  <div class="text-muted small">No project data is available yet. Connect the backend to populate this list.</div>
                </ng-template>
              </div>
            </div>

            <!-- Recent Activities & Notifications -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-bell me-2 text-warning"></i> System Notifications</h5>
                <div class="space-y-3">
                  <div class="p-3 bg-light rounded-3 border-start border-secondary border-4">
                    <p class="small text-muted mb-0">No notifications available yet. They will appear once the backend sends them.</p>
                  </div>
                </div>
              </div>

              <!-- Recent Activity Stream -->
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-activity me-2 text-warning"></i> Recent Audit Log</h5>
                <div class="text-muted small">No recent audit activity has been loaded yet.</div>
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
  `]
})
export class AdminDashboardComponent implements OnInit {
  projects: Project[] = [];
  totalUsersCount = 0;
  activeWorkersCount = 0;
  portfolioTotal = 0;
  portfolioUtilization = 0;
  procurementCount = 0;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private procurementService: ProcurementService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.portfolioTotal = data.reduce((sum, p) => sum + (p.estimatedBudget || 0), 0);
        this.portfolioUtilization = data.length ? Math.round((data.filter(p => p.status === 'In Progress').length / data.length) * 100) : 0;
      },
      error: () => {
        this.projects = [];
      }
    });

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.totalUsersCount = users.length;
        this.activeWorkersCount = users.filter(u => u.role === 'Worker' && u.isActive).length;
      },
      error: () => {
        this.totalUsersCount = 0;
        this.activeWorkersCount = 0;
      }
    });

    this.procurementService.getProcurements().subscribe({
      next: (data) => {
        this.procurementCount = data.filter(p => p.status === 'Pending Approval').length;
      },
      error: () => {
        this.procurementCount = 0;
      }
    });
  }

  get activeProjectsCount(): number {
    return this.projects.filter(p => p.status === 'In Progress').length;
  }
}

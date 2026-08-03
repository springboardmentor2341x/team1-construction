import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent, StatusBadgeComponent],
  template: `
    <app-role-simulator></app-role-simulator>
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
                <div class="mt-2 small text-muted"><span class="text-success fw-bold"><i class="bi bi-arrow-up-short"></i> +2</span> this month</div>
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
                    <h3 class="fw-bold text-dark mb-0 mt-1">128</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-warning-subtle text-warning">
                    <i class="bi bi-people"></i>
                  </div>
                </div>
                <div class="mt-2 small text-muted">across 6 RBAC roles</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Active Site Workers</span>
                    <h3 class="fw-bold text-info mb-0 mt-1">94</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-info-subtle text-info">
                    <i class="bi bi-person-workspace"></i>
                  </div>
                </div>
                <div class="mt-2 small text-muted">98.2% attendance today</div>
              </div>
            </div>
          </div>

          <!-- Second Stats Row: Budget & Procurement -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <div class="card card-custom p-4 border-0">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h5 class="fw-bold text-dark mb-0"><i class="bi bi-currency-dollar me-1 text-warning"></i> Budget Utilization</h5>
                  <span class="fw-bold text-dark">$180.0M Portfolio Total</span>
                </div>
                <div class="progress mb-2" style="height: 12px;">
                  <div class="progress-bar bg-warning" role="progressbar" style="width: 65%;" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">65% Utilized</div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                  <span>Spent: <strong>$117,000,000</strong></span>
                  <span>Remaining: <strong>$63,000,000</strong></span>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="card card-custom p-4 border-0">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h5 class="fw-bold text-dark mb-0"><i class="bi bi-cart-check me-1 text-primary"></i> Procurement Requests</h5>
                  <span class="badge bg-primary rounded-pill">12 Pending Approval</span>
                </div>
                <div class="d-flex align-items-center justify-content-between small text-muted border-top pt-2">
                  <span>Cement & Aggregate: <strong>$240k</strong></span>
                  <span>Structural Steel Beams: <strong>$850k</strong></span>
                  <a routerLink="/projects" class="text-warning text-decoration-none fw-semibold">View All <i class="bi bi-arrow-right"></i></a>
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

                <div class="table-responsive">
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
                        <td class="fw-semibold">\${{ p.estimatedBudget | number }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Recent Activities & Notifications -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-bell me-2 text-warning"></i> System Notifications</h5>
                <div class="space-y-3">
                  <div class="p-3 bg-light rounded-3 mb-2 border-start border-warning border-4">
                    <div class="d-flex justify-content-between">
                      <strong class="small text-dark">Milestone Delayed</strong>
                      <span class="text-muted extra-small">10 mins ago</span>
                    </div>
                    <p class="small text-muted mb-0">Harbor Bridge piling test report logged a 2-day weather delay.</p>
                  </div>

                  <div class="p-3 bg-light rounded-3 border-start border-success border-4">
                    <div class="d-flex justify-content-between">
                      <strong class="small text-dark">New User Registered</strong>
                      <span class="text-muted extra-small">1 hour ago</span>
                    </div>
                    <p class="small text-muted mb-0">Site Engineer David Miller completed onboarding profile setup.</p>
                  </div>
                </div>
              </div>

              <!-- Recent Activity Stream -->
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-activity me-2 text-warning"></i> Recent Audit Log</h5>
                <ul class="list-unstyled mb-0 extra-small">
                  <li class="mb-2 pb-2 border-bottom"><i class="bi bi-check2-circle text-success me-1"></i> Admin Vance created project <strong>BT-PRJ-2026-03</strong></li>
                  <li class="mb-2 pb-2 border-bottom"><i class="bi bi-pencil-square text-info me-1"></i> PM Jenkins updated Milestone 2 completion to 75%</li>
                  <li><i class="bi bi-shield-lock text-primary me-1"></i> Role assignment granted for Contractor Marcus Brody</li>
                </ul>
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

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(data => this.projects = data);
  }

  get activeProjectsCount(): number {
    return this.projects.filter(p => p.status === 'In Progress').length;
  }
}

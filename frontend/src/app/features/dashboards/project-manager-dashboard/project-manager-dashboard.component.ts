import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProjectService } from '../../../core/services/project.service';
import { MilestoneService } from '../../../core/services/milestone.service';
import { Project } from '../../../core/models/project.model';
import { Milestone } from '../../../core/models/milestone.model';

@Component({
  selector: 'app-project-manager-dashboard',
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
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-warning text-dark px-2 py-1 uppercase">PM Workspace</span>
                <h2 class="fw-bold text-dark mb-0">Project Manager Control Board</h2>
              </div>
              <p class="text-muted small mb-0">Monitor schedules, milestone velocity, contractor workforce, and site bottlenecks.</p>
            </div>
            <div class="d-flex gap-2">
              <a routerLink="/projects/schedules" class="btn btn-outline-dark btn-sm"><i class="bi bi-calendar3-range me-1"></i> Manage Schedules</a>
              <a routerLink="/projects/milestones" class="btn btn-bt-accent btn-sm"><i class="bi bi-flag-fill me-1"></i> Milestone Tracker</a>
            </div>
          </div>

          <!-- Top Metric Cards -->
          <div class="row g-3 mb-4">
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Assigned Projects</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1">{{ assignedProjects.length }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-warning-subtle text-warning"><i class="bi bi-kanban"></i></div>
                </div>
                <div class="mt-2 small text-muted">Active PM governance</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Milestone Velocity</span>
                    <h3 class="fw-bold text-success mb-0 mt-1">{{ milestoneVelocity }}%</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-success-subtle text-success"><i class="bi bi-speedometer"></i></div>
                </div>
                <div class="mt-2 small text-muted">avg. completion</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Active Milestones</span>
                    <h3 class="fw-bold text-info mb-0 mt-1">{{ milestones.length }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-info-subtle text-info"><i class="bi bi-person-lines-fill"></i></div>
                </div>
                <div class="mt-2 small text-muted">across projects</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Delayed Activities</span>
                    <h3 class="fw-bold text-danger mb-0 mt-1">{{ delayedMilestones }}</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-danger-subtle text-danger"><i class="bi bi-exclamation-triangle"></i></div>
                </div>
                <div class="mt-2 small text-muted">milestones delayed</div>
              </div>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="row g-4">
            <!-- Left: Assigned Projects & Schedules -->
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4 mb-4">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h5 class="fw-bold text-dark mb-0"><i class="bi bi-building-fill-check text-warning me-2"></i> My Managed Projects</h5>
                  <a routerLink="/projects" class="text-warning text-decoration-none small fw-bold">View Details <i class="bi bi-arrow-right"></i></a>
                </div>

                <div class="row g-3">
                  <div class="col-md-6" *ngFor="let p of assignedProjects">
                    <div class="p-3 bg-light rounded-3 border">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="fw-bold text-dark mb-0">{{ p.projectName }}</h6>
                        <app-status-badge [status]="p.status"></app-status-badge>
                      </div>
                      <p class="text-muted extra-small mb-2">{{ p.description | slice:0:70 }}...</p>
                      <div class="d-flex justify-content-between align-items-center extra-small border-top pt-2 mt-2">
                        <span>Budget: <strong>\${{ p.estimatedBudget | number }}</strong></span>
                        <a [routerLink]="['/projects', p.id]" class="btn btn-xs btn-outline-warning">Project Hub</a>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="assignedProjects.length === 0" class="col-12 text-center py-4 text-muted">
                    No projects available yet.
                  </div>
                </div>
              </div>

              <!-- Milestone Tracker List -->
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-flag-fill text-warning me-2"></i> Active Milestones</h5>
                <div class="space-y-3">
                  <div *ngFor="let m of milestones" class="p-3 border rounded-3 bg-white">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <strong class="text-dark small">{{ m.milestoneName }}</strong>
                      <app-status-badge [status]="m.status"></app-status-badge>
                    </div>
                    <div class="progress mb-2" style="height: 8px;">
                      <div class="progress-bar bg-warning" [style.width.%]="m.completionPercentage"></div>
                    </div>
                    <div class="d-flex justify-content-between extra-small text-muted">
                      <span>Target Date: {{ m.plannedDate }}</span>
                      <span>Progress: <strong>{{ m.completionPercentage }}%</strong></span>
                    </div>
                  </div>
                  <div *ngIf="milestones.length === 0" class="text-center py-4 text-muted">
                    No milestones available yet.
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Sidebar -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-clock-history text-danger me-2"></i> Upcoming Deadlines</h5>
                <div class="text-muted small">Deadlines will appear here once milestone data is available.</div>
              </div>

              <!-- Resource & Workforce Summary -->
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-boxes text-info me-2"></i> Resource & Workforce Summary</h5>
                <div class="extra-small space-y-2">
                  <div class="d-flex justify-content-between py-1 border-bottom">
                    <span class="text-muted">Managed Projects:</span>
                    <strong class="text-dark">{{ assignedProjects.length }}</strong>
                  </div>
                  <div class="d-flex justify-content-between py-1 border-bottom">
                    <span class="text-muted">Milestones:</span>
                    <strong class="text-dark">{{ milestones.length }}</strong>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <span class="text-muted">Delayed:</span>
                    <strong class="text-danger">{{ delayedMilestones }}</strong>
                  </div>
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
    .btn-xs { font-size: 0.75rem; padding: 0.2rem 0.5rem; }
  `]
})
export class ProjectManagerDashboardComponent implements OnInit {
  assignedProjects: Project[] = [];
  milestones: Milestone[] = [];

  constructor(
    private projectService: ProjectService,
    private milestoneService: MilestoneService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projects => {
      this.assignedProjects = projects;
      if (projects.length) {
        this.milestoneService.getMilestonesByProject(projects[0].id).subscribe(ms => this.milestones = ms);
      }
    });
  }

  get milestoneVelocity(): number {
    if (!this.milestones.length) return 0;
    return Math.round(this.milestones.reduce((sum, m) => sum + (m.completionPercentage || 0), 0) / this.milestones.length);
  }

  get delayedMilestones(): number {
    return this.milestones.filter(m => m.status === 'Delayed').length;
  }
}

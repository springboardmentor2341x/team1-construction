import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProjectService } from '../../../core/services/project.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { MilestoneService } from '../../../core/services/milestone.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models/project.model';
import { ProjectSchedule } from '../../../core/models/schedule.model';
import { Milestone } from '../../../core/models/milestone.model';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent, StatusBadgeComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0" *ngIf="project">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <!-- Top Header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge bg-light text-dark font-monospace">{{ project.projectCode }}</span>
                <app-status-badge [status]="project.status"></app-status-badge>
              </div>
              <h2 class="fw-bold text-dark mb-0">{{ project.projectName }}</h2>
              <p class="text-muted small mb-0"><i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ project.location }}</p>
            </div>
            <div class="d-flex gap-2">
              <button *ngIf="canClose()" (click)="closeProject()" class="btn btn-outline-danger btn-sm" [disabled]="project.status === 'Closed'">
                <i class="bi bi-lock-fill me-1"></i> Close Project
              </button>
              <a *ngIf="canEdit()" [routerLink]="['/projects/update', project.id]" class="btn btn-outline-warning btn-sm">
                <i class="bi bi-pencil me-1"></i> Edit Information
              </a>
              <a routerLink="/projects/schedules" class="btn btn-bt-primary btn-sm">
                <i class="bi bi-calendar3 me-1"></i> Schedules
              </a>
              <a routerLink="/projects/milestones" class="btn btn-bt-accent btn-sm">
                <i class="bi bi-flag-fill me-1"></i> Milestones
              </a>
            </div>
          </div>

          <!-- Project Stats Card -->
          <div class="row g-3 mb-4">
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted extra-small">Estimated Budget</span>
                <h4 class="fw-bold text-dark mb-0">₹{{ project.estimatedBudget | number }}</h4>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted extra-small">Category</span>
                <h5 class="fw-bold text-dark mb-0">{{ project.category }}</h5>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted extra-small">Start Date</span>
                <h5 class="fw-bold text-dark mb-0">{{ project.startDate }}</h5>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted extra-small">Completion Target</span>
                <h5 class="fw-bold text-dark mb-0">{{ project.expectedCompletionDate }}</h5>
              </div>
            </div>
          </div>

          <!-- Tabs Nav -->
          <ul class="nav nav-tabs mb-4 border-bottom">
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">Overview & Personnel</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'schedules'" (click)="activeTab = 'schedules'">Phase Schedules ({{ schedules.length }})</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'milestones'" (click)="activeTab = 'milestones'">Milestones ({{ milestones.length }})</button>
            </li>
          </ul>

          <!-- Tab Content: Overview -->
          <div *ngIf="activeTab === 'overview'" class="row g-4">
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-2"><i class="bi bi-info-circle me-2 text-warning"></i> Project Overview</h5>
                <p class="text-muted leading-relaxed mb-0">{{ project.description || 'No detailed scope description provided.' }}</p>
              </div>

              <!-- Personnel Assignments -->
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-people me-2 text-warning"></i> Project Assignments</h5>
                <div class="row g-3">
                  <!-- Project Manager -->
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded-3 border">
                      <span class="text-uppercase extra-small text-muted fw-bold d-block mb-1">Project Manager</span>
                      <div class="fw-bold text-dark">{{ project.projectManagerName }}</div>
                    </div>
                  </div>

                  <!-- Site Engineers -->
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded-3 border">
                      <span class="text-uppercase extra-small text-muted fw-bold d-block mb-1">Assigned Site Engineers</span>
<div *ngFor="let eng of project.assignedEngineers" class="small fw-semibold text-dark">
                        <i class="bi bi-person me-1"></i> {{ eng.name }}
                      </div>
                      <div *ngIf="!project.assignedEngineers?.length" class="extra-small text-muted">No engineers assigned</div>
                    </div>
                  </div>

                  <!-- Contractors -->
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded-3 border">
                      <span class="text-uppercase extra-small text-muted fw-bold d-block mb-1">Assigned Contractors</span>
                      <div *ngFor="let con of project.assignedContractors" class="small fw-semibold text-dark">
                        <i class="bi bi-person me-1"></i> {{ con.name }}
                      </div>
<div *ngIf="!project.assignedContractors?.length" class="extra-small text-muted">No contractors assigned</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Client Info -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-building me-2 text-warning"></i> Client Information</h5>
                <div class="space-y-2 extra-small">
                  <div>
                    <span class="text-muted d-block">Client Organization:</span>
                    <strong class="text-dark fs-6">{{ project.clientName }}</strong>
                  </div>
                  <div>
                    <span class="text-muted d-block">Client Contact:</span>
                    <strong class="text-dark">{{ project.clientContact || 'Not specified' }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content: Schedules -->
          <div *ngIf="activeTab === 'schedules'" class="card card-custom border-0 p-4">
            <h5 class="fw-bold text-dark mb-3">Project Execution Phases</h5>
            <div class="table-responsive">
              <table class="table table-hover align-middle extra-small">
                <thead class="table-light">
                  <tr>
                    <th>Phase Name</th>
                    <th>Description</th>
                    <th>Planned Start</th>
                    <th>Planned End</th>
                    <th>Estimated Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of schedules">
                    <td class="fw-bold">{{ s.phaseName }}</td>
                    <td>{{ s.description }}</td>
                    <td>{{ s.plannedStartDate }}</td>
                    <td>{{ s.plannedEndDate }}</td>
                    <td><span class="badge bg-light text-dark border">{{ s.estimatedDurationDays }} Days</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab Content: Milestones -->
          <div *ngIf="activeTab === 'milestones'" class="card card-custom border-0 p-4">
            <h5 class="fw-bold text-dark mb-3">Project Milestones</h5>
            <div class="space-y-3">
              <div *ngFor="let m of milestones" class="p-3 border rounded-3 bg-white">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <h6 class="fw-bold text-dark mb-0">{{ m.milestoneName }}</h6>
                  <app-status-badge [status]="m.status"></app-status-badge>
                </div>
                <p class="small text-muted mb-2">{{ m.description }}</p>
                <div class="progress mb-2" style="height: 10px;">
                  <div class="progress-bar bg-warning" [style.width.%]="m.completionPercentage"></div>
                </div>
                <div class="d-flex justify-content-between extra-small text-muted">
                  <span>Planned Target: {{ m.plannedDate }}</span>
                  <span>Progress: <strong>{{ m.completionPercentage }}%</strong></span>
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
export class ProjectDetailComponent implements OnInit {
  project?: Project;
  schedules: ProjectSchedule[] = [];
  milestones: Milestone[] = [];
  activeTab: 'overview' | 'schedules' | 'milestones' = 'overview';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private scheduleService: ScheduleService,
    private milestoneService: MilestoneService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.projectService.getProjectById(id).subscribe(p => {
      this.project = p;
      if (p) {
        this.scheduleService.getSchedulesByProject(p.id).subscribe(s => this.schedules = s);
        this.milestoneService.getMilestonesByProject(p.id).subscribe(m => this.milestones = m);
      }
    });
  }

  canEdit(): boolean {
    if (this.project?.status === 'Closed') return false;
    const role = this.authService.getRole();
    return role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  canClose(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  closeProject(): void {
    if (!this.project || this.project.status === 'Closed') return;
    const reason = prompt('Please enter a reason for closing this project:');
    if (reason === null) return;
    
    if (confirm('Are you sure you want to close this project? Operational updates will be disabled.')) {
      this.projectService.closeProject(this.project.id, reason || 'Project completed').subscribe({
        next: (updatedProj) => {
          this.project = updatedProj;
          alert('Project closed successfully.');
        },
        error: (err) => {
          alert('Failed to close project.');
          console.error(err);
        }
      });
    }
  }
}

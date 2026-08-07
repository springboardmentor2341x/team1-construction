import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { SiteProgressService } from '../../../core/services/site-progress.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-milestone-tracking',
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
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-flag-fill me-2 text-warning"></i>Milestone Tracking</h2>
              <p class="text-muted small mb-0">Milestones are auto-synced from daily progress reports and the project management system.</p>
            </div>
            <button (click)="syncMilestones()" class="btn btn-outline-warning btn-sm d-flex align-items-center gap-2">
              <i class="bi bi-arrow-repeat"></i> Sync from Progress
            </button>
          </div>

          <!-- Project Filter -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row align-items-center">
              <div class="col-md-6">
                <label class="form-label fw-semibold small mb-1">Select Project</label>
                <select (change)="onProjectSelect($event)" class="form-select">
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Status Summary Cards -->
          <div class="row g-3 mb-4">
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Pending</span>
                <h3 class="fw-bold text-warning mb-0 mt-1">{{ pendingCount }}</h3>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">In Progress</span>
                <h3 class="fw-bold text-primary mb-0 mt-1">{{ inProgressCount }}</h3>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Completed</span>
                <h3 class="fw-bold text-success mb-0 mt-1">{{ completedCount }}</h3>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Delayed</span>
                <h3 class="fw-bold text-danger mb-0 mt-1">{{ delayedCount }}</h3>
              </div>
            </div>
          </div>

          <!-- Milestones List -->
          <div class="card card-custom border-0 p-4">
            <h6 class="fw-bold mb-3"><i class="bi bi-list-check me-2 text-success"></i>Project Milestones <span class="badge bg-secondary ms-1">{{ milestones().length }}</span></h6>
            <div class="row g-3">
              <div class="col-12" *ngFor="let m of milestones()">
                <div class="border rounded-3 p-3 bg-white">
                  <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <h6 class="fw-bold text-dark mb-0">{{ m.milestoneName }}</h6>
                      <app-status-badge [status]="m.status"></app-status-badge>
                    </div>
                    <span *ngIf="m.category" class="badge bg-light text-dark border">{{ m.category }}</span>
                  </div>
                  <p class="text-muted small mb-2">{{ m.description }}</p>
                  <div class="progress mb-2" style="height: 10px;">
                    <div class="progress-bar" [ngClass]="getProgressClass(m.status)" [style.width.%]="m.completionPercentage">
                      {{ m.completionPercentage }}%
                    </div>
                  </div>
                  <div class="d-flex flex-wrap justify-content-between extra-small text-muted border-top pt-2">
                    <span>Planned Target: <strong>{{ m.plannedDate }}</strong></span>
                    <span>Actual Completion: <strong>{{ m.actualCompletionDate || 'Pending' }}</strong></span>
                    <span>Progress: <strong>{{ m.completionPercentage }}%</strong></span>
                  </div>
                </div>
              </div>
              <div *ngIf="milestones().length === 0" class="col-12 text-center py-4 text-muted">
                <i class="bi bi-flag d-block fs-3 mb-2"></i>
                No milestones created for this project. Create them in Milestone Management under Project Management.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ['.extra-small { font-size: 0.78rem; }']
})
export class MilestoneTrackingComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  milestones = signal<any[]>([]);

  constructor(
    private siteProgressService: SiteProgressService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projs => {
      this.projects = projs;
      if (projs.length) {
        this.selectedProjectId = projs[0].id;
        this.loadMilestones();
      }
    });
  }

  onProjectSelect(event: any): void {
    this.selectedProjectId = event.target.value;
    this.loadMilestones();
  }

  loadMilestones(): void {
    this.siteProgressService.getMilestoneTracking(this.selectedProjectId).subscribe(m => this.milestones.set(m));
  }

  syncMilestones(): void {
    if (!this.selectedProjectId) return;
    this.siteProgressService.syncMilestones(this.selectedProjectId).subscribe(m => this.milestones.set(m));
  }

  get pendingCount(): number { return this.milestones().filter(m => m.status === 'Pending').length; }
  get inProgressCount(): number { return this.milestones().filter(m => m.status === 'In Progress').length; }
  get completedCount(): number { return this.milestones().filter(m => m.status === 'Completed').length; }
  get delayedCount(): number { return this.milestones().filter(m => m.status === 'Delayed').length; }

  getProgressClass(status: string): string {
    return { Completed: 'bg-success', 'In Progress': 'bg-warning', Pending: 'bg-secondary', Delayed: 'bg-danger' }[status] || 'bg-warning';
  }
}

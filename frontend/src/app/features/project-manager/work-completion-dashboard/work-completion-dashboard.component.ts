import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { SiteProgressService } from '../../../core/services/site-progress.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { SiteProgressDashboard } from '../../../core/models/site-progress.model';

@Component({
  selector: 'app-work-completion-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
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
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-graph-up-arrow me-2 text-warning"></i>Work Completion Dashboard</h2>
              <p class="text-muted small mb-0">Auto-computed overall project completion from daily progress reports.</p>
            </div>
            <button (click)="recompute()" class="btn btn-outline-warning btn-sm d-flex align-items-center gap-2">
              <i class="bi bi-arrow-clockwise"></i> Recompute
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

          <ng-container *ngIf="dashboard() as d">
            <!-- Overall Completion -->
            <div class="row g-3 mb-4">
              <div class="col-lg-4">
                <div class="card card-custom border-0 p-4 h-100">
                  <span class="text-muted small fw-semibold">Overall Completion</span>
                  <div class="d-flex align-items-end gap-2 mt-2">
                    <h2 class="fw-bold text-dark mb-0">{{ d.overallCompletionPercentage }}%</h2>
                    <span class="text-muted small mb-2">auto-computed</span>
                  </div>
                  <div class="progress mt-2" style="height: 14px;">
                    <div class="progress-bar bg-warning" [style.width.%]="d.overallCompletionPercentage">{{ d.overallCompletionPercentage }}%</div>
                  </div>
                  <div class="mt-3 extra-small text-muted">
                    <i class="bi bi-file-text me-1"></i> Based on {{ d.dailyReportCount }} daily progress report(s)
                  </div>
                  <div class="mt-2 extra-small text-muted" *ngIf="d.recentReports.length === 0">
                    <i class="bi bi-info-circle me-1"></i> No daily reports yet — completion will update automatically.
                  </div>
                </div>
              </div>

              <!-- Milestone Summary -->
              <div class="col-lg-4">
                <div class="card card-custom border-0 p-4 h-100">
                  <span class="text-muted small fw-semibold"><i class="bi bi-flag me-1"></i>Milestone Summary</span>
                  <div class="mt-3 space-y-2">
                    <div class="d-flex justify-content-between small border-bottom py-1">
                      <span class="text-muted">Total Milestones</span><strong>{{ d.milestones.total }}</strong>
                    </div>
                    <div class="d-flex justify-content-between small border-bottom py-1">
                      <span class="text-muted">Pending</span><strong class="text-warning">{{ d.milestones.pending }}</strong>
                    </div>
                    <div class="d-flex justify-content-between small border-bottom py-1">
                      <span class="text-muted">In Progress</span><strong class="text-primary">{{ d.milestones.inProgress }}</strong>
                    </div>
                    <div class="d-flex justify-content-between small border-bottom py-1">
                      <span class="text-muted">Completed</span><strong class="text-success">{{ d.milestones.completed }}</strong>
                    </div>
                    <div class="d-flex justify-content-between small py-1">
                      <span class="text-muted">Delayed</span><strong class="text-danger">{{ d.milestones.delayed }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Delay Summary -->
              <div class="col-lg-4">
                <div class="card card-custom border-0 p-4 h-100">
                  <span class="text-muted small fw-semibold"><i class="bi bi-exclamation-triangle me-1"></i>Delay Summary</span>
                  <div class="mt-3 space-y-2">
                    <div class="d-flex justify-content-between small border-bottom py-1">
                      <span class="text-muted">Total Delays</span><strong>{{ d.delays.total }}</strong>
                    </div>
                    <div class="d-flex justify-content-between small border-bottom py-1">
                      <span class="text-muted">Open</span><strong class="text-danger">{{ d.delays.open }}</strong>
                    </div>
                    <div class="d-flex justify-content-between small border-bottom py-1">
                      <span class="text-muted">Resolved</span><strong class="text-success">{{ d.delays.resolved }}</strong>
                    </div>
                    <div class="d-flex justify-content-between small py-1">
                      <span class="text-muted">Total Impact</span><strong class="text-warning">{{ d.delays.totalDurationDays }} days</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Category Breakdown -->
            <div class="card card-custom border-0 p-4 mb-4">
              <h6 class="fw-bold mb-3"><i class="bi bi-bar-chart-fill me-2 text-success"></i>Completion by Progress Category</h6>
              <div class="row g-3">
                <div class="col-md-6" *ngFor="let item of categoryEntries()">
                  <div class="d-flex align-items-center justify-content-between small mb-1">
                    <span class="fw-semibold text-dark">{{ item[0] }}</span>
                    <span class="text-muted">{{ item[1] }}%</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-success" [style.width.%]="item[1]"></div>
                  </div>
                </div>
                <div *ngIf="categoryEntries().length === 0" class="col-12 text-center py-3 text-muted">
                  No daily progress reports recorded yet. Category breakdown will appear once reports are submitted.
                </div>
              </div>
            </div>

            <!-- Recent Reports & Activities -->
            <div class="row g-4">
              <div class="col-lg-6">
                <div class="card card-custom border-0 p-4 h-100">
                  <h6 class="fw-bold mb-3"><i class="bi bi-journal-text me-2 text-warning"></i>Recent Daily Reports</h6>
                  <div class="space-y-3">
                    <div *ngFor="let r of d.recentReports" class="p-2 border-bottom small">
                      <div class="d-flex justify-content-between">
                        <span class="fw-semibold text-dark">{{ r.progressCategory }}</span>
                        <span class="text-muted">{{ r.reportDate }}</span>
                      </div>
                      <div class="text-muted mt-1" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ r.workCompleted }}</div>
                      <div class="progress mt-2" style="height:6px">
                        <div class="progress-bar bg-warning" [style.width.%]="r.progressPercentage"></div>
                      </div>
                    </div>
                    <div *ngIf="d.recentReports.length === 0" class="text-center text-muted py-3">No recent reports.</div>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="card card-custom border-0 p-4 h-100">
                  <h6 class="fw-bold mb-3"><i class="bi bi-clipboard-data me-2 text-primary"></i>Recent Site Activities</h6>
                  <div class="space-y-3">
                    <div *ngFor="let a of d.recentActivities" class="d-flex justify-content-between align-items-start py-2 border-bottom small">
                      <div>
                        <div class="fw-semibold text-dark">{{ a.eventType }}</div>
                        <div class="text-muted">{{ a.description }}</div>
                        <div class="extra-small text-muted mt-1"><i class="bi bi-person me-1"></i>{{ a.responsiblePerson }}</div>
                      </div>
                      <span class="text-nowrap ms-2">{{ a.activityDate }} {{ a.activityTime }}</span>
                    </div>
                    <div *ngIf="d.recentActivities.length === 0" class="text-center text-muted py-3">No recent site activities.</div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: ['.extra-small { font-size: 0.78rem; }.space-y-3 > * + * { margin-top: 0.6rem; }.space-y-2 > * + * { margin-top: 0.35rem; }']
})
export class WorkCompletionDashboardComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  dashboard = signal<SiteProgressDashboard | null>(null);

  constructor(
    private siteProgressService: SiteProgressService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projs => {
      this.projects = projs;
      if (projs.length) {
        this.selectedProjectId = projs[0].id;
        this.loadDashboard();
      }
    });
  }

  onProjectSelect(event: any): void {
    this.selectedProjectId = event.target.value;
    this.loadDashboard();
  }

  loadDashboard(): void {
    if (!this.selectedProjectId) return;
    this.siteProgressService.getDashboard(this.selectedProjectId).subscribe(d => this.dashboard.set(d));
  }

  recompute(): void {
    if (!this.selectedProjectId) return;
    this.siteProgressService.recomputeCompletion(this.selectedProjectId).subscribe(() => this.loadDashboard());
  }

  categoryEntries(): [string, number][] {
    const breakdown = this.dashboard()?.categoryBreakdown;
    if (!breakdown) return [];
    return Object.entries(breakdown) as [string, number][];
  }
}


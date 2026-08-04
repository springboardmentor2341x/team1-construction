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
  selector: 'app-client-dashboard',
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
                <span class="badge bg-indigo text-white px-2 py-1 uppercase" style="background-color: #4F46E5;">Client Portal (Read Only)</span>
                <h2 class="fw-bold text-dark mb-0">Client Project Transparency Portal</h2>
              </div>
              <p class="text-muted small mb-0">Executive visibility into construction milestones, completion %, inspection reports & timeline.</p>
            </div>
            <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-file-earmark-pdf"></i> Download Executive Progress Report
            </button>
          </div>

          <!-- Top Stats -->
          <div class="row g-3 mb-4">
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Commissioned Projects</span>
                <h3 class="fw-bold text-dark mb-0 mt-1">{{ projects.length }}</h3>
                <small class="text-muted">live from backend</small>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Overall Completion</span>
                <h3 class="fw-bold text-success mb-0 mt-1">{{ overallCompletion }}%</h3>
                <small class="text-success"><i class="bi bi-check-circle me-1"></i> Avg. progress</small>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Next Key Milestone</span>
                <h3 class="fw-bold text-warning mb-0 mt-1">{{ nextMilestone?.plannedDate || '—' }}</h3>
                <small class="text-muted">{{ nextMilestone?.milestoneName || 'No upcoming milestones' }}</small>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Budget Status</span>
                <h3 class="fw-bold text-primary mb-0 mt-1">\${{ portfolioTotal | number }}</h3>
                <small class="text-muted">total portfolio budget</small>
              </div>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="row g-4">
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-graph-up-arrow me-2 text-warning"></i> Project Timeline & Milestones Progress</h5>

                <div class="mb-4" *ngFor="let p of projects">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="fw-bold text-dark mb-0">{{ p.projectName }}</h6>
                    <app-status-badge [status]="p.status"></app-status-badge>
                  </div>
                  <div class="progress mb-2" style="height: 12px;">
                    <div class="progress-bar bg-success" [style.width]="getProgress(p.status) + '%'">{{ getProgress(p.status) }}% Complete</div>
                  </div>
                  <div class="d-flex justify-content-between extra-small text-muted">
                    <span>Start: {{ p.startDate }}</span>
                    <span>Expected Completion: {{ p.expectedCompletionDate }}</span>
                  </div>
                </div>

                <div *ngIf="projects.length === 0" class="text-center py-4 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                  No projects found. Connect the backend to see project data.
                </div>
              </div>

              <!-- Executive Reports & Documents -->
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-folder2-open me-2 text-warning"></i> Shared Documents & Reports</h5>
                <div class="list-group list-group-flush extra-small">
                  <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2" *ngFor="let d of documents">
                    <div>
                      <i class="bi bi-file-earmark-pdf text-danger me-2 fs-5"></i>
                      <strong class="text-dark">{{ d.name }}</strong>
                    </div>
                    <button class="btn btn-sm btn-light"><i class="bi bi-download"></i></button>
                  </div>
                  <div *ngIf="documents.length === 0" class="text-center py-4 text-muted">
                    No documents available yet.
                  </div>
                </div>
              </div>
            </div>

            <!-- Client Notifications -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-bell text-warning me-2"></i> Client Updates</h5>
                <div class="p-3 bg-light rounded-3 mb-2 border-start border-primary border-4 extra-small">
                  <div class="text-muted">Notifications will appear here once the backend provides them.</div>
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
  `]
})
export class ClientDashboardComponent implements OnInit {
  projects: Project[] = [];
  milestones: Milestone[] = [];
  documents: any[] = [];

  constructor(
    private projectService: ProjectService,
    private milestoneService: MilestoneService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(p => {
      this.projects = p.slice(0, 1);
      if (p.length) {
        this.milestoneService.getMilestonesByProject(p[0].id).subscribe(ms => this.milestones = ms);
      }
    });
  }

  get overallCompletion(): number {
    if (!this.projects.length) return 0;
    return Math.round(this.projects.reduce((sum, p) => sum + this.getProgress(p.status), 0) / this.projects.length);
  }

  get portfolioTotal(): number {
    return this.projects.reduce((sum, p) => sum + (p.estimatedBudget || 0), 0);
  }

  get nextMilestone(): Milestone | undefined {
    const pending = this.milestones.filter(m => m.status !== 'Completed');
    return pending.sort((a, b) => (a.plannedDate > b.plannedDate ? 1 : -1))[0];
  }

getProgress(status: string): number {
    // Derive progress from real milestone completion data when available,
    // otherwise display 0 until real backend data is provided.
    if (this.milestones.length) {
      const completed = this.milestones.filter(m => m.status === 'Completed').length;
      const pending = this.milestones.filter(m => m.status !== 'Completed').length;
      const inProgress = this.milestones.filter(m => m.status === 'In Progress').length;
      if (status === 'Completed') return 100;
      if (status === 'In Progress') {
        const total = this.milestones.length;
        return total ? Math.round((completed / total) * 100) : 0;
      }
      if (status === 'Planning' || status === 'On Hold') {
        const total = this.milestones.length;
        return total ? Math.round(((completed + inProgress) / total) * 100) : 0;
      }
      return 0;
    }
    return 0;
  }
}

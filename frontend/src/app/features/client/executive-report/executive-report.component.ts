import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../../core/services/project.service';
import { MilestoneService } from '../../../core/services/milestone.service';
import { Project } from '../../../core/models/project.model';
import { Milestone } from '../../../core/models/milestone.model';

@Component({
  selector: 'app-executive-report',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block"><app-sidebar></app-sidebar></div>
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">

          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <nav aria-label="breadcrumb"><ol class="breadcrumb small mb-1">
                <li class="breadcrumb-item"><a routerLink="/dashboard/client" class="text-decoration-none text-warning">Client Overview</a></li>
                <li class="breadcrumb-item active">Executive Reports</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-file-earmark-pdf-fill me-2 text-warning"></i>Executive Reports</h2>
              <p class="text-muted small mb-0">Read-only project progress summaries and executive-level reporting.</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary" (click)="printPage()"><i class="bi bi-printer me-1"></i>Print</button>
              <button class="btn btn-bt-accent shadow-sm" (click)="downloadReport()"><i class="bi bi-download me-1"></i>Download PDF</button>
            </div>
          </div>

          <!-- Portfolio Summary -->
          <div class="row g-3 mb-4">
            <div class="col-md-3" *ngFor="let kpi of kpis">
              <div class="card card-custom border-0 p-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="stat-icon-wrapper" [ngClass]="kpi.bgClass"><i class="bi" [ngClass]="kpi.icon"></i></div>
                  <div>
                    <div class="small text-muted">{{ kpi.label }}</div>
                    <div class="fw-bold fs-5" [ngClass]="kpi.colorClass">{{ kpi.value }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Projects Under Portfolio -->
          <div class="card card-custom border-0 p-4 mb-4">
            <h6 class="fw-bold mb-3"><i class="bi bi-building me-2 text-warning"></i>Portfolio Projects</h6>
            <div class="row g-3">
              <div class="col-lg-6" *ngFor="let p of projects()">
                <div class="card border-0 shadow-sm p-4">
                  <div class="d-flex align-items-start justify-content-between mb-2">
                    <div>
                      <h6 class="fw-bold mb-1 text-dark">{{ p.projectName }}</h6>
                      <span class="badge bg-light text-dark font-monospace small">{{ p.projectCode }}</span>
                    </div>
                    <span class="badge rounded-pill" [ngClass]="getStatusBadge(p.status)">{{ p.status }}</span>
                  </div>
                  <div class="small text-muted mb-2">{{ p.description }}</div>
                  <div class="row g-1 small text-muted mb-3">
                    <div class="col-6"><i class="bi bi-geo-alt me-1"></i>{{ p.location }}</div>
                    <div class="col-6"><i class="bi bi-flag me-1"></i>Priority: {{ p.priority }}</div>
                    <div class="col-6"><i class="bi bi-calendar me-1"></i>Start: {{ p.startDate }}</div>
                    <div class="col-6"><i class="bi bi-calendar-check me-1"></i>End: {{ p.expectedCompletionDate }}</div>
                  </div>
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-muted">Budget</span>
                    <span class="fw-semibold">₹{{ p.estimatedBudget | number }}</span>
                  </div>
                  <div class="progress" style="height:6px">
                    <div class="progress-bar bg-warning" [style.width]="getProgressPct(p.status)"></div>
                  </div>
                </div>
              </div>
              <div class="col-12" *ngIf="projects().length === 0">
                <div class="text-center py-4 text-muted"><i class="bi bi-inbox d-block fs-2 mb-2 opacity-50"></i>No projects found.</div>
              </div>
            </div>
          </div>

          <!-- Milestone Timeline Summary -->
          <div class="card card-custom border-0 p-4">
            <h6 class="fw-bold mb-3"><i class="bi bi-flag-fill me-2 text-warning"></i>Key Milestone Summary</h6>
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr><th>Milestone</th><th>Project</th><th>Planned Date</th><th>Completion %</th><th>Status</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let m of milestones">
                    <td class="fw-semibold">{{ m.milestoneName }}</td>
                    <td class="text-muted">{{ projectName(m.projectId) }}</td>
                    <td>{{ m.plannedDate }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress" style="width:60px;height:6px">
                          <div class="progress-bar bg-warning" [style.width]="m.completionPercentage + '%'"></div>
                        </div>
                        <span>{{ m.completionPercentage }}%</span>
                      </div>
                    </td>
                    <td><span class="badge rounded-pill" [ngClass]="getMilestoneBadge(m.status)">{{ m.status }}</span></td>
                  </tr>
                  <tr *ngIf="milestones.length === 0"><td colspan="5" class="text-center py-4 text-muted">No milestones available.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ExecutiveReportComponent implements OnInit {
  projects = signal<Project[]>([]);
  milestones: Milestone[] = [];

  kpis = [
    { label: 'Active Projects', value: '—', colorClass: 'text-primary', icon: 'bi-building', bgClass: 'bg-primary-subtle text-primary' },
    { label: 'Overall Progress', value: '0%', colorClass: 'text-warning', icon: 'bi-graph-up-arrow', bgClass: 'bg-warning-subtle text-warning' },
    { label: 'Budget Utilized', value: '$0', colorClass: 'text-success', icon: 'bi-cash-stack', bgClass: 'bg-success-subtle text-success' },
    { label: 'Milestones Done', value: '0/0', colorClass: 'text-info', icon: 'bi-flag-fill', bgClass: 'bg-info-subtle text-info' }
  ];

  constructor(
    private projectService: ProjectService,
    private milestoneService: MilestoneService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(data => {
      this.projects.set(data);
      const active = data.filter(p => p.status === 'In Progress').length;
      const totalBudget = data.reduce((sum, p) => sum + (p.estimatedBudget || 0), 0);
      this.kpis[0].value = active.toString();
      this.kpis[2].value = '$' + totalBudget.toLocaleString();
      if (data.length) {
        this.milestoneService.getMilestonesByProject(data[0].id).subscribe(ms => {
          this.milestones = ms;
          const done = ms.filter(m => m.status === 'Completed').length;
          this.kpis[3].value = `${done}/${ms.length}`;
          this.kpis[1].value = ms.length ? Math.round(ms.reduce((s, m) => s + (m.completionPercentage || 0), 0) / ms.length) + '%' : '0%';
        });
      }
    });
  }

  projectName(id: string): string {
    return this.projects().find(p => p.id === id)?.projectName || '—';
  }

getStatusBadge = (s: string) => ({ 'In Progress': 'bg-success', 'Planning': 'bg-primary', 'On Hold': 'bg-warning text-dark', 'Completed': 'bg-info text-dark', 'Closed': 'bg-secondary' }[s] || 'bg-secondary');
  getMilestoneBadge = (s: string) => ({ 'Completed': 'bg-success', 'In Progress': 'bg-warning text-dark', 'Pending': 'bg-primary', 'Delayed': 'bg-danger' }[s] || 'bg-secondary');

  getProgressPct(status: string): string {
    // Derive progress from real milestone completion data when available.
    if (this.milestones.length) {
      const completed = this.milestones.filter(m => m.status === 'Completed').length;
      const inProgress = this.milestones.filter(m => m.status === 'In Progress').length;
      const total = this.milestones.length;
      if (status === 'Completed') return '100%';
      if (status === 'In Progress') return Math.round((completed / total) * 100) + '%';
      if (status === 'Planning' || status === 'On Hold') return Math.round(((completed + inProgress) / total) * 100) + '%';
      return '0%';
    }
    return '0%';
  }

  printPage(): void { window.print(); }
  downloadReport(): void { console.log('Download PDF triggered (API integration pending)'); }
}

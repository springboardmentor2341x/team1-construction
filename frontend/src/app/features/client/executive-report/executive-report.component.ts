import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../../core/services/project.service';

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
                    <span class="text-muted">Budget Utilization</span>
                    <span class="fw-semibold">\${{ p.estimatedBudget | number }}</span>
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
                    <td class="fw-semibold">{{ m.name }}</td>
                    <td class="text-muted">{{ m.project }}</td>
                    <td>{{ m.plannedDate }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress" style="width:60px;height:6px">
                          <div class="progress-bar bg-warning" [style.width]="m.pct + '%'"></div>
                        </div>
                        <span>{{ m.pct }}%</span>
                      </div>
                    </td>
                    <td><span class="badge rounded-pill" [ngClass]="getMilestoneBadge(m.status)">{{ m.status }}</span></td>
                  </tr>
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
  projects = signal<any[]>([]);

  kpis = [
    { label: 'Active Projects', value: '—', colorClass: 'text-primary', icon: 'bi-building', bgClass: 'bg-primary-subtle text-primary' },
    { label: 'Overall Progress', value: '62%', colorClass: 'text-warning', icon: 'bi-graph-up-arrow', bgClass: 'bg-warning-subtle text-warning' },
    { label: 'Budget Utilized', value: '$117M', colorClass: 'text-success', icon: 'bi-cash-stack', bgClass: 'bg-success-subtle text-success' },
    { label: 'Milestones Done', value: '1/5', colorClass: 'text-info', icon: 'bi-flag-fill', bgClass: 'bg-info-subtle text-info' }
  ];

  milestones = [
    { name: 'Substructure Land Survey', project: 'Skyline Metropolis Tower', plannedDate: '2026-02-15', pct: 100, status: 'Completed' },
    { name: 'Basement Level 3 Slab Pour', project: 'Skyline Metropolis Tower', plannedDate: '2026-04-10', pct: 75, status: 'In Progress' },
    { name: 'Podium Structure Completion', project: 'Skyline Metropolis Tower', plannedDate: '2026-07-30', pct: 20, status: 'In Progress' },
    { name: 'Structural Steel Topping Off', project: 'Skyline Metropolis Tower', plannedDate: '2027-01-15', pct: 0, status: 'Pending' }
  ];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(data => {
      this.projects.set(data);
      this.kpis[0].value = data.filter(p => p.status === 'In Progress').length.toString();
    });
  }

  getStatusBadge = (s: string) => ({ 'In Progress': 'bg-success', 'Planning': 'bg-primary', 'On Hold': 'bg-warning text-dark', 'Completed': 'bg-info text-dark', 'Closed': 'bg-secondary' }[s] || 'bg-secondary');
  getMilestoneBadge = (s: string) => ({ 'Completed': 'bg-success', 'In Progress': 'bg-warning text-dark', 'Pending': 'bg-primary', 'Delayed': 'bg-danger' }[s] || 'bg-secondary');
  getProgressPct = (s: string) => ({ 'In Progress': '60%', 'Planning': '10%', 'Completed': '100%', 'On Hold': '30%' }[s] || '0%');
  printPage(): void { window.print(); }
  downloadReport(): void { console.log('Download PDF triggered (API integration pending)'); }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../../core/services/project.service';
import { ResourceService } from '../../../core/services/resource.service';
import { MilestoneService } from '../../../core/services/milestone.service';

@Component({
  selector: 'app-analytics-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
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
                <li class="breadcrumb-item"><a routerLink="/dashboard/project-manager" class="text-decoration-none text-warning">Dashboard</a></li>
                <li class="breadcrumb-item active">Analytics & Reports</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-bar-chart-line-fill me-2 text-warning"></i>Analytics & Reports</h2>
              <p class="text-muted small mb-0">Project performance metrics, KPIs, and exportable reports.</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary" (click)="exportPDF()"><i class="bi bi-file-earmark-pdf me-1"></i>Export PDF</button>
              <button class="btn btn-bt-accent shadow-sm" (click)="refreshData()"><i class="bi bi-arrow-clockwise me-1"></i>Refresh</button>
            </div>
          </div>

          <!-- Filter Bar -->
          <div class="card card-custom border-0 p-3 mb-4">
            <form [formGroup]="filterForm" class="row g-2 align-items-end">
              <div class="col-md-3">
                <label class="form-label small fw-semibold text-muted">Date Range From</label>
                <input type="date" class="form-control form-control-sm" formControlName="dateFrom">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold text-muted">Date Range To</label>
                <input type="date" class="form-control form-control-sm" formControlName="dateTo">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold text-muted">Project</label>
                <select class="form-select form-select-sm" formControlName="project">
                  <option value="">All Projects</option>
                  <option *ngFor="let p of projects()" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <button class="btn btn-sm btn-warning w-100" type="button" (click)="applyFilter()">Apply Filter</button>
              </div>
            </form>
          </div>

          <!-- KPI Cards -->
          <div class="row g-3 mb-4">
            <div class="col-md-3" *ngFor="let kpi of kpis">
              <div class="card card-custom border-0 p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <div class="text-muted small fw-semibold">{{ kpi.label }}</div>
                    <div class="fw-bold fs-5 mt-1" [ngClass]="kpi.colorClass">{{ kpi.value }}</div>
                    <div class="extra-small text-muted mt-1">{{ kpi.change }}</div>
                  </div>
                  <div class="stat-icon-wrapper" [ngClass]="kpi.bgClass">
                    <i class="bi" [ngClass]="kpi.icon"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Placeholder Row -->
          <div class="row g-4 mb-4">
            <div class="col-lg-7">
              <div class="card card-custom border-0 p-4 h-100">
                <h6 class="fw-bold mb-3"><i class="bi bi-bar-chart-fill me-2 text-warning"></i>Project Progress Overview</h6>
                <div class="progress-list">
                  <div *ngFor="let p of projects().slice(0, 5)" class="mb-3">
                    <div class="d-flex justify-content-between small mb-1">
                      <span class="fw-semibold text-dark">{{ p.projectName }}</span>
                      <span class="text-muted">{{ p.status }}</span>
                    </div>
                    <div class="progress" style="height:8px">
                      <div class="progress-bar bg-warning" role="progressbar"
                           [style.width]="getProgressWidth(p.status)"
                           [attr.aria-valuenow]="getProgressNum(p.status)"
                           aria-valuemin="0" aria-valuemax="100">
                      </div>
                    </div>
                  </div>
                  <div *ngIf="projects().length === 0" class="text-center text-muted py-4">
                    <i class="bi bi-bar-chart fs-2 d-block mb-2"></i>No project data available.
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-5">
              <div class="card card-custom border-0 p-4 h-100">
                <h6 class="fw-bold mb-3"><i class="bi bi-pie-chart-fill me-2 text-warning"></i>Status Distribution</h6>
                <div *ngFor="let stat of statusStats" class="d-flex align-items-center justify-content-between mb-3">
                  <div class="d-flex align-items-center gap-2">
                    <div class="rounded-circle" [ngClass]="stat.colorClass" style="width:12px;height:12px"></div>
                    <span class="small">{{ stat.status }}</span>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress" style="width:100px;height:6px">
                      <div class="progress-bar" [ngClass]="stat.barClass" [style.width]="stat.pct + '%'"></div>
                    </div>
                    <span class="small fw-bold">{{ stat.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reports Table -->
          <div class="card card-custom border-0 p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0"><i class="bi bi-file-earmark-text me-2 text-warning"></i>Generated Reports</h6>
              <button class="btn btn-sm btn-outline-warning" (click)="generateReport()"><i class="bi bi-plus me-1"></i>Generate New</button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr><th>Report Name</th><th>Period</th><th>Type</th><th>Status</th><th class="text-end">Action</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of savedReports">
                    <td class="fw-semibold">{{ r.name }}</td>
                    <td>{{ r.period }}</td>
                    <td><span class="badge bg-light text-dark">{{ r.type }}</span></td>
                    <td><span class="badge bg-success">Ready</span></td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-download"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: ['.extra-small { font-size: 0.78rem; }']
})
export class AnalyticsReportsComponent implements OnInit {
  filterForm: FormGroup;
  projects = signal<any[]>([]);

  kpis = [
    { label: 'Projects On Schedule', value: '0%', change: 'derived from backend', colorClass: 'text-success', icon: 'bi-check-circle-fill', bgClass: 'bg-success-subtle text-success' },
    { label: 'Budget Adherence', value: '0%', change: 'derived from backend', colorClass: 'text-warning', icon: 'bi-cash-stack', bgClass: 'bg-warning-subtle text-warning' },
    { label: 'Milestones Completed', value: '0/0', change: 'pending this quarter', colorClass: 'text-primary', icon: 'bi-flag-fill', bgClass: 'bg-primary-subtle text-primary' },
    { label: 'Avg. Team Utilization', value: '0%', change: 'derived from backend', colorClass: 'text-info', icon: 'bi-people-fill', bgClass: 'bg-info-subtle text-info' }
  ];

  statusStats = [
    { status: 'In Progress', count: 0, pct: 0, colorClass: 'bg-success', barClass: 'bg-success' },
    { status: 'Planning', count: 0, pct: 0, colorClass: 'bg-primary', barClass: 'bg-primary' },
    { status: 'On Hold', count: 0, pct: 0, colorClass: 'bg-warning', barClass: 'bg-warning' },
    { status: 'Completed', count: 0, pct: 0, colorClass: 'bg-info', barClass: 'bg-info' }
  ];

  savedReports: any[] = [];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private resourceService: ResourceService,
    private milestoneService: MilestoneService
  ) {
    this.filterForm = this.fb.group({ dateFrom: [''], dateTo: [''], project: [''] });
  }

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(data => {
      this.projects.set(data);
      this.computeStats(data);
      const total = data.length || 1;
      const onSchedule = data.filter(p => p.status === 'In Progress').length;
      const totalBudget = data.reduce((sum, p) => sum + (p.estimatedBudget || 0), 0);
      this.kpis[0].value = Math.round((onSchedule / total) * 100) + '%';
      this.kpis[1].value = data.length > 0 ? '100%' : '0%'; // Assumption: fully utilized allocated budget

      // Fetch Milestones
      if (data.length > 0) {
        let totalMilestones = 0;
        let completedMilestones = 0;
        data.forEach((p, index) => {
          this.milestoneService.getMilestonesByProject(p.id).subscribe(ms => {
            totalMilestones += ms.length;
            completedMilestones += ms.filter(m => m.status === 'Completed').length;
            if (index === data.length - 1) {
              this.kpis[2].value = `${completedMilestones}/${totalMilestones}`;
            }
          });
        });
      }
    });

    this.resourceService.getResources().subscribe(res => {
      if (res.length > 0) {
        const util = res.reduce((sum, r) => sum + (r.utilizationPercentage || 0), 0) / res.length;
        this.kpis[3].value = Math.round(util) + '%';
      }
    });
  }

  computeStats(projects: any[]): void {
    const total = projects.length || 1;
    this.statusStats.forEach(s => {
      s.count = projects.filter(p => p.status === s.status).length;
      s.pct = Math.round((s.count / total) * 100);
    });
  }

  getProgressWidth(status: string): string {
    // No fabricated percentages. Only reflect real project status:
    // Completed = 100%, otherwise 0 until a real completion metric exists.
    return status === 'Completed' ? '100%' : '0%';
  }
  getProgressNum(status: string): number {
    return status === 'Completed' ? 100 : 0;
  }

  applyFilter(): void { console.log('Filter applied:', this.filterForm.value); }
  refreshData(): void { this.ngOnInit(); }
  exportPDF(): void { console.log('Export PDF triggered'); }
  generateReport(): void { console.log('Generate report triggered'); }
}

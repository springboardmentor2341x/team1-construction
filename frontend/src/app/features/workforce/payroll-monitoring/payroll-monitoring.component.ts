import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { WorkforceService } from '../../../core/services/workforce.service';
import { ProjectService } from '../../../core/services/project.service';
import { WorkforcePayroll, WorkforcePayrollSummary, Worker } from '../../../core/models/workforce.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-payroll-monitoring',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <!-- Header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb small mb-1">
                  <li class="breadcrumb-item"><a routerLink="/workforce/dashboard" class="text-decoration-none text-warning">Workforce</a></li>
                  <li class="breadcrumb-item active">Payroll Monitoring</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-cash-stack me-2 text-warning"></i>Workforce Payroll & Earnings Monitoring</h2>
              <p class="text-muted small mb-0">Track calculated estimated labor pay based on attendance working days, working hours, & overtime rates.</p>
            </div>

            <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" (click)="showGenerateModal = true">
              <i class="bi bi-calculator-fill"></i> Generate Payroll Record
            </button>
          </div>

          <!-- Alert Messages -->
          <div *ngIf="message" class="alert alert-success alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> {{ message }}
            <button type="button" class="btn-close" (click)="message = ''"></button>
          </div>

          <!-- KPI Summary Row -->
          <div class="row g-3 mb-4" *ngIf="summary">
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom border-0 p-3">
                <span class="text-muted small fw-semibold">Total Estimated Payroll</span>
                <h3 class="fw-bold text-dark mb-0 mt-1">₹{{ summary.totalEstimatedPay | number }}</h3>
                <div class="extra-small text-muted mt-1">{{ summary.totalRecords }} Payroll Records</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom border-0 p-3">
                <span class="text-muted small fw-semibold">Pending Approval</span>
                <h3 class="fw-bold text-warning mb-0 mt-1">₹{{ summary.pendingAmount | number }}</h3>
                <div class="extra-small text-muted mt-1">Awaiting PM audit</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom border-0 p-3">
                <span class="text-muted small fw-semibold">Approved Payroll</span>
                <h3 class="fw-bold text-primary mb-0 mt-1">₹{{ summary.approvedAmount | number }}</h3>
                <div class="extra-small text-muted mt-1">Ready for disbursement</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom border-0 p-3">
                <span class="text-muted small fw-semibold">Total Disbursed / Paid</span>
                <h3 class="fw-bold text-success mb-0 mt-1">₹{{ summary.paidAmount | number }}</h3>
                <div class="extra-small text-muted mt-1">Paid to workforce</div>
              </div>
            </div>
          </div>

          <!-- Filter Bar -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-6">
                <select class="form-select" [(ngModel)]="filterProjectId" (change)="loadPayroll()">
                  <option value="">-- All Projects --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>

              <div class="col-md-6">
                <select class="form-select" [(ngModel)]="filterStatus" (change)="loadPayroll()">
                  <option value="">-- All Payroll Statuses --</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Payroll Table -->
          <div class="card card-custom border-0 p-4">
            <div *ngIf="loading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div>
            </div>

            <div *ngIf="!loading">
              <div class="table-responsive" *ngIf="payrolls.length; else noPayroll">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Worker</th>
                      <th>Project</th>
                      <th>Pay Period</th>
                      <th>Daily Pay Rate</th>
                      <th>Days / Hours</th>
                      <th>Overtime</th>
                      <th>Estimated Pay</th>
                      <th>Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of payrolls">
                      <td class="fw-bold">
                        <a [routerLink]="['/workforce/workers', p.workerId]" class="text-dark text-decoration-none hover-warning">
                          {{ p.workerName }} ({{ p.workerCode }})
                        </a>
                      </td>
                      <td>{{ p.projectName }}</td>
                      <td>{{ p.payPeriodStart }} to {{ p.payPeriodEnd }}</td>
                      <td>₹{{ p.payRate | number }} / day</td>
                      <td>{{ p.workingDays }} days ({{ p.workingHours }} hrs)</td>
                      <td class="text-warning fw-bold">{{ p.overtimeHours }} hrs</td>
                      <td class="fw-bold fs-6 text-success">₹{{ p.estimatedPay | number }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-warning text-dark': p.payrollStatus === 'Pending',
                          'bg-info text-dark': p.payrollStatus === 'Processing',
                          'bg-primary': p.payrollStatus === 'Approved',
                          'bg-success': p.payrollStatus === 'Paid'
                        }">{{ p.payrollStatus }}</span>
                      </td>
                      <td class="text-end">
                        <div class="dropdown">
                          <button class="btn btn-sm btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Status
                          </button>
                          <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                            <li><button class="dropdown-item small" (click)="updateStatus(p.id, 'Pending')">Set Pending</button></li>
                            <li><button class="dropdown-item small text-info" (click)="updateStatus(p.id, 'Processing')">Set Processing</button></li>
                            <li><button class="dropdown-item small text-primary fw-bold" (click)="updateStatus(p.id, 'Approved')">Approve Payroll</button></li>
                            <li><button class="dropdown-item small text-success fw-bold" (click)="updateStatus(p.id, 'Paid')">Mark Paid</button></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noPayroll>
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-cash-stack d-block fs-1 opacity-50 mb-2"></i>
                  <h5>No Payroll Records Found</h5>
                  <p class="small mb-3">Generate payroll calculations for workforce personnel across projects.</p>
                  <button class="btn btn-bt-accent btn-sm" (click)="showGenerateModal = true">Generate Payroll</button>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Generate Payroll Modal -->
          <div *ngIf="showGenerateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-calculator-fill me-2 text-warning"></i>Generate Worker Payroll Record</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showGenerateModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <form (ngSubmit)="submitGenerate()">
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Select Worker <span class="text-danger">*</span></label>
                      <select class="form-select" [(ngModel)]="newPayroll.workerId" name="workerId" required>
                        <option value="">-- Choose Worker --</option>
                        <option *ngFor="let w of allWorkers" [value]="w.id">{{ w.workerName }} ({{ w.workerId }}) - Pay Rate: ₹{{ w.payRate }}</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Target Project <span class="text-danger">*</span></label>
                      <select class="form-select" [(ngModel)]="newPayroll.projectId" name="projectId" required>
                        <option value="">-- Choose Project --</option>
                        <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                      </select>
                    </div>

                    <div class="row g-2 mb-3">
                      <div class="col-6">
                        <label class="form-label small fw-bold">Pay Period Start <span class="text-danger">*</span></label>
                        <input type="date" class="form-control" [(ngModel)]="newPayroll.payPeriodStart" name="payPeriodStart" required>
                      </div>
                      <div class="col-6">
                        <label class="form-label small fw-bold">Pay Period End <span class="text-danger">*</span></label>
                        <input type="date" class="form-control" [(ngModel)]="newPayroll.payPeriodEnd" name="payPeriodEnd" required>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Custom Pay Rate (Leave blank to use Worker Default)</label>
                      <input type="number" class="form-control" [(ngModel)]="newPayroll.payRate" name="payRate" placeholder="e.g. 650">
                    </div>

                    <div class="p-3 bg-light rounded border small mb-3 text-muted">
                      <i class="bi bi-info-circle-fill text-warning me-1"></i>
                      Working days & overtime hours will be automatically calculated from attendance logs in the selected date range.
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="showGenerateModal = false">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4" [disabled]="saving">Calculate & Save Payroll</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class PayrollMonitoringComponent implements OnInit {
  payrolls: WorkforcePayroll[] = [];
  summary: WorkforcePayrollSummary | null = null;

  projects: Project[] = [];
  allWorkers: Worker[] = [];

  filterProjectId = '';
  filterStatus = '';

  loading = true;
  saving = false;
  message = '';

  showGenerateModal = false;
  newPayroll: Partial<WorkforcePayroll> = {
    workerId: '',
    projectId: '',
    payPeriodStart: '2026-08-01',
    payPeriodEnd: '2026-08-07',
    payrollStatus: 'Pending'
  };

  constructor(
    private workforceService: WorkforceService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(p => this.projects = p);
    this.workforceService.getWorkers({ pageSize: 500 }).subscribe(w => this.allWorkers = w.items);
    this.loadPayroll();
  }

  loadPayroll(): void {
    this.loading = true;
    this.workforceService.getPayrolls({
      projectId: this.filterProjectId,
      payrollStatus: this.filterStatus
    }).subscribe({
      next: (data) => {
        this.payrolls = data;

        this.workforceService.getPayrollSummary(this.filterProjectId).subscribe(s => this.summary = s);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  submitGenerate(): void {
    if (!this.newPayroll.workerId || !this.newPayroll.projectId || !this.newPayroll.payPeriodStart || !this.newPayroll.payPeriodEnd) return;

    this.saving = true;
    this.message = '';

    this.workforceService.createOrUpdatePayroll(this.newPayroll).subscribe({
      next: () => {
        this.saving = false;
        this.showGenerateModal = false;
        this.message = 'Payroll record calculated and saved successfully!';
        this.loadPayroll();
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  updateStatus(payrollId: string, status: string): void {
    this.workforceService.updatePayrollStatus(payrollId, status).subscribe({
      next: () => {
        this.message = `Payroll status updated to ${status}.`;
        this.loadPayroll();
      }
    });
  }
}

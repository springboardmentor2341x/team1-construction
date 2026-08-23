import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { WorkforceService } from '../../../core/services/workforce.service';
import {
  Worker,
  WorkerProjectAssignment,
  Shift,
  Attendance,
  WorkforcePayroll
} from '../../../core/models/workforce.model';

@Component({
  selector: 'app-worker-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted mt-2 small">Loading comprehensive 360 worker profile...</p>
          </div>

          <div *ngIf="!loading && worker">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb small mb-2">
                <li class="breadcrumb-item"><a routerLink="/workforce/dashboard" class="text-decoration-none text-warning">Workforce</a></li>
                <li class="breadcrumb-item"><a routerLink="/workforce/workers" class="text-decoration-none text-warning">Worker Directory</a></li>
                <li class="breadcrumb-item active">{{ worker.workerName }}</li>
              </ol>
            </nav>

            <!-- Worker Header Banner -->
            <div class="card card-custom border-0 p-4 mb-4 bg-white shadow-sm">
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center fs-3 shadow-sm" style="width: 64px; height: 64px;">
                    <i class="bi bi-person-fill"></i>
                  </div>
                  <div>
                    <div class="d-flex align-items-center gap-2">
                      <h3 class="fw-bold text-dark mb-0">{{ worker.workerName }}</h3>
                      <span class="badge bg-light text-dark border font-monospace">{{ worker.workerId }}</span>
                      <span class="badge" [ngClass]="{
                        'bg-success': worker.workerStatus === 'Active',
                        'bg-secondary': worker.workerStatus === 'Inactive',
                        'bg-warning text-dark': worker.workerStatus === 'On Leave',
                        'bg-danger': worker.workerStatus === 'Terminated'
                      }">{{ worker.workerStatus }}</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1">
                      <span class="fw-semibold text-warning me-2"><i class="bi bi-tag-fill me-1"></i>{{ worker.categoryName }}</span>
                      • Skill: <strong class="text-dark">{{ worker.skillOrWorkType || 'General Labor' }}</strong>
                      • Joined: {{ worker.joiningDate }}
                    </p>
                  </div>
                </div>

                <div class="text-end">
                  <div class="text-muted small">Daily Pay Rate</div>
                  <div class="fw-bold fs-4 text-success">₹{{ worker.payRate | number }} / day</div>
                </div>
              </div>
            </div>

            <!-- Integrated Overview Grid -->
            <div class="row g-4 mb-4">
              <!-- Current Assignment Box -->
              <div class="col-md-6">
                <div class="card card-custom border-0 p-4 h-100 border-start border-4 border-warning">
                  <h6 class="fw-bold text-muted text-uppercase extra-small mb-3">Current Active Project & Contractor</h6>
                  <div *ngIf="worker.currentProjectId; else noCurrentProj">
                    <h5 class="fw-bold text-dark mb-1"><i class="bi bi-building text-warning me-2"></i>{{ worker.currentProjectName }}</h5>
                    <div class="small text-muted mb-2">Contractor: <strong>{{ worker.contractorName || 'Direct Site Management' }}</strong></div>
                    <div class="badge bg-success-subtle text-success border">Active Project Deployment</div>
                  </div>
                  <ng-template #noCurrentProj>
                    <div class="text-muted small py-2">
                      <i class="bi bi-exclamation-circle me-1 text-warning"></i>
                      Worker is currently not allocated to an active project.
                    </div>
                  </ng-template>
                </div>
              </div>

              <!-- Quick Stats Summary -->
              <div class="col-md-6">
                <div class="card card-custom border-0 p-4 h-100">
                  <h6 class="fw-bold text-muted text-uppercase extra-small mb-3">Workforce Engagement Metrics</h6>
                  <div class="row text-center g-2">
                    <div class="col-4 border-end">
                      <div class="fw-bold fs-4 text-dark">{{ assignmentHistory.length }}</div>
                      <div class="extra-small text-muted">Project Allocations</div>
                    </div>
                    <div class="col-4 border-end">
                      <div class="fw-bold fs-4 text-primary">{{ attendanceLogs.length }}</div>
                      <div class="extra-small text-muted">Attendance Days</div>
                    </div>
                    <div class="col-4">
                      <div class="fw-bold fs-4 text-success">₹{{ totalEarnedPay | number }}</div>
                      <div class="extra-small text-muted">Total Estimated Pay</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabs Navigation for Workflow Details -->
            <div class="card card-custom border-0 p-4">
              <ul class="nav nav-tabs nav-tabs-custom mb-4" role="tablist">
                <li class="nav-item">
                  <button class="nav-link" [class.active]="activeTab === 'assignments'" (click)="activeTab = 'assignments'">
                    <i class="bi bi-diagram-3-fill me-1"></i> Assignment History ({{ assignmentHistory.length }})
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link" [class.active]="activeTab === 'attendance'" (click)="activeTab = 'attendance'">
                    <i class="bi bi-calendar-check-fill me-1"></i> Attendance Logs ({{ attendanceLogs.length }})
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link" [class.active]="activeTab === 'shifts'" (click)="activeTab = 'shifts'">
                    <i class="bi bi-clock-history me-1"></i> Shift Schedules ({{ shiftSchedules.length }})
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link" [class.active]="activeTab === 'payroll'" (click)="activeTab = 'payroll'">
                    <i class="bi bi-cash-stack me-1"></i> Payroll Records ({{ payrollRecords.length }})
                  </button>
                </li>
              </ul>

              <!-- Tab 1: Assignment History Timeline -->
              <div *ngIf="activeTab === 'assignments'">
                <div class="table-responsive" *ngIf="assignmentHistory.length; else noAssignHist">
                  <table class="table table-hover align-middle small">
                    <thead class="table-light text-muted">
                      <tr>
                        <th>Project Name</th>
                        <th>Project Code</th>
                        <th>Contractor</th>
                        <th>Work Activity</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let a of assignmentHistory">
                        <td class="fw-bold text-dark">{{ a.projectName }}</td>
                        <td><span class="badge bg-light text-dark border font-monospace">{{ a.projectCode }}</span></td>
                        <td>{{ a.contractorName || 'Direct Hire' }}</td>
                        <td><span class="badge bg-light text-dark border">{{ a.workActivity || 'General' }}</span></td>
                        <td>{{ a.assignmentStartDate }}</td>
                        <td>{{ a.assignmentEndDate || 'Present' }}</td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-success': a.assignmentStatus === 'Active',
                            'bg-secondary': a.assignmentStatus === 'Completed',
                            'bg-info text-dark': a.assignmentStatus === 'Transferred',
                            'bg-danger': a.assignmentStatus === 'Cancelled'
                          }">{{ a.assignmentStatus }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ng-template #noAssignHist>
                  <div class="text-muted small py-3 text-center">No past project assignment records found.</div>
                </ng-template>
              </div>

              <!-- Tab 2: Attendance History -->
              <div *ngIf="activeTab === 'attendance'">
                <div class="table-responsive" *ngIf="attendanceLogs.length; else noAttHist">
                  <table class="table table-hover align-middle small">
                    <thead class="table-light text-muted">
                      <tr>
                        <th>Date</th>
                        <th>Project</th>
                        <th>Shift</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Working Hours</th>
                        <th>Overtime</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let att of attendanceLogs">
                        <td class="fw-bold">{{ att.date }}</td>
                        <td>{{ att.projectName || '-' }}</td>
                        <td>{{ att.shiftName || 'Morning Shift' }}</td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-success': att.status === 'Present',
                            'bg-danger': att.status === 'Absent',
                            'bg-warning text-dark': att.status === 'Leave'
                          }">{{ att.status }}</span>
                        </td>
                        <td>{{ att.checkIn || '-' }}</td>
                        <td>{{ att.checkOut || '-' }}</td>
                        <td class="fw-bold">{{ att.hoursWorked }} hrs</td>
                        <td class="text-warning fw-bold">{{ att.overtimeHours }} hrs</td>
                        <td class="text-muted">{{ att.remarks || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ng-template #noAttHist>
                  <div class="text-muted small py-3 text-center">No attendance records logged for this worker yet.</div>
                </ng-template>
              </div>

              <!-- Tab 3: Shift History -->
              <div *ngIf="activeTab === 'shifts'">
                <div class="table-responsive" *ngIf="shiftSchedules.length; else noShiftHist">
                  <table class="table table-hover align-middle small">
                    <thead class="table-light text-muted">
                      <tr>
                        <th>Shift Name</th>
                        <th>Project</th>
                        <th>Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let s of shiftSchedules">
                        <td class="fw-bold">{{ s.shiftName }}</td>
                        <td>{{ s.projectName || '-' }}</td>
                        <td>{{ s.shiftDate }}</td>
                        <td>{{ s.startTime }}</td>
                        <td>{{ s.endTime }}</td>
                        <td>{{ s.location || 'Main Yard' }}</td>
                        <td><span class="badge bg-secondary">{{ s.shiftStatus }}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ng-template #noShiftHist>
                  <div class="text-muted small py-3 text-center">No shift assignments recorded for this worker.</div>
                </ng-template>
              </div>

              <!-- Tab 4: Payroll Records -->
              <div *ngIf="activeTab === 'payroll'">
                <div class="table-responsive" *ngIf="payrollRecords.length; else noPayrollHist">
                  <table class="table table-hover align-middle small">
                    <thead class="table-light text-muted">
                      <tr>
                        <th>Pay Period</th>
                        <th>Project</th>
                        <th>Pay Rate</th>
                        <th>Working Days</th>
                        <th>Hours Worked</th>
                        <th>Overtime</th>
                        <th>Estimated Pay</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let p of payrollRecords">
                        <td class="fw-bold">{{ p.payPeriodStart }} to {{ p.payPeriodEnd }}</td>
                        <td>{{ p.projectName }}</td>
                        <td>₹{{ p.payRate | number }} / day</td>
                        <td>{{ p.workingDays }} days</td>
                        <td>{{ p.workingHours }} hrs</td>
                        <td>{{ p.overtimeHours }} hrs</td>
                        <td class="fw-bold text-success">₹{{ p.estimatedPay | number }}</td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-warning text-dark': p.payrollStatus === 'Pending',
                            'bg-info text-dark': p.payrollStatus === 'Processing',
                            'bg-primary': p.payrollStatus === 'Approved',
                            'bg-success': p.payrollStatus === 'Paid'
                          }">{{ p.payrollStatus }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ng-template #noPayrollHist>
                  <div class="text-muted small py-3 text-center">No payroll monitoring records found for this worker.</div>
                </ng-template>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.76rem; }
    .nav-tabs-custom .nav-link { color: #495057; font-weight: 600; font-size: 0.88rem; }
    .nav-tabs-custom .nav-link.active { color: #d97706; border-bottom: 2px solid #d97706; background: transparent; }
  `]
})
export class WorkerDetailComponent implements OnInit {
  workerIdParam = '';
  worker: Worker | null = null;
  loading = true;

  activeTab = 'assignments';

  assignmentHistory: WorkerProjectAssignment[] = [];
  attendanceLogs: Attendance[] = [];
  shiftSchedules: Shift[] = [];
  payrollRecords: WorkforcePayroll[] = [];

  constructor(
    private route: ActivatedRoute,
    private workforceService: WorkforceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.workerIdParam = params['id'];
      if (this.workerIdParam) {
        this.load360Profile();
      }
    });
  }

  load360Profile(): void {
    this.loading = true;
    this.workforceService.getWorkerById(this.workerIdParam).subscribe({
      next: (w) => {
        this.worker = w;

        // Fetch Assignment History
        this.workforceService.getWorkerAssignmentHistory(w.id).subscribe(a => this.assignmentHistory = a);

        // Fetch Attendance History
        this.workforceService.getAttendance({ workerId: w.id }).subscribe(att => this.attendanceLogs = att);

        // Fetch Shifts
        this.workforceService.getShifts().subscribe(shifts => {
          this.shiftSchedules = shifts.filter(s => s.assignedWorkers && s.assignedWorkers.some(aw => aw.workerId === w.id));
        });

        // Fetch Payrolls
        this.workforceService.getPayrolls({ workerId: w.id }).subscribe(p => this.payrollRecords = p);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get totalEarnedPay(): number {
    return this.payrollRecords.reduce((sum, p) => sum + (p.estimatedPay || 0), 0);
  }
}

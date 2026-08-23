import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { WorkforceService } from '../../../core/services/workforce.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import {
  Attendance,
  AttendanceSummary,
  ShiftAttendanceComparison,
  Worker,
  WorkforceCategory,
  Shift
} from '../../../core/models/workforce.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-attendance-management',
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
                  <li class="breadcrumb-item active">Attendance Management</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-calendar-check-fill me-2 text-warning"></i>Workforce Attendance Tracking & Shift Verification</h2>
              <p class="text-muted small mb-0">Record daily check-in/out, calculate working hours & overtime, and verify shift compliance.</p>
            </div>

            <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" (click)="showMarkModal = true">
              <i class="bi bi-clock-fill"></i> Mark Daily Attendance
            </button>
          </div>

          <!-- Alert Messages -->
          <div *ngIf="message" class="alert alert-success alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> {{ message }}
            <button type="button" class="btn-close" (click)="message = ''"></button>
          </div>
          <div *ngIf="error" class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
            <button type="button" class="btn-close" (click)="error = ''"></button>
          </div>

          <!-- Summary KPI Cards -->
          <div class="row g-3 mb-4" *ngIf="summary">
            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-dark">{{ summary.totalWorkers }}</div>
                <div class="small text-muted">Total Tracked Workers</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-success">{{ summary.presentWorkers }}</div>
                <div class="small text-muted">Present Personnel</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-danger">{{ summary.absentWorkers }}</div>
                <div class="small text-muted">Absent Personnel</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-warning">{{ summary.attendancePercentage }}%</div>
                <div class="small text-muted">Attendance Rate</div>
              </div>
            </div>
          </div>

          <!-- Filter Controls -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-3">
                <label class="form-label small fw-bold text-muted mb-1">Date Filter</label>
                <input type="date" class="form-control" [(ngModel)]="filterDate" (change)="loadData()">
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-bold text-muted mb-1">Project Filter</label>
                <select class="form-select" [(ngModel)]="filterProjectId" (change)="loadData()">
                  <option value="">-- All Projects --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-bold text-muted mb-1">Contractor Filter</label>
                <select class="form-select" [(ngModel)]="filterContractorId" (change)="loadData()">
                  <option value="">-- All Contractors --</option>
                  <option *ngFor="let c of contractors" [value]="c.id">{{ c.fullName }}</option>
                </select>
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-bold text-muted mb-1">Category Filter</label>
                <select class="form-select" [(ngModel)]="filterCategoryId" (change)="loadData()">
                  <option value="">-- All Categories --</option>
                  <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- View Mode Toggle -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark mb-0">
              <i class="bi bi-table me-2 text-warning"></i>
              {{ viewMode === 'list' ? 'Attendance Logs' : 'Assigned Shift vs Actual Attendance Comparison' }}
            </h5>

            <div class="btn-group btn-group-sm">
              <button class="btn" [ngClass]="viewMode === 'list' ? 'btn-warning' : 'btn-outline-dark'" (click)="viewMode = 'list'">
                <i class="bi bi-list-ul me-1"></i> Attendance Log List
              </button>
              <button class="btn" [ngClass]="viewMode === 'shift' ? 'btn-warning' : 'btn-outline-dark'" (click)="viewMode = 'shift'; loadShiftComparison()">
                <i class="bi bi-clock-history me-1"></i> Shift vs Actual Comparison
              </button>
            </div>
          </div>

          <!-- Mode 1: Attendance List -->
          <div *ngIf="viewMode === 'list'" class="card card-custom border-0 p-4">
            <div *ngIf="loading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div>
            </div>

            <div *ngIf="!loading">
              <div class="table-responsive" *ngIf="attendanceRecords.length; else noAtt">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Worker Name</th>
                      <th>Category</th>
                      <th>Contractor</th>
                      <th>Project</th>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Working Hours</th>
                      <th>Overtime</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let att of attendanceRecords">
                      <td class="fw-bold text-dark">
                        <a [routerLink]="['/workforce/workers', att.workerId]" class="text-dark text-decoration-none hover-warning">
                          {{ att.workerName }} ({{ att.workerCode }})
                        </a>
                      </td>
                      <td><span class="badge bg-warning text-dark">{{ att.categoryName || 'Skilled' }}</span></td>
                      <td>{{ att.contractorName || 'Direct Hire' }}</td>
                      <td>{{ att.projectName || '-' }}</td>
                      <td>{{ att.date }}</td>
                      <td>{{ att.checkIn || '-' }}</td>
                      <td>{{ att.checkOut || '-' }}</td>
                      <td class="fw-bold">{{ att.hoursWorked }} hrs</td>
                      <td class="text-warning fw-bold">{{ att.overtimeHours }} hrs</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-success': att.status === 'Present',
                          'bg-danger': att.status === 'Absent',
                          'bg-warning text-dark': att.status === 'Leave'
                        }">{{ att.status }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noAtt>
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-calendar-x d-block fs-1 opacity-50 mb-2"></i>
                  <h5>No Attendance Logs Found</h5>
                  <p class="small mb-3">No attendance records found for {{ filterDate }}.</p>
                  <button class="btn btn-bt-accent btn-sm" (click)="showMarkModal = true">Mark Attendance</button>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Mode 2: Shift vs Actual Comparison Table -->
          <div *ngIf="viewMode === 'shift'" class="card card-custom border-0 p-4">
            <div class="table-responsive" *ngIf="shiftComparisons.length; else noShiftComp">
              <table class="table table-hover align-middle small">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Worker Name</th>
                    <th>Assigned Shift</th>
                    <th>Scheduled Hours</th>
                    <th>Actual Check-In</th>
                    <th>Actual Check-Out</th>
                    <th>Actual Hours</th>
                    <th>Variance (Hours)</th>
                    <th>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let sc of shiftComparisons">
                    <td class="fw-bold text-dark">{{ sc.workerName }}</td>
                    <td><span class="badge bg-light text-dark border">{{ sc.shiftName }} ({{ sc.assignedTime }})</span></td>
                    <td>{{ sc.assignedHours }} hrs</td>
                    <td>{{ sc.actualCheckIn || 'Not Checked In' }}</td>
                    <td>{{ sc.actualCheckOut || 'Not Checked Out' }}</td>
                    <td class="fw-bold">{{ sc.actualHours }} hrs</td>
                    <td>
                      <span class="badge" [ngClass]="sc.varianceHours >= 0 ? 'bg-success' : 'bg-danger'">
                        {{ sc.varianceHours > 0 ? '+' : '' }}{{ sc.varianceHours }} hrs
                      </span>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-success': sc.status === 'Present',
                        'bg-danger': sc.status === 'Absent',
                        'bg-warning text-dark': sc.status === 'Leave'
                      }">{{ sc.status }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ng-template #noShiftComp>
              <div class="text-center py-5 text-muted">
                <i class="bi bi-clock d-block fs-1 opacity-50 mb-2"></i>
                <h5>No Shift Comparison Available</h5>
                <p class="small">Select a specific project to compare assigned shift rosters against actual attendance logs.</p>
              </div>
            </ng-template>
          </div>

          <!-- Mark Attendance Modal -->
          <div *ngIf="showMarkModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-clock-fill me-2 text-warning"></i>Mark Worker Attendance</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showMarkModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <form (ngSubmit)="submitAttendance()">
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Select Worker <span class="text-danger">*</span></label>
                      <select class="form-select" [(ngModel)]="newAtt.workerId" name="workerId" required>
                        <option value="">-- Choose Worker --</option>
                        <option *ngFor="let w of allWorkers" [value]="w.id">{{ w.workerName }} ({{ w.workerId }}) - {{ w.categoryName }}</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Target Project <span class="text-danger">*</span></label>
                      <select class="form-select" [(ngModel)]="newAtt.projectId" name="projectId" required>
                        <option value="">-- Choose Project --</option>
                        <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Attendance Date <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" [(ngModel)]="newAtt.date" name="date" required>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Attendance Status</label>
                      <select class="form-select" [(ngModel)]="newAtt.status" name="status">
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Leave">Leave</option>
                      </select>
                    </div>

                    <div class="row g-2 mb-3" *ngIf="newAtt.status === 'Present'">
                      <div class="col-6">
                        <label class="form-label small fw-bold">Check-In Time</label>
                        <input type="time" class="form-control" [(ngModel)]="newAtt.checkIn" name="checkIn">
                      </div>
                      <div class="col-6">
                        <label class="form-label small fw-bold">Check-Out Time</label>
                        <input type="time" class="form-control" [(ngModel)]="newAtt.checkOut" name="checkOut">
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label small fw-bold">Remarks / Site Location</label>
                      <input type="text" class="form-control" [(ngModel)]="newAtt.remarks" name="remarks" placeholder="e.g. Block A Level 5 Pouring">
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="showMarkModal = false">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4" [disabled]="saving">Submit Attendance</button>
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
export class AttendanceManagementComponent implements OnInit {
  attendanceRecords: Attendance[] = [];
  summary: AttendanceSummary | null = null;
  shiftComparisons: ShiftAttendanceComparison[] = [];

  allWorkers: Worker[] = [];
  projects: Project[] = [];
  contractors: any[] = [];
  categories: WorkforceCategory[] = [];

  filterDate = new Date().toISOString().split('T')[0];
  filterProjectId = '';
  filterContractorId = '';
  filterCategoryId = '';

  viewMode: 'list' | 'shift' = 'list';
  loading = true;
  saving = false;
  message = '';
  error = '';

  showMarkModal = false;
  newAtt: Partial<Attendance> = {
    workerId: '',
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '08:00',
    checkOut: '17:00',
    remarks: 'Shift completed'
  };

  constructor(
    private workforceService: WorkforceService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(p => this.projects = p);
    this.userService.getUsers('Contractor').subscribe(c => this.contractors = c);
    this.workforceService.getCategories().subscribe(cat => this.categories = cat);
    this.workforceService.getWorkers({ pageSize: 500 }).subscribe(w => this.allWorkers = w.items);

    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.workforceService.getAttendance({
      projectId: this.filterProjectId,
      contractorId: this.filterContractorId,
      attendanceDate: this.filterDate,
      categoryId: this.filterCategoryId
    }).subscribe({
      next: (records) => {
        this.attendanceRecords = records;

        this.workforceService.getAttendanceSummary({
          projectId: this.filterProjectId,
          contractorId: this.filterContractorId,
          attendanceDate: this.filterDate,
          categoryId: this.filterCategoryId
        }).subscribe(s => this.summary = s);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadShiftComparison(): void {
    if (!this.filterProjectId && this.projects.length > 0) {
      this.filterProjectId = this.projects[0].id;
    }

    if (this.filterProjectId) {
      this.workforceService.getShiftAttendanceComparison(this.filterProjectId, this.filterDate).subscribe({
        next: (res) => this.shiftComparisons = res,
        error: () => this.shiftComparisons = []
      });
    }
  }

  submitAttendance(): void {
    if (!this.newAtt.workerId || !this.newAtt.projectId || !this.newAtt.date) return;

    this.saving = true;
    this.message = '';
    this.error = '';

    this.workforceService.createAttendance(this.newAtt).subscribe({
      next: () => {
        this.saving = false;
        this.showMarkModal = false;
        this.message = 'Attendance record logged successfully!';
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Failed to log attendance.';
      }
    });
  }
}

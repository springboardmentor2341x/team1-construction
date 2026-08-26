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
  WorkforceCategory
} from '../../../core/models/workforce.model';

import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    SidebarComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">

        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">

          <!-- HEADER -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">

            <div>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb small mb-1">
                  <li class="breadcrumb-item">
                    <a
                      routerLink="/workforce/dashboard"
                      class="text-decoration-none text-warning">
                      Workforce
                    </a>
                  </li>

                  <li class="breadcrumb-item active">
                    Attendance Management
                  </li>
                </ol>
              </nav>

              <h2 class="fw-bold text-dark mb-0">
                <i class="bi bi-calendar-check-fill me-2 text-warning"></i>
                Workforce Attendance Tracking & Shift Verification
              </h2>

              <p class="text-muted small mb-0">
                Record daily check-in/out, calculate working hours & overtime,
                and verify shift compliance.
              </p>
            </div>

            <button
              class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm"
              (click)="openMarkAttendanceModal()">

              <i class="bi bi-clock-fill"></i>
              Mark Daily Attendance
            </button>

          </div>

          <!-- SUCCESS MESSAGE -->
          <div
            *ngIf="message"
            class="alert alert-success alert-dismissible fade show mb-3"
            role="alert">

            <i class="bi bi-check-circle-fill me-2"></i>
            {{ message }}

            <button
              type="button"
              class="btn-close"
              (click)="message = ''">
            </button>

          </div>

          <!-- ERROR MESSAGE -->
          <div
            *ngIf="error"
            class="alert alert-danger alert-dismissible fade show mb-3"
            role="alert">

            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ error }}

            <button
              type="button"
              class="btn-close"
              (click)="error = ''">
            </button>

          </div>

          <!-- SUMMARY -->
          <div
            class="row g-3 mb-4"
            *ngIf="summary">

            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">

                <div class="fw-bold fs-4 text-dark">
                  {{ summary.totalWorkers }}
                </div>

                <div class="small text-muted">
                  Total Tracked Workers
                </div>

              </div>
            </div>

            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">

                <div class="fw-bold fs-4 text-success">
                  {{ summary.presentWorkers }}
                </div>

                <div class="small text-muted">
                  Present Personnel
                </div>

              </div>
            </div>

            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">

                <div class="fw-bold fs-4 text-danger">
                  {{ summary.absentWorkers }}
                </div>

                <div class="small text-muted">
                  Absent Personnel
                </div>

              </div>
            </div>

            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">

                <div class="fw-bold fs-4 text-warning">
                  {{ summary.attendancePercentage }}%
                </div>

                <div class="small text-muted">
                  Attendance Rate
                </div>

              </div>
            </div>

          </div>

          <!-- FILTERS -->
          <div class="card card-custom border-0 p-3 mb-4">

            <div class="row g-3">

              <div class="col-md-3">

                <label class="form-label small fw-bold text-muted mb-1">
                  Date Filter
                </label>

                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="filterDate"
                  (change)="loadData()">

              </div>

              <div class="col-md-3">

                <label class="form-label small fw-bold text-muted mb-1">
                  Project Filter
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="filterProjectId"
                  (change)="loadData()">

                  <option value="">
                    -- All Projects --
                  </option>

                  <option
                    *ngFor="let p of projects"
                    [value]="p.id">

                    {{ p.projectName }}

                  </option>

                </select>

              </div>

              <div class="col-md-3">

                <label class="form-label small fw-bold text-muted mb-1">
                  Contractor Filter
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="filterContractorId"
                  (change)="loadData()">

                  <option value="">
                    -- All Contractors --
                  </option>

                  <option
                    *ngFor="let c of contractors"
                    [value]="c.id">

                    {{ c.fullName }}

                  </option>

                </select>

              </div>

              <div class="col-md-3">

                <label class="form-label small fw-bold text-muted mb-1">
                  Category Filter
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="filterCategoryId"
                  (change)="loadData()">

                  <option value="">
                    -- All Categories --
                  </option>

                  <option
                    *ngFor="let cat of categories"
                    [value]="cat.id">

                    {{ cat.name }}

                  </option>

                </select>

              </div>

            </div>

          </div>

          <!-- VIEW MODE -->
          <div class="d-flex justify-content-between align-items-center mb-3">

            <h5 class="fw-bold text-dark mb-0">

              <i class="bi bi-table me-2 text-warning"></i>

              {{
                viewMode === 'list'
                  ? 'Attendance Logs'
                  : 'Assigned Shift vs Actual Attendance Comparison'
              }}

            </h5>

            <div class="btn-group btn-group-sm">

              <button
                class="btn"
                [ngClass]="
                  viewMode === 'list'
                    ? 'btn-warning'
                    : 'btn-outline-dark'
                "
                (click)="viewMode = 'list'">

                <i class="bi bi-list-ul me-1"></i>
                Attendance Log List

              </button>

              <button
                class="btn"
                [ngClass]="
                  viewMode === 'shift'
                    ? 'btn-warning'
                    : 'btn-outline-dark'
                "
                (click)="viewMode = 'shift'; loadShiftComparison()">

                <i class="bi bi-clock-history me-1"></i>
                Shift vs Actual Comparison

              </button>

            </div>

          </div>

          <!-- ATTENDANCE LIST -->
          <div
            *ngIf="viewMode === 'list'"
            class="card card-custom border-0 p-4">

            <div
              *ngIf="loading"
              class="text-center py-5">

              <div
                class="spinner-border text-warning"
                role="status">
              </div>

            </div>

            <div *ngIf="!loading">

              <div
                class="table-responsive"
                *ngIf="attendanceRecords.length > 0; else noAttendance">

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

                        <a
                          [routerLink]="[
                            '/workforce/workers',
                            att.workerId
                          ]"
                          class="text-dark text-decoration-none">

                          {{ att.workerName }}
                          ({{ att.workerCode }})

                        </a>

                      </td>

                      <td>

                        <span class="badge bg-warning text-dark">
                          {{ att.categoryName || 'Skilled' }}
                        </span>

                      </td>

                      <td>
                        {{ att.contractorName || 'Direct Hire' }}
                      </td>

                      <td>
                        {{ att.projectName || '-' }}
                      </td>

                      <td>
                        {{ att.date }}
                      </td>

                      <td>
                        {{ att.checkIn || '-' }}
                      </td>

                      <td>
                        {{ att.checkOut || '-' }}
                      </td>

                      <td class="fw-bold">
                        {{ att.hoursWorked }} hrs
                      </td>

                      <td class="text-warning fw-bold">
                        {{ att.overtimeHours }} hrs
                      </td>

                      <td>

                        <span
                          class="badge"
                          [ngClass]="{
                            'bg-success': att.status === 'Present',
                            'bg-danger': att.status === 'Absent',
                            'bg-warning text-dark': att.status === 'Leave'
                          }">

                          {{ att.status }}

                        </span>

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

              <ng-template #noAttendance>

                <div class="text-center py-5 text-muted">

                  <i
                    class="bi bi-calendar-x d-block fs-1 opacity-50 mb-2">
                  </i>

                  <h5>
                    No Attendance Logs Found
                  </h5>

                  <p class="small mb-3">
                    No attendance records found for {{ filterDate }}.
                  </p>

                  <button
                    class="btn btn-bt-accent btn-sm"
                    (click)="openMarkAttendanceModal()">

                    Mark Attendance

                  </button>

                </div>

              </ng-template>

            </div>

          </div>

          <!-- SHIFT COMPARISON -->
          <div
            *ngIf="viewMode === 'shift'"
            class="card card-custom border-0 p-4">

            <div
              *ngIf="shiftComparisonLoading"
              class="text-center py-5">

              <div
                class="spinner-border text-warning"
                role="status">
              </div>

            </div>

            <div *ngIf="!shiftComparisonLoading">

              <div
                class="table-responsive"
                *ngIf="
                  shiftComparisons.length > 0;
                  else noShiftComparison
                ">

                <table class="table table-hover align-middle small">

                  <thead class="table-light text-muted">

                    <tr>
                      <th>Worker Name</th>
                      <th>Assigned Shift</th>
                      <th>Scheduled Hours</th>
                      <th>Actual Check-In</th>
                      <th>Actual Check-Out</th>
                      <th>Actual Hours</th>
                      <th>Variance</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    <tr *ngFor="let sc of shiftComparisons">

                      <td class="fw-bold text-dark">
                        {{ sc.workerName }}
                      </td>

                      <td>

                        <span class="badge bg-light text-dark border">

                          {{ sc.shiftName }}
                          ({{ sc.assignedTime }})

                        </span>

                      </td>

                      <td>
                        {{ sc.assignedHours }} hrs
                      </td>

                      <td>
                        {{ sc.actualCheckIn || 'Not Checked In' }}
                      </td>

                      <td>
                        {{ sc.actualCheckOut || 'Not Checked Out' }}
                      </td>

                      <td class="fw-bold">
                        {{ sc.actualHours }} hrs
                      </td>

                      <td>

                        <span
                          class="badge"
                          [ngClass]="
                            sc.varianceHours >= 0
                              ? 'bg-success'
                              : 'bg-danger'
                          ">

                          {{
                            sc.varianceHours > 0 ? '+' : ''
                          }}{{ sc.varianceHours }} hrs

                        </span>

                      </td>

                      <td>

                        <span
                          class="badge"
                          [ngClass]="{
                            'bg-success': sc.status === 'Present',
                            'bg-danger': sc.status === 'Absent',
                            'bg-warning text-dark': sc.status === 'Leave'
                          }">

                          {{ sc.status }}

                        </span>

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

              <ng-template #noShiftComparison>

                <div class="text-center py-5 text-muted">

                  <i
                    class="bi bi-clock d-block fs-1 opacity-50 mb-2">
                  </i>

                  <h5>
                    No Shift Comparison Available
                  </h5>

                  <p class="small">
                    Select a specific project to compare assigned
                    shift rosters against actual attendance logs.
                  </p>

                </div>

              </ng-template>

            </div>

          </div>

          <!-- MARK ATTENDANCE MODAL -->
          <div
            *ngIf="showMarkModal"
            class="modal fade show d-block"
            tabindex="-1"
            style="background: rgba(0,0,0,0.5);">

            <div class="modal-dialog modal-dialog-centered">

              <div class="modal-content border-0 shadow-lg">

                <div class="modal-header bg-dark text-white">

                  <h5 class="modal-title fw-bold">

                    <i class="bi bi-clock-fill me-2 text-warning"></i>
                    Mark Worker Attendance

                  </h5>

                  <button
                    type="button"
                    class="btn-close btn-close-white"
                    (click)="closeMarkAttendanceModal()">
                  </button>

                </div>

                <div class="modal-body p-4">

                  <form
                    (ngSubmit)="submitAttendance()"
                    #attendanceForm="ngForm">

                    <!-- WORKER -->
                    <div class="mb-3">

                      <label class="form-label small fw-bold">
                        Select Worker
                        <span class="text-danger">*</span>
                      </label>

                      <select
                        class="form-select"
                        [(ngModel)]="newAtt.workerId"
                        name="workerId"
                        required>

                        <option value="">
                          -- Choose Worker --
                        </option>

                        <option
                          *ngFor="let w of allWorkers"
                          [value]="w.id">

                          {{ w.workerName }}
                          ({{ w.workerId }})
                          -
                          {{ w.categoryName }}

                        </option>

                      </select>

                    </div>

                    <!-- PROJECT -->
                    <div class="mb-3">

                      <label class="form-label small fw-bold">
                        Target Project
                        <span class="text-danger">*</span>
                      </label>

                      <select
                        class="form-select"
                        [(ngModel)]="newAtt.projectId"
                        name="projectId"
                        required>

                        <option value="">
                          -- Choose Project --
                        </option>

                        <option
                          *ngFor="let p of projects"
                          [value]="p.id">

                          {{ p.projectName }}
                          ({{ p.projectCode }})

                        </option>

                      </select>

                    </div>

                    <!-- SHIFT -->
                    <div class="mb-3">

                      <label class="form-label small fw-bold">
                        Shift
                      </label>

                      <select
                        class="form-select"
                        [(ngModel)]="newAtt.shiftId"
                        name="shiftId">

                        <option value="">
                          -- No Specific Shift --
                        </option>

                        <option
                          *ngFor="let s of availableShifts"
                          [value]="s.id">

                          {{ s.shiftName }}
                          - {{ s.shiftDate }}
                          ({{ s.startTime }} - {{ s.endTime }})

                        </option>

                      </select>

                    </div>

                    <!-- DATE -->
                    <div class="mb-3">

                      <label class="form-label small fw-bold">
                        Attendance Date
                        <span class="text-danger">*</span>
                      </label>

                      <input
                        type="date"
                        class="form-control"
                        [(ngModel)]="newAtt.date"
                        name="date"
                        required>

                    </div>

                    <!-- STATUS -->
                    <div class="mb-3">

                      <label class="form-label small fw-bold">
                        Attendance Status
                      </label>

                      <select
                        class="form-select"
                        [(ngModel)]="newAtt.status"
                        name="status">

                        <option value="Present">
                          Present
                        </option>

                        <option value="Absent">
                          Absent
                        </option>

                        <option value="Leave">
                          Leave
                        </option>

                      </select>

                    </div>

                    <!-- CHECK IN / OUT -->
                    <div
                      class="row g-2 mb-3"
                      *ngIf="newAtt.status === 'Present'">

                      <div class="col-6">

                        <label class="form-label small fw-bold">
                          Check-In Time
                        </label>

                        <input
                          type="time"
                          class="form-control"
                          [(ngModel)]="newAtt.checkIn"
                          name="checkIn">

                      </div>

                      <div class="col-6">

                        <label class="form-label small fw-bold">
                          Check-Out Time
                        </label>

                        <input
                          type="time"
                          class="form-control"
                          [(ngModel)]="newAtt.checkOut"
                          name="checkOut">

                      </div>

                    </div>

                    <!-- LOCATION -->
                    <div class="mb-3">

                      <label class="form-label small fw-bold">
                        Site Location
                      </label>

                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="newAtt.location"
                        name="location"
                        placeholder="e.g. Block A Level 5">

                    </div>

                    <!-- REMARKS -->
                    <div class="mb-3">

                      <label class="form-label small fw-bold">
                        Remarks
                      </label>

                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="newAtt.remarks"
                        name="remarks"
                        placeholder="e.g. Shift completed">

                    </div>

                    <!-- BUTTONS -->
                    <div
                      class="d-flex justify-content-end gap-2 mt-4">

                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        (click)="closeMarkAttendanceModal()">

                        Cancel

                      </button>

                      <button
                        type="submit"
                        class="btn btn-bt-accent px-4"
                        [disabled]="saving || attendanceForm.invalid">

                        <span
                          *ngIf="saving"
                          class="spinner-border spinner-border-sm me-2">
                        </span>

                        {{ saving ? 'Saving...' : 'Submit Attendance' }}

                      </button>

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

  availableShifts: any[] = [];

  filterDate = new Date().toISOString().split('T')[0];

  filterProjectId = '';

  filterContractorId = '';

  filterCategoryId = '';

  viewMode: 'list' | 'shift' = 'list';

  loading = true;

  shiftComparisonLoading = false;

  saving = false;

  message = '';

  error = '';

  showMarkModal = false;

  newAtt: any = {
    workerId: '',
    projectId: '',
    shiftId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '08:00',
    checkOut: '17:00',
    remarks: 'Shift completed',
    location: ''
  };

  constructor(
    private workforceService: WorkforceService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: () => {
        this.projects = [];
      }
    });

    this.userService.getUsers('Contractor').subscribe({
      next: (contractors) => {
        this.contractors = contractors;
      },
      error: () => {
        this.contractors = [];
      }
    });

    this.workforceService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categories = [];
      }
    });

    this.workforceService
      .getWorkers({ pageSize: 500 })
      .subscribe({
        next: (response) => {
          this.allWorkers = response.items;
        },
        error: () => {
          this.allWorkers = [];
        }
      });

    this.loadShifts();

    this.loadData();
  }

  loadShifts(): void {

    this.workforceService.getShifts({
      projectId: this.filterProjectId,
      shiftDate: this.filterDate,
      shiftStatus: ''
    }).subscribe({
      next: (shifts) => {
        this.availableShifts = shifts;
      },
      error: () => {
        this.availableShifts = [];
      }
    });

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

        this.loadSummary();

        this.loading = false;

      },

      error: (err) => {

        this.loading = false;

        this.error =
          err?.error?.detail ||
          'Failed to load attendance records.';

      }

    });

    this.loadShifts();

  }

  loadSummary(): void {

    this.workforceService.getAttendanceSummary({
      projectId: this.filterProjectId,
      contractorId: this.filterContractorId,
      attendanceDate: this.filterDate,
      categoryId: this.filterCategoryId
    }).subscribe({

      next: (summary) => {
        this.summary = summary;
      },

      error: () => {
        this.summary = null;
      }

    });

  }

  loadShiftComparison(): void {

    this.shiftComparisonLoading = true;

    this.shiftComparisons = [];

    if (!this.filterProjectId) {

      this.shiftComparisonLoading = false;

      return;
    }

    this.workforceService
      .getShiftAttendanceComparison(
        this.filterProjectId,
        this.filterDate
      )
      .subscribe({

        next: (response) => {

          this.shiftComparisons = response;

          this.shiftComparisonLoading = false;

        },

        error: (err) => {

          this.shiftComparisons = [];

          this.shiftComparisonLoading = false;

          this.error =
            err?.error?.detail ||
            'Failed to load shift comparison.';

        }

      });

  }

  openMarkAttendanceModal(): void {

    this.error = '';

    this.message = '';

    this.newAtt = {
      workerId: '',
      projectId: this.filterProjectId || '',
      shiftId: '',
      date: this.filterDate,
      status: 'Present',
      checkIn: '08:00',
      checkOut: '17:00',
      remarks: 'Shift completed',
      location: ''
    };

    this.showMarkModal = true;

  }

  closeMarkAttendanceModal(): void {

    if (!this.saving) {
      this.showMarkModal = false;
    }

  }

  submitAttendance(): void {

    if (
      !this.newAtt.workerId ||
      !this.newAtt.projectId ||
      !this.newAtt.date
    ) {

      this.error =
        'Please select a worker, project and attendance date.';

      return;
    }

    this.saving = true;

    this.message = '';

    this.error = '';

    const payload = {
      workerId: this.newAtt.workerId,
      projectId: this.newAtt.projectId,
      shiftId: this.newAtt.shiftId || null,
      date: this.newAtt.date,
      status: this.newAtt.status || 'Present',
      checkIn:
        this.newAtt.status === 'Present'
          ? this.newAtt.checkIn || null
          : null,
      checkOut:
        this.newAtt.status === 'Present'
          ? this.newAtt.checkOut || null
          : null,
      remarks: this.newAtt.remarks || '',
      location: this.newAtt.location || ''
    };

    this.workforceService.createAttendance(payload).subscribe({

      next: () => {

        this.saving = false;

        this.showMarkModal = false;

        this.message =
          'Attendance record logged successfully!';

        this.loadData();

      },

      error: (err) => {

        this.saving = false;

        this.error =
          err?.error?.detail ||
          'Failed to log attendance.';

      }

    });

  }

}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

import { WorkforceService } from '../../../core/services/workforce.service';
import { ProjectService } from '../../../core/services/project.service';

import {
  Shift,
  Worker
} from '../../../core/models/workforce.model';

import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-shift-management',
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

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100">

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
                    Shift Scheduling
                  </li>

                </ol>

              </nav>

              <h2 class="fw-bold text-dark mb-1">

                <i class="bi bi-clock-history me-2 text-warning"></i>

                Shift Scheduling

              </h2>

              <p class="text-muted small mb-0">

                Create project shifts and assign the appropriate workforce
                to each shift.

              </p>

            </div>

            <button
              class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm"
              (click)="openCreateModal()">

              <i class="bi bi-plus-circle-fill"></i>

              Create New Shift

            </button>

          </div>


          <!-- SUCCESS MESSAGE -->
          <div
            *ngIf="message"
            class="alert alert-success alert-dismissible fade show">

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
            class="alert alert-danger alert-dismissible fade show">

            <i class="bi bi-exclamation-triangle-fill me-2"></i>

            {{ error }}

            <button
              type="button"
              class="btn-close"
              (click)="error = ''">
            </button>

          </div>


          <!-- FILTERS -->
          <div class="card card-custom border-0 shadow-sm p-3 mb-4">

            <div class="row g-3">

              <div class="col-md-4">

                <label class="form-label small fw-bold">
                  Project
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="filterProjectId"
                  (change)="loadShifts()">

                  <option value="">
                    All Projects
                  </option>

                  <option
                    *ngFor="let project of projects"
                    [value]="project.id">

                    {{ project.projectName }}

                  </option>

                </select>

              </div>


              <div class="col-md-4">

                <label class="form-label small fw-bold">
                  Shift Date
                </label>

                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="filterShiftDate"
                  (change)="loadShifts()">

              </div>


              <div class="col-md-4">

                <label class="form-label small fw-bold">
                  Status
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="filterStatus"
                  (change)="loadShifts()">

                  <option value="">
                    All Statuses
                  </option>

                  <option value="Scheduled">
                    Scheduled
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>

          </div>


          <!-- LOADING -->
          <div
            *ngIf="loading"
            class="text-center py-5">

            <div class="spinner-border text-warning"></div>

            <p class="text-muted mt-2">
              Loading shifts...
            </p>

          </div>


          <!-- SHIFT CARDS -->
          <div *ngIf="!loading">

            <div
              class="row g-4"
              *ngIf="shifts.length > 0; else noShifts">

              <div
                *ngFor="let shift of shifts"
                class="col-lg-6">

                <div class="card card-custom border-0 p-4 h-100 shadow-sm">

                  <!-- SHIFT HEADER -->
                  <div class="d-flex justify-content-between align-items-start mb-2">

                    <div>

                      <h5 class="fw-bold text-dark mb-1">

                        {{ shift.shiftName }}

                      </h5>

                      <div class="small text-muted">

                        <i class="bi bi-calendar3 me-1"></i>

                        {{ shift.shiftDate }}

                      </div>

                    </div>


                    <span
                      class="badge"
                      [ngClass]="{
                        'bg-warning text-dark':
                          shift.shiftStatus === 'Scheduled',

                        'bg-success':
                          shift.shiftStatus === 'Active',

                        'bg-secondary':
                          shift.shiftStatus === 'Completed',

                        'bg-danger':
                          shift.shiftStatus === 'Cancelled'
                      }">

                      {{ shift.shiftStatus }}

                    </span>

                  </div>


                  <!-- PROJECT -->
                  <div class="small text-muted mb-3">

                    <i class="bi bi-building me-1 text-warning"></i>

                    Project:

                    <strong>
                      {{ shift.projectName || 'General Site' }}
                    </strong>

                  </div>


                  <!-- SHIFT DETAILS -->
                  <div class="p-3 bg-light rounded-3 mb-3">

                    <div class="row text-center g-2">

                      <div class="col-6 border-end">

                        <span class="small text-muted d-block">
                          Shift Time
                        </span>

                        <strong>
                          {{ shift.startTime }}
                          -
                          {{ shift.endTime }}
                        </strong>

                      </div>


                      <div class="col-6">

                        <span class="small text-muted d-block">
                          Assigned Workers
                        </span>

                        <strong class="text-warning">

                          {{ shift.assignedWorkerCount || 0 }}

                          Personnel

                        </strong>

                      </div>

                    </div>

                  </div>


                  <!-- WORKER ROSTER -->
                  <div class="mb-3">

                    <div
                      class="d-flex justify-content-between align-items-center mb-2">

                      <span
                        class="fw-bold small text-muted text-uppercase">

                        Assigned Crew

                      </span>

                      <button
                        *ngIf="
                          shift.shiftStatus !== 'Completed' &&
                          shift.shiftStatus !== 'Cancelled'
                        "
                        class="btn btn-sm btn-outline-warning"
                        (click)="openAssignModal(shift)">

                        <i class="bi bi-person-plus-fill me-1"></i>

                        Assign Crew

                      </button>

                    </div>


                    <div
                      *ngIf="
                        shift.assignedWorkers &&
                        shift.assignedWorkers.length > 0;
                        else noWorkers
                      "
                      class="d-flex flex-wrap gap-2">

                      <span
                        *ngFor="
                          let worker of shift.assignedWorkers
                        "
                        class="badge bg-white text-dark border p-2">

                        <i
                          class="bi bi-person-fill text-warning me-1">
                        </i>

                        {{ worker.workerName }}

                        <span
                          *ngIf="worker.workerCode"
                          class="text-muted">

                          ({{ worker.workerCode }})

                        </span>

                        <button
                          *ngIf="
                            shift.shiftStatus !== 'Completed' &&
                            shift.shiftStatus !== 'Cancelled'
                          "
                          type="button"
                          class="btn btn-sm p-0 ms-2 text-danger border-0"
                          (click)="
                            removeWorkerFromShift(
                              shift.id,
                              worker.workerId
                            )
                          "
                          title="Remove worker">

                          <i class="bi bi-x-circle"></i>

                        </button>

                      </span>

                    </div>


                    <ng-template #noWorkers>

                      <div class="text-muted small">

                        <i class="bi bi-people me-1"></i>

                        No workers assigned to this shift yet.

                      </div>

                    </ng-template>

                  </div>


                  <!-- ACTIONS -->
                  <div
                    class="d-flex justify-content-end gap-2 border-top pt-3">

                    <button
                      *ngIf="shift.shiftStatus === 'Scheduled'"
                      class="btn btn-sm btn-outline-success"
                      (click)="updateStatus(shift.id, 'Active')">

                      <i class="bi bi-play-fill me-1"></i>

                      Start Shift

                    </button>


                    <button
                      *ngIf="shift.shiftStatus === 'Active'"
                      class="btn btn-sm btn-outline-secondary"
                      (click)="updateStatus(shift.id, 'Completed')">

                      <i class="bi bi-check-circle me-1"></i>

                      Complete

                    </button>


                    <button
                      *ngIf="
                        shift.shiftStatus !== 'Completed' &&
                        shift.shiftStatus !== 'Cancelled'
                      "
                      class="btn btn-sm btn-outline-danger"
                      (click)="updateStatus(shift.id, 'Cancelled')">

                      <i class="bi bi-x-circle me-1"></i>

                      Cancel

                    </button>

                  </div>

                </div>

              </div>

            </div>


            <!-- EMPTY -->
            <ng-template #noShifts>

              <div
                class="text-center py-5 card card-custom border-0 p-5">

                <i
                  class="bi bi-clock-history d-block fs-1 opacity-50 mb-3">
                </i>

                <h5>
                  No Shift Schedules Found
                </h5>

                <p class="small text-muted mb-3">

                  Create a project shift and assign workers
                  to the required crew.

                </p>

                <button
                  class="btn btn-bt-accent"
                  (click)="openCreateModal()">

                  Create First Shift

                </button>

              </div>

            </ng-template>

          </div>


          <!-- ========================================== -->
          <!-- CREATE SHIFT MODAL -->
          <!-- ========================================== -->

          <div
            *ngIf="showCreateModal"
            class="modal fade show d-block"
            tabindex="-1"
            style="background: rgba(0,0,0,.55);">

            <div class="modal-dialog modal-dialog-centered">

              <div class="modal-content border-0 shadow-lg">

                <div class="modal-header bg-dark text-white">

                  <h5 class="modal-title">

                    <i
                      class="bi bi-calendar-plus-fill text-warning me-2">
                    </i>

                    Create Shift Schedule

                  </h5>

                  <button
                    type="button"
                    class="btn-close btn-close-white"
                    (click)="closeCreateModal()">
                  </button>

                </div>


                <form (ngSubmit)="submitCreateShift()">

                  <div class="modal-body p-4">

                    <div class="mb-3">

                      <label class="form-label fw-bold">
                        Shift Name *
                      </label>

                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="newShift.shiftName"
                        name="shiftName"
                        required
                        placeholder="e.g. Morning Construction Shift">

                    </div>


                    <div class="mb-3">

                      <label class="form-label fw-bold">
                        Project *
                      </label>

                      <select
                        class="form-select"
                        [(ngModel)]="newShift.projectId"
                        name="projectId"
                        required>

                        <option value="">
                          Select Project
                        </option>

                        <option
                          *ngFor="let project of projects"
                          [value]="project.id">

                          {{ project.projectName }}

                          <span
                            *ngIf="project.projectCode">

                            ({{ project.projectCode }})

                          </span>

                        </option>

                      </select>

                    </div>


                    <div class="mb-3">

                      <label class="form-label fw-bold">
                        Shift Date *
                      </label>

                      <input
                        type="date"
                        class="form-control"
                        [(ngModel)]="newShift.shiftDate"
                        name="shiftDate"
                        required>

                    </div>


                    <div class="row g-3 mb-3">

                      <div class="col-6">

                        <label class="form-label fw-bold">
                          Start Time *
                        </label>

                        <input
                          type="time"
                          class="form-control"
                          [(ngModel)]="newShift.startTime"
                          name="startTime"
                          required>

                      </div>


                      <div class="col-6">

                        <label class="form-label fw-bold">
                          End Time *
                        </label>

                        <input
                          type="time"
                          class="form-control"
                          [(ngModel)]="newShift.endTime"
                          name="endTime"
                          required>

                      </div>

                    </div>


                    <div class="mb-3">

                      <label class="form-label fw-bold">
                        Location / Zone
                      </label>

                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="newShift.location"
                        name="location"
                        placeholder="e.g. Block A - Level 4">

                    </div>


                    <div class="alert alert-info small">

                      <i class="bi bi-info-circle me-1"></i>

                      Workers can be assigned after the shift is created.
                      Only workers allocated to the selected project
                      should be assigned to this shift.

                    </div>

                  </div>


                  <div class="modal-footer">

                    <button
                      type="button"
                      class="btn btn-light"
                      (click)="closeCreateModal()">

                      Cancel

                    </button>

                    <button
                      type="submit"
                      class="btn btn-bt-accent"
                      [disabled]="saving">

                      <span
                        *ngIf="saving"
                        class="spinner-border spinner-border-sm me-1">
                      </span>

                      Create Shift

                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>


          <!-- ========================================== -->
          <!-- ASSIGN CREW MODAL -->
          <!-- ========================================== -->

          <div
            *ngIf="showAssignModal && selectedShift"
            class="modal fade show d-block"
            tabindex="-1"
            style="background: rgba(0,0,0,.55);">

            <div class="modal-dialog modal-dialog-centered">

              <div class="modal-content border-0 shadow-lg">

                <div class="modal-header bg-dark text-white">

                  <h5 class="modal-title">

                    <i
                      class="bi bi-people-fill text-warning me-2">
                    </i>

                    Assign Workers

                  </h5>

                  <button
                    type="button"
                    class="btn-close btn-close-white"
                    (click)="closeAssignModal()">
                  </button>

                </div>


                <div class="modal-body p-4">

                  <div class="alert alert-light border small">

                    <strong>
                      {{ selectedShift.shiftName }}
                    </strong>

                    <br>

                    <span class="text-muted">

                      Project:
                      {{ selectedShift.projectName || 'Unknown' }}

                      |
                      Date:
                      {{ selectedShift.shiftDate }}

                      |
                      Time:
                      {{ selectedShift.startTime }}
                      -
                      {{ selectedShift.endTime }}

                    </span>

                  </div>


                  <label class="form-label fw-bold">
                    Select Workers
                  </label>


                  <div
                    class="border rounded p-3"
                    style="max-height:300px; overflow-y:auto;">

                    <div
                      *ngFor="let worker of projectWorkers"
                      class="form-check mb-2">

                      <input
                        class="form-check-input"
                        type="checkbox"
                        [id]="'worker_' + worker.id"
                        [checked]="
                          selectedWorkerIds.includes(worker.id)
                        "
                        (change)="
                          toggleWorkerSelection(worker.id)
                        ">

                      <label
                        class="form-check-label"
                        [for]="'worker_' + worker.id">

                        <strong>
                          {{ worker.workerName }}
                        </strong>

                        <span class="text-muted">
                          ({{ worker.workerId }})
                        </span>

                        <span
                          *ngIf="worker.categoryName"
                          class="badge bg-light text-dark border ms-2">

                          {{ worker.categoryName }}

                        </span>

                      </label>

                    </div>


                    <div
                      *ngIf="projectWorkers.length === 0"
                      class="text-center text-muted py-3">

                      <i class="bi bi-people fs-3 d-block mb-2"></i>

                      No workers are allocated to this project.

                      <div class="small mt-1">
                        Allocate workers to the project first.
                      </div>

                    </div>

                  </div>

                </div>


                <div class="modal-footer">

                  <button
                    type="button"
                    class="btn btn-light"
                    (click)="closeAssignModal()">

                    Cancel

                  </button>

                  <button
                    type="button"
                    class="btn btn-bt-accent"
                    [disabled]="
                      saving ||
                      selectedWorkerIds.length === 0
                    "
                    (click)="submitAssignCrew()">

                    <span
                      *ngIf="saving"
                      class="spinner-border spinner-border-sm me-1">
                    </span>

                    Assign Selected Workers

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  `
})
export class ShiftManagementComponent implements OnInit {

  shifts: Shift[] = [];

  projects: Project[] = [];

  availableWorkers: Worker[] = [];

  projectWorkers: Worker[] = [];

  filterProjectId = '';

  filterShiftDate = '';

  filterStatus = '';

  loading = true;

  saving = false;

  message = '';

  error = '';

  showCreateModal = false;

  showAssignModal = false;

  selectedShift: Shift | null = null;

  selectedWorkerIds: string[] = [];


  newShift: any = {

    shiftName: 'Morning Shift',

    startTime: '08:00',

    endTime: '17:00',

    projectId: '',

    shiftDate:
      new Date().toISOString().split('T')[0],

    shiftStatus: 'Scheduled',

    location: ''

  };


  constructor(

    private workforceService: WorkforceService,

    private projectService: ProjectService

  ) {}


  ngOnInit(): void {

    this.loadProjects();

    this.loadWorkers();

    this.loadShifts();

  }


  loadProjects(): void {

    this.projectService
      .getProjects()
      .subscribe({

        next: (data) => {

          this.projects = data || [];

        },

        error: () => {

          this.projects = [];

        }

      });

  }


  loadWorkers(): void {

    this.workforceService
      .getWorkers({ pageSize: 500 })
      .subscribe({

        next: (data) => {

          this.availableWorkers =
            data?.items || [];

        },

        error: () => {

          this.availableWorkers = [];

        }

      });

  }


  loadShifts(): void {

    this.loading = true;

    this.error = '';

    this.workforceService
      .getShifts({

        projectId:
          this.filterProjectId || undefined,

        shiftDate:
          this.filterShiftDate || undefined,

        shiftStatus:
          this.filterStatus || undefined

      })
      .subscribe({

        next: (data) => {

          this.shifts = data || [];

          this.loading = false;

        },

        error: (err) => {

          this.loading = false;

          this.error =
            err?.error?.detail ||
            'Failed to load shifts.';

        }

      });

  }


  openCreateModal(): void {

    this.error = '';

    this.message = '';

    this.newShift = {

      shiftName: 'Morning Shift',

      startTime: '08:00',

      endTime: '17:00',

      projectId: '',

      shiftDate:
        new Date().toISOString().split('T')[0],

      shiftStatus: 'Scheduled',

      location: ''

    };

    this.showCreateModal = true;

  }


  closeCreateModal(): void {

    if (this.saving) {
      return;
    }

    this.showCreateModal = false;

  }


  submitCreateShift(): void {

    this.error = '';

    this.message = '';


    if (
      !this.newShift.shiftName ||
      !this.newShift.projectId ||
      !this.newShift.shiftDate ||
      !this.newShift.startTime ||
      !this.newShift.endTime
    ) {

      this.error =
        'Shift name, project, date, start time and end time are required.';

      return;

    }


    if (
      this.newShift.endTime <=
      this.newShift.startTime
    ) {

      this.error =
        'End time must be later than start time.';

      return;

    }


    this.saving = true;


    this.workforceService
      .createShift(this.newShift)
      .subscribe({

        next: () => {

          this.saving = false;

          this.showCreateModal = false;

          this.message =
            'Shift schedule created successfully.';

          this.loadShifts();

        },

        error: (err) => {

          this.saving = false;

          this.error =
            err?.error?.detail ||
            'Failed to create shift.';

        }

      });

  }


  openAssignModal(shift: Shift): void {

    this.selectedShift = shift;

    this.selectedWorkerIds = [];

    this.error = '';

    this.message = '';

    /*
     * Part 2 rule:
     *
     * Worker must already be allocated
     * to the same project before being
     * assigned to the shift.
     */

    if (!shift.projectId) {

      this.projectWorkers = [];

      this.error =
        'This shift is not linked to a project.';

      return;

    }


    this.showAssignModal = true;


    this.workforceService
      .getAssignments({

        projectId: shift.projectId,

        assignmentStatus: 'Active'

      })
      .subscribe({

        next: (assignments) => {

          const workerIds =
            new Set(
              (assignments || [])
                .map(a => a.workerId)
            );


          this.projectWorkers =
            this.availableWorkers.filter(
              worker =>
                workerIds.has(worker.id)
            );


          const alreadyAssigned =
            new Set(
              (shift.assignedWorkers || [])
                .map(w => w.workerId)
            );


          this.projectWorkers =
            this.projectWorkers.filter(
              worker =>
                !alreadyAssigned.has(worker.id)
            );

        },

        error: (err) => {

          this.projectWorkers = [];

          this.error =
            err?.error?.detail ||
            'Unable to load workers allocated to this project.';

        }

      });

  }


  toggleWorkerSelection(workerId: string): void {

    const index =
      this.selectedWorkerIds.indexOf(workerId);


    if (index >= 0) {

      this.selectedWorkerIds.splice(index, 1);

    } else {

      this.selectedWorkerIds.push(workerId);

    }

  }


  submitAssignCrew(): void {

    if (
      !this.selectedShift ||
      this.selectedWorkerIds.length === 0
    ) {

      return;

    }


    this.saving = true;

    this.error = '';

    this.message = '';


    this.workforceService
      .assignWorkersToShift(

        this.selectedShift.id,

        this.selectedWorkerIds

      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.showAssignModal = false;

          this.message =
            'Workers assigned to the shift successfully.';

          this.loadShifts();

        },

        error: (err) => {

          this.saving = false;

          this.error =
            err?.error?.detail ||
            'Failed to assign workers to shift.';

        }

      });

  }


  removeWorkerFromShift(
    shiftId: string,
    workerId: string
  ): void {

    if (
      !confirm(
        'Remove this worker from the shift?'
      )
    ) {

      return;

    }


    this.error = '';

    this.message = '';


    this.workforceService
      .removeWorkerFromShift(
        shiftId,
        workerId
      )
      .subscribe({

        next: () => {

          this.message =
            'Worker removed from shift roster.';

          this.loadShifts();

        },

        error: (err) => {

          this.error =
            err?.error?.detail ||
            'Failed to remove worker from shift.';

        }

      });

  }


  updateStatus(
    shiftId: string,
    status: string
  ): void {

    this.error = '';

    this.message = '';


    this.workforceService
      .updateShift(

        shiftId,

        {
          shiftStatus: status
        }

      )
      .subscribe({

        next: () => {

          this.message =
            `Shift status updated to ${status}.`;

          this.loadShifts();

        },

        error: (err) => {

          this.error =
            err?.error?.detail ||
            'Failed to update shift status.';

        }

      });

  }


  closeAssignModal(): void {

    if (this.saving) {
      return;
    }

    this.showAssignModal = false;

    this.selectedShift = null;

    this.selectedWorkerIds = [];

    this.projectWorkers = [];

  }

}
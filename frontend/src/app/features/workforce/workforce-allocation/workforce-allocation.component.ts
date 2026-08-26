import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

import { WorkforceService } from '../../../core/services/workforce.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';

import {
  Worker,
  WorkerProjectAssignment,
  WorkerTransferRequest
} from '../../../core/models/workforce.model';

import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-workforce-allocation',
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
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

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
                    Workforce Allocation
                  </li>
                </ol>
              </nav>

              <h2 class="fw-bold mb-1">
                <i class="bi bi-diagram-3-fill me-2 text-warning"></i>
                Workforce Allocation
              </h2>

              <p class="text-muted small mb-0">
                Assign workers to projects and contractors and maintain assignment history.
              </p>
            </div>

            <button
              class="btn btn-bt-accent"
              (click)="openAssignModal()">

              <i class="bi bi-plus-circle-fill me-1"></i>
              New Assignment

            </button>

          </div>

          <!-- MESSAGE -->
          <div
            *ngIf="message"
            class="alert alert-success alert-dismissible fade show">

            {{ message }}

            <button
              type="button"
              class="btn-close"
              (click)="message = ''">
            </button>

          </div>

          <!-- ERROR -->
          <div
            *ngIf="error"
            class="alert alert-danger alert-dismissible fade show">

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
                  (change)="loadAssignments()">

                  <option value="">
                    All Projects
                  </option>

                  <option
                    *ngFor="let project of projects"
                    [value]="project.id">

                    {{ project.projectName }}
                    <span *ngIf="project.projectCode">
                      ({{ project.projectCode }})
                    </span>

                  </option>

                </select>

              </div>

              <div class="col-md-4">

                <label class="form-label small fw-bold">
                  Contractor
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="filterContractorId"
                  (change)="loadAssignments()">

                  <option value="">
                    All Contractors
                  </option>

                  <option
                    *ngFor="let contractor of contractors"
                    [value]="contractor.id">

                    {{ contractor.fullName }}

                  </option>

                </select>

              </div>

              <div class="col-md-4">

                <label class="form-label small fw-bold">
                  Assignment Status
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="filterStatus"
                  (change)="loadAssignments()">

                  <option value="">
                    All Status
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Transferred">
                    Transferred
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
              Loading workforce allocations...
            </p>

          </div>

          <!-- ASSIGNMENT TABLE -->
          <div
            *ngIf="!loading"
            class="card card-custom border-0 shadow-sm">

            <div class="card-header bg-white border-0 p-4">

              <div class="d-flex justify-content-between align-items-center">

                <div>

                  <h5 class="fw-bold mb-1">
                    Project Workforce Allocation
                  </h5>

                  <p class="text-muted small mb-0">
                    Worker → Contractor → Project → Activity
                  </p>

                </div>

                <span class="badge bg-dark">
                  {{ assignments.length }} Assignments
                </span>

              </div>

            </div>

            <div class="table-responsive">

              <table class="table table-hover align-middle mb-0">

                <thead class="table-light">

                  <tr>

                    <th>Worker</th>
                    <th>Project</th>
                    <th>Contractor</th>
                    <th>Activity</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  <tr *ngFor="let assignment of assignments">

                    <td>

                      <a
                        [routerLink]="[
                          '/workforce/workers',
                          assignment.workerId
                        ]"
                        class="text-decoration-none text-dark fw-bold">

                        {{ assignment.workerName }}

                      </a>

                      <div class="small text-muted">
                        {{ assignment.workerCode }}
                      </div>

                    </td>

                    <td>

                      <div class="fw-semibold">
                        {{ assignment.projectName || '-' }}
                      </div>

                      <div class="small text-muted">
                        {{ assignment.projectCode || '' }}
                      </div>

                    </td>

                    <td>
                      {{ assignment.contractorName || 'Direct Labor' }}
                    </td>

                    <td>
                      <span class="badge bg-light text-dark border">
                        {{ assignment.workActivity || 'General' }}
                      </span>
                    </td>

                    <td>
                      {{ assignment.assignmentStartDate }}
                    </td>

                    <td>
                      {{ assignment.assignmentEndDate || 'Present' }}
                    </td>

                    <td>

                      <span
                        class="badge"
                        [ngClass]="{
                          'bg-success':
                            assignment.assignmentStatus === 'Active',

                          'bg-secondary':
                            assignment.assignmentStatus === 'Completed',

                          'bg-info text-dark':
                            assignment.assignmentStatus === 'Transferred',

                          'bg-danger':
                            assignment.assignmentStatus === 'Cancelled'
                        }">

                        {{ assignment.assignmentStatus }}

                      </span>

                    </td>

                    <td>

                      <button
                        *ngIf="assignment.assignmentStatus === 'Active'"
                        class="btn btn-sm btn-outline-warning"
                        (click)="openTransferModal(assignment)">

                        <i class="bi bi-arrow-left-right me-1"></i>
                        Transfer

                      </button>

                    </td>

                  </tr>

                  <tr *ngIf="assignments.length === 0">

                    <td
                      colspan="8"
                      class="text-center py-5 text-muted">

                      <i class="bi bi-people fs-1 d-block mb-2"></i>

                      No workforce assignments found.

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>
    </div>


    <!-- ================================================= -->
    <!-- NEW ASSIGNMENT MODAL -->
    <!-- ================================================= -->

    <div
      *ngIf="showAssignModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0,0,0,.55);">

      <div class="modal-dialog modal-dialog-centered">

        <div class="modal-content border-0 shadow-lg">

          <div class="modal-header bg-dark text-white">

            <h5 class="modal-title">
              <i class="bi bi-person-plus-fill text-warning me-2"></i>
              Assign Worker to Project
            </h5>

            <button
              type="button"
              class="btn-close btn-close-white"
              (click)="closeModals()">
            </button>

          </div>

          <form (ngSubmit)="submitAssign()">

            <div class="modal-body p-4">

              <div class="mb-3">

                <label class="form-label fw-bold">
                  Worker *
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="newAssign.workerId"
                  name="workerId"
                  required>

                  <option value="">
                    Select Worker
                  </option>

                  <option
                    *ngFor="let worker of availableWorkers"
                    [value]="worker.id">

                    {{ worker.workerName }}
                    ({{ worker.workerId }})

                  </option>

                </select>

              </div>

              <div class="mb-3">

                <label class="form-label fw-bold">
                  Project *
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="newAssign.projectId"
                  name="projectId"
                  required>

                  <option value="">
                    Select Project
                  </option>

                  <option
                    *ngFor="let project of projects"
                    [value]="project.id">

                    {{ project.projectName }}

                  </option>

                </select>

              </div>

              <div class="mb-3">

                <label class="form-label fw-bold">
                  Contractor
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="newAssign.contractorId"
                  name="contractorId">

                  <option value="">
                    Direct Labor / No Contractor
                  </option>

                  <option
                    *ngFor="let contractor of contractors"
                    [value]="contractor.id">

                    {{ contractor.fullName }}

                  </option>

                </select>

              </div>

              <div class="mb-3">

                <label class="form-label fw-bold">
                  Work Activity
                </label>

                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="newAssign.workActivity"
                  name="workActivity"
                  placeholder="e.g. Masonry, Electrical, Excavation">

              </div>

              <div class="row g-3">

                <div class="col-md-6">

                  <label class="form-label fw-bold">
                    Start Date *
                  </label>

                  <input
                    type="date"
                    class="form-control"
                    [(ngModel)]="newAssign.assignmentStartDate"
                    name="assignmentStartDate"
                    required>

                </div>

                <div class="col-md-6">

                  <label class="form-label fw-bold">
                    End Date
                  </label>

                  <input
                    type="date"
                    class="form-control"
                    [(ngModel)]="newAssign.assignmentEndDate"
                    name="assignmentEndDate">

                </div>

              </div>

            </div>

            <div class="modal-footer">

              <button
                type="button"
                class="btn btn-light"
                (click)="closeModals()">

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

                Assign Worker

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- TRANSFER MODAL -->
    <!-- ================================================= -->

    <div
      *ngIf="showTransferModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0,0,0,.55);">

      <div class="modal-dialog modal-dialog-centered">

        <div class="modal-content border-0 shadow-lg">

          <div class="modal-header bg-dark text-white">

            <h5 class="modal-title">
              <i class="bi bi-arrow-left-right text-warning me-2"></i>
              Transfer Worker
            </h5>

            <button
              type="button"
              class="btn-close btn-close-white"
              (click)="closeModals()">
            </button>

          </div>

          <form (ngSubmit)="submitTransfer()">

            <div class="modal-body p-4">

              <div
                *ngIf="selectedAssign"
                class="alert alert-light border">

                <strong>
                  {{ selectedAssign.workerName }}
                </strong>

                <div class="small text-muted">
                  Current Project:
                  {{ selectedAssign.projectName }}
                </div>

              </div>

              <div class="mb-3">

                <label class="form-label fw-bold">
                  New Project *
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="transferReq.newProjectId"
                  name="newProjectId"
                  required>

                  <option value="">
                    Select New Project
                  </option>

                  <option
                    *ngFor="let project of projects"
                    [value]="project.id">

                    {{ project.projectName }}

                  </option>

                </select>

              </div>

              <div class="mb-3">

                <label class="form-label fw-bold">
                  New Contractor
                </label>

                <select
                  class="form-select"
                  [(ngModel)]="transferReq.newContractorId"
                  name="newContractorId">

                  <option value="">
                    Direct Labor / No Contractor
                  </option>

                  <option
                    *ngFor="let contractor of contractors"
                    [value]="contractor.id">

                    {{ contractor.fullName }}

                  </option>

                </select>

              </div>

              <div class="mb-3">

                <label class="form-label fw-bold">
                  New Work Activity
                </label>

                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="transferReq.newWorkActivity"
                  name="newWorkActivity">

              </div>

              <div class="mb-3">

                <label class="form-label fw-bold">
                  Transfer Date *
                </label>

                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="transferReq.transferDate"
                  name="transferDate"
                  required>

              </div>

              <div class="alert alert-warning small mb-0">

                <i class="bi bi-info-circle me-1"></i>

                The current assignment will be closed and a new
                assignment will be created, preserving the worker's
                assignment history.

              </div>

            </div>

            <div class="modal-footer">

              <button
                type="button"
                class="btn btn-light"
                (click)="closeModals()">

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

                Transfer Worker

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }

    .table td {
      vertical-align: middle;
    }
  `]
})
export class WorkforceAllocationComponent implements OnInit {

  assignments: WorkerProjectAssignment[] = [];

  projects: Project[] = [];

  contractors: any[] = [];

  availableWorkers: Worker[] = [];

  filterProjectId = '';
  filterContractorId = '';
  filterStatus = '';

  loading = false;
  saving = false;

  message = '';
  error = '';

  showAssignModal = false;
  showTransferModal = false;

  selectedAssign: WorkerProjectAssignment | null = null;

  newAssign: any = {
    workerId: '',
    projectId: '',
    contractorId: '',
    workActivity: '',
    assignmentStartDate: new Date().toISOString().split('T')[0],
    assignmentEndDate: '',
    assignmentStatus: 'Active'
  };

  transferReq: WorkerTransferRequest = {
    newProjectId: '',
    newContractorId: '',
    newWorkActivity: '',
    transferDate: new Date().toISOString().split('T')[0]
  };

  constructor(
    private workforceService: WorkforceService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {

    this.loadProjects();
    this.loadContractors();
    this.loadWorkers();
    this.loadAssignments();

  }

  loadProjects(): void {

    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data || [];
      },
      error: () => {
        this.projects = [];
      }
    });

  }

  loadContractors(): void {

    this.userService.getUsers('Contractor').subscribe({
      next: (data) => {
        this.contractors = data || [];
      },
      error: () => {
        this.contractors = [];
      }
    });

  }

  loadWorkers(): void {

    this.workforceService.getWorkers({
      pageSize: 500
    }).subscribe({
      next: (data) => {
        this.availableWorkers = data?.items || [];
      },
      error: () => {
        this.availableWorkers = [];
      }
    });

  }

  loadAssignments(): void {

    this.loading = true;
    this.error = '';

    this.workforceService.getAssignments({
      projectId: this.filterProjectId || undefined,
      contractorId: this.filterContractorId || undefined,
      assignmentStatus: this.filterStatus || undefined
    }).subscribe({

      next: (data) => {

        this.assignments = data || [];
        this.loading = false;

      },

      error: (err) => {

        this.loading = false;

        this.error =
          err?.error?.detail ||
          'Failed to load workforce assignments.';

      }

    });

  }

  openAssignModal(): void {

    this.error = '';
    this.message = '';

    this.newAssign = {
      workerId: '',
      projectId: '',
      contractorId: '',
      workActivity: '',
      assignmentStartDate:
        new Date().toISOString().split('T')[0],
      assignmentEndDate: '',
      assignmentStatus: 'Active'
    };

    this.showAssignModal = true;

  }

  submitAssign(): void {

    if (
      !this.newAssign.workerId ||
      !this.newAssign.projectId ||
      !this.newAssign.assignmentStartDate
    ) {

      this.error =
        'Worker, Project and Start Date are required.';

      return;

    }

    this.saving = true;
    this.error = '';
    this.message = '';

    this.workforceService
      .createAssignment(this.newAssign)
      .subscribe({

        next: () => {

          this.saving = false;
          this.showAssignModal = false;

          this.message =
            'Worker successfully assigned to the project.';

          this.loadAssignments();

        },

        error: (err) => {

          this.saving = false;

          this.error =
            err?.error?.detail ||
            'Failed to create worker assignment.';

        }

      });

  }

  openTransferModal(
    assignment: WorkerProjectAssignment
  ): void {

    this.selectedAssign = assignment;

    this.transferReq = {

      newProjectId: '',
      newContractorId:
        assignment.contractorId || '',

      newWorkActivity:
        assignment.workActivity || '',

      transferDate:
        new Date().toISOString().split('T')[0]

    };

    this.error = '';
    this.message = '';

    this.showTransferModal = true;

  }

  submitTransfer(): void {

    if (
      !this.selectedAssign ||
      !this.transferReq.newProjectId ||
      !this.transferReq.transferDate
    ) {

      this.error =
        'New Project and Transfer Date are required.';

      return;

    }

    this.saving = true;
    this.error = '';
    this.message = '';

    this.workforceService
      .transferWorker(
        this.selectedAssign.id,
        this.transferReq
      )
      .subscribe({

        next: () => {

          this.saving = false;
          this.showTransferModal = false;

          this.message =
            `Worker ${this.selectedAssign?.workerName} transferred successfully. Assignment history has been preserved.`;

          this.loadAssignments();

        },

        error: (err: HttpErrorResponse) => {

          this.saving = false;

          this.error =
            err?.error?.detail ||
            'Failed to transfer worker.';

        }

      });

  }

  closeModals(): void {

    if (this.saving) {
      return;
    }

    this.showAssignModal = false;
    this.showTransferModal = false;

    this.selectedAssign = null;

  }

}
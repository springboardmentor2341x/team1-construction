import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { ScheduleService } from '../../../core/services/schedule.service';
import { ProjectService } from '../../../core/services/project.service';
import { ProjectSchedule } from '../../../core/models/schedule.model';
import { Project } from '../../../core/models/project.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-project-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-0">Project Scheduling Management</h2>
              <p class="text-muted small">Define project execution phases, estimated timeline durations, & Gantt milestones.</p>
            </div>
            <button *ngIf="canManage()" (click)="openCreateModal()" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" data-bs-toggle="modal" data-bs-target="#scheduleModal">
              <i class="bi bi-plus-circle-fill"></i> Create Phase Schedule
            </button>
          </div>

          <!-- Project Filter Selector -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row align-items-center">
              <div class="col-md-6">
                <label class="form-label fw-semibold small mb-1">Select Active Project</label>
                <select (change)="onProjectSelect($event)" class="form-select">
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Schedules List Table -->
          <div class="card card-custom border-0 p-4">
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light small text-muted">
                  <tr>
                    <th>Phase Name</th>
                    <th>Scope Description</th>
                    <th>Planned Start</th>
                    <th>Planned End</th>
                    <th>Est. Duration</th>
                    <th *ngIf="canManage()" class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let s of schedules">
                    <td class="fw-bold text-dark">{{ s.phaseName }}</td>
                    <td class="text-muted">{{ s.description }}</td>
                    <td><i class="bi bi-calendar-event text-success me-1"></i> {{ s.plannedStartDate }}</td>
                    <td><i class="bi bi-calendar-check text-danger me-1"></i> {{ s.plannedEndDate }}</td>
                    <td><span class="badge bg-warning text-dark px-2 py-1">{{ s.estimatedDurationDays }} Days</span></td>
                    <td *ngIf="canManage()" class="text-end">
                      <button (click)="openEditModal(s)" class="btn btn-sm btn-outline-warning me-1" data-bs-toggle="modal" data-bs-target="#scheduleModal">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button (click)="deleteSchedule(s.id)" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="schedules.length === 0">
                    <td [attr.colspan]="canManage() ? 6 : 5" class="text-center py-4 text-muted">
                      No schedule phases defined for this project yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div class="modal fade" id="scheduleModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark">{{ editingId ? 'Edit Schedule Phase' : 'Create New Phase Schedule' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form [formGroup]="scheduleForm" (ngSubmit)="saveSchedule()">
            <div class="modal-body p-4 space-y-3">
              <div>
                <label class="form-label fw-semibold small">Phase Name *</label>
                <input type="text" formControlName="phaseName" class="form-control" placeholder="Phase 1: Deep Excavation">
              </div>

              <div>
                <label class="form-label fw-semibold small">Planned Start Date *</label>
                <input type="date" formControlName="plannedStartDate" class="form-control">
              </div>

              <div>
                <label class="form-label fw-semibold small">Planned End Date *</label>
                <input type="date" formControlName="plannedEndDate" class="form-control">
              </div>

              <div>
                <label class="form-label fw-semibold small">Phase Description</label>
                <textarea formControlName="description" class="form-control" rows="3" placeholder="Summary of civil engineering activities..."></textarea>
              </div>
            </div>
            <div class="modal-footer border-top px-4 py-3">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" [disabled]="scheduleForm.invalid" class="btn btn-bt-accent" data-bs-dismiss="modal">
                Save Phase Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .space-y-3 > * + * { margin-top: 0.75rem; }
  `]
})
export class ProjectScheduleComponent implements OnInit {
  projects: Project[] = [];
selectedProjectId = '';
  schedules: ProjectSchedule[] = [];
  scheduleForm: FormGroup;
  editingId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {
    this.scheduleForm = this.fb.group({
      phaseName: ['', [Validators.required]],
      plannedStartDate: ['', [Validators.required]],
      plannedEndDate: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projs => {
      this.projects = projs;
      if (projs.length) {
        this.selectedProjectId = projs[0].id;
        this.loadSchedules();
      }
    });
  }

  onProjectSelect(event: any): void {
    this.selectedProjectId = event.target.value;
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.scheduleService.getSchedulesByProject(this.selectedProjectId).subscribe(s => this.schedules = s);
  }

  canManage(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  openCreateModal(): void {
    this.editingId = null;
    const today = new Date().toISOString().split('T')[0];
    this.scheduleForm.reset({
      phaseName: '',
      plannedStartDate: today,
      plannedEndDate: today,
      description: ''
    });
  }

  openEditModal(sch: ProjectSchedule): void {
    this.editingId = sch.id;
    this.scheduleForm.patchValue({
      phaseName: sch.phaseName,
      plannedStartDate: sch.plannedStartDate,
      plannedEndDate: sch.plannedEndDate,
      description: sch.description
    });
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) return;

    const payload = {
      ...this.scheduleForm.value,
      projectId: this.selectedProjectId
    };

    if (this.editingId) {
      this.scheduleService.updateSchedule(this.editingId, payload).subscribe(() => this.loadSchedules());
    } else {
      this.scheduleService.createSchedule(payload).subscribe(() => this.loadSchedules());
    }
  }

  deleteSchedule(id: string): void {
    if (confirm('Are you sure you want to delete this schedule phase?')) {
      this.scheduleService.deleteSchedule(id).subscribe(() => this.loadSchedules());
    }
  }
}

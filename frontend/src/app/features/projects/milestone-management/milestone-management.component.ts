import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { MilestoneService } from '../../../core/services/milestone.service';
import { ProjectService } from '../../../core/services/project.service';
import { Milestone, MilestoneStatus } from '../../../core/models/milestone.model';
import { Project } from '../../../core/models/project.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-milestone-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent, StatusBadgeComponent],
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
              <h2 class="fw-bold text-dark mb-0">Project Milestone Management</h2>
              <p class="text-muted small">Track target completion dates, % progress velocity, & milestone status updates.</p>
            </div>
            <button *ngIf="canManage()" (click)="openCreateModal()" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" data-bs-toggle="modal" data-bs-target="#milestoneModal">
              <i class="bi bi-flag-fill"></i> Create New Milestone
            </button>
          </div>

          <!-- Project Filter -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row align-items-center">
              <div class="col-md-6">
                <label class="form-label fw-semibold small mb-1">Select Project</label>
                <select (change)="onProjectSelect($event)" class="form-select">
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Milestones Cards & List -->
          <div class="row g-3">
            <div class="col-12" *ngFor="let m of milestones">
              <div class="card card-custom border-0 p-4">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <h5 class="fw-bold text-dark mb-0">{{ m.milestoneName }}</h5>
                    <app-status-badge [status]="m.status"></app-status-badge>
                  </div>
                  <div *ngIf="canManage()" class="btn-group">
                    <button (click)="openEditModal(m)" class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#milestoneModal">
                      <i class="bi bi-pencil me-1"></i> Edit Status
                    </button>
                    <button (click)="deleteMilestone(m.id)" class="btn btn-sm btn-outline-danger">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>

                <p class="text-muted small mb-3">{{ m.description }}</p>

                <div class="progress mb-2" style="height: 12px;">
                  <div class="progress-bar bg-warning" [style.width.%]="m.completionPercentage">
                    {{ m.completionPercentage }}%
                  </div>
                </div>

                <div class="d-flex flex-wrap justify-content-between extra-small text-muted border-top pt-2 mt-2">
                  <span>Planned Target Date: <strong>{{ m.plannedDate }}</strong></span>
                  <span>Actual Completion Date: <strong>{{ m.actualCompletionDate || 'Pending' }}</strong></span>
                  <span>Completion Status: <strong>{{ m.completionPercentage }}% Verified</strong></span>
                </div>
              </div>
            </div>

            <div *ngIf="milestones.length === 0" class="col-12 text-center py-5 text-muted">
              <i class="bi bi-flag fs-1 text-secondary d-block mb-2"></i>
              No milestones created for this project yet.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Milestone Modal -->
    <div class="modal fade" id="milestoneModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark">{{ editingId ? 'Update Milestone Status' : 'Create New Milestone' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form [formGroup]="milestoneForm" (ngSubmit)="saveMilestone()">
            <div class="modal-body p-4 space-y-3">
              <div>
                <label class="form-label fw-semibold small">Milestone Name *</label>
                <input type="text" formControlName="milestoneName" class="form-control" placeholder="e.g. Substructure Slab Pour">
              </div>

              <div>
                <label class="form-label fw-semibold small">Planned Date *</label>
                <input type="date" formControlName="plannedDate" class="form-control">
              </div>

              <div>
                <label class="form-label fw-semibold small">Actual Completion Date (If completed)</label>
                <input type="date" formControlName="actualCompletionDate" class="form-control">
              </div>

              <div>
                <label class="form-label fw-semibold small">Completion Percentage (0-100%) *</label>
                <input type="number" formControlName="completionPercentage" min="0" max="100" class="form-control">
              </div>

              <div>
                <label class="form-label fw-semibold small">Milestone Status *</label>
                <select formControlName="status" class="form-select">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              <div>
                <label class="form-label fw-semibold small">Description</label>
                <textarea formControlName="description" class="form-control" rows="3"></textarea>
              </div>
            </div>
            <div class="modal-footer border-top px-4 py-3">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" [disabled]="milestoneForm.invalid" class="btn btn-bt-accent" data-bs-dismiss="modal">
                Save Milestone
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.78rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
  `]
})
export class MilestoneManagementComponent implements OnInit {
  projects: Project[] = [];
selectedProjectId = '';
  milestones: Milestone[] = [];
  milestoneForm: FormGroup;
  editingId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private milestoneService: MilestoneService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {
    this.milestoneForm = this.fb.group({
      milestoneName: ['', [Validators.required]],
      plannedDate: ['', [Validators.required]],
      actualCompletionDate: [''],
      completionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      status: ['Pending', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projs => {
      this.projects = projs;
      if (projs.length) {
        this.selectedProjectId = projs[0].id;
        this.loadMilestones();
      }
    });
  }

  onProjectSelect(event: any): void {
    this.selectedProjectId = event.target.value;
    this.loadMilestones();
  }

  loadMilestones(): void {
    this.milestoneService.getMilestonesByProject(this.selectedProjectId).subscribe(m => this.milestones = m);
  }

  canManage(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  openCreateModal(): void {
    this.editingId = null;
    const today = new Date().toISOString().split('T')[0];
    this.milestoneForm.reset({
      milestoneName: '',
      plannedDate: today,
      actualCompletionDate: '',
      completionPercentage: 0,
      status: 'Pending',
      description: ''
    });
  }

  openEditModal(m: Milestone): void {
    this.editingId = m.id;
    this.milestoneForm.patchValue({
      milestoneName: m.milestoneName,
      plannedDate: m.plannedDate,
      actualCompletionDate: m.actualCompletionDate,
      completionPercentage: m.completionPercentage,
      status: m.status,
      description: m.description
    });
  }

  saveMilestone(): void {
    if (this.milestoneForm.invalid) return;

    const payload = {
      ...this.milestoneForm.value,
      projectId: this.selectedProjectId
    };

    if (this.editingId) {
      this.milestoneService.updateMilestone(this.editingId, payload).subscribe(() => this.loadMilestones());
    } else {
      this.milestoneService.createMilestone(payload).subscribe(() => this.loadMilestones());
    }
  }

  deleteMilestone(id: string): void {
    if (confirm('Are you sure you want to delete this milestone?')) {
      this.milestoneService.deleteMilestone(id).subscribe(() => this.loadMilestones());
    }
  }
}

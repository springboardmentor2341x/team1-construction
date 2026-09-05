import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { UserRole } from '../../../core/models/role.enum';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-project-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-0">Update Project Details</h2>
              <p class="text-muted small">Edit budget allocations, execution status, timeline milestones, & assigned personnel.</p>
            </div>
            <a routerLink="/projects" class="btn btn-outline-secondary btn-sm"><i class="bi bi-arrow-left me-1"></i> Back to List</a>
          </div>

          <div class="card card-custom border-0 p-4" *ngIf="updateForm">
            <form [formGroup]="updateForm" (ngSubmit)="onSubmit()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Project Name</label>
                  <input type="text" formControlName="projectName" class="form-control">
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Project Code (Read-Only)</label>
                  <input type="text" formControlName="projectCode" class="form-control bg-light" readonly>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Category</label>
                  <select formControlName="category" class="form-select">
                    <option value="Commercial High-Rise">Commercial High-Rise</option>
                    <option value="Infrastructure & Transit">Infrastructure & Transit</option>
                    <option value="Residential Complex">Residential Complex</option>
                    <option value="Healthcare Facility">Healthcare Facility</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Assigned Project Manager</label>
                  <select formControlName="projectManagerId" (change)="onPMChange($event)" class="form-select">
                    <option *ngFor="let pm of projectManagers" [value]="pm.id">{{ pm.fullName }}</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Estimated Budget (₹ INR)</label>
                  <input type="number" formControlName="estimatedBudget" class="form-control">
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Project Status</label>
                  <select formControlName="status" class="form-select">
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Start Date</label>
                  <input type="date" formControlName="startDate" class="form-control">
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Expected Completion Date</label>
                  <input type="date" formControlName="expectedCompletionDate" class="form-control">
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Priority Level</label>
                  <select formControlName="priority" class="form-select">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold small">Project Description</label>
                  <textarea formControlName="description" class="form-control" rows="3"></textarea>
                </div>
              </div>

              <div class="mt-4 text-end">
                <button type="button" routerLink="/projects" class="btn btn-outline-secondary me-2">Cancel</button>
                <button type="submit" [disabled]="updateForm.invalid || isSubmitting" class="btn btn-bt-accent px-4">
                  <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                  Save Project Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectUpdateComponent implements OnInit {
  projectId = '';
  updateForm!: FormGroup;
  projectManagers: User[] = [];
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    this.userService.getUsersByRole(UserRole.PROJECT_MANAGER).subscribe(pmList => this.projectManagers = pmList);

    this.projectService.getProjectById(this.projectId).subscribe(proj => {
      if (proj) {
        this.updateForm = this.fb.group({
          projectName: [proj.projectName, [Validators.required]],
          projectCode: [proj.projectCode],
          category: [proj.category, [Validators.required]],
          estimatedBudget: [proj.estimatedBudget, [Validators.required]],
          startDate: [proj.startDate, [Validators.required]],
          expectedCompletionDate: [proj.expectedCompletionDate, [Validators.required]],
          priority: [proj.priority, [Validators.required]],
          status: [proj.status, [Validators.required]],
          projectManagerId: [proj.projectManagerId, [Validators.required]],
          projectManagerName: [proj.projectManagerName],
          description: [proj.description]
        });
      }
    });
  }

  onPMChange(event: any): void {
    const selectedId = event.target.value;
    const found = this.projectManagers.find(pm => pm.id === selectedId);
    if (found) {
      this.updateForm.patchValue({ projectManagerName: found.fullName });
    }
  }

  onSubmit(): void {
    if (this.updateForm.invalid) return;

    this.isSubmitting = true;
    this.projectService.updateProject(this.projectId, this.updateForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/projects', this.projectId]);
      },
      error: () => { this.isSubmitting = false; }
    });
  }
}

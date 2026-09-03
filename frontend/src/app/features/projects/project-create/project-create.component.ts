import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { UserRole } from '../../../core/models/role.enum';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-project-create',
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
              <span class="badge bg-danger text-white mb-1">Admin Privilege</span>
              <h2 class="fw-bold text-dark mb-0">Create New Construction Project</h2>
              <p class="text-muted small">Initialize project metadata, location, timeline budgets, & assign Project Manager.</p>
            </div>
            <a routerLink="/projects" class="btn btn-outline-secondary btn-sm"><i class="bi bi-arrow-left me-1"></i> Back to List</a>
          </div>

          <div class="card card-custom border-0 p-4">
            <form [formGroup]="createForm" (ngSubmit)="onSubmit()">
              <div class="row g-3">
                <!-- Project Name -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Project Name *</label>
                  <input type="text" formControlName="projectName" class="form-control" placeholder="e.g. Skyline Metropolis Tower"
                    [class.is-invalid]="f['projectName'].touched && f['projectName'].invalid">
                  <div *ngIf="f['projectName'].touched && f['projectName'].errors" class="invalid-feedback small">
                    Project name is required.
                  </div>
                </div>

                <!-- Project Code -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Project Code *</label>
                  <input type="text" formControlName="projectCode" class="form-control" placeholder="e.g. BT-PRJ-2026-05"
                    [class.is-invalid]="f['projectCode'].touched && f['projectCode'].invalid">
                  <div *ngIf="f['projectCode'].touched && f['projectCode'].errors" class="invalid-feedback small">
                    Project code is required.
                  </div>
                </div>

                <!-- Category -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Project Category *</label>
                  <select formControlName="category" class="form-select" [class.is-invalid]="f['category'].touched && f['category'].invalid">
                    <option value="">Select Category</option>
                    <option value="Commercial High-Rise">Commercial High-Rise</option>
                    <option value="Infrastructure & Transit">Infrastructure & Transit</option>
                    <option value="Residential Complex">Residential Complex</option>
                    <option value="Healthcare Facility">Healthcare Facility</option>
                    <option value="Industrial Plant">Industrial Plant</option>
                  </select>
                  <div *ngIf="f['category'].touched && f['category'].errors" class="invalid-feedback small">
                    Category is required.
                  </div>
                </div>

                <!-- Assign Project Manager -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Assign Project Manager *</label>
                  <select formControlName="projectManagerId" (change)="onPMChange($event)" class="form-select" [class.is-invalid]="f['projectManagerId'].touched && f['projectManagerId'].invalid">
                    <option value="">Select Manager</option>
                    <option *ngFor="let pm of projectManagers" [value]="pm.id">{{ pm.fullName }} ({{ pm.employeeId }})</option>
                  </select>
                  <div *ngIf="f['projectManagerId'].touched && f['projectManagerId'].errors" class="invalid-feedback small">
                    Project Manager selection is required.
                  </div>
                </div>

                <!-- Client Name -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Client Name / Organization *</label>
                  <input type="text" formControlName="clientName" class="form-control" placeholder="e.g. Apex Real Estate Holdings"
                    [class.is-invalid]="f['clientName'].touched && f['clientName'].invalid">
                  <div *ngIf="f['clientName'].touched && f['clientName'].errors" class="invalid-feedback small">
                    Client name is required.
                  </div>
                </div>

                <!-- Client Contact -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Client Contact Info</label>
                  <input type="text" formControlName="clientContact" class="form-control" placeholder="+1 (555) 014-7000">
                </div>

                <!-- Location -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Project Location / Site Address *</label>
                  <input type="text" formControlName="location" class="form-control" placeholder="742 Executive Parkway"
                    [class.is-invalid]="f['location'].touched && f['location'].invalid">
                  <div *ngIf="f['location'].touched && f['location'].errors" class="invalid-feedback small">
                    Site location is required.
                  </div>
                </div>

                <!-- Estimated Budget -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Estimated Budget ($ USD) *</label>
                  <input type="number" formControlName="estimatedBudget" class="form-control" placeholder="45000000"
                    [class.is-invalid]="f['estimatedBudget'].touched && f['estimatedBudget'].invalid">
                  <div *ngIf="f['estimatedBudget'].touched && f['estimatedBudget'].errors" class="invalid-feedback small">
                    <span *ngIf="f['estimatedBudget'].errors['required']">Budget is required.</span>
                    <span *ngIf="f['estimatedBudget'].errors['min']">Budget must be greater than 0.</span>
                  </div>
                </div>

                <!-- Start Date -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Start Date *</label>
                  <input type="date" formControlName="startDate" class="form-control"
                    [class.is-invalid]="f['startDate'].touched && f['startDate'].invalid">
                  <div *ngIf="f['startDate'].touched && f['startDate'].errors" class="invalid-feedback small">
                    Start date is required.
                  </div>
                </div>

                <!-- Expected Completion Date -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Expected Completion Date *</label>
                  <input type="date" formControlName="expectedCompletionDate" class="form-control"
                    [class.is-invalid]="f['expectedCompletionDate'].touched && (f['expectedCompletionDate'].invalid || createForm.hasError('invalidDates'))">
                  <div *ngIf="createForm.hasError('invalidDates') && f['expectedCompletionDate'].touched" class="invalid-feedback d-block small">
                    Completion date must be after or on the start date.
                  </div>
                </div>

                <!-- Priority -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Priority Level *</label>
                  <select formControlName="priority" class="form-select">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <!-- Initial Status -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Initial Status *</label>
                  <select formControlName="status" class="form-select">
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <!-- Description -->
                <div class="col-12">
                  <label class="form-label fw-semibold small">Project Scope & Technical Description</label>
                  <textarea formControlName="description" class="form-control" rows="4" placeholder="Detail the structural, civil, and architectural scope..."></textarea>
                </div>
              </div>

              <div class="mt-4 text-end">
                <button type="button" routerLink="/projects" class="btn btn-outline-secondary me-2">Cancel</button>
                <button type="submit" [disabled]="createForm.invalid || isSubmitting" class="btn btn-bt-accent px-4 shadow-sm">
                  <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i class="bi bi-floppy-fill me-1"></i> Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectCreateComponent implements OnInit {
  createForm: FormGroup;
  projectManagers: User[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private router: Router
  ) {
    const today = new Date().toISOString().split('T')[0];

    this.createForm = this.fb.group({
      projectName: ['', [Validators.required]],
      projectCode: [`BT-PRJ-2026-${Math.floor(10 + Math.random() * 90)}`, [Validators.required]],
      category: ['Commercial High-Rise', [Validators.required]],
      clientName: ['', [Validators.required]],
      clientContact: [''],
      location: ['', [Validators.required]],
      estimatedBudget: [15000000, [Validators.required, Validators.min(1000)]],
      startDate: [today, [Validators.required]],
      expectedCompletionDate: [today, [Validators.required]],
      priority: ['Medium', [Validators.required]],
      status: ['Planning', [Validators.required]],
      projectManagerId: ['usr-pm-1', [Validators.required]],
      projectManagerName: ['Sarah Jenkins'],
      description: ['']
    }, { validators: this.dateValidator });
  }

  get f() { return this.createForm.controls; }

  ngOnInit(): void {
    this.userService.getUsersByRole(UserRole.PROJECT_MANAGER).subscribe(users => this.projectManagers = users);
  }

  dateValidator(group: AbstractControl) {
    const start = group.get('startDate')?.value;
    const end = group.get('expectedCompletionDate')?.value;
    if (start && end && new Date(end) < new Date(start)) {
      return { invalidDates: true };
    }
    return null;
  }

  onPMChange(event: any): void {
    const selectedId = event.target.value;
    const found = this.projectManagers.find(pm => pm.id === selectedId);
    if (found) {
      this.createForm.patchValue({ projectManagerName: found.fullName });
    }
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.projectService.createProject(this.createForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/projects']);
      },
      error: () => { this.isSubmitting = false; }
    });
  }
}

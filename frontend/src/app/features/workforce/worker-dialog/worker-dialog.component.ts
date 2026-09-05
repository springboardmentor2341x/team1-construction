import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkforceService } from '../../../core/services/workforce.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { Worker, WorkforceCategory } from '../../../core/models/workforce.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-worker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-person-plus-fill me-2 text-warning"></i>
              {{ isEdit ? 'Edit Worker Information' : 'Register New Worker' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="close.emit()"></button>
          </div>

          <div class="modal-body p-4">
            <div *ngIf="error" class="alert alert-danger mb-3 py-2 small">
              <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ error }}
            </div>

            <form (ngSubmit)="saveWorker()">
              <div class="row g-3">
                <!-- Worker ID -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Worker ID <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="formData.workerId" name="workerId" required placeholder="e.g. WRK-2026-101" [disabled]="isEdit">
                </div>

                <!-- Worker Name -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Full Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="formData.workerName" name="workerName" required placeholder="e.g. Samuel Oak">
                </div>

                <!-- Category -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Workforce Category <span class="text-danger">*</span></label>
                  <select class="form-select" [(ngModel)]="formData.workforceCategoryId" name="workforceCategoryId" required>
                    <option value="">-- Select Category --</option>
                    <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                  </select>
                </div>

                <!-- Skill / Work Type -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Skill / Specialization</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.skillOrWorkType" name="skillOrWorkType" placeholder="e.g. Masonry, Electrical, Scaffolding">
                </div>

                <!-- Contact Information -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Contact Phone / Email</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.contactInformation" name="contactInformation" placeholder="e.g. +1 555-0199">
                </div>

                <!-- Contractor -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Contractor Agency</label>
                  <select class="form-select" [(ngModel)]="formData.contractorId" name="contractorId">
                    <option value="">-- Direct Hire / None --</option>
                    <option *ngFor="let c of contractors" [value]="c.id">{{ c.fullName }} ({{ c.email }})</option>
                  </select>
                </div>

                <!-- Joining Date -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Joining Date <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" [(ngModel)]="formData.joiningDate" name="joiningDate" required>
                </div>

                <!-- Worker Status -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Worker Status</label>
                  <select class="form-select" [(ngModel)]="formData.workerStatus" name="workerStatus">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>

                <!-- Daily Pay Rate -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Daily / Hourly Pay Rate (₹ INR)</label>
                  <input type="number" class="form-control" [(ngModel)]="formData.payRate" name="payRate" placeholder="e.g. 600">
                </div>

                <!-- Initial Project Assignment (Only for Create) -->
                <div class="col-md-6" *ngIf="!isEdit">
                  <label class="form-label small fw-bold">Initial Project Allocation</label>
                  <select class="form-select" [(ngModel)]="initialProjectId" name="initialProjectId">
                    <option value="">-- Assign Later --</option>
                    <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                  </select>
                </div>
              </div>

              <div class="mt-4 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" (click)="close.emit()">Cancel</button>
                <button type="submit" class="btn btn-bt-accent px-4" [disabled]="saving">
                  <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isEdit ? 'Save Changes' : 'Register Worker' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WorkerDialogComponent implements OnInit {
  @Input() workerToEdit: Worker | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Worker>();

  isEdit = false;
  saving = false;
  error = '';

  formData: Partial<Worker> = {
    workerId: '',
    workerName: '',
    workforceCategoryId: '',
    skillOrWorkType: '',
    contactInformation: '',
    contractorId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    workerStatus: 'Active',
    payRate: 600
  };

  initialProjectId = '';

  categories: WorkforceCategory[] = [];
  contractors: any[] = [];
  projects: Project[] = [];

  constructor(
    private workforceService: WorkforceService,
    private userService: UserService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    if (this.workerToEdit) {
      this.isEdit = true;
      this.formData = { ...this.workerToEdit };
    }

    this.workforceService.getCategories().subscribe(cats => this.categories = cats);
    this.userService.getUsers('Contractor').subscribe(c => this.contractors = c);
    this.projectService.getProjects().subscribe(p => this.projects = p);
  }

  saveWorker(): void {
    if (!this.formData.workerId || !this.formData.workerName || !this.formData.workforceCategoryId) {
      this.error = 'Please fill out all required fields marked with *';
      return;
    }

    this.saving = true;
    this.error = '';

    if (this.isEdit && this.workerToEdit) {
      this.workforceService.updateWorker(this.workerToEdit.id, this.formData).subscribe({
        next: (updated) => {
          this.saving = false;
          this.saved.emit(updated);
        },
        error: (err) => {
          this.saving = false;
          this.error = err?.error?.detail || 'Failed to update worker.';
        }
      });
    } else {
      this.workforceService.createWorker(this.formData).subscribe({
        next: (created) => {
          // If initial project was selected, allocate worker
          if (this.initialProjectId) {
            this.workforceService.createAssignment({
              workerId: created.id,
              projectId: this.initialProjectId,
              contractorId: created.contractorId,
              workActivity: created.skillOrWorkType || 'General Construction',
              assignmentStartDate: created.joiningDate
            }).subscribe(() => {
              this.saving = false;
              this.saved.emit(created);
            });
          } else {
            this.saving = false;
            this.saved.emit(created);
          }
        },
        error: (err) => {
          this.saving = false;
          this.error = err?.error?.detail || 'Failed to create worker.';
        }
      });
    }
  }
}

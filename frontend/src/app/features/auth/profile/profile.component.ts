import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <!-- Sidebar -->
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <!-- Main Content -->
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-1">User Profile & Account</h2>
              <p class="text-muted small mb-0">Manage personal identification, department role, and contact credentials.</p>
            </div>
            <span class="badge bg-warning text-dark px-3 py-2 fs-7 fw-bold">
              <i class="bi bi-shield-check me-1"></i> Authenticated Personnel
            </span>
          </div>

          <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> {{ successMessage }}
            <button type="button" class="btn-close" (click)="successMessage = ''"></button>
          </div>

          <div class="row g-4" *ngIf="currentUser">
            <!-- Left Profile Card -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4 text-center">
                <div class="position-relative d-inline-block mx-auto mb-3">
                  <img [src]="currentUser.profilePicture" alt="Profile Picture" class="rounded-circle object-fit-cover shadow" width="130" height="130">
                  <label class="position-absolute bottom-0 end-0 bg-warning text-dark rounded-circle p-2 shadow cursor-pointer" title="Change Picture">
                    <i class="bi bi-camera-fill"></i>
                    <input type="file" (change)="onAvatarUpload($event)" accept="image/*" class="d-none">
                  </label>
                </div>

                <h4 class="fw-bold text-dark mb-1">{{ currentUser.fullName }}</h4>
                <p class="text-muted small mb-2">{{ currentUser.department }}</p>
                <div class="mb-3">
                  <span class="badge bg-primary text-white px-3 py-1 rounded-pill">{{ currentUser.role }}</span>
                </div>

                <hr class="my-3">

                <div class="text-start small space-y-2">
                  <div class="d-flex justify-content-between py-1 border-bottom border-light">
                    <span class="text-muted"><i class="bi bi-card-heading me-1"></i> Employee ID:</span>
                    <strong class="text-dark">{{ currentUser.employeeId || 'N/A' }}</strong>
                  </div>
                  <div class="d-flex justify-content-between py-1 border-bottom border-light">
                    <span class="text-muted"><i class="bi bi-envelope me-1"></i> Email:</span>
                    <strong class="text-dark">{{ currentUser.email }}</strong>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <span class="text-muted"><i class="bi bi-telephone me-1"></i> Phone:</span>
                    <strong class="text-dark">{{ currentUser.mobileNumber || 'Not set' }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Edit Form -->
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-pencil-square me-2 text-warning"></i> Edit Personnel Information</h5>

                <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold small">Full Name</label>
                      <input type="text" formControlName="fullName" class="form-control">
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold small">Email Address (Read-Only)</label>
                      <input type="email" formControlName="email" class="form-control bg-light" readonly>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold small">Mobile Phone</label>
                      <input type="text" formControlName="mobileNumber" class="form-control">
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold small">Employee ID (Read-Only)</label>
                      <input type="text" formControlName="employeeId" class="form-control bg-light" readonly>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold small">Department / Designation</label>
                      <input type="text" formControlName="department" class="form-control">
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-semibold small">Role Designation</label>
                      <input type="text" formControlName="role" class="form-control bg-light" readonly>
                    </div>

                    <div class="col-12">
                      <label class="form-label fw-semibold small">Physical / Site Address</label>
                      <textarea formControlName="address" class="form-control" rows="3"></textarea>
                    </div>
                  </div>

                  <div class="mt-4 text-end">
                    <button type="submit" [disabled]="profileForm.invalid || isSaving" class="btn btn-bt-accent px-4 py-2 shadow-sm">
                      <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                      <i class="bi bi-floppy-fill me-1"></i> Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm!: FormGroup;
  isSaving = false;
  successMessage = '';

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();
    this.initForm();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      fullName: [this.currentUser?.fullName || '', [Validators.required]],
      email: [this.currentUser?.email || ''],
      mobileNumber: [this.currentUser?.mobileNumber || ''],
      employeeId: [this.currentUser?.employeeId || ''],
      department: [this.currentUser?.department || ''],
      role: [this.currentUser?.role || ''],
      address: [this.currentUser?.address || '']
    });
  }

  onAvatarUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profileService.uploadProfilePicture(file).subscribe(res => {
        if (this.currentUser) {
          this.currentUser = { ...this.currentUser, profilePicture: res.url };
        }
        this.successMessage = 'Profile avatar updated successfully!';
      });
    }
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.currentUser = updated;
        this.successMessage = 'Profile information saved successfully!';
      },
      error: () => { this.isSaving = false; }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-bg p-3 py-5">
      <div class="card auth-card border-0 w-100" style="max-width: 680px;">
        <div class="p-4 p-sm-5">
          <div class="text-center mb-4">
            <div class="bg-warning text-dark rounded-4 d-inline-flex p-3 mb-2 shadow">
              <i class="bi bi-person-plus-fill fs-2"></i>
            </div>
            <h2 class="fw-bold brand-font text-dark mb-1">Create Personnel Account</h2>
            <p class="text-muted small">Register new team member into BuildTrack RBAC hierarchy</p>
          </div>

          <!-- Alert for server error/success -->
          <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 small mb-3">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <div *ngIf="successMessage" class="alert alert-success d-flex align-items-center gap-2 small mb-3">
            <i class="bi bi-check-circle-fill"></i>
            <span>{{ successMessage }}</span>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <!-- Full Name -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Full Name *</label>
                <input type="text" formControlName="fullName" class="form-control" placeholder="e.g. John Doe"
                  [class.is-invalid]="f['fullName'].touched && f['fullName'].invalid">
                <div *ngIf="f['fullName'].touched && f['fullName'].errors" class="invalid-feedback small">
                  Full name is required.
                </div>
              </div>

              <!-- Email Address -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Email Address *</label>
                <input type="email" formControlName="email" class="form-control" placeholder="john@buildtrack.com"
                  [class.is-invalid]="f['email'].touched && f['email'].invalid">
                <div *ngIf="f['email'].touched && f['email'].errors" class="invalid-feedback small">
                  <span *ngIf="f['email'].errors['required']">Email is required.</span>
                  <span *ngIf="f['email'].errors['email']">Enter a valid email address.</span>
                </div>
              </div>

              <!-- Mobile Number -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Mobile Number *</label>
                <input type="text" formControlName="mobileNumber" class="form-control" placeholder="+1 555-0199"
                  [class.is-invalid]="f['mobileNumber'].touched && f['mobileNumber'].invalid">
                <div *ngIf="f['mobileNumber'].touched && f['mobileNumber'].errors" class="invalid-feedback small">
                  Valid mobile number is required.
                </div>
              </div>

              <!-- Role Selection -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Assign Role *</label>
                <select formControlName="role" class="form-select" [class.is-invalid]="f['role'].touched && f['role'].invalid">
                  <option *ngFor="let role of roles" [value]="role">{{ role }}</option>
                </select>
                <div *ngIf="f['role'].touched && f['role'].errors" class="invalid-feedback small">
                  Role assignment is required.
                </div>
              </div>

              <!-- Employee ID -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Employee ID *</label>
                <input type="text" formControlName="employeeId" class="form-control" placeholder="e.g. EMP-2045"
                  [class.is-invalid]="f['employeeId'].touched && f['employeeId'].invalid">
                <div *ngIf="f['employeeId'].touched && f['employeeId'].errors" class="invalid-feedback small">
                  Employee ID is required.
                </div>
              </div>

              <!-- Department -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Department / Designation *</label>
                <input type="text" formControlName="department" class="form-control" placeholder="e.g. Structural Operations"
                  [class.is-invalid]="f['department'].touched && f['department'].invalid">
                <div *ngIf="f['department'].touched && f['department'].errors" class="invalid-feedback small">
                  Department is required.
                </div>
              </div>

              <!-- Password -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Password *</label>
                <input type="password" formControlName="password" class="form-control" placeholder="••••••••"
                  [class.is-invalid]="f['password'].touched && f['password'].invalid">
                <div *ngIf="f['password'].touched && f['password'].errors" class="invalid-feedback small">
                  <span *ngIf="f['password'].errors['required']">Password is required.</span>
                  <span *ngIf="f['password'].errors['minlength']">Must be at least 8 characters.</span>
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Confirm Password *</label>
                <input type="password" formControlName="confirmPassword" class="form-control" placeholder="••••••••"
                  [class.is-invalid]="f['confirmPassword'].touched && registerForm.hasError('passwordsMismatch')">
                <div *ngIf="registerForm.hasError('passwordsMismatch') && f['confirmPassword'].touched" class="invalid-feedback d-block small">
                  Passwords do not match.
                </div>
              </div>

              <!-- Address -->
              <div class="col-12">
                <label class="form-label fw-semibold small">Office / Site Address</label>
                <textarea formControlName="address" class="form-control" rows="2" placeholder="Full street address"></textarea>
              </div>

              <!-- Profile Picture Upload -->
              <div class="col-12">
                <label class="form-label fw-semibold small">Profile Picture</label>
                <input type="file" (change)="onFileSelected($event)" accept="image/*" class="form-control">
              </div>
            </div>

            <!-- Submit Button (Prominent & Vibrant) -->
            <button type="submit" [disabled]="isLoading" class="btn btn-warning fw-bold text-dark w-100 py-3 mt-4 shadow-sm border-0 d-flex align-items-center justify-content-center gap-2">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
              <i *ngIf="!isLoading" class="bi bi-person-check-fill fs-5"></i>
              <span>Create Account & Assign Role</span>
            </button>

            <div class="text-center small text-muted mt-3">
              Already have an account? <a routerLink="/login" class="text-warning text-decoration-none fw-bold">Sign In</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  roles = Object.values(UserRole);
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required]],
      role: [UserRole.PROJECT_MANAGER, [Validators.required]],
      employeeId: [`EMP-${Math.floor(1000 + Math.random() * 9000)}`, [Validators.required]],
      department: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      address: [''],
      profilePicture: ['']
    }, { validators: this.passwordMatchValidator });
  }

  get f() { return this.registerForm.controls; }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.registerForm.patchValue({ profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please complete all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.successMessage = `Account for ${user.fullName} created successfully! Redirecting to login...`;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.detail || 'Failed to register account. Please check your network connection.';
      }
    });
  }
}

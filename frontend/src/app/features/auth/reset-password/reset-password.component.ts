import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-bg p-3">
      <div class="card auth-card border-0 w-100" style="max-width: 440px;">
        <div class="p-4 p-sm-5">
          <div class="text-center mb-4">
            <div class="bg-warning text-dark rounded-4 d-inline-flex p-3 mb-2 shadow">
              <i class="bi bi-shield-lock-fill fs-2"></i>
            </div>
            <h2 class="fw-bold brand-font text-dark mb-1">Set New Password</h2>
            <p class="text-muted small">Choose a strong password for your security</p>
          </div>

          <div *ngIf="successMessage" class="alert alert-success py-2 small mb-3">
            <i class="bi bi-check-circle me-1"></i> {{ successMessage }}
          </div>

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            <!-- New Password -->
            <div class="mb-3">
              <label class="form-label fw-semibold small">New Password *</label>
              <input type="password" formControlName="password" class="form-control" placeholder="••••••••"
                [class.is-invalid]="f['password'].touched && f['password'].invalid">
              <div *ngIf="f['password'].touched && f['password'].errors" class="invalid-feedback small">
                <span *ngIf="f['password'].errors['required']">Password is required.</span>
                <span *ngIf="f['password'].errors['minlength']">Must be at least 8 characters.</span>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="mb-4">
              <label class="form-label fw-semibold small">Confirm New Password *</label>
              <input type="password" formControlName="confirmPassword" class="form-control" placeholder="••••••••"
                [class.is-invalid]="f['confirmPassword'].touched && resetForm.hasError('passwordsMismatch')">
              <div *ngIf="resetForm.hasError('passwordsMismatch') && f['confirmPassword'].touched" class="invalid-feedback d-block small">
                Passwords do not match.
              </div>
            </div>

            <button type="submit" [disabled]="resetForm.invalid || isLoading" class="btn btn-bt-primary w-100 py-2.5 mb-3 shadow-sm">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-1"></span>
              Update Password
            </button>

            <div class="text-center small">
              <a routerLink="/login" class="text-decoration-none text-muted"><i class="bi bi-arrow-left me-1"></i> Back to Sign In</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  isLoading = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get f() { return this.resetForm.controls; }

  passwordMatchValidator(group: AbstractControl) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { passwordsMismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword(this.resetForm.value.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => { this.isLoading = false; }
    });
  }
}

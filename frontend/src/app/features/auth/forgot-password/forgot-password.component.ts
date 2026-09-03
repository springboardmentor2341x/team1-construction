import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-bg p-3">
      <div class="card auth-card border-0 w-100" style="max-width: 440px;">
        <div class="p-4 p-sm-5">
          <div class="text-center mb-4">
            <div class="bg-warning text-dark rounded-4 d-inline-flex p-3 mb-2 shadow">
              <i class="bi bi-key-fill fs-2"></i>
            </div>
            <h2 class="fw-bold brand-font text-dark mb-1">Reset Password</h2>
            <p class="text-muted small">Enter registered email to receive recovery instructions</p>
          </div>

          <div *ngIf="successMessage" class="alert alert-success py-2 small mb-3">
            <i class="bi bi-check-circle me-1"></i> {{ successMessage }}
          </div>

          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="form-label fw-semibold small">Email Address *</label>
              <div class="input-group">
                <span class="input-group-text bg-light text-muted"><i class="bi bi-envelope"></i></span>
                <input type="email" formControlName="email" class="form-control" placeholder="name@company.com"
                  [class.is-invalid]="f['email'].touched && f['email'].invalid">
              </div>
              <div *ngIf="f['email'].touched && f['email'].errors" class="invalid-feedback d-block small">
                <span *ngIf="f['email'].errors['required']">Email is required.</span>
                <span *ngIf="f['email'].errors['email']">Please enter a valid email address.</span>
              </div>
            </div>

            <button type="submit" [disabled]="forgotForm.invalid || isLoading" class="btn btn-bt-primary w-100 py-2.5 mb-3 shadow-sm">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-1"></span>
              Send Recovery Link
            </button>

            <div class="text-center small">
              <a routerLink="/login" class="text-decoration-none text-muted"><i class="bi bi-arrow-left me-1"></i> Back to Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  successMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotForm.controls; }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message;
      },
      error: () => { this.isLoading = false; }
    });
  }
}

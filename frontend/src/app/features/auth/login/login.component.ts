import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-bg p-3">
      <div class="card auth-card border-0 w-100" style="max-width: 440px;">
        <div class="p-4 p-sm-5">
          <div class="text-center mb-4">
            <div class="bg-warning text-dark rounded-4 d-inline-flex p-3 mb-2 shadow">
              <i class="bi bi-building-fill-gear fs-2"></i>
            </div>
            <h2 class="fw-bold brand-font text-dark mb-1">BuildTrack</h2>
            <p class="text-muted small">Construction Project Management Platform</p>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger py-2 small mb-3">
            <i class="bi bi-exclamation-octagon me-1"></i> {{ errorMessage }}
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Email -->
            <div class="mb-3">
              <label class="form-label fw-semibold small">Email Address</label>
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

            <!-- Password -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-semibold small mb-0">Password</label>
                <a routerLink="/forgot-password" class="text-warning text-decoration-none small fw-semibold">Forgot password?</a>
              </div>
              <div class="input-group">
                <span class="input-group-text bg-light text-muted"><i class="bi bi-lock"></i></span>
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" class="form-control" placeholder="••••••••"
                  [class.is-invalid]="f['password'].touched && f['password'].invalid">
                <button type="button" class="btn btn-outline-secondary" (click)="showPassword = !showPassword">
                  <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div *ngIf="f['password'].touched && f['password'].errors" class="invalid-feedback d-block small">
                <span *ngIf="f['password'].errors['required']">Password is required.</span>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="form-check mb-4">
              <input type="checkbox" formControlName="rememberMe" class="form-check-input" id="rememberMe">
              <label class="form-check-label small text-muted" for="rememberMe">Remember my device</label>
            </div>

            <!-- Login Button -->
            <button type="submit" [disabled]="loginForm.invalid || isLoading" class="btn btn-bt-primary w-100 py-2.5 mb-3 shadow-sm d-flex align-items-center justify-content-center gap-2">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm"></span>
              <span>Sign In to Platform</span>
              <i class="bi bi-arrow-right"></i>
            </button>

            <!-- Registration Link -->
            <div class="text-center small text-muted">
              Don't have an account? <a routerLink="/register" class="text-warning text-decoration-none fw-bold">Register Company Account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@buildtrack.com', [Validators.required, Validators.email]],
      password: ['Admin@1234', [Validators.required]],
      rememberMe: [true]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        const targetRoute = this.roleService.getDashboardRouteForRole(res.user.role);
        this.router.navigate([targetRoute]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Invalid credentials. Please try again.';
      }
    });
  }
}

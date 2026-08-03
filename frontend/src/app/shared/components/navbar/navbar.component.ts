import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top py-2 px-3">
      <div class="container-fluid p-0">
        <!-- Brand Logo -->
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-4" routerLink="/">
          <div class="bg-warning text-dark rounded-3 px-2 py-1 d-flex align-items-center justify-content-center shadow-sm">
            <i class="bi bi-building-fill-gear fs-5"></i>
          </div>
          <span>Build<span class="text-warning">Track</span></span>
          <span class="badge bg-secondary text-uppercase fs-8 ms-1">M1</span>
        </a>

        <!-- User & Actions -->
        <div class="d-flex align-items-center gap-3 ms-auto">
          <!-- User Info pill -->
          <ng-container *ngIf="authService.currentUser() as user">
            <div class="dropdown">
              <button class="btn btn-outline-light border-0 d-flex align-items-center gap-2 py-1 px-2 rounded-3 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img [src]="user.profilePicture" alt="User Avatar" class="rounded-circle object-fit-cover" width="36" height="36">
                <div class="text-start d-none d-sm-block">
                  <div class="fw-semibold text-white small lh-1 mb-1">{{ user.fullName }}</div>
                  <span class="badge" [ngClass]="getRoleBadgeClass(user.role)">{{ user.role }}</span>
                </div>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2">
                <li class="px-3 py-2 border-bottom">
                  <div class="fw-bold text-dark">{{ user.fullName }}</div>
                  <div class="small text-muted">{{ user.email }}</div>
                </li>
                <li><a class="dropdown-item py-2 d-flex align-items-center gap-2" routerLink="/profile"><i class="bi bi-person me-1"></i> My Profile</a></li>
                <li><a class="dropdown-item py-2 d-flex align-items-center gap-2" [routerLink]="getDashboardRoute()"><i class="bi bi-speedometer2 me-1"></i> Dashboard</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item py-2 text-danger d-flex align-items-center gap-2" (click)="onLogout()"><i class="bi bi-box-arrow-right me-1"></i> Sign Out</button></li>
              </ul>
            </div>
          </ng-container>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  getDashboardRoute(): string {
    const role = this.authService.getRole();
    switch (role) {
      case UserRole.ADMINISTRATOR: return '/dashboard/admin';
      case UserRole.PROJECT_MANAGER: return '/dashboard/project-manager';
      case UserRole.SITE_ENGINEER: return '/dashboard/site-engineer';
      case UserRole.CONTRACTOR: return '/dashboard/contractor';
      case UserRole.WORKER: return '/dashboard/worker';
      case UserRole.CLIENT: return '/dashboard/client';
      default: return '/login';
    }
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMINISTRATOR: return 'badge-admin';
      case UserRole.PROJECT_MANAGER: return 'badge-pm';
      case UserRole.SITE_ENGINEER: return 'badge-engineer';
      case UserRole.CONTRACTOR: return 'badge-contractor';
      case UserRole.WORKER: return 'badge-worker';
      case UserRole.CLIENT: return 'badge-client';
      default: return 'bg-secondary';
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

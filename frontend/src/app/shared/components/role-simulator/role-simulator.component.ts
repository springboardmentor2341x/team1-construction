import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-role-simulator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-dark text-white px-3 py-2 border-bottom border-secondary d-flex flex-wrap align-items-center justify-content-between gap-2 shadow-sm fs-7">
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-warning text-dark fw-bold px-2 py-1"><i class="bi bi-person-workspace me-1"></i> Quick Role Switcher</span>
        <span class="text-secondary small d-none d-md-inline">Simulate logins for RBAC testing:</span>
      </div>
      <div class="d-flex flex-wrap align-items-center gap-1">
        <button 
          *ngFor="let role of roles" 
          (click)="switchRole(role)" 
          [class.active]="authService.getRole() === role"
          [class.btn-warning]="authService.getRole() === role"
          [class.btn-outline-light]="authService.getRole() !== role"
          class="btn btn-xs py-1 px-2 rounded-2 fw-semibold transition-all">
          {{ role }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .fs-7 { font-size: 0.8rem; }
    .btn-xs { font-size: 0.75rem; }
  `]
})
export class RoleSimulatorComponent {
  roles = Object.values(UserRole);

  constructor(
    public authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  switchRole(role: UserRole): void {
    this.authService.switchRole(role);
    const targetRoute = this.roleService.getDashboardRouteForRole(role);
    this.router.navigate([targetRoute]);
  }
}

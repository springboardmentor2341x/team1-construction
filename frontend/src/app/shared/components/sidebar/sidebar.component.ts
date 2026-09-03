import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService, NavItem } from '../../../core/services/role.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-custom p-3 d-flex flex-column justify-content-between h-100">
      <div>
        <div class="px-2 mb-3 text-uppercase text-secondary small fw-bold tracking-wider">
          Navigation
        </div>
        <nav class="nav flex-column gap-1">
          <a *ngFor="let item of navItems()" 
             [routerLink]="item.route" 
             routerLinkActive="active" 
             class="sidebar-link">
            <i [class]="'bi ' + item.icon + ' fs-5'"></i>
            <span>{{ item.label }}</span>
            <span *ngIf="item.badge" class="badge bg-warning text-dark ms-auto rounded-pill">{{ item.badge }}</span>
          </a>
        </nav>
      </div>

      <!-- User quick footer card -->
      <div class="mt-4 pt-3 border-top border-secondary border-opacity-25 px-2">
        <div class="d-flex align-items-center justify-content-between">
          <div class="small text-secondary">
            Role: <strong class="text-white">{{ authService.getRole() }}</strong>
          </div>
          <button class="btn btn-sm btn-outline-danger py-0 px-2" (click)="logout()" title="Logout">
            <i class="bi bi-power"></i>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  navItems = computed<NavItem[]>(() => {
    const role = this.authService.currentUser()?.role || null;
    return this.roleService.getNavItemsForRole(role);
  });

  constructor(
    public authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

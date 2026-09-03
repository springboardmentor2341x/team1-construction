import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, NotificationItem } from '../../../core/services/notification.service';
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

        <!-- Right Side: Notifications Bell & User Profile -->
        <div class="d-flex align-items-center gap-3 ms-auto">

          <ng-container *ngIf="authService.currentUser()">
            <!-- Notification Bell Dropdown -->
            <div class="dropdown">
              <button class="btn btn-outline-light border-0 position-relative p-2 rounded-circle d-flex align-items-center justify-content-center"
                      type="button" data-bs-toggle="dropdown" aria-expanded="false" (click)="loadNotifications()"
                      title="Notifications">
                <i class="bi bi-bell-fill fs-5 text-light"></i>
                <span *ngIf="unreadCount() > 0"
                      class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
                      style="font-size: 0.68rem; padding: 0.25em 0.45em;">
                  {{ unreadCount() > 99 ? '99+' : unreadCount() }}
                </span>
              </button>

              <div class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2 p-0" style="width: 340px; max-height: 480px; overflow-y: auto;">
                <div class="p-3 bg-dark text-white rounded-top d-flex align-items-center justify-content-between border-bottom border-secondary">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-bell-fill text-warning"></i>
                    <strong class="small">Notifications</strong>
                    <span *ngIf="unreadCount() > 0" class="badge bg-danger rounded-pill small">{{ unreadCount() }}</span>
                  </div>
                  <button *ngIf="unreadCount() > 0" class="btn btn-link text-warning p-0 text-decoration-none small" (click)="onMarkAllRead($event)" style="font-size:0.75rem">
                    Mark all read
                  </button>
                </div>

                <!-- Recent Notifications List -->
                <div class="p-2">
                  <div *ngIf="recentNotifications().length === 0" class="text-center py-4 text-muted small">
                    <i class="bi bi-bell-slash fs-4 d-block mb-1 text-secondary"></i>
                    No recent notifications
                  </div>

                  <div *ngFor="let n of recentNotifications()"
                       class="notification-item p-2 mb-1 rounded-2 d-flex align-items-start gap-2 text-decoration-none"
                       [ngClass]="n.isRead ? 'bg-white opacity-75' : 'bg-light border-start border-3 border-warning'"
                       style="cursor: pointer"
                       (click)="onNotificationClick(n)">
                    <div class="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 mt-1"
                         [ngClass]="getBadgeClass(n.type)" style="width:28px; height:28px; font-size:0.75rem">
                      <i class="bi" [ngClass]="getIcon(n.type)"></i>
                    </div>
                    <div class="flex-grow-1 overflow-hidden">
                      <div class="d-flex align-items-center justify-content-between">
                        <strong class="small text-dark text-truncate" style="max-width: 190px;">{{ n.title }}</strong>
                        <span class="text-muted" style="font-size:0.65rem">{{ n.time }}</span>
                      </div>
                      <p class="text-muted small mb-0 text-truncate" style="font-size:0.75rem">{{ n.message }}</p>
                    </div>
                  </div>
                </div>

                <div class="p-2 text-center bg-light border-top rounded-bottom">
                  <a routerLink="/notifications" class="text-decoration-none text-warning fw-semibold small">
                    View All Notifications <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            <!-- User Info Pill -->
            <div class="dropdown">
              <button class="btn btn-outline-light border-0 d-flex align-items-center gap-2 py-1 px-2 rounded-3 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold me-1" style="width:34px; height:34px;">
                  <i class="bi bi-person-fill fs-6"></i>
                </div>
                <div class="text-start d-none d-sm-block">
                  <div class="fw-semibold text-white small lh-1 mb-1">{{ authService.currentUser()?.fullName }}</div>
                  <span class="badge" [ngClass]="getRoleBadgeClass(authService.currentUser()?.role)">{{ authService.currentUser()?.role }}</span>
                </div>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2">
                <li class="px-3 py-2 border-bottom">
                  <div class="fw-bold text-dark">{{ authService.currentUser()?.fullName }}</div>
                  <div class="small text-muted">{{ authService.currentUser()?.email }}</div>
                </li>
                <li><a class="dropdown-item py-2 d-flex align-items-center gap-2" routerLink="/profile"><i class="bi bi-person me-1"></i> My Profile</a></li>
                <li><a class="dropdown-item py-2 d-flex align-items-center gap-2" [routerLink]="getDashboardRoute()"><i class="bi bi-speedometer2 me-1"></i> Dashboard</a></li>
                <li><a class="dropdown-item py-2 d-flex align-items-center gap-2" routerLink="/notifications"><i class="bi bi-bell me-1"></i> Notifications <span *ngIf="unreadCount() > 0" class="badge bg-danger ms-auto">{{ unreadCount() }}</span></a></li>
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
export class NavbarComponent implements OnInit {
  unreadCount = signal<number>(0);
  recentNotifications = signal<NotificationItem[]>([]);

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadUnreadCount();
      this.loadNotifications();
    }
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe(res => {
      this.unreadCount.set(res.unread_count || 0);
    });
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(items => {
      this.recentNotifications.set(items.slice(0, 5));
      const unread = items.filter(i => !i.isRead).length;
      this.unreadCount.set(unread);
    });
  }

  onMarkAllRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllRead().subscribe(() => {
      this.unreadCount.set(0);
      this.loadNotifications();
    });
  }

  onNotificationClick(n: NotificationItem): void {
    if (!n.isRead) {
      this.notificationService.markRead(n.id).subscribe(() => {
        this.loadUnreadCount();
      });
    }

    if (n.referenceModule === 'projects' && n.projectId) {
      this.router.navigate(['/projects', n.projectId]);
    } else if (n.referenceModule === 'procurement_requests') {
      this.router.navigate(['/procurement/requests']);
    } else if (n.referenceModule === 'attendance') {
      this.router.navigate(['/workforce/attendance']);
    } else {
      this.router.navigate(['/notifications']);
    }
  }

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

  getRoleBadgeClass(role?: UserRole): string {
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

  getBadgeClass(type: string): string {
    switch (type) {
      case 'PROJECT_UPDATE': return 'bg-primary';
      case 'TASK_ASSIGNMENT': return 'bg-info';
      case 'PROCUREMENT': return 'bg-warning text-dark';
      case 'ATTENDANCE': return 'bg-danger';
      case 'DEADLINE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'PROJECT_UPDATE': return 'bi-building';
      case 'TASK_ASSIGNMENT': return 'bi-check2-square';
      case 'PROCUREMENT': return 'bi-cart-check';
      case 'ATTENDANCE': return 'bi-person-badge';
      case 'DEADLINE': return 'bi-clock-history';
      default: return 'bi-bell';
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

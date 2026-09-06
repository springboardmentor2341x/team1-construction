import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, NotificationItem } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block"><app-sidebar></app-sidebar></div>
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">

          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <nav aria-label="breadcrumb"><ol class="breadcrumb small mb-1">
                <li class="breadcrumb-item"><a [routerLink]="dashboardRoute" class="text-decoration-none text-warning">Dashboard</a></li>
                <li class="breadcrumb-item active">Notifications</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-bell-fill me-2 text-warning"></i>Notifications</h2>
              <p class="text-muted small mb-0">{{ unreadCount() }} unread notification{{ unreadCount() !== 1 ? 's' : '' }}.</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary" (click)="markAllRead()"><i class="bi bi-check-all me-1"></i>Mark All Read</button>
              <button class="btn btn-sm btn-outline-danger" (click)="clearAll()"><i class="bi bi-trash me-1"></i>Clear All</button>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-sm" [ngClass]="activeFilter() === 'all' ? 'btn-warning' : 'btn-outline-secondary'" (click)="setFilter('all')">All <span class="badge bg-secondary ms-1">{{ notifications().length }}</span></button>
              <button class="btn btn-sm" [ngClass]="activeFilter() === 'unread' ? 'btn-warning' : 'btn-outline-secondary'" (click)="setFilter('unread')">Unread <span class="badge bg-danger ms-1">{{ unreadCount() }}</span></button>
              <button class="btn btn-sm" [ngClass]="activeFilter() === 'PROJECT_UPDATE' ? 'btn-warning' : 'btn-outline-secondary'" (click)="setFilter('PROJECT_UPDATE')">Project Updates</button>
              <button class="btn btn-sm" [ngClass]="activeFilter() === 'TASK_ASSIGNMENT' ? 'btn-warning' : 'btn-outline-secondary'" (click)="setFilter('TASK_ASSIGNMENT')">Tasks</button>
              <button class="btn btn-sm" [ngClass]="activeFilter() === 'PROCUREMENT' ? 'btn-warning' : 'btn-outline-secondary'" (click)="setFilter('PROCUREMENT')">Procurement</button>
              <button class="btn btn-sm" [ngClass]="activeFilter() === 'ATTENDANCE' ? 'btn-warning' : 'btn-outline-secondary'" (click)="setFilter('ATTENDANCE')">Attendance</button>
              <button class="btn btn-sm" [ngClass]="activeFilter() === 'DEADLINE' ? 'btn-warning' : 'btn-outline-secondary'" (click)="setFilter('DEADLINE')">Deadlines</button>
              <button class="btn btn-sm" [ngClass]="activeFilter() === 'SYSTEM' ? 'btn-warning' : 'btn-outline-secondary'" (click)="setFilter('SYSTEM')">System</button>
            </div>
          </div>

          <!-- Notifications List -->
          <div class="card card-custom border-0 p-4">
            <div *ngIf="filteredNotifications().length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-bell-slash fs-1 d-block mb-2 text-muted opacity-50"></i>
              <p>No notifications found.</p>
            </div>
            <div *ngFor="let n of filteredNotifications()" class="notification-item p-3 mb-2 rounded-3 border-start border-4 d-flex align-items-start gap-3"
                 [ngClass]="[getBorderClass(n.type), n.isRead ? 'bg-white' : 'bg-light shadow-sm']"
                 style="cursor:pointer" (click)="onItemClick(n)">
              <div class="notification-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white" [ngClass]="getIconBgClass(n.type)" style="width:38px;height:38px">
                <i class="bi" [ngClass]="getIcon(n.type)"></i>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex align-items-center justify-content-between">
                  <strong class="small text-dark">{{ n.title }}</strong>
                  <div class="d-flex align-items-center gap-2">
                    <span class="text-muted" style="font-size:0.72rem">{{ n.time }}</span>
                    <span class="badge rounded-pill bg-dark text-white" style="font-size:0.68rem">{{ n.type || n.category }}</span>
                    <span *ngIf="!n.isRead" class="badge bg-danger rounded-circle" style="width:8px;height:8px;padding:0"></span>
                  </div>
                </div>
                <p class="small text-muted mb-0 mt-1">{{ n.message }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  activeFilter = signal<string>('all');
  dashboardRoute: string;

  notifications = signal<NotificationItem[]>([]);

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    const role = this.authService.getRole();
    this.dashboardRoute = role === 'Site Engineer' ? '/dashboard/site-engineer' :
                          role === 'Contractor' ? '/dashboard/contractor' :
                          '/dashboard/project-manager';
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(data => {
      this.notifications.set(data);
    });
  }

  unreadCount = () => this.notifications().filter(n => !n.isRead).length;

  filteredNotifications() {
    const f = this.activeFilter();
    if (f === 'unread') return this.notifications().filter(n => !n.isRead);
    if (f === 'all') return this.notifications();
    return this.notifications().filter(n => n.type === f || n.category === f);
  }

  setFilter(f: string): void { this.activeFilter.set(f); }

  onItemClick(n: NotificationItem): void {
    if (!n.isRead) {
      this.notificationService.markRead(n.id).subscribe(() => {
        n.isRead = true;
        n.read = true;
      });
    }

    if (n.referenceModule === 'projects' && n.projectId) {
      this.router.navigate(['/projects', n.projectId]);
    } else if (n.referenceModule === 'procurement_requests') {
      this.router.navigate(['/procurement/requests']);
    } else if (n.referenceModule === 'attendance') {
      this.router.navigate(['/workforce/attendance']);
    } else if (n.referenceModule === 'tasks') {
      const role = this.authService.getRole();
      if (role === 'Worker') {
        this.router.navigate(['/worker-tasks']);
      } else {
        this.router.navigate(['/tasks']);
      }
    } else if (n.referenceModule === 'budget') {
      this.router.navigate(['/budget']);
    }
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  clearAll(): void {
    this.notificationService.clearAll().subscribe(() => {
      this.notifications.set([]);
    });
  }

  getBorderClass(t: string): string {
    switch (t) {
      case 'PROJECT_UPDATE': return 'border-primary';
      case 'TASK_ASSIGNMENT': return 'border-info';
      case 'PROCUREMENT': return 'border-warning';
      case 'ATTENDANCE': return 'border-danger';
      case 'DEADLINE': return 'border-danger';
      default: return 'border-secondary';
    }
  }

  getIconBgClass(t: string): string {
    switch (t) {
      case 'PROJECT_UPDATE': return 'bg-primary';
      case 'TASK_ASSIGNMENT': return 'bg-info';
      case 'PROCUREMENT': return 'bg-warning text-dark';
      case 'ATTENDANCE': return 'bg-danger';
      case 'DEADLINE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getIcon(t: string): string {
    switch (t) {
      case 'PROJECT_UPDATE': return 'bi-building';
      case 'TASK_ASSIGNMENT': return 'bi-check2-square';
      case 'PROCUREMENT': return 'bi-cart-check';
      case 'ATTENDANCE': return 'bi-person-badge';
      case 'DEADLINE': return 'bi-clock-history';
      default: return 'bi-bell-fill';
    }
  }
}

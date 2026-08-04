import { Injectable } from '@angular/core';
import { UserRole } from '../models/role.enum';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  getNavItemsForRole(role: UserRole | null): NavItem[] {
    switch (role) {
      case UserRole.ADMINISTRATOR:
        return [
          { label: 'Executive Dashboard', icon: 'bi-grid-1x2-fill', route: '/dashboard/admin' },
          { label: 'Project Directory', icon: 'bi-building-gear', route: '/projects' },
          { label: 'Create New Project', icon: 'bi-plus-circle-fill', route: '/projects/create' },
          { label: 'User Management', icon: 'bi-people-fill', route: '/users' },
          { label: 'System Settings', icon: 'bi-gear-wide-connected', route: '/settings' },
          { label: 'My Profile', icon: 'bi-person-badge', route: '/profile' }
        ];

      case UserRole.PROJECT_MANAGER:
        return [
          { label: 'Manager Dashboard', icon: 'bi-speedometer2', route: '/dashboard/project-manager' },
          { label: 'My Managed Projects', icon: 'bi-kanban-fill', route: '/projects' },
          { label: 'Project Schedules', icon: 'bi-calendar3-range', route: '/projects/schedules' },
          { label: 'Milestone Tracker', icon: 'bi-flag-fill', route: '/projects/milestones' },
          { label: 'Analytics & Reports', icon: 'bi-bar-chart-line-fill', route: '/reports' },
          { label: 'Notifications', icon: 'bi-bell-fill', route: '/notifications', badge: '3' },
          { label: 'My Profile', icon: 'bi-person-circle', route: '/profile' }
        ];

      case UserRole.SITE_ENGINEER:
        return [
          { label: 'Engineering Hub', icon: 'bi-tools', route: '/dashboard/site-engineer' },
          { label: 'Assigned Site Projects', icon: 'bi-building-fill-check', route: '/projects' },
          { label: 'Daily Activity Logs', icon: 'bi-journal-check', route: '/site-activity' },
          { label: 'Equipment Status', icon: 'bi-truck-front-fill', route: '/equipment' },
          { label: 'Site Notifications', icon: 'bi-bell-fill', route: '/notifications', badge: '5' },
          { label: 'My Profile', icon: 'bi-person-bounding-box', route: '/profile' }
        ];

      case UserRole.CONTRACTOR:
        return [
          { label: 'Contractor Hub', icon: 'bi-hammer', route: '/dashboard/contractor' },
          { label: 'Assigned Tasks', icon: 'bi-card-checklist', route: '/tasks' },
          { label: 'Contractor Workforce', icon: 'bi-person-badge-fill', route: '/workers' },
          { label: 'Shift Schedules', icon: 'bi-clock-history', route: '/shifts' },
          { label: 'Notifications', icon: 'bi-bell-fill', route: '/notifications' },
          { label: 'My Profile', icon: 'bi-person-vcard', route: '/profile' }
        ];

      case UserRole.WORKER:
        return [
          { label: 'Worker Portal', icon: 'bi-cone-striped', route: '/dashboard/worker' },
          { label: 'My Assigned Tasks', icon: 'bi-list-task', route: '/worker-tasks' },
          { label: 'My Attendance', icon: 'bi-calendar-check', route: '/attendance' },
          { label: 'My Shift Schedule', icon: 'bi-clock', route: '/shifts' },
          { label: 'My Profile', icon: 'bi-person-circle', route: '/profile' }
        ];

      case UserRole.CLIENT:
        return [
          { label: 'Client Overview', icon: 'bi-eye-fill', route: '/dashboard/client' },
          { label: 'Project Progress', icon: 'bi-graph-up-arrow', route: '/projects' },
          { label: 'Milestones & Timeline', icon: 'bi-check-all', route: '/projects/milestones' },
          { label: 'Executive Reports', icon: 'bi-file-earmark-pdf-fill', route: '/client-reports' },
          { label: 'Project Documents', icon: 'bi-folder2-open', route: '/documents' },
          { label: 'My Profile', icon: 'bi-person-fill', route: '/profile' }
        ];

      default:
        return [];
    }
  }

  getDashboardRouteForRole(role: UserRole | null): string {
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
}

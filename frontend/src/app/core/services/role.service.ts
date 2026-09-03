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
          { label: 'Procurement Dashboard', icon: 'bi-cart-fill', route: '/procurement/dashboard' },
          { label: 'Vendor Directory', icon: 'bi-shop', route: '/procurement/vendors' },
          { label: 'Procurement Requests', icon: 'bi-file-earmark-text-fill', route: '/procurement/requests' },
          { label: 'Purchase Orders', icon: 'bi-receipt-cutoff', route: '/procurement/purchase-orders' },
          { label: 'Invoice Tracking', icon: 'bi-receipt', route: '/procurement/invoices' },
          { label: 'Workforce Dashboard', icon: 'bi-people-fill', route: '/workforce/dashboard' },
          { label: 'Worker Directory', icon: 'bi-person-vcard-fill', route: '/workforce/workers' },
          { label: 'Workforce Allocation', icon: 'bi-diagram-3-fill', route: '/workforce/allocations' },
          { label: 'Attendance Tracking', icon: 'bi-calendar-check-fill', route: '/workforce/attendance' },
          { label: 'Shift Management', icon: 'bi-clock-history', route: '/workforce/shifts' },
          { label: 'Payroll Monitoring', icon: 'bi-cash-stack', route: '/workforce/payroll' },
          { label: 'Project Directory', icon: 'bi-building-gear', route: '/projects' },
          { label: 'Resource Management', icon: 'bi-tools', route: '/resource/allocation' },
          { label: 'Resource Utilization', icon: 'bi-pie-chart-fill', route: '/resource/utilization' },
          { label: 'Materials Master', icon: 'bi-box-seam-fill', route: '/materials' },
          { label: 'Inventory Stock', icon: 'bi-boxes', route: '/inventory' },
          { label: 'Material Requests', icon: 'bi-file-earmark-text-fill', route: '/material-requests' },
          { label: 'Material Allocations', icon: 'bi-box-arrow-right', route: '/material-allocations' },
          { label: 'Stock Movements Log', icon: 'bi-clock-history', route: '/stock-movements' },
          { label: 'Create New Project', icon: 'bi-plus-circle-fill', route: '/projects/create' },
          { label: 'Project Assignments', icon: 'bi-person-lines-fill', route: '/projects/assignments' },
          { label: 'User Management', icon: 'bi-person-badge', route: '/users' },
          { label: 'System Settings', icon: 'bi-gear-wide-connected', route: '/settings' },
          { label: 'Work Completion', icon: 'bi-graph-up-arrow', route: '/work-completion-dashboard' },
          { label: 'Milestone Tracking', icon: 'bi-flag-fill', route: '/milestone-tracking' },
          { label: 'Delay Tracking', icon: 'bi-exclamation-triangle-fill', route: '/delay-tracking' },
          { label: 'Weekly Reports', icon: 'bi-card-checklist', route: '/weekly-progress-reports' },
          { label: 'Site Activity Logs', icon: 'bi-clipboard-data', route: '/site-activity-logs' },
          { label: 'My Profile', icon: 'bi-person-circle', route: '/profile' }
        ];

      case UserRole.PROJECT_MANAGER:
        return [
          { label: 'Manager Dashboard', icon: 'bi-speedometer2', route: '/dashboard/project-manager' },
          { label: 'Procurement Hub', icon: 'bi-cart-fill', route: '/procurement/dashboard' },
          { label: 'Vendor Directory', icon: 'bi-shop', route: '/procurement/vendors' },
          { label: 'Procurement Requests', icon: 'bi-file-earmark-text-fill', route: '/procurement/requests' },
          { label: 'Purchase Orders', icon: 'bi-receipt-cutoff', route: '/procurement/purchase-orders' },
          { label: 'Invoice Tracking', icon: 'bi-receipt', route: '/procurement/invoices' },
          { label: 'Workforce Hub', icon: 'bi-people-fill', route: '/workforce/dashboard' },
          { label: 'Worker Directory', icon: 'bi-person-vcard-fill', route: '/workforce/workers' },
          { label: 'Workforce Allocation', icon: 'bi-diagram-3-fill', route: '/workforce/allocations' },
          { label: 'Attendance Tracking', icon: 'bi-calendar-check-fill', route: '/workforce/attendance' },
          { label: 'Shift Management', icon: 'bi-clock-history', route: '/workforce/shifts' },
          { label: 'Payroll Monitoring', icon: 'bi-cash-stack', route: '/workforce/payroll' },
          { label: 'My Managed Projects', icon: 'bi-kanban-fill', route: '/projects' },
          { label: 'Resource Management', icon: 'bi-tools', route: '/resource/allocation' },
          { label: 'Resource Utilization', icon: 'bi-pie-chart-fill', route: '/resource/utilization' },
          { label: 'Materials Master', icon: 'bi-box-seam-fill', route: '/materials' },
          { label: 'Inventory Stock', icon: 'bi-boxes', route: '/inventory' },
          { label: 'Material Requests', icon: 'bi-file-earmark-text-fill', route: '/material-requests' },
          { label: 'Material Allocations', icon: 'bi-box-arrow-right', route: '/material-allocations' },
          { label: 'Stock Movements Log', icon: 'bi-clock-history', route: '/stock-movements' },
          { label: 'Project Assignments', icon: 'bi-person-lines-fill', route: '/projects/assignments' },
          { label: 'Project Schedules', icon: 'bi-calendar3-range', route: '/projects/schedules' },
          { label: 'Tasks & Assignment', icon: 'bi-check2-square', route: '/tasks' },
          { label: 'Milestone Tracker', icon: 'bi-flag-fill', route: '/projects/milestones' },
          { label: 'Analytics & Reports', icon: 'bi-bar-chart-line-fill', route: '/reports' },
          { label: 'Work Completion', icon: 'bi-graph-up-arrow', route: '/work-completion-dashboard' },
          { label: 'Daily Progress Reports', icon: 'bi-journal-text', route: '/daily-progress-reports' },
          { label: 'Weekly Progress Reports', icon: 'bi-card-checklist', route: '/weekly-progress-reports' },
          { label: 'Delay Tracking', icon: 'bi-exclamation-triangle-fill', route: '/delay-tracking' },
          { label: 'Site Activity Logs', icon: 'bi-clipboard-data', route: '/site-activity-logs' },
          { label: 'Notifications', icon: 'bi-bell-fill', route: '/notifications', badge: '3' },
          { label: 'My Profile', icon: 'bi-person-circle', route: '/profile' }
        ];

      case UserRole.SITE_ENGINEER:
        return [
          { label: 'Engineering Hub', icon: 'bi-tools', route: '/dashboard/site-engineer' },
          { label: 'Procurement Requests', icon: 'bi-cart-fill', route: '/procurement/requests' },
          { label: 'Purchase Orders', icon: 'bi-receipt-cutoff', route: '/procurement/purchase-orders' },
          { label: 'Site Workforce', icon: 'bi-people-fill', route: '/workforce/workers' },
          { label: 'Attendance Tracking', icon: 'bi-calendar-check-fill', route: '/workforce/attendance' },
          { label: 'Shift Roster', icon: 'bi-clock-history', route: '/workforce/shifts' },
          { label: 'Assigned Site Projects', icon: 'bi-building-fill-check', route: '/projects' },
          { label: 'Resource Management', icon: 'bi-truck-front-fill', route: '/resource/allocation' },
          { label: 'Inventory Stock', icon: 'bi-boxes', route: '/inventory' },
          { label: 'Material Requests', icon: 'bi-file-earmark-text-fill', route: '/material-requests' },
          { label: 'Material Allocations', icon: 'bi-box-arrow-right', route: '/material-allocations' },
          { label: 'Stock Movements Log', icon: 'bi-clock-history', route: '/stock-movements' },
          { label: 'Daily Activity Logs', icon: 'bi-journal-check', route: '/site-activity' },
          { label: 'Equipment Status', icon: 'bi-wrench-adjustable', route: '/equipment' },
          { label: 'Daily Progress Reports', icon: 'bi-journal-text', route: '/daily-progress-reports' },
          { label: 'Site Activity Logs', icon: 'bi-clipboard-data', route: '/site-activity-logs' },
          { label: 'Milestone Tracking', icon: 'bi-flag-fill', route: '/milestone-tracking' },
          { label: 'Delay Tracking', icon: 'bi-exclamation-triangle-fill', route: '/delay-tracking' },
          { label: 'Work Completion', icon: 'bi-graph-up-arrow', route: '/work-completion-dashboard' },
          { label: 'Site Notifications', icon: 'bi-bell-fill', route: '/notifications', badge: '5' },
          { label: 'My Profile', icon: 'bi-person-bounding-box', route: '/profile' }
        ];

      case UserRole.CONTRACTOR:
        return [
          { label: 'Contractor Hub', icon: 'bi-hammer', route: '/dashboard/contractor' },
          { label: 'Procurement Requests', icon: 'bi-cart-fill', route: '/procurement/requests' },
          { label: 'Purchase Orders', icon: 'bi-receipt-cutoff', route: '/procurement/purchase-orders' },
          { label: 'Workforce Directory', icon: 'bi-people-fill', route: '/workforce/workers' },
          { label: 'Workforce Allocation', icon: 'bi-diagram-3-fill', route: '/workforce/allocations' },
          { label: 'Attendance Tracking', icon: 'bi-calendar-check-fill', route: '/workforce/attendance' },
          { label: 'Shift Schedules', icon: 'bi-clock-history', route: '/workforce/shifts' },
          { label: 'Payroll Monitoring', icon: 'bi-cash-stack', route: '/workforce/payroll' },
          { label: 'Assigned Tasks', icon: 'bi-card-checklist', route: '/tasks' },
          { label: 'Project Inventory', icon: 'bi-boxes', route: '/inventory' },
          { label: 'Contractor Workforce', icon: 'bi-person-badge-fill', route: '/workers' },
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
          { label: 'Procurement Overview', icon: 'bi-cart-fill', route: '/procurement/dashboard' },
          { label: 'Workforce Overview', icon: 'bi-people-fill', route: '/workforce/dashboard' },
          { label: 'Project Progress', icon: 'bi-graph-up-arrow', route: '/projects' },
          { label: 'Project Inventory', icon: 'bi-boxes', route: '/inventory' },
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

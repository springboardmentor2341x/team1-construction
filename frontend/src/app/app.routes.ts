import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/role.enum';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth Routes (Module 1)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/profile/profile.component').then(m => m.ProfileComponent)
  },

  // Role Dashboards
  {
    path: 'dashboard/admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR] },
    loadComponent: () => import('./features/dashboards/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'dashboard/project-manager',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.PROJECT_MANAGER] },
    loadComponent: () => import('./features/dashboards/project-manager-dashboard/project-manager-dashboard.component').then(m => m.ProjectManagerDashboardComponent)
  },
  {
    path: 'dashboard/site-engineer',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/dashboards/site-engineer-dashboard/site-engineer-dashboard.component').then(m => m.SiteEngineerDashboardComponent)
  },
  {
    path: 'dashboard/contractor',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/dashboards/contractor-dashboard/contractor-dashboard.component').then(m => m.ContractorDashboardComponent)
  },
  {
    path: 'dashboard/worker',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.WORKER] },
    loadComponent: () => import('./features/dashboards/worker-dashboard/worker-dashboard.component').then(m => m.WorkerDashboardComponent)
  },
  {
    path: 'dashboard/client',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.CLIENT] },
    loadComponent: () => import('./features/dashboards/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
  },

  // Project Management Routes (Module 2)
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent)
  },
  {
    path: 'projects/create',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR] },
    loadComponent: () => import('./features/projects/project-create/project-create.component').then(m => m.ProjectCreateComponent)
  },
  {
    path: 'projects/update/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER] },
    loadComponent: () => import('./features/projects/project-update/project-update.component').then(m => m.ProjectUpdateComponent)
  },
  {
    path: 'projects/schedules',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-schedule/project-schedule.component').then(m => m.ProjectScheduleComponent)
  },
{
    path: 'projects/milestones',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/milestone-management/milestone-management.component').then(m => m.MilestoneManagementComponent)
  },
  {
    path: 'projects/assignments',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER] },
    loadComponent: () => import('./features/projects/project-assignments/project-assignments.component').then(m => m.ProjectAssignmentsComponent)
  },
  {
    path: 'projects/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./features/contractor/assign-task/assign-task.component').then(m => m.AssignTaskComponent)
  },

  // === ADMINISTRATOR PAGES ===
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR] },
    loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR] },
    loadComponent: () => import('./features/admin/system-settings/system-settings.component').then(m => m.SystemSettingsComponent)
  },

  // === PROJECT MANAGER PAGES ===
  {
    path: 'reports',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.CLIENT] },
    loadComponent: () => import('./features/project-manager/analytics-reports/analytics-reports.component').then(m => m.AnalyticsReportsComponent)
  },

  // === MODULE 3 : SITE PROGRESS MONITORING ===
  // Daily Progress Reports (Site Engineer)
  {
    path: 'daily-progress-reports',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.SITE_ENGINEER, UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.CLIENT] },
    loadComponent: () => import('./features/site-engineer/daily-progress-reports/daily-progress-reports.component').then(m => m.DailyProgressReportsComponent)
  },
  // Weekly Progress Reports (PM / Admin)
  {
    path: 'weekly-progress-reports',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.PROJECT_MANAGER, UserRole.ADMINISTRATOR] },
    loadComponent: () => import('./features/project-manager/weekly-progress-reports/weekly-progress-reports.component').then(m => m.WeeklyProgressReportsComponent)
  },
  // Milestone Tracking (all authenticated stakeholders)
  {
    path: 'milestone-tracking',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CLIENT] },
    loadComponent: () => import('./features/projects/milestone-tracking/milestone-tracking.component').then(m => m.MilestoneTrackingComponent)
  },
  // Delay Tracking (PM / Admin / Site Engineer)
  {
    path: 'delay-tracking',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/project-manager/delay-tracking/delay-tracking.component').then(m => m.DelayTrackingComponent)
  },
  // Site Activity Logs (Site Engineer / Admin / PM)
  {
    path: 'site-activity-logs',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.SITE_ENGINEER, UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER] },
    loadComponent: () => import('./features/site-engineer/site-activity-logs/site-activity-logs.component').then(m => m.SiteActivityLogsComponent)
  },
  // Work Completion Dashboard (all stakeholders)
  {
    path: 'work-completion-dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CLIENT] },
    loadComponent: () => import('./features/project-manager/work-completion-dashboard/work-completion-dashboard.component').then(m => m.WorkCompletionDashboardComponent)
  },

  // === SITE ENGINEER PAGES ===
  {
    path: 'site-activity',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/site-engineer/daily-activity-logs/daily-activity-logs.component').then(m => m.DailyActivityLogsComponent)
  },
  {
    path: 'equipment',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/site-engineer/equipment-status/equipment-status.component').then(m => m.EquipmentStatusComponent)
  },

  // === CONTRACTOR PAGES ===
  {
    path: 'tasks',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/contractor/assign-task/assign-task.component').then(m => m.AssignTaskComponent)
  },
  {
    path: 'workers',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/contractor/contractor-workforce/contractor-workforce.component').then(m => m.ContractorWorkforceComponent)
  },

  // === SHARED PAGES: Notifications, Shifts ===
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-pages/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'shifts',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shared-pages/shift-schedule/shift-schedule.component').then(m => m.ShiftScheduleComponent)
  },

  // === WORKER PAGES ===
  {
    path: 'worker-tasks',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.WORKER] },
    loadComponent: () => import('./features/worker/my-tasks/my-tasks-worker.component').then(m => m.MyTasksWorkerComponent)
  },
  {
    path: 'attendance',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.WORKER] },
    loadComponent: () => import('./features/worker/my-attendance/my-attendance.component').then(m => m.MyAttendanceComponent)
  },

  // === CLIENT PAGES ===
  {
    path: 'client-reports',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.CLIENT] },
    loadComponent: () => import('./features/client/executive-report/executive-report.component').then(m => m.ExecutiveReportComponent)
  },
  {
    path: 'documents',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.CLIENT] },
    loadComponent: () => import('./features/client/project-documents/project-documents.component').then(m => m.ProjectDocumentsComponent)
  },

  // === RESOURCE PAGES ===
  {
    path: 'resource/allocation',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/resource/resource-allocation/resource-allocation.component').then(m => m.ResourceAllocationComponent)
  },
  {
    path: 'resource/utilization',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER] },
    loadComponent: () => import('./features/resource/resource-utilization/resource-utilization.component').then(m => m.ResourceUtilizationComponent)
  },

  // === INVENTORY & PROCUREMENT PAGES ===
  {
    path: 'materials',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/material/material-list/material-list.component').then(m => m.MaterialListComponent)
  },
  {
    path: 'inventory',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR, UserRole.CLIENT] },
    loadComponent: () => import('./features/material/inventory-management/inventory-management.component').then(m => m.InventoryManagementComponent)
  },
  {
    path: 'material-requests',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/material/material-request/material-request.component').then(m => m.MaterialRequestComponent)
  },
  {
    path: 'material-allocations',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/material/material-allocation/material-allocation.component').then(m => m.MaterialAllocationComponent)
  },
  {
    path: 'stock-movements',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/material/stock-movements/stock-movements.component').then(m => m.StockMovementsComponent)
  },
  {
    path: 'inventory/materials',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/inventory/material-inventory/material-inventory.component').then(m => m.MaterialInventoryComponent)
  },
  {
    path: 'inventory/stock',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER] },
    loadComponent: () => import('./features/inventory/stock-monitoring/stock-monitoring.component').then(m => m.StockMonitoringComponent)
  },
  {
    path: 'inventory/procurement',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/inventory/procurement-request/procurement-request.component').then(m => m.ProcurementRequestComponent)
  },
  {
    path: 'procurement',
    redirectTo: 'inventory/procurement',
    pathMatch: 'full'
  },

  // === MODULE 6: WORKFORCE MANAGEMENT ===
  {
    path: 'workforce',
    redirectTo: 'workforce/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'workforce/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR, UserRole.CLIENT] },
    loadComponent: () => import('./features/workforce/workforce-dashboard/workforce-dashboard.component').then(m => m.WorkforceDashboardComponent)
  },
  {
    path: 'workforce/workers',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/workforce/worker-list/worker-list.component').then(m => m.WorkerListComponent)
  },
  {
    path: 'workforce/workers/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/workforce/worker-detail/worker-detail.component').then(m => m.WorkerDetailComponent)
  },
  {
    path: 'workforce/allocations',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/workforce/workforce-allocation/workforce-allocation.component').then(m => m.WorkforceAllocationComponent)
  },
  {
    path: 'workforce/attendance',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR, UserRole.WORKER] },
    loadComponent: () => import('./features/workforce/attendance-management/attendance-management.component').then(m => m.AttendanceManagementComponent)
  },
  {
    path: 'workforce/shifts',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR, UserRole.WORKER] },
    loadComponent: () => import('./features/workforce/shift-management/shift-management.component').then(m => m.ShiftManagementComponent)
  },
  {
    path: 'workforce/payroll',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/workforce/payroll-monitoring/payroll-monitoring.component').then(m => m.PayrollMonitoringComponent)
  },

  // === MODULE 7: PROCUREMENT MANAGEMENT ===
  {
    path: 'procurement/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR, UserRole.CLIENT] },
    loadComponent: () => import('./features/procurement/procurement-dashboard/procurement-dashboard.component').then(m => m.ProcurementDashboardComponent)
  },
  {
    path: 'procurement/vendors',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/procurement/vendor-list/vendor-list.component').then(m => m.VendorListComponent)
  },
  {
    path: 'procurement/vendors/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/procurement/vendor-detail/vendor-detail.component').then(m => m.VendorDetailComponent)
  },
  {
    path: 'procurement/requests',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/procurement/procurement-request-list/procurement-request-list.component').then(m => m.ProcurementRequestListComponent)
  },
  {
    path: 'procurement/purchase-orders',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/procurement/purchase-order-list/purchase-order-list.component').then(m => m.PurchaseOrderListComponent)
  },
  {
    path: 'procurement/invoices',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMINISTRATOR, UserRole.PROJECT_MANAGER, UserRole.CONTRACTOR] },
    loadComponent: () => import('./features/procurement/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
  },
  {
    path: 'procurement/workflow/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/procurement/procurement-detail/procurement-detail.component').then(m => m.ProcurementDetailComponent)
  },

  // Wildcard Route
  { path: '**', redirectTo: 'login' }
];


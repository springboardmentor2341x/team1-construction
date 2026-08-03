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
    path: 'projects/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
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
    data: { roles: [UserRole.PROJECT_MANAGER, UserRole.CLIENT] },
    loadComponent: () => import('./features/project-manager/analytics-reports/analytics-reports.component').then(m => m.AnalyticsReportsComponent)
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

  // Wildcard Route
  { path: '**', redirectTo: 'login' }
];

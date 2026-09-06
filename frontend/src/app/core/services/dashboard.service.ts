import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PmDashboardData {
  assignedProjects: {
    id: string;
    code: string;
    name: string;
    status: string;
    budget: number;
    completionPercentage: number;
    startDate?: string;
    endDate?: string;
  }[];
  selectedProjectId?: string;
  projectProgress: {
    totalProjects: number;
    overallCompletionPercentage: number;
    activeProjectsCount: number;
    totalMilestones: number;
    completedMilestones: number;
    delayedMilestones: number;
    milestoneVelocity: number;
  };
  budgetUtilization: {
    totalPlannedBudget: number;
    totalProcurementSpent: number;
    totalPurchaseOrderSpent: number;
    totalUtilized: number;
    remainingBudget: number;
    utilizationPercentage: number;
  };
  workforceStatus: {
    totalAssignedWorkers: number;
    presentTodayCount: number;
    absentTodayCount: number;
    attendanceRatePercentage: number;
    activeWorkforceCategories: number;
  };
  resourceUtilization: {
    totalAllocatedEquipment: number;
    activeEquipmentCount: number;
    maintenanceCount: number;
    utilizationRatePercentage: number;
  };
  procurementOverview: {
    totalRequests: number;
    pendingApprovalCount: number;
    approvedRequestsCount: number;
    purchaseOrderTotalAmount: number;
    totalInvoices: number;
  };
  recentActivities: {
    id: string;
    action: string;
    details: string;
    time: string;
  }[];
  unreadNotificationCount: number;
}

export interface AdminDashboardData {
  userManagement: {
    totalUsers: number;
    activeUsers: number;
    roleBreakdown: { [key: string]: number };
  };
  projectMonitoring: {
    totalProjects: number;
    inProgressProjects: number;
    planningProjects: number;
    completedProjects: number;
    totalSystemBudget: number;
    averageCompletionPercentage: number;
    projects: {
      id: string;
      code: string;
      name: string;
      status: string;
      budget: number;
      completionPercentage: number;
      projectManagerName: string;
    }[];
  };
  systemAnalytics: {
    totalSystemTasks: number;
    totalProcurementSpent: number;
    totalRegisteredWorkers: number;
    systemHealthStatus: string;
  };
  reportsManagement: {
    totalDailyReports: number;
    totalWeeklyReports: number;
    totalDelayIncidents: number;
    totalMilestonesTracked: number;
  };
  activityLogs: {
    id: string;
    project: string;
    action: string;
    details: string;
    timestamp: string;
  }[];
  unreadNotificationCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getPmDashboard(projectId?: string): Observable<PmDashboardData> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    return this.http.get<PmDashboardData>(`${this.apiUrl}/pm`, { params });
  }

  getAdminDashboard(): Observable<AdminDashboardData> {
    return this.http.get<AdminDashboardData>(`${this.apiUrl}/admin`);
  }

  getProjectSummary(projectId?: string): Observable<PmDashboardData> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    return this.http.get<PmDashboardData>(`${this.apiUrl}/project-summary`, { params });
  }
}

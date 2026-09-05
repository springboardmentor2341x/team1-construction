from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from app.models.user import User
from app.models.role import Role
from app.models.project import Project
from app.models.assignments import ProjectSiteEngineer, ProjectContractor, ProjectClient
from app.models.milestone import ProjectMilestone
from app.models.schedule import ProjectSchedule
from app.models.site_progress import DailyProgressReport, WeeklyProgressReport, DelayTracking, SiteActivityLog
from app.models.resource import ResourceModel, ResourceAllocationModel, ResourceUtilizationModel, ResourceMaintenanceModel
from app.models.equipment import EquipmentModel
from app.models.material import MaterialModel, MaterialInventoryModel, MaterialRequestModel, MaterialAllocationModel, StockMovementModel
from app.models.workforce import Worker, WorkerProjectAssignment, AttendanceModel, WorkforcePayroll
from app.models.procurement import ProcurementRequestModel, PurchaseOrderModel, InvoiceModel, VendorModel
from app.models.notification import Notification
from app.models.budget import ProjectBudget, ActualExpense

class DashboardService:

    @staticmethod
    def _get_project_completion_percentage(proj: Project) -> float:
        if proj.completion_status and proj.completion_status.overall_completion_percentage is not None:
            return float(proj.completion_status.overall_completion_percentage)
        if proj.milestones and len(proj.milestones) > 0:
            return float(sum(m.completion_percentage or 0 for m in proj.milestones) / len(proj.milestones))
        if proj.status in ("Completed", "COMPLETED"):
            return 100.0
        return float(getattr(proj, 'overall_progress', 0.0) or 0.0)


    @staticmethod
    def _get_pm_assigned_project_ids(db: Session, user: User) -> List[str]:
        """Fetch project IDs assigned to the logged-in Project Manager or authorized team member."""
        if user.role_rel and user.role_rel.name == "Administrator":
            projects = db.query(Project.id).all()
            return [p.id for p in projects]
        
        # Direct PM ownership
        pm_projects = db.query(Project.id).filter(Project.project_manager_id == user.id).all()
        project_ids = {p.id for p in pm_projects}

        # Also check site engineer assignments
        se_projects = db.query(ProjectSiteEngineer.project_id).filter(ProjectSiteEngineer.site_engineer_id == user.id).all()
        for p in se_projects:
            project_ids.add(p.project_id)

        # Also check contractor assignments
        c_projects = db.query(ProjectContractor.project_id).filter(ProjectContractor.contractor_id == user.id).all()
        for p in c_projects:
            project_ids.add(p.project_id)

        return list(project_ids)

    @classmethod
    def get_pm_dashboard(cls, db: Session, current_user: User, project_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculates PM Dashboard statistics based on PostgreSQL database records.
        Filterable by specific project_id or aggregated across assigned projects.
        """
        assigned_project_ids = cls._get_pm_assigned_project_ids(db, current_user)
        
        if project_id:
            if project_id not in assigned_project_ids and (current_user.role_rel and current_user.role_rel.name != "Administrator"):
                target_project_ids = []
            else:
                target_project_ids = [project_id]
        else:
            target_project_ids = assigned_project_ids

        if not target_project_ids:
            return {
                "assignedProjects": [],
                "selectedProjectId": project_id,
                "projectProgress": {"totalProjects": 0, "overallCompletionPercentage": 0.0, "activeProjectsCount": 0, "totalMilestones": 0, "completedMilestones": 0, "delayedMilestones": 0, "milestoneVelocity": 0.0},
                "budgetUtilization": {"totalPlannedBudget": 0.0, "totalProcurementSpent": 0.0, "totalPurchaseOrderSpent": 0.0, "totalUtilized": 0.0, "remainingBudget": 0.0, "utilizationPercentage": 0.0},
                "workforceStatus": {"totalAssignedWorkers": 0, "presentTodayCount": 0, "absentTodayCount": 0, "attendanceRatePercentage": 0.0, "activeWorkforceCategories": 0},
                "resourceUtilization": {"totalAllocatedEquipment": 0, "activeEquipmentCount": 0, "maintenanceCount": 0, "utilizationRatePercentage": 0.0},
                "procurementOverview": {"totalRequests": 0, "pendingApprovalCount": 0, "approvedRequestsCount": 0, "purchaseOrderTotalAmount": 0.0, "totalInvoices": 0},
                "recentActivities": [],
                "unreadNotificationCount": 0
            }

        # 1. Assigned Projects Summary
        projects_query = db.query(Project).filter(Project.id.in_(target_project_ids)).all()
        project_list_data = []
        total_budget = 0.0

        for proj in projects_query:
            p_budget = float(getattr(proj, 'estimated_budget', getattr(proj, 'budget', 0.0)) or 0.0)
            p_name = getattr(proj, 'project_name', getattr(proj, 'name', ''))
            p_progress = cls._get_project_completion_percentage(proj)
            total_budget += p_budget
            project_list_data.append({
                "id": proj.id,
                "code": proj.project_code,
                "name": p_name,
                "status": proj.status or "In Progress",
                "budget": p_budget,
                "completionPercentage": round(p_progress, 1),
                "startDate": str(proj.start_date) if proj.start_date else None,
                "endDate": str(proj.expected_completion_date) if proj.expected_completion_date else None
            })

        # 2. Project Progress & Milestones Calculation
        milestones = db.query(ProjectMilestone).filter(ProjectMilestone.project_id.in_(target_project_ids)).all()
        total_milestones = len(milestones)
        completed_milestones = sum(1 for m in milestones if m.status in ("Completed", "APPROVED", "Approved"))
        delayed_milestones = sum(1 for m in milestones if m.status in ("Delayed", "DELAYED", "Overdue"))
        
        if project_list_data:
            avg_completion = sum(p["completionPercentage"] for p in project_list_data) / len(project_list_data)
        else:
            avg_completion = 0.0

        milestone_velocity = round((completed_milestones / total_milestones * 100), 1) if total_milestones > 0 else 0.0

        # 3. Budget Utilization Calculation (Module 11 & Purchase Orders)
        po_total = db.query(func.coalesce(func.sum(PurchaseOrderModel.total_amount), 0.0)).filter(
            PurchaseOrderModel.project_id.in_(target_project_ids)
        ).scalar() or 0.0

        exp_total = db.query(func.coalesce(func.sum(ActualExpense.amount), 0.0)).filter(
            ActualExpense.project_id.in_(target_project_ids)
        ).scalar() or 0.0

        total_utilized = float(po_total) + float(exp_total)
        remaining_budget = max(0.0, total_budget - total_utilized)
        budget_utilization_pct = round((total_utilized / total_budget * 100), 1) if total_budget > 0 else 0.0

        # 4. Workforce Status Calculation
        worker_assignments = db.query(WorkerProjectAssignment).filter(
            WorkerProjectAssignment.project_id.in_(target_project_ids),
            WorkerProjectAssignment.assignment_status == "Active"
        ).all()
        assigned_worker_ids = list({w.worker_id for w in worker_assignments})
        total_assigned_workers = len(assigned_worker_ids)

        today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        today_attendance = db.query(AttendanceModel).filter(
            AttendanceModel.project_id.in_(target_project_ids),
            AttendanceModel.date == today_date
        ).all()
        
        present_count = sum(1 for a in today_attendance if a.status == "Present")
        absent_count = sum(1 for a in today_attendance if a.status == "Absent")
        
        if total_assigned_workers > 0 and len(today_attendance) > 0:
            att_rate = round((present_count / len(today_attendance) * 100), 1)
        else:
            att_rate = 0.0

        active_categories_count = db.query(func.count(func.distinct(Worker.workforce_category_id))).join(
            WorkerProjectAssignment, Worker.id == WorkerProjectAssignment.worker_id
        ).filter(
            WorkerProjectAssignment.project_id.in_(target_project_ids),
            WorkerProjectAssignment.assignment_status == "Active"
        ).scalar() or 0

        # 5. Resource Utilization Calculation
        allocations = db.query(ResourceAllocationModel).filter(
            ResourceAllocationModel.project_id.in_(target_project_ids),
            ResourceAllocationModel.status == "Active"
        ).all()
        total_allocated_equip = len(allocations)
        active_equip = sum(1 for a in allocations if a.status == "Active")
        
        utilization_pct = round((active_equip / total_allocated_equip * 100), 1) if total_allocated_equip > 0 else 0.0

        maint_count = db.query(func.count(ResourceMaintenanceModel.id)).join(
            ResourceModel, ResourceMaintenanceModel.resource_id == ResourceModel.id
        ).filter(
            ResourceModel.project_id.in_(target_project_ids),
            ResourceMaintenanceModel.status.in_(["Scheduled", "In Progress"])
        ).scalar() or 0

        if maint_count == 0:
            maint_count = db.query(func.count(ResourceModel.id)).filter(
                ResourceModel.project_id.in_(target_project_ids),
                ResourceModel.status == "Under Maintenance"
            ).scalar() or 0

        # 6. Procurement Overview Calculation
        proc_requests = db.query(ProcurementRequestModel).filter(
            ProcurementRequestModel.project_id.in_(target_project_ids)
        ).all()
        total_proc_reqs = len(proc_requests)
        pending_proc = sum(1 for r in proc_requests if r.request_status in ("Pending", "Submitted", "UNDER_REVIEW"))
        approved_proc = sum(1 for r in proc_requests if r.request_status in ("Approved", "APPROVED"))

        # 7. Unread Notification Count
        unread_notifications = db.query(func.count(Notification.id)).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).scalar() or 0

        # 8. Recent Activities
        recent_logs = db.query(SiteActivityLog).filter(
            SiteActivityLog.project_id.in_(target_project_ids)
        ).order_by(desc(SiteActivityLog.created_at)).limit(6).all()

        recent_activities = [{
            "id": log.id,
            "action": getattr(log, 'event_type', None) or getattr(log, 'description', None) or "Site Activity",
            "details": log.description or "",
            "time": log.created_at.strftime("%b %d, %H:%M") if log.created_at else "Just now"
        } for log in recent_logs]

        return {
            "assignedProjects": project_list_data,
            "selectedProjectId": project_id,
            "projectProgress": {
                "totalProjects": len(projects_query),
                "overallCompletionPercentage": round(avg_completion, 1),
                "activeProjectsCount": sum(1 for p in projects_query if p.status == "In Progress"),
                "totalMilestones": total_milestones,
                "completedMilestones": completed_milestones,
                "delayedMilestones": delayed_milestones,
                "milestoneVelocity": milestone_velocity
            },
            "budgetUtilization": {
                "totalPlannedBudget": round(total_budget, 2),
                "totalProcurementSpent": round(float(po_total), 2),
                "totalPurchaseOrderSpent": round(float(po_total), 2),
                "totalUtilized": round(total_utilized, 2),
                "remainingBudget": round(remaining_budget, 2),
                "utilizationPercentage": budget_utilization_pct
            },
            "workforceStatus": {
                "totalAssignedWorkers": total_assigned_workers,
                "presentTodayCount": present_count,
                "absentTodayCount": absent_count,
                "attendanceRatePercentage": att_rate,
                "activeWorkforceCategories": active_categories_count
            },
            "resourceUtilization": {
                "totalAllocatedEquipment": total_allocated_equip,
                "activeEquipmentCount": active_equip,
                "maintenanceCount": maint_count,
                "utilizationRatePercentage": utilization_pct
            },
            "procurementOverview": {
                "totalRequests": total_proc_reqs,
                "pendingApprovalCount": pending_proc,
                "approvedRequestsCount": approved_proc,
                "purchaseOrderTotalAmount": round(float(po_total), 2),
                "totalInvoices": db.query(func.count(InvoiceModel.id)).join(
                    PurchaseOrderModel, InvoiceModel.purchase_order_id == PurchaseOrderModel.id
                ).filter(PurchaseOrderModel.project_id.in_(target_project_ids)).scalar() or 0
            },
            "recentActivities": recent_activities,
            "unreadNotificationCount": unread_notifications
        }

    @classmethod
    def get_admin_dashboard(cls, db: Session, current_user: User) -> Dict[str, Any]:
        """
        Calculates System-Wide Administrator Dashboard statistics from PostgreSQL.
        Enforces Administrator security access control.
        """
        if not current_user.role_rel or current_user.role_rel.name != "Administrator":
            raise PermissionError("Only Administrator role is authorized to view Admin Dashboard")

        # 1. User Management Overview
        total_users = db.query(func.count(User.id)).scalar() or 0
        active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0

        roles_count = db.query(Role.name, func.count(User.id)).join(
            User, User.role_id == Role.id, isouter=True
        ).group_by(Role.name).all()

        role_breakdown = {role_name: count for role_name, count in roles_count if role_name}

        # 2. Project Monitoring Overview
        all_projects = db.query(Project).all()
        total_projects = len(all_projects)
        in_progress_projects = sum(1 for p in all_projects if p.status == "In Progress")
        planning_projects = sum(1 for p in all_projects if p.status == "Planning")
        completed_projects = sum(1 for p in all_projects if p.status == "Completed")

        total_system_budget = sum(float(getattr(p, 'estimated_budget', getattr(p, 'budget', 0.0)) or 0.0) for p in all_projects)
        system_completion_percentages = [cls._get_project_completion_percentage(p) for p in all_projects]
        avg_system_completion = sum(system_completion_percentages) / total_projects if total_projects > 0 else 0.0

        project_summary_list = []
        for p, p_pct in zip(all_projects, system_completion_percentages):
            pm = db.query(User).filter(User.id == p.project_manager_id).first() if p.project_manager_id else None
            project_summary_list.append({
                "id": p.id,
                "code": p.project_code,
                "name": getattr(p, 'project_name', getattr(p, 'name', '')),
                "status": p.status or "In Progress",
                "budget": float(getattr(p, 'estimated_budget', getattr(p, 'budget', 0.0)) or 0.0),
                "completionPercentage": round(p_pct, 1),
                "projectManagerName": pm.full_name if (pm and pm.full_name) else "Unassigned"
            })

        # 3. System Analytics Metrics & Dynamic Health Calculation
        total_tasks = db.query(func.count(Notification.id)).scalar() or 0
        total_proc_spent = db.query(func.coalesce(func.sum(PurchaseOrderModel.total_amount), 0.0)).scalar() or 0.0
        total_workers = db.query(func.count(Worker.id)).scalar() or 0

        delayed_milestones_count = db.query(func.count(ProjectMilestone.id)).filter(
            ProjectMilestone.status.in_(["Delayed", "DELAYED", "Overdue"])
        ).scalar() or 0

        pending_proc_count = db.query(func.count(ProcurementRequestModel.id)).filter(
            ProcurementRequestModel.request_status.in_(["Pending", "Submitted", "UNDER_REVIEW"])
        ).scalar() or 0

        if total_projects == 0:
            system_health = "Not Available"
        elif delayed_milestones_count > 0 or pending_proc_count > 5:
            system_health = "Attention Needed"
        else:
            system_health = "Operational"

        # 4. Reports Management Summary
        dpr_count = db.query(func.count(DailyProgressReport.id)).scalar() or 0
        wpr_count = db.query(func.count(WeeklyProgressReport.id)).scalar() or 0
        delays_count = db.query(func.count(DelayTracking.id)).scalar() or 0
        milestone_count = db.query(func.count(ProjectMilestone.id)).scalar() or 0

        # 5. Activity Monitoring Log Feed
        logs = db.query(SiteActivityLog).order_by(desc(SiteActivityLog.created_at)).limit(10).all()
        activity_logs = [{
            "id": log.id,
            "project": log.project.project_name if log.project else "System",
            "action": getattr(log, 'event_type', None) or getattr(log, 'description', None) or "Activity Recorded",
            "details": log.description or "",
            "timestamp": log.created_at.strftime("%Y-%m-%d %H:%M UTC") if log.created_at else "Now"
        } for log in logs]

        # Unread notifications for Admin
        unread_notifications = db.query(func.count(Notification.id)).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).scalar() or 0

        return {
            "userManagement": {
                "totalUsers": total_users,
                "activeUsers": active_users,
                "roleBreakdown": role_breakdown
            },
            "projectMonitoring": {
                "totalProjects": total_projects,
                "inProgressProjects": in_progress_projects,
                "planningProjects": planning_projects,
                "completedProjects": completed_projects,
                "totalSystemBudget": round(total_system_budget, 2),
                "averageCompletionPercentage": round(avg_system_completion, 1),
                "projects": project_summary_list
            },
            "systemAnalytics": {
                "totalSystemTasks": total_tasks,
                "totalProcurementSpent": round(float(total_proc_spent), 2),
                "totalRegisteredWorkers": total_workers,
                "systemHealthStatus": system_health
            },
            "reportsManagement": {
                "totalDailyReports": dpr_count,
                "totalWeeklyReports": wpr_count,
                "totalDelayIncidents": delays_count,
                "totalMilestonesTracked": milestone_count
            },
            "activityLogs": activity_logs,
            "unreadNotificationCount": unread_notifications
        }

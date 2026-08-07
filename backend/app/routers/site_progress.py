from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.schemas.site_progress import (
    PROGRESS_CATEGORIES,
    ACTIVITY_EVENT_TYPES,
    DailyProgressReportCreate,
    DailyProgressReportRead,
    DailyProgressReportUpdate,
    WeeklyProgressReportCreate,
    WeeklyProgressReportRead,
    DelayTrackingCreate,
    DelayTrackingRead,
    DelayTrackingUpdate,
    SiteActivityLogCreate,
    SiteActivityLogRead,
    SiteActivityLogUpdate,
    ProgressPhotographCreate,
    ProgressPhotographRead,
    WorkCompletionStatusRead,
    MilestoneTrackingRead,
    SiteProgressDashboardRead,
)
from app.services.site_progress_service import SiteProgressService

router = APIRouter(prefix="/site-progress", tags=["Site Progress Monitoring"])

# Roles allowed to create/edit operational site-progress data
SITE_WRITERS = ["Site Engineer", "Administrator", "Project Manager"]
MANAGERS = ["Administrator", "Project Manager"]


# ----------------------------------------------------------------------
# Daily Progress Reports
# ----------------------------------------------------------------------
@router.get("/daily-reports", response_model=List[DailyProgressReportRead])
def get_daily_reports(
    projectId: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SiteProgressService(db)
    return service.get_daily_reports(projectId)


@router.get("/daily-reports/{report_id}", response_model=DailyProgressReportRead)
def get_daily_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SiteProgressService(db)
    return service.get_daily_report(report_id)


@router.post("/daily-reports", response_model=DailyProgressReportRead, status_code=status.HTTP_201_CREATED)
def create_daily_report(
    req: DailyProgressReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(SITE_WRITERS)),
):
    service = SiteProgressService(db)
    return service.create_daily_report(req, current_user.full_name, current_user.id)


@router.put("/daily-reports/{report_id}", response_model=DailyProgressReportRead)
def update_daily_report(
    report_id: str,
    updates: DailyProgressReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(SITE_WRITERS)),
):
    service = SiteProgressService(db)
    return service.update_daily_report(report_id, updates)


@router.delete("/daily-reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_daily_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(MANAGERS)),
):
    service = SiteProgressService(db)
    service.delete_daily_report(report_id)
    return None


# ----------------------------------------------------------------------
# Weekly Progress Reports
# ----------------------------------------------------------------------
@router.get("/weekly-reports", response_model=List[WeeklyProgressReportRead])
def get_weekly_reports(
    projectId: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SiteProgressService(db)
    return service.get_weekly_reports(projectId)


@router.get("/weekly-reports/{report_id}", response_model=WeeklyProgressReportRead)
def get_weekly_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SiteProgressService(db)
    return service.get_weekly_report(report_id)


@router.post("/weekly-reports", response_model=WeeklyProgressReportRead, status_code=status.HTTP_201_CREATED)
def create_weekly_report(
    req: WeeklyProgressReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(MANAGERS)),
):
    service = SiteProgressService(db)
    return service.create_weekly_report(req, current_user.full_name)


@router.delete("/weekly-reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_weekly_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(MANAGERS)),
):
    service = SiteProgressService(db)
    service.delete_weekly_report(report_id)
    return None


# ----------------------------------------------------------------------
# Work Completion Status (auto-computed)
# ----------------------------------------------------------------------
@router.get("/completion-status", response_model=List[WorkCompletionStatusRead])
def get_completion_status(
    projectId: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SiteProgressService(db)
    return service.get_completion_status(projectId)


@router.post("/completion-status/recompute/{project_id}", response_model=WorkCompletionStatusRead)
def recompute_completion(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(SITE_WRITERS)),
):
    service = SiteProgressService(db)
    return service.recompute_completion(project_id)


# ----------------------------------------------------------------------
# Milestone Tracking (reuses existing project_milestones table)
# ----------------------------------------------------------------------
@router.get("/milestone-tracking", response_model=List[MilestoneTrackingRead])
def get_milestone_tracking(
    projectId: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SiteProgressService(db)
    return service.get_milestone_tracking(projectId)


@router.post("/milestone-tracking/sync/{project_id}", response_model=List[MilestoneTrackingRead])
def sync_milestones(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(SITE_WRITERS)),
):
    service = SiteProgressService(db)
    return service.sync_milestones_from_reports(project_id)


# ----------------------------------------------------------------------
# Delay Tracking
# ----------------------------------------------------------------------
@router.get("/delays", response_model=List[DelayTrackingRead])
def get_delays(
    projectId: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SiteProgressService(db)
    return service.get_delays(projectId)


@router.post("/delays", response_model=DelayTrackingRead, status_code=status.HTTP_201_CREATED)
def create_delay(
    req: DelayTrackingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(SITE_WRITERS)),
):
    service = SiteProgressService(db)
    return service.create_delay(req, current_user.full_name)


@router.put("/delays/{delay_id}", response_model=DelayTrackingRead)
def update_delay(
    delay_id: str,
    updates: DelayTrackingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(SITE_WRITERS)),
):
    service = SiteProgressService(db)
    return service.update_delay(delay_id, updates)


@router.delete("/delays/{delay_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_delay(
    delay_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(MANAGERS)),
):
    service = SiteProgressService(db)
    service.delete_delay(delay_id)
    return None


# ----------------------------------------------------------------------
# Site Activity Logs
# ----------------------------------------------------------------------
@router.get("/activity-logs", response_model=List[SiteActivityLogRead])
def get_site_activity_logs(
    projectId: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SiteProgressService(db)
    return service.get_activity_logs(projectId)


@router.post("/activity-logs", response_model=SiteActivityLogRead, status_code=status.HTTP_201_CREATED)
def create_site_activity_log(
    req: SiteActivityLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(SITE_WRITERS)),
):
    service = SiteProgressService(db)
    return service.create_activity_log(req, current_user.full_name)


@router.put("/activity-logs/{log_id}", response_model=SiteActivityLogRead)
def update_site_activity_log(
    log_id: str,
    updates: SiteActivityLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(SITE_WRITERS)),
):
    service = SiteProgressService(db)
    return service.update_activity_log(log_id, updates)


@router.delete("/activity-logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site_activity_log(
    log_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(MANAGERS)),
):
    service = SiteProgressService(db)
    service.delete_activity_log(log_id)
    return None


# ----------------------------------------------------------------------
# Progress Photographs
# ----------------------------------------------------------------------
@router.get("/photographs", response_model=List[ProgressPhotographRead])
def get_photographs(
    reportId: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SiteProgressService(db)
    return service.get_photographs(reportId)


@router.post("/photographs", response_model=ProgressPhotographRead, status_code=status.HTTP_201_CREATED)
def add_photograph(
    req: ProgressPhotographCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(SITE_WRITERS)),
):
    service = SiteProgressService(db)
    return service.add_photograph(req, current_user.full_name)


@router.delete("/photographs/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photograph(
    photo_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(SITE_WRITERS)),
):
    service = SiteProgressService(db)
    service.delete_photograph(photo_id)
    return None


# ----------------------------------------------------------------------
# Work Completion Dashboard summary
# ----------------------------------------------------------------------
@router.get("/dashboard", response_model=SiteProgressDashboardRead)
def get_dashboard(
    projectId: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SiteProgressService(db)
    return service.get_dashboard(projectId)


# Expose the allowed enum values for dropdowns on the frontend
@router.get("/meta/progress-categories", response_model=List[str])
def get_progress_categories(
    current_user: User = Depends(get_current_user),
):
    return PROGRESS_CATEGORIES


@router.get("/meta/activity-event-types", response_model=List[str])
def get_activity_event_types(
    current_user: User = Depends(get_current_user),
):
    return ACTIVITY_EVENT_TYPES


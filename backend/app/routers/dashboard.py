from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.rbac import get_current_user, RequireRole
from app.models.user import User
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Module 9 - Dashboard & Analytics"])

@router.get("/pm", response_model=Dict[str, Any])
def get_pm_dashboard(
    projectId: Optional[str] = Query(None, description="Optional filter for specific assigned project"),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"])),
    db: Session = Depends(get_db)
):
    """
    Get real database-driven metrics for the Project Manager Dashboard.
    Filterable by projectId. Restricted to user's assigned projects.
    """
    return DashboardService.get_pm_dashboard(db=db, current_user=current_user, project_id=projectId)


@router.get("/admin", response_model=Dict[str, Any])
def get_admin_dashboard(
    current_user: User = Depends(RequireRole(["Administrator"])),
    db: Session = Depends(get_db)
):
    """
    Get system-wide Administrator Dashboard analytics.
    Enforces Administrator security role check.
    """
    try:
        return DashboardService.get_admin_dashboard(db=db, current_user=current_user)
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.get("/project-summary", response_model=Dict[str, Any])
def get_project_summary(
    projectId: Optional[str] = Query(None),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"])),
    db: Session = Depends(get_db)
):
    """
    Get project summary metrics for analytics dashboards.
    """
    return DashboardService.get_pm_dashboard(db=db, current_user=current_user, project_id=projectId)

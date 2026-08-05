from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.schemas.project import (
    ProjectCreate, ProjectRead, ProjectUpdate,
    AssignmentRequest, AssignmentRead, AuditLogRead, ProjectCloseRequest
)
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])

ADMIN_PM = ["Administrator", "Project Manager"]


@router.get("", response_model=List[ProjectRead])
def get_projects(
    search: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProjectService(db)
    return service.get_projects(search, category, priority, status)


@router.get("/assignments", response_model=List[AssignmentRead])
def get_project_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return project personnel assignments (engineers, contractors, clients)."""
    service = ProjectService(db)
    return service.get_project_assignments()


@router.get("/{project_id}", response_model=ProjectRead)
def get_project_by_id(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProjectService(db)
    return service.get_project_by_id(project_id)


@router.get("/{project_id}/audit", response_model=List[AuditLogRead])
def get_project_audit(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    service = ProjectService(db)
    return service.get_project_audit_logs(project_id)


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    req: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator"]))
):
    service = ProjectService(db)
    return service.create_project(req, current_user.id)


@router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: str,
    updates: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    service = ProjectService(db)
    return service.update_project(project_id, updates, current_user.id)


@router.post("/{project_id}/close", response_model=ProjectRead)
def close_project(
    project_id: str,
    req: ProjectCloseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    service = ProjectService(db)
    return service.close_project(project_id, current_user.id, req.reason)


@router.post("/{project_id}/assign-engineer", response_model=ProjectRead)
def assign_engineer(
    project_id: str,
    req: AssignmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    service = ProjectService(db)
    return service.assign_site_engineer(project_id, req.userId, current_user.id)


@router.post("/{project_id}/assign-contractor", response_model=ProjectRead)
def assign_contractor(
    project_id: str,
    req: AssignmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    service = ProjectService(db)
    return service.assign_contractor(project_id, req.userId, current_user.id)


@router.post("/{project_id}/assign-client", response_model=ProjectRead)
def assign_client(
    project_id: str,
    req: AssignmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    service = ProjectService(db)
    return service.assign_client(project_id, req.userId, current_user.id)


@router.delete("/{project_id}/unassign", response_model=ProjectRead)
def unassign_user(
    project_id: str,
    userId: str,
    kind: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    service = ProjectService(db)
    return service.unassign_user(project_id, userId, current_user.id, kind)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator"]))
):
    service = ProjectService(db)
    service.delete_project(project_id)
    return None

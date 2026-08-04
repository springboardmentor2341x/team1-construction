from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectRead])
def get_projects(
    search: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    return service.get_projects(search, category, priority, status)

@router.get("/{project_id}", response_model=ProjectRead)
def get_project_by_id(project_id: str, db: Session = Depends(get_db)):
    service = ProjectService(db)
    return service.get_project_by_id(project_id)

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
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    service = ProjectService(db)
    return service.update_project(project_id, updates)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator"]))
):
    service = ProjectService(db)
    service.delete_project(project_id)
    return None

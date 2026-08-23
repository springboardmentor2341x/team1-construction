from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.schemas.milestone import MilestoneCreate, MilestoneRead, MilestoneUpdate
from app.services.milestone_service import MilestoneService

router = APIRouter(prefix="/milestones", tags=["Project Milestones"])


@router.get("", response_model=List[MilestoneRead])
def get_milestones_by_project(
    projectId: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = MilestoneService(db)
    return service.get_by_project(projectId)


@router.post("", response_model=MilestoneRead, status_code=status.HTTP_201_CREATED)
def create_milestone(
    req: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    service = MilestoneService(db)
    return service.create_milestone(req)


@router.put("/{milestone_id}", response_model=MilestoneRead)
def update_milestone(
    milestone_id: str,
    updates: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    service = MilestoneService(db)
    return service.update_milestone(milestone_id, updates)


@router.delete("/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(
    milestone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    service = MilestoneService(db)
    service.delete_milestone(milestone_id)
    return None

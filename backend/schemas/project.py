from pydantic import BaseModel
from datetime import date
from typing import List, Optional
from models.project import ProjectStatus, ProjectCategory

class ProjectMilestoneBase(BaseModel):
    name: str
    target_date: date
    completion_status: str = "Pending"

class ProjectMilestoneCreate(ProjectMilestoneBase):
    pass

class ProjectMilestoneResponse(ProjectMilestoneBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    status: ProjectStatus = ProjectStatus.planning
    category: ProjectCategory

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    manager_id: Optional[int] = None
    milestones: List[ProjectMilestoneResponse] = []

    class Config:
        from_attributes = True

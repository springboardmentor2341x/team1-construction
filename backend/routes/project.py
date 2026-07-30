from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.project import Project, ProjectMilestone
from schemas.project import ProjectCreate, ProjectResponse, ProjectMilestoneCreate, ProjectMilestoneResponse

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

@router.post("/", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/", response_model=List[ProjectResponse])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
def read_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/{project_id}/milestones", response_model=ProjectMilestoneResponse)
def create_milestone(project_id: int, milestone: ProjectMilestoneCreate, db: Session = Depends(get_db)):
    db_milestone = ProjectMilestone(**milestone.model_dump(), project_id=project_id)
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

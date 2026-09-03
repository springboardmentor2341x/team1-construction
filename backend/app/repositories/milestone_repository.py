from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.milestone import ProjectMilestone

class MilestoneRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, milestone_id: str) -> Optional[ProjectMilestone]:
        return self.db.query(ProjectMilestone).filter(ProjectMilestone.id == milestone_id).first()

    def get_by_project(self, project_id: str) -> List[ProjectMilestone]:
        return self.db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).all()

    def create(self, milestone: ProjectMilestone) -> ProjectMilestone:
        self.db.add(milestone)
        self.db.commit()
        self.db.refresh(milestone)
        return milestone

    def update(self, milestone: ProjectMilestone) -> ProjectMilestone:
        self.db.commit()
        self.db.refresh(milestone)
        return milestone

    def delete(self, milestone: ProjectMilestone) -> None:
        self.db.delete(milestone)
        self.db.commit()

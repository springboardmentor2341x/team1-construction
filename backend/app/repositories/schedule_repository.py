from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.schedule import ProjectSchedule

class ScheduleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, schedule_id: str) -> Optional[ProjectSchedule]:
        return self.db.query(ProjectSchedule).filter(ProjectSchedule.id == schedule_id).first()

    def get_by_project(self, project_id: str) -> List[ProjectSchedule]:
        return self.db.query(ProjectSchedule).filter(ProjectSchedule.project_id == project_id).all()

    def create(self, schedule: ProjectSchedule) -> ProjectSchedule:
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        return schedule

    def update(self, schedule: ProjectSchedule) -> ProjectSchedule:
        self.db.commit()
        self.db.refresh(schedule)
        return schedule

    def delete(self, schedule: ProjectSchedule) -> None:
        self.db.delete(schedule)
        self.db.commit()

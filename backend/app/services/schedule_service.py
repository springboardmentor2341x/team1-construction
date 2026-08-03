from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.schedule import ProjectSchedule
from app.schemas.schedule import ScheduleCreate, ScheduleRead, ScheduleUpdate
from app.repositories.schedule_repository import ScheduleRepository

class ScheduleService:
    def __init__(self, db: Session):
        self.repo = ScheduleRepository(db)

    def get_by_project(self, project_id: str) -> List[ScheduleRead]:
        schedules = self.repo.get_by_project(project_id)
        return [
            ScheduleRead(
                id=s.id,
                projectId=s.project_id,
                phaseName=s.phase_name,
                description=s.description,
                plannedStartDate=s.planned_start_date,
                plannedEndDate=s.planned_end_date,
                estimatedDurationDays=s.estimated_duration
            ) for s in schedules
        ]

    def create_schedule(self, req: ScheduleCreate) -> ScheduleRead:
        new_s = ProjectSchedule(
            project_id=req.projectId,
            phase_name=req.phaseName,
            description=req.description,
            planned_start_date=req.plannedStartDate,
            planned_end_date=req.plannedEndDate,
            estimated_duration=req.estimatedDurationDays or 0
        )
        created = self.repo.create(new_s)
        return ScheduleRead(
            id=created.id,
            projectId=created.project_id,
            phaseName=created.phase_name,
            description=created.description,
            plannedStartDate=created.planned_start_date,
            plannedEndDate=created.planned_end_date,
            estimatedDurationDays=created.estimated_duration
        )

    def update_schedule(self, schedule_id: str, updates: ScheduleUpdate) -> ScheduleRead:
        sch = self.repo.get_by_id(schedule_id)
        if not sch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule phase not found")

        if updates.phaseName is not None: sch.phase_name = updates.phaseName
        if updates.description is not None: sch.description = updates.description
        if updates.plannedStartDate is not None: sch.planned_start_date = updates.plannedStartDate
        if updates.plannedEndDate is not None: sch.planned_end_date = updates.plannedEndDate
        if updates.estimatedDurationDays is not None: sch.estimated_duration = updates.estimatedDurationDays

        updated = self.repo.update(sch)
        return ScheduleRead(
            id=updated.id,
            projectId=updated.project_id,
            phaseName=updated.phase_name,
            description=updated.description,
            plannedStartDate=updated.planned_start_date,
            plannedEndDate=updated.planned_end_date,
            estimatedDurationDays=updated.estimated_duration
        )

    def delete_schedule(self, schedule_id: str) -> bool:
        sch = self.repo.get_by_id(schedule_id)
        if not sch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule phase not found")
        self.repo.delete(sch)
        return True

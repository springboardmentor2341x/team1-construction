from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.milestone import ProjectMilestone
from app.schemas.milestone import MilestoneCreate, MilestoneRead, MilestoneUpdate
from app.repositories.milestone_repository import MilestoneRepository

class MilestoneService:
    def __init__(self, db: Session):
        self.repo = MilestoneRepository(db)

    def get_by_project(self, project_id: str) -> List[MilestoneRead]:
        milestones = self.repo.get_by_project(project_id)
        return [
            MilestoneRead(
                id=m.id,
                projectId=m.project_id,
                milestoneName=m.milestone_name,
                description=m.description,
                plannedDate=m.planned_date,
                actualCompletionDate=m.actual_completion_date,
                completionPercentage=m.completion_percentage,
                status=m.status
            ) for m in milestones
        ]

    def create_milestone(self, req: MilestoneCreate) -> MilestoneRead:
        new_m = ProjectMilestone(
            project_id=req.projectId,
            milestone_name=req.milestoneName,
            description=req.description,
            planned_date=req.plannedDate,
            actual_completion_date=req.actualCompletionDate,
            completion_percentage=req.completionPercentage or 0,
            status=req.status or "Pending"
        )
        created = self.repo.create(new_m)
        return MilestoneRead(
            id=created.id,
            projectId=created.project_id,
            milestoneName=created.milestone_name,
            description=created.description,
            plannedDate=created.planned_date,
            actualCompletionDate=created.actual_completion_date,
            completionPercentage=created.completion_percentage,
            status=created.status
        )

    def update_milestone(self, milestone_id: str, updates: MilestoneUpdate) -> MilestoneRead:
        ms = self.repo.get_by_id(milestone_id)
        if not ms:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

        if updates.milestoneName is not None: ms.milestone_name = updates.milestoneName
        if updates.description is not None: ms.description = updates.description
        if updates.plannedDate is not None: ms.planned_date = updates.plannedDate
        if updates.actualCompletionDate is not None: ms.actual_completion_date = updates.actualCompletionDate
        if updates.completionPercentage is not None: ms.completion_percentage = updates.completionPercentage
        if updates.status is not None: ms.status = updates.status

        updated = self.repo.update(ms)
        return MilestoneRead(
            id=updated.id,
            projectId=updated.project_id,
            milestoneName=updated.milestone_name,
            description=updated.description,
            plannedDate=updated.planned_date,
            actualCompletionDate=updated.actual_completion_date,
            completionPercentage=updated.completion_percentage,
            status=updated.status
        )

    def delete_milestone(self, milestone_id: str) -> bool:
        ms = self.repo.get_by_id(milestone_id)
        if not ms:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
        self.repo.delete(ms)
        return True

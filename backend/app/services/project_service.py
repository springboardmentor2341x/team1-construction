from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate, PersonnelRead
from app.repositories.project_repository import ProjectRepository

class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.project_repo = ProjectRepository(db)

    def get_projects(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        status_filter: Optional[str] = None
    ) -> List[ProjectRead]:
        projects = self.project_repo.get_all(search, category, priority, status_filter)
        return [self._to_read_schema(p) for p in projects]

    def get_project_by_id(self, project_id: str) -> ProjectRead:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return self._to_read_schema(project)

    def create_project(self, req: ProjectCreate, current_user_id: str) -> ProjectRead:
        existing = self.project_repo.get_by_code(req.projectCode)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project Code already exists")

        new_proj = Project(
            project_name=req.projectName,
            project_code=req.projectCode,
            category=req.category,
            client_name=req.clientName,
            client_contact=req.clientContact,
            description=req.description,
            location=req.location,
            estimated_budget=req.estimatedBudget,
            priority=req.priority,
            status=req.status,
            start_date=req.startDate,
            expected_completion_date=req.expectedCompletionDate,
            project_manager_id=req.projectManagerId,
            created_by=current_user_id
        )

        created = self.project_repo.create(new_proj)
        return self._to_read_schema(created)

    def update_project(self, project_id: str, updates: ProjectUpdate) -> ProjectRead:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        if updates.projectName is not None: project.project_name = updates.projectName
        if updates.category is not None: project.category = updates.category
        if updates.clientName is not None: project.client_name = updates.clientName
        if updates.clientContact is not None: project.client_contact = updates.clientContact
        if updates.description is not None: project.description = updates.description
        if updates.location is not None: project.location = updates.location
        if updates.estimatedBudget is not None: project.estimated_budget = updates.estimatedBudget
        if updates.startDate is not None: project.start_date = updates.startDate
        if updates.expectedCompletionDate is not None: project.expected_completion_date = updates.expectedCompletionDate
        if updates.priority is not None: project.priority = updates.priority
        if updates.status is not None: project.status = updates.status
        if updates.projectManagerId is not None: project.project_manager_id = updates.projectManagerId

        updated = self.project_repo.update(project)
        return self._to_read_schema(updated)

    def delete_project(self, project_id: str) -> bool:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        self.project_repo.delete(project)
        return True

    def _to_read_schema(self, p: Project) -> ProjectRead:
        pm_name = p.project_manager.full_name if p.project_manager else "Unassigned"
        return ProjectRead(
            id=p.id,
            projectName=p.project_name,
            projectCode=p.project_code,
            category=p.category,
            clientName=p.client_name,
            clientContact=p.client_contact,
            description=p.description,
            location=p.location,
            estimatedBudget=p.estimated_budget,
            startDate=p.start_date,
            expectedCompletionDate=p.expected_completion_date,
            priority=p.priority,
            status=p.status,
            projectManagerId=p.project_manager_id,
            projectManagerName=pm_name,
            assignedEngineers=[
                PersonnelRead(id="eng-1", name="David Miller", role="Lead Site Engineer")
            ],
            assignedContractors=[
                PersonnelRead(id="con-1", name="Marcus Brody", role="Structural Steel Contractor")
            ]
        )

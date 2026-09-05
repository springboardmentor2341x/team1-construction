from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.assignments import ProjectSiteEngineer, ProjectContractor, ProjectClient
from app.models.project_audit import ProjectAuditLog
from app.models.user import User
from app.schemas.project import (
    ProjectCreate, ProjectRead, ProjectUpdate, PersonnelRead, AssignmentRead, AuditLogRead
)
from app.repositories.project_repository import ProjectRepository
from app.services.notification_service import NotificationService


def _user_personnel(user: User) -> PersonnelRead:
    role = user.role_rel.name if user.role_rel else "Team Member"
    return PersonnelRead(
        id=user.id,
        name=user.full_name,
        role=role,
        avatar=user.profile_picture
    )


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.project_repo = ProjectRepository(db)

    def get_projects(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        status_filter: Optional[str] = None,
        current_user: Optional[User] = None
    ) -> List[ProjectRead]:
        projects = self.project_repo.get_all(search, category, priority, status_filter)
        if current_user and (not current_user.role_rel or current_user.role_rel.name != "Administrator"):
            from app.services.budget_service import BudgetService
            authorized_ids = BudgetService.get_user_authorized_project_ids(self.db, current_user)
            projects = [p for p in projects if p.id in authorized_ids]
        return [self._to_read_schema(p) for p in projects]

    def get_project_by_id(self, project_id: str, current_user: Optional[User] = None) -> ProjectRead:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        if current_user and (not current_user.role_rel or current_user.role_rel.name != "Administrator"):
            from app.services.budget_service import BudgetService
            authorized_ids = BudgetService.get_user_authorized_project_ids(self.db, current_user)
            if project_id not in authorized_ids:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this project")
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
        self._log_audit(created.id, "PROJECT_CREATED", current_user_id, f"Project {created.project_code} created")
        return self._to_read_schema(created)

    def update_project(self, project_id: str, updates: ProjectUpdate, current_user_id: str) -> ProjectRead:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        if project.status == "Closed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify a closed project")

        changed = []
        if updates.projectName is not None:
            project.project_name = updates.projectName
            changed.append("name")
        if updates.category is not None:
            project.category = updates.category
            changed.append("category")
        if updates.clientName is not None:
            project.client_name = updates.clientName
            changed.append("client")
        if updates.clientContact is not None:
            project.client_contact = updates.clientContact
            changed.append("client contact")
        if updates.description is not None:
            project.description = updates.description
            changed.append("description")
        if updates.location is not None:
            project.location = updates.location
            changed.append("location")
        if updates.estimatedBudget is not None:
            project.estimated_budget = updates.estimatedBudget
            changed.append("budget")
        if updates.startDate is not None:
            project.start_date = updates.startDate
            changed.append("start date")
        if updates.expectedCompletionDate is not None:
            project.expected_completion_date = updates.expectedCompletionDate
            changed.append("completion date")
        if updates.priority is not None:
            project.priority = updates.priority
            changed.append("priority")
        if updates.status is not None:
            project.status = updates.status
            changed.append("status")
        if updates.projectManagerId is not None:
            project.project_manager_id = updates.projectManagerId
            changed.append("project manager")

        updated = self.project_repo.update(project)
        self._log_audit(project.id, "PROJECT_UPDATED", current_user_id, f"Updated: {', '.join(changed) if changed else 'no fields'}")

        # Emit Project Update Notifications to authorized relevant users
        recipients = NotificationService.get_relevant_project_user_ids(self.db, project.id, exclude_user_id=current_user_id)
        if recipients and changed:
            NotificationService.create_bulk_notifications(
                db=self.db,
                user_ids=recipients,
                title=f"Project Updated: {project.project_name}",
                message=f"Project '{project.project_name}' ({project.project_code}) was updated ({', '.join(changed)}).",
                type="PROJECT_UPDATE",
                project_id=project.id,
                reference_module="projects",
                reference_id=project.id,
                category="Project"
            )

        return self._to_read_schema(updated)

    def delete_project(self, project_id: str) -> bool:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        if project.status == "Closed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify a closed project")
        self.project_repo.delete(project)
        return True

    # ---- Assignment methods ----

    def assign_site_engineer(self, project_id: str, user_id: str, current_user_id: str) -> ProjectRead:
        return self._assign_user(project_id, user_id, current_user_id, "engineer")

    def assign_contractor(self, project_id: str, user_id: str, current_user_id: str) -> ProjectRead:
        return self._assign_user(project_id, user_id, current_user_id, "contractor")

    def assign_client(self, project_id: str, user_id: str, current_user_id: str) -> ProjectRead:
        return self._assign_user(project_id, user_id, current_user_id, "client")

    def _assign_user(self, project_id: str, user_id: str, current_user_id: str, kind: str) -> ProjectRead:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        if project.status == "Closed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify a closed project")

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if kind == "engineer":
            existing = self.db.query(ProjectSiteEngineer).filter(
                ProjectSiteEngineer.project_id == project_id,
                ProjectSiteEngineer.site_engineer_id == user_id
            ).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Engineer already assigned")
            self.db.add(ProjectSiteEngineer(project_id=project_id, site_engineer_id=user_id))
            label = "site engineer"
        elif kind == "contractor":
            existing = self.db.query(ProjectContractor).filter(
                ProjectContractor.project_id == project_id,
                ProjectContractor.contractor_id == user_id
            ).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Contractor already assigned")
            self.db.add(ProjectContractor(project_id=project_id, contractor_id=user_id))
            label = "contractor"
        else:
            existing = self.db.query(ProjectClient).filter(
                ProjectClient.project_id == project_id,
                ProjectClient.client_id == user_id
            ).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Client already assigned")
            self.db.add(ProjectClient(project_id=project_id, client_id=user_id))
            label = "client"

        self.db.commit()
        self._log_audit(project_id, f"PROJECT_{label.upper()}_ASSIGNED", current_user_id,
                        f"{user.full_name} assigned as {label}")

        # Emit Assignment Notification to the specific assigned user
        NotificationService.create_notification(
            db=self.db,
            user_id=user_id,
            title=f"Assigned to Project: {project.project_name}",
            message=f"You have been assigned as {label.title()} for project '{project.project_name}' ({project.project_code}).",
            type="PROJECT_UPDATE",
            project_id=project_id,
            reference_module="projects",
            reference_id=project_id,
            category="Project"
        )

        return self._to_read_schema(project)

    def unassign_user(self, project_id: str, user_id: str, current_user_id: str, kind: str) -> ProjectRead:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        if project.status == "Closed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify a closed project")

        if kind == "engineer":
            row = self.db.query(ProjectSiteEngineer).filter(
                ProjectSiteEngineer.project_id == project_id,
                ProjectSiteEngineer.site_engineer_id == user_id
            ).first()
            label = "site engineer"
        elif kind == "contractor":
            row = self.db.query(ProjectContractor).filter(
                ProjectContractor.project_id == project_id,
                ProjectContractor.contractor_id == user_id
            ).first()
            label = "contractor"
        else:
            row = self.db.query(ProjectClient).filter(
                ProjectClient.project_id == project_id,
                ProjectClient.client_id == user_id
            ).first()
            label = "client"

        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        self.db.delete(row)
        self.db.commit()
        self._log_audit(project_id, f"PROJECT_{label.upper()}_UNASSIGNED", current_user_id,
                        f"{label} removed from project")
        return self._to_read_schema(project)

    def get_project_assignments(self) -> List[AssignmentRead]:
        projects = self.project_repo.get_all()
        result = []
        for p in projects:
            engineers = [_user_personnel(se.engineer) for se in p.site_engineers if se.engineer]
            contractors = [_user_personnel(c.contractor) for c in p.contractors if c.contractor]
            clients = [_user_personnel(c.client) for c in p.clients if c.client]
            result.append(AssignmentRead(
                projectId=p.id,
                projectName=p.project_name,
                engineers=engineers,
                contractors=contractors,
                clients=clients
            ))
        return result

    # ---- Closure ----

    def close_project(self, project_id: str, current_user_id: str, reason: Optional[str] = None) -> ProjectRead:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        if project.status == "Closed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project is already closed")

        # Closure validation: verify all project milestones are completed
        from app.models.milestone import ProjectMilestone
        milestones = self.db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).all()
        pending_milestones = [m for m in milestones if m.completion_percentage < 100 and m.status != "Completed"]
        if pending_milestones:
            incomplete_names = ", ".join([f"'{m.milestone_name}' ({m.completion_percentage}%)" for m in pending_milestones])
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot close project: Incomplete milestones remain [{incomplete_names}]. All milestones must reach 100% completion before project closure."
            )

        project.status = "Closed"
        updated = self.project_repo.update(project)
        desc = f"Project marked as Closed" + (f" ({reason})" if reason else "")
        self._log_audit(project_id, "PROJECT_CLOSED", current_user_id, desc)
        return self._to_read_schema(updated)

    # ---- Audit ----

    def get_project_audit_logs(self, project_id: str) -> List[AuditLogRead]:
        logs = self.db.query(ProjectAuditLog).filter(
            ProjectAuditLog.project_id == project_id
        ).order_by(ProjectAuditLog.created_at.desc()).all()
        return [
            AuditLogRead(
                id=log.id,
                action=log.action,
                performedByName=log.performed_by_name,
                description=log.description,
                timestamp=log.created_at.isoformat() if log.created_at else None
            ) for log in logs
        ]

    def _log_audit(self, project_id: str, action: str, user_id: Optional[str], description: str):
        name = None
        if user_id:
            u = self.db.query(User).filter(User.id == user_id).first()
            name = u.full_name if u else None
        self.db.add(ProjectAuditLog(
            project_id=project_id,
            action=action,
            performed_by=user_id,
            performed_by_name=name,
            description=description
        ))
        self.db.commit()

    def _to_read_schema(self, p: Project) -> ProjectRead:
        pm_name = p.project_manager.full_name if p.project_manager else "Unassigned"
        engineers = [_user_personnel(se.engineer) for se in p.site_engineers if se.engineer]
        contractors = [_user_personnel(c.contractor) for c in p.contractors if c.contractor]
        clients = [_user_personnel(c.client) for c in p.clients if c.client]
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
            assignedEngineers=engineers,
            assignedContractors=contractors,
            assignedClients=clients
        )

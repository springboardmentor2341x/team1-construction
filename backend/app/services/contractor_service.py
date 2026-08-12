from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.project import Project
from app.models.assignments import ContractorWorker
from app.schemas.contractor import ContractorWorkerRead, WorkerAssignRequest

class ContractorService:
    def __init__(self, db: Session):
        self.db = db

    def _verify_contractor(self, contractor_id: str) -> User:
        contractor = self.db.query(User).filter(User.id == contractor_id).first()
        if not contractor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contractor account not found")
        contractor_role = contractor.role_rel.name if contractor.role_rel else ""
        if contractor_role != "Contractor" and contractor_role != "Administrator":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Target user is not a Contractor (user role: {contractor_role})"
            )
        return contractor

    def _verify_permission(self, contractor_id: str, current_user: User):
        user_role = current_user.role_rel.name if current_user.role_rel else ""
        if user_role in ["Administrator", "Project Manager"]:
            return
        if user_role == "Contractor" and current_user.id == contractor_id:
            return
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage this contractor's workers"
        )

    def get_assigned_workers(self, contractor_id: str, current_user: User) -> List[ContractorWorkerRead]:
        self._verify_contractor(contractor_id)
        self._verify_permission(contractor_id, current_user)

        assignments = self.db.query(ContractorWorker).filter(
            ContractorWorker.contractor_id == contractor_id
        ).all()

        results = []
        for a in assignments:
            worker = self.db.query(User).filter(User.id == a.worker_id).first()
            project = self.db.query(Project).filter(Project.id == a.project_id).first() if a.project_id else None
            if worker:
                results.append(ContractorWorkerRead(
                    id=a.id,
                    contractorId=a.contractor_id,
                    workerId=worker.id,
                    workerName=worker.full_name,
                    workerEmail=worker.email,
                    trade=worker.department or "General",
                    employeeId=worker.employee_id,
                    projectId=project.id if project else None,
                    projectName=project.project_name if project else None,
                    assignedAt=a.assigned_at.isoformat() if a.assigned_at else None
                ))
        return results

    def assign_worker(self, contractor_id: str, req: WorkerAssignRequest, current_user: User) -> ContractorWorkerRead:
        contractor = self._verify_contractor(contractor_id)
        self._verify_permission(contractor_id, current_user)

        worker = self.db.query(User).filter(User.id == req.workerId).first()
        if not worker:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker account not found")

        worker_role = worker.role_rel.name if worker.role_rel else ""
        if worker_role != "Worker":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Target user is not a Worker (user role: {worker_role})"
            )

        # Check duplicate assignment
        existing = self.db.query(ContractorWorker).filter(
            ContractorWorker.contractor_id == contractor_id,
            ContractorWorker.worker_id == req.workerId
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Worker is already assigned to this contractor"
            )

        project = None
        if req.projectId:
            project = self.db.query(Project).filter(Project.id == req.projectId).first()
            if not project:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        new_assignment = ContractorWorker(
            contractor_id=contractor_id,
            worker_id=req.workerId,
            project_id=req.projectId
        )
        self.db.add(new_assignment)
        self.db.commit()
        self.db.refresh(new_assignment)

        return ContractorWorkerRead(
            id=new_assignment.id,
            contractorId=new_assignment.contractor_id,
            workerId=worker.id,
            workerName=worker.full_name,
            workerEmail=worker.email,
            trade=worker.department or "General",
            employeeId=worker.employee_id,
            projectId=project.id if project else None,
            projectName=project.project_name if project else None,
            assignedAt=new_assignment.assigned_at.isoformat() if new_assignment.assigned_at else None
        )

    def remove_worker(self, contractor_id: str, worker_id: str, current_user: User) -> bool:
        self._verify_contractor(contractor_id)
        self._verify_permission(contractor_id, current_user)

        assignment = self.db.query(ContractorWorker).filter(
            ContractorWorker.contractor_id == contractor_id,
            ContractorWorker.worker_id == worker_id
        ).first()
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Worker assignment not found for this contractor"
            )

        self.db.delete(assignment)
        self.db.commit()
        return True

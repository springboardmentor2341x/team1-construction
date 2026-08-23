from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.contractor import ContractorWorkerRead, WorkerAssignRequest
from app.services.contractor_service import ContractorService

router = APIRouter(prefix="/contractors", tags=["Contractors"])

@router.get("/{contractor_id}/workers", response_model=List[ContractorWorkerRead])
def get_contractor_workers(
    contractor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ContractorService(db)
    return service.get_assigned_workers(contractor_id, current_user)

@router.post("/{contractor_id}/workers", response_model=ContractorWorkerRead, status_code=status.HTTP_201_CREATED)
def assign_worker_to_contractor(
    contractor_id: str,
    req: WorkerAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ContractorService(db)
    return service.assign_worker(contractor_id, req, current_user)

@router.delete("/{contractor_id}/workers/{worker_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_worker_from_contractor(
    contractor_id: str,
    worker_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ContractorService(db)
    service.remove_worker(contractor_id, worker_id, current_user)
    return None

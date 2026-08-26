from typing import List, Optional

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.models.shift import ShiftModel
from app.models.workforce import WorkerShiftAssignment, Worker, WorkerProjectAssignment


router = APIRouter(prefix="/shifts", tags=["Shifts"])


# =========================================================
# Schemas
# =========================================================

class ShiftWorkerRead(BaseModel):
    id: str
    workerId: str
    workerName: str
    workerCode: Optional[str] = None
    assignedAt: Optional[str] = None

    class Config:
        from_attributes = True


class ShiftRead(BaseModel):
    id: str
    shiftName: str
    date: str
    shiftType: str
    shiftStart: str
    shiftEnd: str
    location: str
    projectId: Optional[str] = None
    project: str
    status: str
    assignedWorkers: List[ShiftWorkerRead] = []

    class Config:
        from_attributes = True


class ShiftCreate(BaseModel):
    shiftName: str = "Morning Shift"
    date: str
    shiftType: Optional[str] = "Morning"
    shiftStart: Optional[str] = "06:00"
    shiftEnd: Optional[str] = "14:00"
    location: Optional[str] = ""
    projectId: Optional[str] = None
    project: Optional[str] = ""
    status: Optional[str] = "Scheduled"
    workerIds: List[str] = []


class ShiftUpdate(BaseModel):
    shiftName: Optional[str] = None
    date: Optional[str] = None
    shiftType: Optional[str] = None
    shiftStart: Optional[str] = None
    shiftEnd: Optional[str] = None
    location: Optional[str] = None
    projectId: Optional[str] = None
    project: Optional[str] = None
    status: Optional[str] = None


class ShiftWorkerAssignRequest(BaseModel):
    workerIds: List[str]


# =========================================================
# Helper
# =========================================================

def _to_read(s: ShiftModel) -> ShiftRead:
    assigned_workers = []

    for assignment in s.worker_assignments:
        worker = assignment.worker

        if not worker:
            continue

        assigned_workers.append(
            ShiftWorkerRead(
                id=assignment.id,
                workerId=worker.id,
                workerName=worker.worker_name,
                workerCode=worker.worker_id,
                assignedAt=(
                    assignment.assigned_at.isoformat()
                    if assignment.assigned_at
                    else None
                )
            )
        )

    return ShiftRead(
        id=s.id,
        shiftName=s.shift_name,
        date=s.date,
        shiftType=s.shift_type,
        shiftStart=s.shift_start,
        shiftEnd=s.shift_end,
        location=s.location,
        projectId=s.project_id,
        project=s.project,
        status=s.status,
        assignedWorkers=assigned_workers
    )


# =========================================================
# Get Shifts
# =========================================================

@router.get("", response_model=List[ShiftRead])
def get_shifts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shifts = (
        db.query(ShiftModel)
        .order_by(ShiftModel.date)
        .all()
    )

    return [_to_read(s) for s in shifts]


# =========================================================
# Create Shift
# =========================================================

@router.post(
    "",
    response_model=ShiftRead,
    status_code=status.HTTP_201_CREATED
)
def create_shift(
    req: ShiftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        RequireRole(
            [
                "Administrator",
                "Project Manager",
                "Site Engineer"
            ]
        )
    )
):
    new_shift = ShiftModel(
        shift_name=req.shiftName,
        worker_name="",
        date=req.date,
        shift_type=req.shiftType or "Morning",
        shift_start=req.shiftStart or "06:00",
        shift_end=req.shiftEnd or "14:00",
        location=req.location or "",
        project=req.project or "",
        project_id=req.projectId,
        status=req.status or "Scheduled"
    )

    db.add(new_shift)
    db.flush()

    # -----------------------------------------------------
    # Assign workers only if they are assigned to the
    # selected project.
    # -----------------------------------------------------

    if req.workerIds:

        if not req.projectId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="projectId is required when assigning workers"
            )

        for worker_id in req.workerIds:

            worker = (
                db.query(Worker)
                .filter(Worker.id == worker_id)
                .first()
            )

            if not worker:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Worker {worker_id} not found"
                )

            assignment = (
                db.query(WorkerProjectAssignment)
                .filter(
                    WorkerProjectAssignment.worker_id == worker_id,
                    WorkerProjectAssignment.project_id == req.projectId,
                    WorkerProjectAssignment.assignment_status == "Active"
                )
                .first()
            )

            if not assignment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Worker {worker.worker_name} is not actively "
                        f"assigned to the selected project"
                    )
                )

            existing = (
                db.query(WorkerShiftAssignment)
                .filter(
                    WorkerShiftAssignment.shift_id == new_shift.id,
                    WorkerShiftAssignment.worker_id == worker_id
                )
                .first()
            )

            if not existing:
                db.add(
                    WorkerShiftAssignment(
                        shift_id=new_shift.id,
                        worker_id=worker_id
                    )
                )

    db.commit()
    db.refresh(new_shift)

    return _to_read(new_shift)


# =========================================================
# Update Shift
# =========================================================

@router.put("/{shift_id}", response_model=ShiftRead)
def update_shift(
    shift_id: str,
    updates: ShiftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        RequireRole(
            [
                "Administrator",
                "Project Manager",
                "Site Engineer"
            ]
        )
    )
):
    shift = (
        db.query(ShiftModel)
        .filter(ShiftModel.id == shift_id)
        .first()
    )

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    if updates.shiftName is not None:
        shift.shift_name = updates.shiftName

    if updates.date is not None:
        shift.date = updates.date

    if updates.shiftType is not None:
        shift.shift_type = updates.shiftType

    if updates.shiftStart is not None:
        shift.shift_start = updates.shiftStart

    if updates.shiftEnd is not None:
        shift.shift_end = updates.shiftEnd

    if updates.location is not None:
        shift.location = updates.location

    if updates.projectId is not None:
        shift.project_id = updates.projectId

    if updates.project is not None:
        shift.project = updates.project

    if updates.status is not None:
        shift.status = updates.status

    db.commit()
    db.refresh(shift)

    return _to_read(shift)


# =========================================================
# Assign Workers To Existing Shift
# =========================================================

@router.post(
    "/{shift_id}/workers",
    response_model=ShiftRead
)
def assign_workers_to_shift(
    shift_id: str,
    req: ShiftWorkerAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        RequireRole(
            [
                "Administrator",
                "Project Manager",
                "Site Engineer"
            ]
        )
    )
):
    shift = (
        db.query(ShiftModel)
        .filter(ShiftModel.id == shift_id)
        .first()
    )

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    if not shift.project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shift must belong to a project before workers can be assigned"
        )

    for worker_id in req.workerIds:

        worker = (
            db.query(Worker)
            .filter(Worker.id == worker_id)
            .first()
        )

        if not worker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Worker {worker_id} not found"
            )

        project_assignment = (
            db.query(WorkerProjectAssignment)
            .filter(
                WorkerProjectAssignment.worker_id == worker_id,
                WorkerProjectAssignment.project_id == shift.project_id,
                WorkerProjectAssignment.assignment_status == "Active"
            )
            .first()
        )

        if not project_assignment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Worker {worker.worker_name} is not actively "
                    f"assigned to this project"
                )
            )

        existing = (
            db.query(WorkerShiftAssignment)
            .filter(
                WorkerShiftAssignment.shift_id == shift.id,
                WorkerShiftAssignment.worker_id == worker_id
            )
            .first()
        )

        if not existing:
            db.add(
                WorkerShiftAssignment(
                    shift_id=shift.id,
                    worker_id=worker_id
                )
            )

    db.commit()
    db.refresh(shift)

    return _to_read(shift)


# =========================================================
# Remove Worker From Shift
# =========================================================

@router.delete(
    "/{shift_id}/workers/{worker_id}",
    response_model=ShiftRead
)
def remove_worker_from_shift(
    shift_id: str,
    worker_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        RequireRole(
            [
                "Administrator",
                "Project Manager",
                "Site Engineer"
            ]
        )
    )
):
    assignment = (
        db.query(WorkerShiftAssignment)
        .filter(
            WorkerShiftAssignment.shift_id == shift_id,
            WorkerShiftAssignment.worker_id == worker_id
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker is not assigned to this shift"
        )

    db.delete(assignment)
    db.commit()

    shift = (
        db.query(ShiftModel)
        .filter(ShiftModel.id == shift_id)
        .first()
    )

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    return _to_read(shift)


# =========================================================
# Delete Shift
# =========================================================

@router.delete(
    "/{shift_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_shift(
    shift_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        RequireRole(
            [
                "Administrator",
                "Project Manager",
                "Site Engineer"
            ]
        )
    )
):
    shift = (
        db.query(ShiftModel)
        .filter(ShiftModel.id == shift_id)
        .first()
    )

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    db.delete(shift)
    db.commit()

    return None

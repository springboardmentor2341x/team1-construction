from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.models.shift import ShiftModel
from pydantic import BaseModel

router = APIRouter(prefix="/shifts", tags=["Shifts"])


class ShiftRead(BaseModel):
    id: str
    workerName: str
    date: str
    shiftType: str
    shiftStart: str
    shiftEnd: str
    location: str
    project: str
    status: str

    class Config:
        from_attributes = True


class ShiftCreate(BaseModel):
    workerName: str
    date: str
    shiftType: Optional[str] = "Morning"
    shiftStart: Optional[str] = "06:00"
    shiftEnd: Optional[str] = "14:00"
    location: Optional[str] = ""
    project: Optional[str] = ""
    status: Optional[str] = "Scheduled"


class ShiftUpdate(BaseModel):
    workerName: Optional[str] = None
    date: Optional[str] = None
    shiftType: Optional[str] = None
    shiftStart: Optional[str] = None
    shiftEnd: Optional[str] = None
    location: Optional[str] = None
    project: Optional[str] = None
    status: Optional[str] = None


def _to_read(s: ShiftModel) -> ShiftRead:
    return ShiftRead(
        id=s.id,
        workerName=s.worker_name,
        date=s.date,
        shiftType=s.shift_type,
        shiftStart=s.shift_start,
        shiftEnd=s.shift_end,
        location=s.location,
        project=s.project,
        status=s.status
    )


@router.get("", response_model=List[ShiftRead])
def get_shifts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shifts = db.query(ShiftModel).order_by(ShiftModel.date).all()
    return [_to_read(s) for s in shifts]


@router.post("", response_model=ShiftRead, status_code=status.HTTP_201_CREATED)
def create_shift(
    req: ShiftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    new_s = ShiftModel(
        worker_name=req.workerName,
        date=req.date,
        shift_type=req.shiftType or "Morning",
        shift_start=req.shiftStart or "06:00",
        shift_end=req.shiftEnd or "14:00",
        location=req.location or "",
        project=req.project or "",
        status=req.status or "Scheduled"
    )
    db.add(new_s)
    db.commit()
    db.refresh(new_s)
    return _to_read(new_s)


@router.put("/{shift_id}", response_model=ShiftRead)
def update_shift(
    shift_id: str,
    updates: ShiftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    s = db.query(ShiftModel).filter(ShiftModel.id == shift_id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift not found")
    if updates.workerName is not None: s.worker_name = updates.workerName
    if updates.date is not None: s.date = updates.date
    if updates.shiftType is not None: s.shift_type = updates.shiftType
    if updates.shiftStart is not None: s.shift_start = updates.shiftStart
    if updates.shiftEnd is not None: s.shift_end = updates.shiftEnd
    if updates.location is not None: s.location = updates.location
    if updates.project is not None: s.project = updates.project
    if updates.status is not None: s.status = updates.status
    db.commit()
    db.refresh(s)
    return _to_read(s)


@router.delete("/{shift_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shift(
    shift_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    s = db.query(ShiftModel).filter(ShiftModel.id == shift_id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift not found")
    db.delete(s)
    db.commit()
    return None


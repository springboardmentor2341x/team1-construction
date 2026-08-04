from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.models.placeholders import Attendance
from pydantic import BaseModel

router = APIRouter(prefix="/attendance", tags=["Attendance"])


class AttendanceRead(BaseModel):
    id: str
    date: str
    dayName: str
    shiftType: str
    checkIn: Optional[str] = None
    checkOut: Optional[str] = None
    status: str
    hoursWorked: float
    location: Optional[str] = None

    class Config:
        from_attributes = True


class AttendanceCreate(BaseModel):
    date: str
    dayName: Optional[str] = None
    shiftType: Optional[str] = "Morning"
    checkIn: Optional[str] = None
    checkOut: Optional[str] = None
    status: Optional[str] = "Present"
    hoursWorked: Optional[float] = 0.0
    location: Optional[str] = None


@router.get("", response_model=List[AttendanceRead])
def get_attendance(db: Session = Depends(get_db)):
    records = db.query(Attendance).order_by(Attendance.date.desc()).all()
    return [
        AttendanceRead(
            id=r.id,
            date=r.date,
            dayName=r.day_name or "",
            shiftType=r.shift_type or "Morning",
            checkIn=r.check_in,
            checkOut=r.check_out,
            status=r.status,
            hoursWorked=r.hours_worked or 0,
            location=r.location
        ) for r in records
    ]


@router.post("", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def create_attendance(req: AttendanceCreate, db: Session = Depends(get_db)):
    new_rec = Attendance(
        user_id="",  # linked to current user in a full auth flow
        user_name="Robert Thorne",
        date=req.date,
        day_name=req.dayName,
        shift_type=req.shiftType or "Morning",
        check_in=req.checkIn,
        check_out=req.checkOut,
        status=req.status or "Present",
        hours_worked=req.hoursWorked or 0,
        location=req.location
    )
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return AttendanceRead(
        id=new_rec.id,
        date=new_rec.date,
        dayName=new_rec.day_name or "",
        shiftType=new_rec.shift_type or "Morning",
        checkIn=new_rec.check_in,
        checkOut=new_rec.check_out,
        status=new_rec.status,
        hoursWorked=new_rec.hours_worked or 0,
        location=new_rec.location
    )


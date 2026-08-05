from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.models.activity_log import ActivityLogModel
from app.models.equipment import EquipmentModel
from pydantic import BaseModel

router = APIRouter(tags=["Site Engineer"])

class ActivityLogCreate(BaseModel):
    date: str
    location: str
    activity: str
    progressNotes: Optional[str] = None
    weatherCondition: Optional[str] = "Sunny"
    workersPresent: Optional[int] = 0
    issues: Optional[str] = None

class ActivityLogRead(BaseModel):
    id: str
    date: str
    location: str
    activity: str
    progressNotes: Optional[str] = None
    weatherCondition: str
    workersPresent: int
    issues: Optional[str] = None
    submittedBy: str
    status: str

    class Config:
        from_attributes = True

class EquipmentRead(BaseModel):
    id: str
    name: str
    type: str
    serialNo: str
    location: str
    operator: str
    status: str
    lastInspection: str
    nextService: str
    fuelLevel: Optional[int] = None

    class Config:
        from_attributes = True

@router.get("/activity-logs", response_model=List[ActivityLogRead])
def get_activity_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(ActivityLogModel).order_by(ActivityLogModel.date.desc()).all()
    return [
        ActivityLogRead(
            id=l.id,
            date=l.date,
            location=l.location,
            activity=l.activity,
            progressNotes=l.progress_notes,
            weatherCondition=l.weather_condition,
            workersPresent=l.workers_present,
            issues=l.issues,
            submittedBy=l.submitted_by,
            status=l.status
        ) for l in logs
    ]

@router.post("/activity-logs", response_model=ActivityLogRead, status_code=status.HTTP_201_CREATED)
def create_activity_log(
    req: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Site Engineer", "Administrator", "Project Manager"]))
):
    new_log = ActivityLogModel(
        date=req.date,
        location=req.location,
        activity=req.activity,
        progress_notes=req.progressNotes,
        weather_condition=req.weatherCondition or "Sunny",
        workers_present=req.workersPresent or 0,
        issues=req.issues,
        submitted_by=current_user.full_name,
        status="Pending"
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return ActivityLogRead(
        id=new_log.id,
        date=new_log.date,
        location=new_log.location,
        activity=new_log.activity,
        progressNotes=new_log.progress_notes,
        weatherCondition=new_log.weather_condition,
        workersPresent=new_log.workers_present,
        issues=new_log.issues,
        submittedBy=new_log.submitted_by,
        status=new_log.status
    )

@router.get("/equipment", response_model=List[EquipmentRead])
def get_equipment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    equipment_list = db.query(EquipmentModel).all()
    return [
        EquipmentRead(
            id=e.id,
            name=e.name,
            type=e.type,
            serialNo=e.serial_no,
            location=e.location,
            operator=e.operator,
            status=e.status,
            lastInspection=e.last_inspection,
            nextService=e.next_service,
            fuelLevel=e.fuel_level
        ) for e in equipment_list
    ]

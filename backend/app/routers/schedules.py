from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.schedule import ScheduleCreate, ScheduleRead, ScheduleUpdate
from app.services.schedule_service import ScheduleService

router = APIRouter(prefix="/schedules", tags=["Project Schedules"])

@router.get("", response_model=List[ScheduleRead])
def get_schedules_by_project(projectId: str, db: Session = Depends(get_db)):
    service = ScheduleService(db)
    return service.get_by_project(projectId)

@router.post("", response_model=ScheduleRead, status_code=status.HTTP_201_CREATED)
def create_schedule(req: ScheduleCreate, db: Session = Depends(get_db)):
    service = ScheduleService(db)
    return service.create_schedule(req)

@router.put("/{schedule_id}", response_model=ScheduleRead)
def update_schedule(schedule_id: str, updates: ScheduleUpdate, db: Session = Depends(get_db)):
    service = ScheduleService(db)
    return service.update_schedule(schedule_id, updates)

@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(schedule_id: str, db: Session = Depends(get_db)):
    service = ScheduleService(db)
    service.delete_schedule(schedule_id)
    return None

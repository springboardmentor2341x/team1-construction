from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from models.workforce import WorkerCategory, AttendanceStatus

class AttendanceBase(BaseModel):
    date: date
    status: AttendanceStatus = AttendanceStatus.present

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    id: int
    worker_id: int

    class Config:
        from_attributes = True

class WorkerBase(BaseModel):
    name: str
    category: WorkerCategory
    contact_number: Optional[str] = None
    project_id: Optional[int] = None

class WorkerCreate(WorkerBase):
    pass

class WorkerResponse(WorkerBase):
    id: int
    attendance: List[AttendanceResponse] = []

    class Config:
        from_attributes = True

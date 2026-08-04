from pydantic import BaseModel
from typing import Optional

class ScheduleCreate(BaseModel):
    projectId: str
    phaseName: str
    description: Optional[str] = None
    plannedStartDate: str
    plannedEndDate: str
    estimatedDurationDays: Optional[int] = 0

class ScheduleUpdate(BaseModel):
    phaseName: Optional[str] = None
    description: Optional[str] = None
    plannedStartDate: Optional[str] = None
    plannedEndDate: Optional[str] = None
    estimatedDurationDays: Optional[int] = None

class ScheduleRead(BaseModel):
    id: str
    projectId: str
    phaseName: str
    description: Optional[str] = None
    plannedStartDate: str
    plannedEndDate: str
    estimatedDurationDays: int

    class Config:
        from_attributes = True

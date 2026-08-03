from pydantic import BaseModel
from typing import Optional

class MilestoneCreate(BaseModel):
    projectId: str
    milestoneName: str
    description: Optional[str] = None
    plannedDate: str
    actualCompletionDate: Optional[str] = None
    completionPercentage: Optional[int] = 0
    status: Optional[str] = "Pending"

class MilestoneUpdate(BaseModel):
    milestoneName: Optional[str] = None
    description: Optional[str] = None
    plannedDate: Optional[str] = None
    actualCompletionDate: Optional[str] = None
    completionPercentage: Optional[int] = None
    status: Optional[str] = None

class MilestoneRead(BaseModel):
    id: str
    projectId: str
    milestoneName: str
    description: Optional[str] = None
    plannedDate: str
    actualCompletionDate: Optional[str] = None
    completionPercentage: int
    status: str

    class Config:
        from_attributes = True

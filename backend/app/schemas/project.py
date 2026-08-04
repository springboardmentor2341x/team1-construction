from pydantic import BaseModel
from typing import Optional, List

class PersonnelRead(BaseModel):
    id: str
    name: str
    role: str
    avatar: Optional[str] = None

class ProjectCreate(BaseModel):
    projectName: str
    projectCode: str
    category: str
    clientName: str
    clientContact: Optional[str] = None
    description: Optional[str] = None
    location: str
    estimatedBudget: float
    startDate: str
    expectedCompletionDate: str
    priority: str = "Medium"
    status: str = "Planning"
    projectManagerId: Optional[str] = None
    projectManagerName: Optional[str] = None

class ProjectUpdate(BaseModel):
    projectName: Optional[str] = None
    category: Optional[str] = None
    clientName: Optional[str] = None
    clientContact: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    estimatedBudget: Optional[float] = None
    startDate: Optional[str] = None
    expectedCompletionDate: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    projectManagerId: Optional[str] = None
    projectManagerName: Optional[str] = None

class ProjectRead(BaseModel):
    id: str
    projectName: str
    projectCode: str
    category: str
    clientName: str
    clientContact: Optional[str] = None
    description: Optional[str] = None
    location: str
    estimatedBudget: float
    startDate: str
    expectedCompletionDate: str
    priority: str
    status: str
    projectManagerId: Optional[str] = None
    projectManagerName: Optional[str] = None
    assignedEngineers: List[PersonnelRead] = []
    assignedContractors: List[PersonnelRead] = []

    class Config:
        from_attributes = True

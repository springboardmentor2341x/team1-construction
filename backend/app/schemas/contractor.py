from pydantic import BaseModel
from typing import Optional, List

class WorkerAssignRequest(BaseModel):
    workerId: str
    projectId: Optional[str] = None

class ContractorWorkerRead(BaseModel):
    id: str
    contractorId: str
    workerId: str
    workerName: str
    workerEmail: str
    trade: Optional[str] = None
    employeeId: Optional[str] = None
    projectId: Optional[str] = None
    projectName: Optional[str] = None
    assignedAt: Optional[str] = None

    class Config:
        from_attributes = True

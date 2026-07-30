from pydantic import BaseModel
from typing import Optional
from models.resource import ResourceCategory, ResourceStatus

class ResourceBase(BaseModel):
    name: str
    category: ResourceCategory
    status: ResourceStatus = ResourceStatus.available
    project_id: Optional[int] = None

class ResourceCreate(ResourceBase):
    pass

class ResourceResponse(ResourceBase):
    id: int

    class Config:
        from_attributes = True

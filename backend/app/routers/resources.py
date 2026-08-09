from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.models.placeholders import Resource
from pydantic import BaseModel

router = APIRouter(prefix="/resources", tags=["Resources"])

class ResourceRead(BaseModel):
    id: str
    name: str
    resource_type: Optional[str]
    project_id: Optional[str]
    status: str
    utilization_percentage: float

    class Config:
        from_attributes = True

class ResourceCreate(BaseModel):
    name: str
    resource_type: Optional[str] = None
    project_id: Optional[str] = None
    status: Optional[str] = "Available"
    utilization_percentage: Optional[float] = 0.0

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    resource_type: Optional[str] = None
    project_id: Optional[str] = None
    status: Optional[str] = None
    utilization_percentage: Optional[float] = None

@router.get("", response_model=List[ResourceRead])
def get_resources(
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Resource)
    if project_id:
        query = query.filter(Resource.project_id == project_id)
    return query.all()

@router.post("", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
def create_resource(
    req: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    new_res = Resource(**req.model_dump())
    db.add(new_res)
    db.commit()
    db.refresh(new_res)
    return new_res

@router.put("/{resource_id}", response_model=ResourceRead)
def update_resource(
    resource_id: str,
    req: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(res, key, value)
        
    db.commit()
    db.refresh(res)
    return res

@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    db.delete(res)
    db.commit()
    return None

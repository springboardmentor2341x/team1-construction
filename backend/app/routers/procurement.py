from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.models.placeholders import Procurement
from pydantic import BaseModel

router = APIRouter(prefix="/procurements", tags=["Procurement"])

class ProcurementRead(BaseModel):
    id: str
    title: str
    amount: float
    project_id: Optional[str]
    material_id: Optional[str]
    quantity: float
    status: str
    requested_by: Optional[str]

    class Config:
        from_attributes = True

class ProcurementCreate(BaseModel):
    title: str
    amount: float = 0.0
    project_id: Optional[str] = None
    material_id: Optional[str] = None
    quantity: float = 0.0
    status: Optional[str] = "Pending Approval"

class ProcurementUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    project_id: Optional[str] = None
    material_id: Optional[str] = None
    quantity: Optional[float] = None
    status: Optional[str] = None

@router.get("", response_model=List[ProcurementRead])
def get_procurements(
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Procurement)
    if project_id:
        query = query.filter(Procurement.project_id == project_id)
    return query.all()

@router.post("", response_model=ProcurementRead, status_code=status.HTTP_201_CREATED)
def create_procurement(
    req: ProcurementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer", "Contractor"]))
):
    new_req = Procurement(
        **req.model_dump(),
        requested_by=current_user.full_name
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

@router.put("/{procurement_id}", response_model=ProcurementRead)
def update_procurement(
    procurement_id: str,
    req: ProcurementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    proc = db.query(Procurement).filter(Procurement.id == procurement_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement request not found")
    
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(proc, key, value)
        
    db.commit()
    db.refresh(proc)
    return proc

@router.delete("/{procurement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_procurement(
    procurement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    proc = db.query(Procurement).filter(Procurement.id == procurement_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement request not found")
    
    db.delete(proc)
    db.commit()
    return None

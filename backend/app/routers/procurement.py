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
    supplier: Optional[str] = None
    material_name: Optional[str] = None
    expected_delivery_date: Optional[str] = None
    po_number: Optional[str] = None
    amount: float
    project_id: Optional[str] = None
    material_id: Optional[str] = None
    quantity: float
    status: str
    requested_by: Optional[str] = None

    class Config:
        from_attributes = True

class ProcurementCreate(BaseModel):
    title: str
    supplier: Optional[str] = None
    material_name: Optional[str] = None
    expected_delivery_date: Optional[str] = None
    po_number: Optional[str] = None
    amount: float = 0.0
    project_id: Optional[str] = None
    material_id: Optional[str] = None
    quantity: float = 0.0
    status: Optional[str] = "Pending Approval"

class ProcurementUpdate(BaseModel):
    title: Optional[str] = None
    supplier: Optional[str] = None
    material_name: Optional[str] = None
    expected_delivery_date: Optional[str] = None
    po_number: Optional[str] = None
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

@router.put("/{procurement_id}/issue-po", response_model=ProcurementRead)
def issue_po(
    procurement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    import uuid
    proc = db.query(Procurement).filter(Procurement.id == procurement_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement request not found")
    
    proc.status = "PO Issued"
    if not proc.po_number:
        proc.po_number = f"PO-{uuid.uuid4().hex[:6].upper()}"
    db.commit()
    db.refresh(proc)
    return proc

@router.put("/{procurement_id}/mark-received", response_model=ProcurementRead)
def mark_received(
    procurement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    proc = db.query(Procurement).filter(Procurement.id == procurement_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement request not found")
    
    proc.status = "Received"
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

from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.models.placeholders import Inventory
from pydantic import BaseModel

router = APIRouter(prefix="/inventory", tags=["Inventory"])

class InventoryRead(BaseModel):
    id: str
    item_name: str
    quantity: float
    project_id: Optional[str]
    status: str

    class Config:
        from_attributes = True

class InventoryCreate(BaseModel):
    item_name: str
    quantity: float = 0.0
    project_id: Optional[str] = None
    status: Optional[str] = "In Stock"

class InventoryUpdate(BaseModel):
    item_name: Optional[str] = None
    quantity: Optional[float] = None
    project_id: Optional[str] = None
    status: Optional[str] = None

@router.get("", response_model=List[InventoryRead])
def get_inventory(
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Inventory)
    if project_id:
        query = query.filter(Inventory.project_id == project_id)
    return query.all()

@router.post("", response_model=InventoryRead, status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    req: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    new_item = Inventory(**req.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=InventoryRead)
def update_inventory_item(
    item_id: str,
    req: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
        
    # Auto-update status based on quantity
    if item.quantity <= 0:
        item.status = "Out of Stock"
    elif item.quantity < 10 and item.status != "Low Stock":
        item.status = "Low Stock"
    elif item.quantity >= 10 and item.status in ["Low Stock", "Out of Stock"]:
        item.status = "In Stock"
        
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db.delete(item)
    db.commit()
    return None

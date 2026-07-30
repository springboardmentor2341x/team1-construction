from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.inventory import Inventory
from schemas.inventory import InventoryCreate, InventoryResponse

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)

@router.post("/", response_model=InventoryResponse)
def create_inventory(item: InventoryCreate, db: Session = Depends(get_db)):
    db_item = Inventory(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[InventoryResponse])
def read_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(Inventory).offset(skip).limit(limit).all()
    return items

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.procurement import Procurement
from schemas.procurement import ProcurementCreate, ProcurementResponse

router = APIRouter(
    prefix="/procurement",
    tags=["Procurement"]
)

@router.post("/", response_model=ProcurementResponse)
def create_procurement(item: ProcurementCreate, db: Session = Depends(get_db)):
    db_item = Procurement(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[ProcurementResponse])
def read_procurement(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(Procurement).offset(skip).limit(limit).all()
    return items

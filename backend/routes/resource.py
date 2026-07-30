from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.resource import Resource
from schemas.resource import ResourceCreate, ResourceResponse

router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)

@router.post("/", response_model=ResourceResponse)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    db_resource = Resource(**resource.model_dump())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.get("/", response_model=List[ResourceResponse])
def read_resources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    resources = db.query(Resource).offset(skip).limit(limit).all()
    return resources

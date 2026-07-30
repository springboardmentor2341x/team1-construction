from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.workforce import Worker, Attendance
from schemas.workforce import WorkerCreate, WorkerResponse, AttendanceCreate, AttendanceResponse

router = APIRouter(
    prefix="/workforce",
    tags=["Workforce"]
)

@router.post("/workers", response_model=WorkerResponse)
def create_worker(worker: WorkerCreate, db: Session = Depends(get_db)):
    db_worker = Worker(**worker.model_dump())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

@router.get("/workers", response_model=List[WorkerResponse])
def read_workers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    workers = db.query(Worker).offset(skip).limit(limit).all()
    return workers

@router.post("/workers/{worker_id}/attendance", response_model=AttendanceResponse)
def log_attendance(worker_id: int, attendance: AttendanceCreate, db: Session = Depends(get_db)):
    db_attendance = Attendance(**attendance.model_dump(), worker_id=worker_id)
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

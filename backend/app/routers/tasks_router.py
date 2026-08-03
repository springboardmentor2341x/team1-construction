from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.models.task import TaskModel
from app.models.document import DocumentModel
from pydantic import BaseModel

tasks_router = APIRouter(prefix="/tasks", tags=["Tasks"])
documents_router = APIRouter(prefix="/documents", tags=["Documents"])

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project: str
    assignedTo: str
    priority: Optional[str] = "Medium"
    dueDate: str
    location: Optional[str] = None

class TaskRead(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    project: str
    assignedTo: str
    priority: str
    status: str
    dueDate: str
    location: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentRead(BaseModel):
    id: str
    name: str
    type: str
    project: str
    uploadedBy: str
    uploadDate: str
    size: str
    category: str

    class Config:
        from_attributes = True

@tasks_router.get("", response_model=List[TaskRead])
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(TaskModel).order_by(TaskModel.created_at.desc()).all()
    return [
        TaskRead(
            id=t.id,
            title=t.title,
            description=t.description,
            project=t.project,
            assignedTo=t.assigned_to,
            priority=t.priority,
            status=t.status,
            dueDate=t.due_date,
            location=t.location
        ) for t in tasks
    ]

@tasks_router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(req: TaskCreate, db: Session = Depends(get_db)):
    new_task = TaskModel(
        title=req.title,
        description=req.description,
        project=req.project,
        assigned_to=req.assignedTo,
        priority=req.priority or "Medium",
        status="Open",
        due_date=req.dueDate,
        location=req.location
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return TaskRead(
        id=new_task.id,
        title=new_task.title,
        description=new_task.description,
        project=new_task.project,
        assignedTo=new_task.assigned_to,
        priority=new_task.priority,
        status=new_task.status,
        dueDate=new_task.due_date,
        location=new_task.location
    )

@documents_router.get("", response_model=List[DocumentRead])
def get_documents(db: Session = Depends(get_db)):
    docs = db.query(DocumentModel).order_by(DocumentModel.created_at.desc()).all()
    return [
        DocumentRead(
            id=d.id,
            name=d.name,
            type=d.type,
            project=d.project,
            uploadedBy=d.uploaded_by,
            uploadDate=d.upload_date,
            size=d.size,
            category=d.category
        ) for d in docs
    ]

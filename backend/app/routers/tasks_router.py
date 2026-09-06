from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.models.task import TaskModel
from app.models.document import DocumentModel
from pydantic import BaseModel

tasks_router = APIRouter(prefix="/tasks", tags=["Tasks"])
documents_router = APIRouter(prefix="/documents", tags=["Documents"])

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project: str
    projectId: Optional[str] = None
    assignedTo: str
    assignedToId: Optional[str] = None
    milestoneId: Optional[str] = None
    contractorId: Optional[str] = None
    workerId: Optional[str] = None
    priority: Optional[str] = "Medium"
    dueDate: str
    location: Optional[str] = None

class TaskRead(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    project: str
    projectId: Optional[str] = None
    assignedTo: str
    assignedToId: Optional[str] = None
    milestoneId: Optional[str] = None
    contractorId: Optional[str] = None
    workerId: Optional[str] = None
    priority: str
    status: str
    dueDate: str
    location: Optional[str] = None

    class Config:
        from_attributes = True

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    assignedToId: Optional[str] = None
    assignedTo: Optional[str] = None
    priority: Optional[str] = None
    dueDate: Optional[str] = None

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
def get_tasks(
    projectId: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TaskModel)
    if projectId:
        query = query.filter((TaskModel.project_id == projectId) | (TaskModel.project == projectId))
    tasks = query.order_by(TaskModel.created_at.desc()).all()
    return [
        TaskRead(
            id=t.id,
            title=t.title,
            description=t.description,
            project=t.project,
            projectId=t.project_id,
            assignedTo=t.assigned_to,
            assignedToId=t.assigned_to_id,
            milestoneId=t.milestone_id,
            contractorId=t.contractor_id,
            workerId=t.worker_id,
            priority=t.priority,
            status=t.status,
            dueDate=t.due_date,
            location=t.location
        ) for t in tasks
    ]

@tasks_router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    req: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.project import Project
    proj = None
    if req.projectId:
        proj = db.query(Project).filter(Project.id == req.projectId).first()
    if not proj and req.project:
        proj = db.query(Project).filter(Project.project_name == req.project).first()

    project_id_val = proj.id if proj else req.projectId
    project_name_val = proj.project_name if proj else req.project

    # Lookup assigned user ID if provided by name/email/ID
    assigned_user = db.query(User).filter(
        (User.id == req.assignedToId) | (User.id == req.assignedTo) | (User.full_name == req.assignedTo) | (User.email == req.assignedTo)
    ).first()
    assigned_to_id_val = assigned_user.id if assigned_user else req.assignedToId
    assigned_to_name_val = assigned_user.full_name if assigned_user else req.assignedTo

    new_task = TaskModel(
        title=req.title,
        description=req.description,
        project=project_name_val,
        project_id=project_id_val,
        assigned_to=assigned_to_name_val,
        assigned_to_id=assigned_to_id_val,
        milestone_id=req.milestoneId,
        contractor_id=req.contractorId,
        worker_id=req.workerId,
        priority=req.priority or "Medium",
        status="Open",
        due_date=req.dueDate,
        location=req.location
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Emit Task Assignment Notification
    if assigned_user:
        from app.services.notification_service import NotificationService
        NotificationService.create_notification(
            db=db,
            user_id=assigned_user.id,
            title=f"New Task Assigned: {new_task.title}",
            message=f"You have been assigned task '{new_task.title}' for project {new_task.project}. Due: {new_task.due_date}.",
            type="TASK_ASSIGNMENT",
            project_id=new_task.project_id,
            reference_module="tasks",
            reference_id=new_task.id,
            category="Task"
        )

    return TaskRead(
        id=new_task.id,
        title=new_task.title,
        description=new_task.description,
        project=new_task.project,
        projectId=new_task.project_id,
        assignedTo=new_task.assigned_to,
        assignedToId=new_task.assigned_to_id,
        milestoneId=new_task.milestone_id,
        contractorId=new_task.contractor_id,
        workerId=new_task.worker_id,
        priority=new_task.priority,
        status=new_task.status,
        dueDate=new_task.due_date,
        location=new_task.location
    )

@tasks_router.patch("/{task_id}", response_model=TaskRead)
def update_task_status(
    task_id: str,
    req: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.project import Project
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.project_id:
        proj = db.query(Project).filter(Project.id == task.project_id).first()
        if proj and proj.status == "Closed":
            raise HTTPException(status_code=400, detail="Cannot update tasks on a Closed project.")

    old_assigned_to_id = task.assigned_to_id

    if req.title is not None:
        task.title = req.title
    if req.status is not None:
        task.status = req.status
    if req.progress is not None:
        task.progress = req.progress
    if req.priority is not None:
        task.priority = req.priority
    if req.dueDate is not None:
        task.due_date = req.dueDate

    if req.assignedToId or req.assignedTo:
        assigned_user = db.query(User).filter(
            (User.id == req.assignedToId) | (User.id == req.assignedTo) | (User.full_name == req.assignedTo) | (User.email == req.assignedTo)
        ).first()
        if assigned_user:
            task.assigned_to_id = assigned_user.id
            task.assigned_to = assigned_user.full_name

    db.commit()
    db.refresh(task)

    from app.services.notification_service import NotificationService
    if task.assigned_to_id and task.assigned_to_id != old_assigned_to_id:
        NotificationService.create_notification(
            db=db,
            user_id=task.assigned_to_id,
            title=f"Task Reassigned: {task.title}",
            message=f"Task '{task.title}' for project {task.project} has been reassigned to you.",
            type="TASK_ASSIGNMENT",
            project_id=task.project_id,
            reference_module="tasks",
            reference_id=task.id,
            category="Task"
        )
        if old_assigned_to_id and old_assigned_to_id != current_user.id:
            NotificationService.create_notification(
                db=db,
                user_id=old_assigned_to_id,
                title=f"Task Unassigned: {task.title}",
                message=f"Task '{task.title}' was reassigned to {task.assigned_to}.",
                type="TASK_ASSIGNMENT",
                project_id=task.project_id,
                reference_module="tasks",
                reference_id=task.id,
                category="Task"
            )
    elif req.status is not None:
        if task.assigned_to_id and task.assigned_to_id != current_user.id:
            NotificationService.create_notification(
                db=db,
                user_id=task.assigned_to_id,
                title=f"Task Status Updated: {task.title}",
                message=f"Task '{task.title}' status was updated to '{task.status}' by {current_user.full_name}.",
                type="TASK_ASSIGNMENT",
                project_id=task.project_id,
                reference_module="tasks",
                reference_id=task.id,
                category="Task"
            )
    return TaskRead(
        id=task.id,
        title=task.title,
        description=task.description,
        project=task.project,
        projectId=task.project_id,
        assignedTo=task.assigned_to,
        assignedToId=task.assigned_to_id,
        milestoneId=task.milestone_id,
        contractorId=task.contractor_id,
        workerId=task.worker_id,
        priority=task.priority,
        status=task.status,
        dueDate=task.due_date,
        location=task.location
    )

@documents_router.get("", response_model=List[DocumentRead])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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

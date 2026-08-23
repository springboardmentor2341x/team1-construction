from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.models.placeholders import Notification
from pydantic import BaseModel

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationRead(BaseModel):
    id: str
    title: str
    message: Optional[str] = None
    type: str
    time: str
    read: bool
    category: str

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    title: str
    message: Optional[str] = None
    type: Optional[str] = "info"
    category: Optional[str] = "System"
    time: Optional[str] = ""


class NotificationUpdate(BaseModel):
    read: Optional[bool] = None


@router.get("", response_model=List[NotificationRead])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifs = db.query(Notification).order_by(Notification.created_at.desc()).all()
    return [
        NotificationRead(
            id=n.id,
            title=n.title,
            message=n.message,
            type=n.notification_type or "info",
            time=n.time or "",
            read=n.is_read,
            category=n.category or "System"
        ) for n in notifs
    ]


@router.post("", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
def create_notification(
    req: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    new_n = Notification(
        title=req.title,
        message=req.message,
        notification_type=req.type or "info",
        category=req.category or "System",
        time=req.time or "",
        is_read=False
    )
    db.add(new_n)
    db.commit()
    db.refresh(new_n)
    return NotificationRead(
        id=new_n.id,
        title=new_n.title,
        message=new_n.message,
        type=new_n.notification_type or "info",
        time=new_n.time or "",
        read=new_n.is_read,
        category=new_n.category or "System"
    )


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    n.is_read = True
    db.commit()
    db.refresh(n)
    return NotificationRead(
        id=n.id,
        title=n.title,
        message=n.message,
        type=n.notification_type or "info",
        time=n.time or "",
        read=n.is_read,
        category=n.category or "System"
    )


@router.post("/read-all", response_model=List[NotificationRead])
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifs = db.query(Notification).all()
    for n in notifs:
        n.is_read = True
    db.commit()
    return [
        NotificationRead(
            id=n.id,
            title=n.title,
            message=n.message,
            type=n.notification_type or "info",
            time=n.time or "",
            read=n.is_read,
            category=n.category or "System"
        ) for n in notifs
    ]


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    notifs = db.query(Notification).all()
    for n in notifs:
        db.delete(n)
    db.commit()
    return None


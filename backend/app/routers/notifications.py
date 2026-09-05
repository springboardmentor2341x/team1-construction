from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationRead(BaseModel):
    id: str
    userId: Optional[str] = None
    projectId: Optional[str] = None
    title: str
    message: Optional[str] = None
    type: str
    notificationType: str
    time: str
    read: bool
    isRead: bool
    category: str
    referenceModule: Optional[str] = None
    referenceId: Optional[str] = None
    createdAt: Optional[str] = None
    readAt: Optional[str] = None

    class Config:
        from_attributes = True


class NotificationUnreadCount(BaseModel):
    unread_count: int


class NotificationCreate(BaseModel):
    userId: Optional[str] = None
    title: str
    message: Optional[str] = None
    type: Optional[str] = "SYSTEM"
    category: Optional[str] = "System"
    projectId: Optional[str] = None
    referenceModule: Optional[str] = None
    referenceId: Optional[str] = None


def _to_schema(n) -> NotificationRead:
    created_str = n.created_at.isoformat() if n.created_at else ""
    read_str = n.read_at.isoformat() if n.read_at else None
    return NotificationRead(
        id=n.id,
        userId=n.user_id,
        projectId=n.project_id,
        title=n.title,
        message=n.message or "",
        type=n.type or "SYSTEM",
        notificationType=n.notification_type or "info",
        time=n.time or "",
        read=n.is_read,
        isRead=n.is_read,
        category=n.category or "System",
        referenceModule=n.reference_module,
        referenceId=n.reference_id,
        createdAt=created_str,
        readAt=read_str,
    )


@router.get("", response_model=List[NotificationRead])
def get_user_notifications(
    unread_only: bool = Query(False),
    type_filter: Optional[str] = Query(None, alias="type"),
    category_filter: Optional[str] = Query(None, alias="category"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns notifications belonging ONLY to the authenticated user.
    Enforces JWT security isolation.
    """
    notifs = NotificationService.get_user_notifications(
        db=db,
        user_id=current_user.id,
        unread_only=unread_only,
        type_filter=type_filter,
        category_filter=category_filter,
        limit=limit,
        offset=offset,
    )
    return [_to_schema(n) for n in notifs]


@router.get("/unread-count", response_model=NotificationUnreadCount)
def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return unread notification count for the authenticated user.
    """
    count = NotificationService.get_unread_count(db=db, user_id=current_user.id)
    return NotificationUnreadCount(unread_count=count)


@router.get("/{notification_id}", response_model=NotificationRead)
def get_notification_detail(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return notification details only if the authenticated user is the owner.
    """
    n = NotificationService.get_notification_by_id(db=db, notification_id=notification_id, user_id=current_user.id)
    if not n:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access unauthorized"
        )
    return _to_schema(n)


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark one notification owned by the authenticated user as read.
    """
    n = NotificationService.mark_as_read(db=db, notification_id=notification_id, user_id=current_user.id)
    if not n:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access unauthorized"
        )
    return _to_schema(n)


@router.patch("/read-all", response_model=dict)
def mark_all_notifications_read_patch(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark all unread notifications of the authenticated user as read.
    """
    count = NotificationService.mark_all_as_read(db=db, user_id=current_user.id)
    return {"message": "All notifications marked as read", "count": count}


@router.post("/read-all", response_model=dict)
def mark_all_notifications_read_post(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST route compatibility for marking all notifications as read.
    """
    count = NotificationService.mark_all_as_read(db=db, user_id=current_user.id)
    return {"message": "All notifications marked as read", "count": count}


@router.delete("", response_model=dict)
def delete_all_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete/clear all notifications belonging to the authenticated user.
    """
    count = NotificationService.clear_user_notifications(db=db, user_id=current_user.id)
    return {"message": "All notifications cleared", "count": count}


@router.post("", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
def create_custom_notification(
    req: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"])),
):
    """
    Create a notification for a target user (Admin/PM access only).
    """
    target_user_id = req.userId or current_user.id
    n = NotificationService.create_notification(
        db=db,
        user_id=target_user_id,
        title=req.title,
        message=req.message,
        type=req.type or "SYSTEM",
        project_id=req.projectId,
        reference_module=req.referenceModule,
        reference_id=req.referenceId,
        category=req.category or "System",
    )
    if not n:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target user not found")
    return _to_schema(n)


@router.post("/trigger-deadlines", response_model=dict)
def trigger_deadline_checks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluates upcoming and passed deadlines and generates notifications for relevant users.
    """
    count = NotificationService.check_and_generate_deadline_notifications(db=db)
    return {"message": "Deadline check complete", "notifications_generated": count}

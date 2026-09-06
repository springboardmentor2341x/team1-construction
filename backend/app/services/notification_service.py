import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_, func

from app.models.notification import Notification
from app.models.user import User
from app.models.role import Role
from app.models.project import Project
from app.models.assignments import (
    ProjectSiteEngineer,
    ProjectContractor,
    ProjectClient,
)
from app.models.workforce import WorkerProjectAssignment, Worker
from app.models.task import TaskModel
from app.models.milestone import ProjectMilestone


class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: str,
        title: str,
        message: Optional[str] = None,
        type: str = "SYSTEM",
        project_id: Optional[str] = None,
        reference_module: Optional[str] = None,
        reference_id: Optional[str] = None,
        category: Optional[str] = "System",
    ) -> Notification:
        # Check if recipient exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        # Map type to backward compatible notification_type
        type_upper = type.upper() if type else "SYSTEM"
        notif_type = "info"
        if type_upper in ["PROJECT_UPDATE", "TASK_ASSIGNMENT"]:
            notif_type = "info"
        elif type_upper in ["PROCUREMENT", "ATTENDANCE"]:
            notif_type = "warning"
        elif type_upper in ["DEADLINE"]:
            notif_type = "danger"

        now = datetime.now(timezone.utc)
        formatted_time = now.strftime("%b %d, %Y %H:%M")

        new_n = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            project_id=project_id,
            title=title,
            message=message,
            type=type_upper,
            notification_type=notif_type,
            category=category or type_upper.title(),
            time=formatted_time,
            reference_module=reference_module,
            reference_id=reference_id,
            is_read=False,
            created_at=now,
        )
        db.add(new_n)
        db.commit()
        db.refresh(new_n)
        return new_n

    @staticmethod
    def create_bulk_notifications(
        db: Session,
        user_ids: List[str],
        title: str,
        message: Optional[str] = None,
        type: str = "SYSTEM",
        project_id: Optional[str] = None,
        reference_module: Optional[str] = None,
        reference_id: Optional[str] = None,
        category: Optional[str] = "System",
    ) -> List[Notification]:
        unique_uids = list(set(user_ids))
        notifications = []
        for uid in unique_uids:
            if uid:
                n = NotificationService.create_notification(
                    db=db,
                    user_id=uid,
                    title=title,
                    message=message,
                    type=type,
                    project_id=project_id,
                    reference_module=reference_module,
                    reference_id=reference_id,
                    category=category,
                )
                if n:
                    notifications.append(n)
        return notifications

    @staticmethod
    def get_relevant_project_user_ids(
        db: Session,
        project_id: str,
        exclude_user_id: Optional[str] = None,
        roles_filter: Optional[List[str]] = None,
    ) -> List[str]:
        user_ids = set()

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return []

        # 1. Project Manager
        if project.project_manager_id:
            user_ids.add(project.project_manager_id)

        # 2. Site Engineers
        engineers = db.query(ProjectSiteEngineer.site_engineer_id).filter(
            ProjectSiteEngineer.project_id == project_id
        ).all()
        for e in engineers:
            user_ids.add(e.site_engineer_id)

        # 3. Contractors
        contractors = db.query(ProjectContractor.contractor_id).filter(
            ProjectContractor.project_id == project_id
        ).all()
        for c in contractors:
            user_ids.add(c.contractor_id)

        # 4. Clients
        clients = db.query(ProjectClient.client_id).filter(
            ProjectClient.project_id == project_id
        ).all()
        for cl in clients:
            user_ids.add(cl.client_id)

        # 5. Workers assigned to project
        worker_assigns = db.query(WorkerProjectAssignment.worker_id).filter(
            WorkerProjectAssignment.project_id == project_id
        ).all()
        for wa in worker_assigns:
            # Map worker_id to user_id if worker has user account
            worker = db.query(Worker).filter(Worker.id == wa.worker_id).first()
            if worker and hasattr(worker, "user_id") and worker.user_id:
                user_ids.add(worker.user_id)

        # 6. Admins
        admin_role = db.query(Role).filter(Role.name == "Administrator").first()
        if admin_role:
            admins = db.query(User.id).filter(User.role_id == admin_role.id).all()
            for a in admins:
                user_ids.add(a.id)

        # Filter by roles if specified
        if roles_filter:
            filtered_ids = set()
            for uid in user_ids:
                u = db.query(User).filter(User.id == uid).first()
                if u and u.role_rel and u.role_rel.name in roles_filter:
                    filtered_ids.add(uid)
            user_ids = filtered_ids

        if exclude_user_id and exclude_user_id in user_ids:
            user_ids.remove(exclude_user_id)

        return list(user_ids)

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: str,
        unread_only: bool = False,
        type_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Notification]:
        query = db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        if type_filter and type_filter.lower() != "all":
            query = query.filter(
                or_(
                    Notification.type == type_filter.upper(),
                    Notification.category == type_filter,
                    Notification.notification_type == type_filter,
                )
            )
        if category_filter and category_filter.lower() != "all":
            query = query.filter(Notification.category == category_filter)

        return query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def get_unread_count(db: Session, user_id: str) -> int:
        return db.query(func.count(Notification.id)).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).scalar() or 0

    @staticmethod
    def mark_as_read(db: Session, notification_id: str, user_id: str) -> Optional[Notification]:
        n = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if not n:
            return None
        n.is_read = True
        n.read_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(n)
        return n

    @staticmethod
    def mark_all_as_read(db: Session, user_id: str) -> int:
        notifs = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).all()
        now = datetime.now(timezone.utc)
        count = len(notifs)
        for n in notifs:
            n.is_read = True
            n.read_at = now
        db.commit()
        return count

    @staticmethod
    def clear_user_notifications(db: Session, user_id: str) -> int:
        count = db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)
        db.commit()
        return count

    @staticmethod
    def get_notification_by_id(db: Session, notification_id: str, user_id: str) -> Optional[Notification]:
        return db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()

    @staticmethod
    def check_and_generate_deadline_notifications(db: Session) -> int:
        """
        Safely scans active milestones and tasks for upcoming (<48h) or overdue deadlines.
        Target recipients specifically (PM for milestones, assigned user for tasks) to prevent duplicate/spam notifications.
        """
        generated_count = 0
        now = datetime.now(timezone.utc)

        # 1. Milestone Deadlines (PM recipient only)
        milestones = db.query(ProjectMilestone).filter(
            ProjectMilestone.status.notin_(["Completed", "Closed"])
        ).all()

        for m in milestones:
            if not m.planned_date or not m.project or not m.project.project_manager_id:
                continue
            try:
                target_dt = datetime.strptime(m.planned_date[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            except Exception:
                continue

            diff = target_dt - now
            is_overdue = now > target_dt
            is_approaching = 0 <= diff.total_seconds() <= (48 * 3600)

            if is_overdue or is_approaching:
                title = f"Milestone Overdue: {m.milestone_name}" if is_overdue else f"Milestone Deadline Approaching: {m.milestone_name}"
                msg = f"Milestone '{m.milestone_name}' for project '{m.project.project_name}' was due on {m.planned_date}." if is_overdue else f"Milestone '{m.milestone_name}' for project '{m.project.project_name}' is due on {m.planned_date}."
                pm_id = m.project.project_manager_id

                existing = db.query(Notification).filter(
                    Notification.user_id == pm_id,
                    Notification.reference_id == m.id,
                    Notification.reference_module == "milestones",
                    Notification.title == title
                ).first()
                if not existing:
                    n = NotificationService.create_notification(
                        db=db,
                        user_id=pm_id,
                        project_id=m.project_id,
                        title=title,
                        message=msg,
                        type="DEADLINE",
                        reference_module="milestones",
                        reference_id=m.id,
                        category="Deadline"
                    )
                    if n:
                        generated_count += 1

        # 2. Task Deadlines (Assigned User recipient only)
        tasks = db.query(TaskModel).filter(
            TaskModel.status.notin_(["Completed", "Closed"])
        ).all()

        for t in tasks:
            if not t.due_date or not t.assigned_to_id:
                continue
            try:
                target_dt = datetime.strptime(t.due_date[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            except Exception:
                continue

            is_overdue = now > target_dt
            diff = target_dt - now
            is_approaching = 0 <= diff.total_seconds() <= (48 * 3600)

            if is_overdue or is_approaching:
                title = f"Task Overdue: {t.title}" if is_overdue else f"Task Deadline Approaching: {t.title}"
                msg = f"Task '{t.title}' assigned to you was due on {t.due_date}." if is_overdue else f"Task '{t.title}' assigned to you is due on {t.due_date}."

                existing = db.query(Notification).filter(
                    Notification.user_id == t.assigned_to_id,
                    Notification.reference_id == t.id,
                    Notification.reference_module == "tasks",
                    Notification.title == title
                ).first()

                if not existing:
                    n = NotificationService.create_notification(
                        db=db,
                        user_id=t.assigned_to_id,
                        project_id=t.project_id,
                        title=title,
                        message=msg,
                        type="DEADLINE",
                        reference_module="tasks",
                        reference_id=t.id,
                        category="Deadline"
                    )
                    if n:
                        generated_count += 1

        return generated_count

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base

class TaskModel(Base):
    __tablename__ = "assigned_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    project: Mapped[str] = mapped_column(String(150), nullable=False)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), nullable=True)
    assigned_to: Mapped[str] = mapped_column(String(100), nullable=False)
    assigned_to_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    milestone_id: Mapped[str] = mapped_column(String(36), ForeignKey("project_milestones.id"), nullable=True)
    contractor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    worker_id: Mapped[str] = mapped_column(String(36), ForeignKey("workers.id"), nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="Medium")
    status: Mapped[str] = mapped_column(String(30), default="Open")
    due_date: Mapped[str] = mapped_column(String(20), nullable=False)
    location: Mapped[str] = mapped_column(String(150), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

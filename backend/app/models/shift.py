import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class ShiftModel(Base):
    __tablename__ = "shifts"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    shift_name: Mapped[str] = mapped_column(
        String(100),
        default="Morning Shift",
        nullable=False
    )

    # Kept for compatibility with the existing application.
    # Actual worker assignment is maintained through
    # WorkerShiftAssignment.
    worker_name: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
        default=""
    )

    date: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True
    )

    shift_type: Mapped[str] = mapped_column(
        String(20),
        default="Morning"
    )

    shift_start: Mapped[str] = mapped_column(
        String(10),
        default="06:00",
        nullable=False
    )

    shift_end: Mapped[str] = mapped_column(
        String(10),
        default="14:00",
        nullable=False
    )

    location: Mapped[str] = mapped_column(
        String(150),
        default=""
    )

    # Kept for compatibility with existing data/API.
    # project_id is the actual relationship to Project.
    project: Mapped[str] = mapped_column(
        String(150),
        default=""
    )

    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "projects.id",
            ondelete="SET NULL"
        ),
        nullable=True,
        index=True
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="Scheduled",
        nullable=False,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    # ---------------------------------------------------------
    # Project relationship
    # ---------------------------------------------------------
    project_rel = relationship(
        "Project",
        foreign_keys=[project_id]
    )

    # ---------------------------------------------------------
    # Worker ↔ Shift relationship
    # ---------------------------------------------------------
    worker_assignments = relationship(
        "WorkerShiftAssignment",
        back_populates="shift",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index(
            "ix_shift_project_date",
            "project_id",
            "date"
        ),
        Index(
            "ix_shift_project_status",
            "project_id",
            "status"
        ),
    )
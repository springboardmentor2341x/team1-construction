import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


# =========================================================
# Workforce Category
# =========================================================

class WorkforceCategory(Base):
    __tablename__ = "workforce_categories"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    workers = relationship(
        "Worker",
        back_populates="category_rel"
    )


# =========================================================
# Worker
# =========================================================

class Worker(Base):
    __tablename__ = "workers"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    # Business-level unique worker identifier
    worker_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    worker_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True
    )

    contact_information: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )

    workforce_category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "workforce_categories.id",
            ondelete="RESTRICT"
        ),
        nullable=False,
        index=True
    )

    skill_or_work_type: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )

    # Contractor is represented by the application's User record.
    contractor_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "users.id",
            ondelete="SET NULL"
        ),
        nullable=True,
        index=True
    )

    joining_date: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    worker_status: Mapped[str] = mapped_column(
        String(30),
        default="Active",
        nullable=False,
        index=True
    )
    # Active, Inactive, On Leave, Terminated

    pay_rate: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    category_rel = relationship(
        "WorkforceCategory",
        back_populates="workers"
    )

    contractor_rel = relationship(
        "User",
        foreign_keys=[contractor_id]
    )

    project_assignments = relationship(
        "WorkerProjectAssignment",
        back_populates="worker",
        cascade="all, delete-orphan"
    )

    shift_assignments = relationship(
        "WorkerShiftAssignment",
        back_populates="worker",
        cascade="all, delete-orphan"
    )

    attendance_records = relationship(
        "AttendanceModel",
        back_populates="worker",
        cascade="all, delete-orphan"
    )

    payroll_records = relationship(
        "WorkforcePayroll",
        back_populates="worker",
        cascade="all, delete-orphan"
    )


# =========================================================
# Worker → Project Assignment
# =========================================================

class WorkerProjectAssignment(Base):
    __tablename__ = "worker_project_assignments"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    worker_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "workers.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "projects.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    contractor_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "users.id",
            ondelete="SET NULL"
        ),
        nullable=True,
        index=True
    )

    work_activity: Mapped[str] = mapped_column(
        String(200),
        nullable=True
    )

    assignment_start_date: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    assignment_end_date: Mapped[str] = mapped_column(
        String(20),
        nullable=True
    )

    assignment_status: Mapped[str] = mapped_column(
        String(30),
        default="Active",
        nullable=False,
        index=True
    )
    # Active, Completed, Transferred, Cancelled

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    worker = relationship(
        "Worker",
        back_populates="project_assignments"
    )

    project = relationship(
        "Project",
        foreign_keys=[project_id]
    )

    contractor = relationship(
        "User",
        foreign_keys=[contractor_id]
    )

    __table_args__ = (
        Index(
            "ix_worker_project_assignment_lookup",
            "worker_id",
            "project_id",
            "assignment_status"
        ),
    )


# =========================================================
# Worker → Shift Assignment
# =========================================================

class WorkerShiftAssignment(Base):
    __tablename__ = "worker_shift_assignments"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    shift_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "shifts.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    worker_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "workers.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    shift = relationship(
        "ShiftModel",
        back_populates="worker_assignments"
    )

    worker = relationship(
        "Worker",
        back_populates="shift_assignments"
    )

    __table_args__ = (
        Index(
            "ix_worker_shift_assignment_lookup",
            "shift_id",
            "worker_id"
        ),
    )


# =========================================================
# Attendance
# =========================================================

class AttendanceModel(Base):
    __tablename__ = "attendance"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    worker_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "workers.id",
            ondelete="CASCADE"
        ),
        nullable=True,
        index=True
    )

    # Kept for compatibility with the existing application.
    user_id: Mapped[str] = mapped_column(
        String(36),
        nullable=True,
        default=""
    )

    user_name: Mapped[str] = mapped_column(
        String(100),
        default="Field Worker"
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

    shift_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "shifts.id",
            ondelete="SET NULL"
        ),
        nullable=True,
        index=True
    )

    date: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True
    )

    day_name: Mapped[str] = mapped_column(
        String(20),
        default=""
    )

    shift_type: Mapped[str] = mapped_column(
        String(20),
        default="Morning"
    )

    check_in: Mapped[str] = mapped_column(
        String(10),
        nullable=True
    )

    check_out: Mapped[str] = mapped_column(
        String(10),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="Present",
        nullable=False,
        index=True
    )
    # Present, Absent, Leave

    hours_worked: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    overtime_hours: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    remarks: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    location: Mapped[str] = mapped_column(
        String(150),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    worker = relationship(
        "Worker",
        back_populates="attendance_records"
    )

    project = relationship(
        "Project",
        foreign_keys=[project_id]
    )

    shift = relationship(
        "ShiftModel",
        foreign_keys=[shift_id]
    )

    __table_args__ = (
        Index(
            "ix_attendance_worker_project_date",
            "worker_id",
            "project_id",
            "date"
        ),
        Index(
            "ix_attendance_project_date_status",
            "project_id",
            "date",
            "status"
        ),
    )


# =========================================================
# Workforce Payroll
# =========================================================

class WorkforcePayroll(Base):
    __tablename__ = "workforce_payrolls"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    worker_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "workers.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "projects.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    pay_period_start: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    pay_period_end: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    pay_rate: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    working_days: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    working_hours: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    overtime_hours: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    leave_days: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    attendance_reference: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    estimated_pay: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    payroll_status: Mapped[str] = mapped_column(
        String(30),
        default="Pending",
        nullable=False,
        index=True
    )
    # Pending, Processing, Approved, Paid

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    worker = relationship(
        "Worker",
        back_populates="payroll_records"
    )

    project = relationship(
        "Project",
        foreign_keys=[project_id]
    )

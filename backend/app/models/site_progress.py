import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, Float, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base


class DailyProgressReport(Base):
    """Daily site progress report submitted by Site Engineers.

    Each report is a standalone record (never overwrites previous reports) and
    is linked to a project via a foreign key. Progress percentages feed the
    auto-computed WorkCompletionStatus and milestone sync logic.
    """
    __tablename__ = "daily_progress_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    report_date: Mapped[str] = mapped_column(String(20), nullable=False)
    progress_category: Mapped[str] = mapped_column(String(50), nullable=False)
    work_completed: Mapped[str] = mapped_column(Text, nullable=False)
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0)
    contractor: Mapped[str] = mapped_column(String(150), nullable=True)
    worker_attendance: Mapped[str] = mapped_column(String(255), nullable=True)
    worker_count: Mapped[int] = mapped_column(Integer, default=0)
    worker_absent: Mapped[int] = mapped_column(Integer, default=0)
    worker_hours: Mapped[float] = mapped_column(Float, default=0.0)
    machinery_used: Mapped[str] = mapped_column(Text, nullable=True)
    materials_consumed: Mapped[str] = mapped_column(Text, nullable=True)
    material_updates: Mapped[dict] = mapped_column(JSON, nullable=True)
    cost_incurred: Mapped[float] = mapped_column(Float, default=0.0)
    weather_conditions: Mapped[str] = mapped_column(String(50), default="Sunny")
    safety_observations: Mapped[str] = mapped_column(Text, nullable=True)
    quality_inspection_remarks: Mapped[str] = mapped_column(Text, nullable=True)
    delays: Mapped[bool] = mapped_column(Boolean, default=False)
    delay_reasons: Mapped[str] = mapped_column(Text, nullable=True)
    comments: Mapped[str] = mapped_column(Text, nullable=True)
    reported_by: Mapped[str] = mapped_column(String(100), nullable=False, default="Site Engineer")
    reported_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="daily_progress_reports")
    photographs = relationship("ProgressPhotograph", back_populates="report", cascade="all, delete-orphan")


class WeeklyProgressReport(Base):
    """Weekly summary generated from daily progress reports within a date range."""
    __tablename__ = "weekly_progress_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    week_start_date: Mapped[str] = mapped_column(String(20), nullable=False)
    week_end_date: Mapped[str] = mapped_column(String(20), nullable=False)
    completed_work: Mapped[str] = mapped_column(Text, nullable=True)
    weekly_progress_percentage: Mapped[int] = mapped_column(Integer, default=0)
    worker_hours: Mapped[float] = mapped_column(Float, default=0.0)
    worker_count: Mapped[int] = mapped_column(Integer, default=0)
    major_activities: Mapped[str] = mapped_column(Text, nullable=True)
    delays: Mapped[str] = mapped_column(Text, nullable=True)
    safety_incidents: Mapped[str] = mapped_column(Text, nullable=True)
    overall_status: Mapped[str] = mapped_column(String(30), default="On Track")
    generated_by: Mapped[str] = mapped_column(String(100), nullable=False, default="Project Manager")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="weekly_progress_reports")


class WorkCompletionStatus(Base):
    """Cached auto-computed overall project completion snapshot per project.

    Source of truth remains the daily_progress_reports table; this row is an
    upserted snapshot computed whenever a daily report is created/updated/deleted.
    """
    __tablename__ = "work_completion_status"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    overall_completion_percentage: Mapped[int] = mapped_column(Integer, default=0)
    category_breakdown: Mapped[dict] = mapped_column(JSON, nullable=True)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="completion_status")


class DelayTracking(Base):
    """Recorded project delays with reason, duration, impacted category and timeline impact."""
    __tablename__ = "delay_tracking"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, default=0)
    affected_work_category: Mapped[str] = mapped_column(String(50), nullable=False)
    impact_on_timeline: Mapped[str] = mapped_column(Text, nullable=True)
    reported_date: Mapped[str] = mapped_column(String(20), nullable=False)
    reported_by: Mapped[str] = mapped_column(String(100), nullable=False, default="Site Engineer")
    status: Mapped[str] = mapped_column(String(20), default="Open")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="delays")


class SiteActivityLog(Base):
    """Site event log: material deliveries, inspections, safety meetings, etc."""
    __tablename__ = "site_activity_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    activity_date: Mapped[str] = mapped_column(String(20), nullable=False)
    activity_time: Mapped[str] = mapped_column(String(10), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    responsible_person: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="site_activity_logs")


class ProgressPhotograph(Base):
    """Progress photographs attached to a daily progress report."""
    __tablename__ = "progress_photographs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id: Mapped[str] = mapped_column(String(36), ForeignKey("daily_progress_reports.id", ondelete="CASCADE"), nullable=False)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str] = mapped_column(String(200), nullable=True)
    uploaded_by: Mapped[str] = mapped_column(String(100), nullable=False, default="Site Engineer")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    report = relationship("DailyProgressReport", back_populates="photographs")


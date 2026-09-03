import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_name: Mapped[str] = mapped_column(String(150), nullable=False)
    project_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    client_name: Mapped[str] = mapped_column(String(150), nullable=False)
    client_contact: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    estimated_budget: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    priority: Mapped[str] = mapped_column(String(20), default="Medium")
    status: Mapped[str] = mapped_column(String(30), default="Planning")
    start_date: Mapped[str] = mapped_column(String(20), nullable=False)
    expected_completion_date: Mapped[str] = mapped_column(String(20), nullable=False)
    project_manager_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project_manager = relationship("User", foreign_keys=[project_manager_id], back_populates="managed_projects")
    schedules = relationship("ProjectSchedule", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("ProjectMilestone", back_populates="project", cascade="all, delete-orphan")
    site_engineers = relationship("ProjectSiteEngineer", back_populates="project", cascade="all, delete-orphan")
    contractors = relationship("ProjectContractor", back_populates="project", cascade="all, delete-orphan")
    clients = relationship("ProjectClient", back_populates="project", cascade="all, delete-orphan")
    audit_logs = relationship("ProjectAuditLog", back_populates="project", cascade="all, delete-orphan")
    budget = relationship("ProjectBudget", back_populates="project", uselist=False, cascade="all, delete-orphan")
    cost_estimates = relationship("CostEstimate", back_populates="project", cascade="all, delete-orphan")
    expenses = relationship("ProjectExpense", back_populates="project", cascade="all, delete-orphan")

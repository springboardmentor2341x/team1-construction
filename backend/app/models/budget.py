import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, Numeric, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

# Core budget categories supported across BuildTrack Module 11
BUDGET_CATEGORIES = [
    "Labor",
    "Material",
    "Equipment",
    "Transportation",
    "Maintenance",
    "Administrative"
]


class ProjectBudget(Base):
    __tablename__ = "project_budgets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    overall_budget: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", foreign_keys=[project_id])
    creator = relationship("User", foreign_keys=[created_by])
    allocations = relationship("BudgetCategoryAllocation", back_populates="budget", cascade="all, delete-orphan")


class BudgetCategoryAllocation(Base):
    __tablename__ = "budget_category_allocations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    budget_id: Mapped[str] = mapped_column(String(36), ForeignKey("project_budgets.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # Labor, Material, Equipment, Transportation, Maintenance, Administrative
    allocated_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.0)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("budget_id", "category", name="uq_budget_category"),
    )

    budget = relationship("ProjectBudget", back_populates="allocations")


class CostEstimate(Base):
    __tablename__ = "cost_estimates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    estimate_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.0)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    task_reference: Mapped[str] = mapped_column(String(150), nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("Project", foreign_keys=[project_id])
    creator = relationship("User", foreign_keys=[created_by])


class ActualExpense(Base):
    __tablename__ = "actual_expenses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    expense_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.0)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    expense_date: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    source_reference: Mapped[str] = mapped_column(String(150), nullable=True)
    worker_id: Mapped[str] = mapped_column(String(36), ForeignKey("workers.id", ondelete="SET NULL"), nullable=True, index=True)
    material_id: Mapped[str] = mapped_column(String(36), ForeignKey("materials.id", ondelete="SET NULL"), nullable=True, index=True)
    equipment_id: Mapped[str] = mapped_column(String(36), ForeignKey("resources.id", ondelete="SET NULL"), nullable=True, index=True)
    purchase_order_id: Mapped[str] = mapped_column(String(36), ForeignKey("purchase_orders.id", ondelete="SET NULL"), nullable=True, index=True)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("Project", foreign_keys=[project_id])
    creator = relationship("User", foreign_keys=[created_by])
    worker = relationship("Worker", foreign_keys=[worker_id])
    material = relationship("MaterialModel", foreign_keys=[material_id])
    equipment = relationship("ResourceModel", foreign_keys=[equipment_id])
    purchase_order = relationship("PurchaseOrderModel", foreign_keys=[purchase_order_id])

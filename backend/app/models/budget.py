import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import (
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    UniqueConstraint,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base


class CostCategory(Base):
    """Lookup of cost categories used for budget allocations, estimates, and expenses."""

    __tablename__ = "cost_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    allocations = relationship("BudgetAllocation", back_populates="cost_category")
    cost_estimates = relationship("CostEstimate", back_populates="cost_category")
    expenses = relationship("ProjectExpense", back_populates="cost_category")


class ProjectBudget(Base):
    """Overall planned budget for a single project (one row per project)."""

    __tablename__ = "project_budgets"
    __table_args__ = (
        UniqueConstraint("project_id", name="uq_project_budgets_project_id"),
        CheckConstraint("total_budget >= 0", name="ck_project_budgets_total_budget_non_negative"),
        Index("ix_project_budgets_status", "status"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    total_budget: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False, default=Decimal("0.00"))
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="USD")
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="Draft")
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    project = relationship("Project", back_populates="budget")
    created_by_user = relationship("User", foreign_keys=[created_by])
    allocations = relationship(
        "BudgetAllocation",
        back_populates="project_budget",
        cascade="all, delete-orphan",
    )


class BudgetAllocation(Base):
    """Category-wise planned allocation against a project budget."""

    __tablename__ = "budget_allocations"
    __table_args__ = (
        UniqueConstraint("project_budget_id", "cost_category_id", name="uq_budget_allocations_budget_category"),
        CheckConstraint("allocated_amount >= 0", name="ck_budget_allocations_amount_non_negative"),
        Index("ix_budget_allocations_cost_category_id", "cost_category_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_budget_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("project_budgets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    cost_category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("cost_categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    allocated_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False, default=Decimal("0.00"))
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    project_budget = relationship("ProjectBudget", back_populates="allocations")
    cost_category = relationship("CostCategory", back_populates="allocations")


class CostEstimate(Base):
    """Estimated cost line for a project and cost category."""

    __tablename__ = "cost_estimates"
    __table_args__ = (
        CheckConstraint("estimated_amount >= 0", name="ck_cost_estimates_amount_non_negative"),
        Index("ix_cost_estimates_project_id", "project_id"),
        Index("ix_cost_estimates_cost_category_id", "cost_category_id"),
        Index("ix_cost_estimates_estimate_date", "estimate_date"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    cost_category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("cost_categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    estimate_title: Mapped[str] = mapped_column(String(200), nullable=False)
    estimated_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False, default=Decimal("0.00"))
    estimate_date: Mapped[str] = mapped_column(String(20), nullable=False)
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    project = relationship("Project", back_populates="cost_estimates")
    cost_category = relationship("CostCategory", back_populates="cost_estimates")
    created_by_user = relationship("User", foreign_keys=[created_by])


class ProjectExpense(Base):
    """Actual project expense belonging to a project and cost category."""

    __tablename__ = "project_expenses"
    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_project_expenses_amount_positive"),
        Index("ix_project_expenses_project_id", "project_id"),
        Index("ix_project_expenses_cost_category_id", "cost_category_id"),
        Index("ix_project_expenses_expense_date", "expense_date"),
        Index("ix_project_expenses_status", "status"),
        Index("ix_project_expenses_source", "source_type", "source_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    cost_category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("cost_categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    expense_title: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    expense_date: Mapped[str] = mapped_column(String(20), nullable=False)
    vendor_or_payee: Mapped[str] = mapped_column(String(150), nullable=True)
    reference_no: Mapped[str] = mapped_column(String(50), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="Recorded")
    source_type: Mapped[str] = mapped_column(String(30), nullable=False, default="Manual")
    source_id: Mapped[str] = mapped_column(String(36), nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    project = relationship("Project", back_populates="expenses")
    cost_category = relationship("CostCategory", back_populates="expenses")
    created_by_user = relationship("User", foreign_keys=[created_by])

"""Create budget & cost management module tables

Revision ID: 011_budget_module
Revises:
Create Date: 2026-09-03 14:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "011_budget_module"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Cost Categories
    op.create_table(
        "cost_categories",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_cost_categories_name"), "cost_categories", ["name"], unique=True)

    # 2. Project Budgets (one overall budget per project)
    op.create_table(
        "project_budgets",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("project_id", sa.String(length=36), nullable=False),
        sa.Column("total_budget", sa.Numeric(precision=18, scale=2), nullable=False, server_default="0.00"),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="USD"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="Draft"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("total_budget >= 0", name="ck_project_budgets_total_budget_non_negative"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("project_id", name="uq_project_budgets_project_id"),
    )
    op.create_index(op.f("ix_project_budgets_project_id"), "project_budgets", ["project_id"], unique=False)
    op.create_index("ix_project_budgets_status", "project_budgets", ["status"], unique=False)

    # 3. Budget Allocations (category-wise planned amounts)
    op.create_table(
        "budget_allocations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("project_budget_id", sa.String(length=36), nullable=False),
        sa.Column("cost_category_id", sa.String(length=36), nullable=False),
        sa.Column("allocated_amount", sa.Numeric(precision=18, scale=2), nullable=False, server_default="0.00"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("allocated_amount >= 0", name="ck_budget_allocations_amount_non_negative"),
        sa.ForeignKeyConstraint(["cost_category_id"], ["cost_categories.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["project_budget_id"], ["project_budgets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("project_budget_id", "cost_category_id", name="uq_budget_allocations_budget_category"),
    )
    op.create_index(
        op.f("ix_budget_allocations_project_budget_id"),
        "budget_allocations",
        ["project_budget_id"],
        unique=False,
    )
    op.create_index(
        "ix_budget_allocations_cost_category_id",
        "budget_allocations",
        ["cost_category_id"],
        unique=False,
    )

    # 4. Cost Estimates
    op.create_table(
        "cost_estimates",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("project_id", sa.String(length=36), nullable=False),
        sa.Column("cost_category_id", sa.String(length=36), nullable=False),
        sa.Column("estimate_title", sa.String(length=200), nullable=False),
        sa.Column("estimated_amount", sa.Numeric(precision=18, scale=2), nullable=False, server_default="0.00"),
        sa.Column("estimate_date", sa.String(length=20), nullable=False),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("estimated_amount >= 0", name="ck_cost_estimates_amount_non_negative"),
        sa.ForeignKeyConstraint(["cost_category_id"], ["cost_categories.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cost_estimates_project_id", "cost_estimates", ["project_id"], unique=False)
    op.create_index("ix_cost_estimates_cost_category_id", "cost_estimates", ["cost_category_id"], unique=False)
    op.create_index("ix_cost_estimates_estimate_date", "cost_estimates", ["estimate_date"], unique=False)

    # 5. Actual Project Expenses
    op.create_table(
        "project_expenses",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("project_id", sa.String(length=36), nullable=False),
        sa.Column("cost_category_id", sa.String(length=36), nullable=False),
        sa.Column("expense_title", sa.String(length=200), nullable=False),
        sa.Column("amount", sa.Numeric(precision=18, scale=2), nullable=False),
        sa.Column("expense_date", sa.String(length=20), nullable=False),
        sa.Column("vendor_or_payee", sa.String(length=150), nullable=True),
        sa.Column("reference_no", sa.String(length=50), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="Recorded"),
        sa.Column("source_type", sa.String(length=30), nullable=False, server_default="Manual"),
        sa.Column("source_id", sa.String(length=36), nullable=True),
        sa.Column("created_by", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("amount > 0", name="ck_project_expenses_amount_positive"),
        sa.ForeignKeyConstraint(["cost_category_id"], ["cost_categories.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_project_expenses_project_id", "project_expenses", ["project_id"], unique=False)
    op.create_index("ix_project_expenses_cost_category_id", "project_expenses", ["cost_category_id"], unique=False)
    op.create_index("ix_project_expenses_expense_date", "project_expenses", ["expense_date"], unique=False)
    op.create_index("ix_project_expenses_status", "project_expenses", ["status"], unique=False)
    op.create_index("ix_project_expenses_source", "project_expenses", ["source_type", "source_id"], unique=False)

    # Lookup category names only (no monetary amounts).
    cost_categories = sa.table(
        "cost_categories",
        sa.column("id", sa.String),
        sa.column("name", sa.String),
        sa.column("description", sa.Text),
        sa.column("is_active", sa.Boolean),
    )
    op.bulk_insert(
        cost_categories,
        [
            {
                "id": "a11e0001-c011-4000-8000-000000000001",
                "name": "Labor Cost",
                "description": "Workforce wages, overtime, and related labor charges",
                "is_active": True,
            },
            {
                "id": "a11e0001-c011-4000-8000-000000000002",
                "name": "Material Cost",
                "description": "Construction materials and consumables",
                "is_active": True,
            },
            {
                "id": "a11e0001-c011-4000-8000-000000000003",
                "name": "Equipment Cost",
                "description": "Equipment purchase, hire, and operating charges",
                "is_active": True,
            },
            {
                "id": "a11e0001-c011-4000-8000-000000000004",
                "name": "Transportation Cost",
                "description": "Haulage, logistics, and site transport charges",
                "is_active": True,
            },
            {
                "id": "a11e0001-c011-4000-8000-000000000005",
                "name": "Maintenance Cost",
                "description": "Plant, equipment, and facility maintenance charges",
                "is_active": True,
            },
            {
                "id": "a11e0001-c011-4000-8000-000000000006",
                "name": "Administrative Cost",
                "description": "Site administration, overheads, and office charges",
                "is_active": True,
            },
        ],
    )


def downgrade() -> None:
    op.drop_index("ix_project_expenses_source", table_name="project_expenses")
    op.drop_index("ix_project_expenses_status", table_name="project_expenses")
    op.drop_index("ix_project_expenses_expense_date", table_name="project_expenses")
    op.drop_index("ix_project_expenses_cost_category_id", table_name="project_expenses")
    op.drop_index("ix_project_expenses_project_id", table_name="project_expenses")
    op.drop_table("project_expenses")

    op.drop_index("ix_cost_estimates_estimate_date", table_name="cost_estimates")
    op.drop_index("ix_cost_estimates_cost_category_id", table_name="cost_estimates")
    op.drop_index("ix_cost_estimates_project_id", table_name="cost_estimates")
    op.drop_table("cost_estimates")

    op.drop_index("ix_budget_allocations_cost_category_id", table_name="budget_allocations")
    op.drop_index(op.f("ix_budget_allocations_project_budget_id"), table_name="budget_allocations")
    op.drop_table("budget_allocations")

    op.drop_index("ix_project_budgets_status", table_name="project_budgets")
    op.drop_index(op.f("ix_project_budgets_project_id"), table_name="project_budgets")
    op.drop_table("project_budgets")

    op.drop_index(op.f("ix_cost_categories_name"), table_name="cost_categories")
    op.drop_table("cost_categories")

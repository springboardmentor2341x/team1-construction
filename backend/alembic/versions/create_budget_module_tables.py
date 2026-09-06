"""Create budget module tables

Revision ID: 009_budget_module
Revises: 008_notification_module
Create Date: 2026-09-04 07:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


revision = '009_budget_module'
down_revision = '008_notifications_module'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    tables = inspector.get_table_names()

    # 1. Project Budgets
    if 'project_budgets' not in tables:
        op.create_table(
            'project_budgets',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('project_id', sa.String(length=36), nullable=False),
            sa.Column('overall_budget', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0.00'),
            sa.Column('currency', sa.String(length=10), nullable=False, server_default='INR'),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_by', sa.String(length=36), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('project_id')
        )
        op.create_index(op.f('ix_project_budgets_project_id'), 'project_budgets', ['project_id'], unique=True)

    # 2. Budget Category Allocations
    if 'budget_category_allocations' not in tables:
        op.create_table(
            'budget_category_allocations',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('budget_id', sa.String(length=36), nullable=False),
            sa.Column('category', sa.String(length=50), nullable=False),
            sa.Column('allocated_amount', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0.00'),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['budget_id'], ['project_budgets.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('budget_id', 'category', name='uq_budget_category')
        )
        op.create_index(op.f('ix_budget_category_allocations_budget_id'), 'budget_category_allocations', ['budget_id'], unique=False)
        op.create_index(op.f('ix_budget_category_allocations_category'), 'budget_category_allocations', ['category'], unique=False)

    # 3. Cost Estimates
    if 'cost_estimates' not in tables:
        op.create_table(
            'cost_estimates',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('estimate_code', sa.String(length=50), nullable=False),
            sa.Column('project_id', sa.String(length=36), nullable=False),
            sa.Column('category', sa.String(length=50), nullable=False),
            sa.Column('amount', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0.00'),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('task_reference', sa.String(length=150), nullable=True),
            sa.Column('created_by', sa.String(length=36), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('estimate_code')
        )
        op.create_index(op.f('ix_cost_estimates_estimate_code'), 'cost_estimates', ['estimate_code'], unique=True)
        op.create_index(op.f('ix_cost_estimates_project_id'), 'cost_estimates', ['project_id'], unique=False)
        op.create_index(op.f('ix_cost_estimates_category'), 'cost_estimates', ['category'], unique=False)

    # 4. Actual Expenses
    if 'actual_expenses' not in tables:
        op.create_table(
            'actual_expenses',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('expense_code', sa.String(length=50), nullable=False),
            sa.Column('project_id', sa.String(length=36), nullable=False),
            sa.Column('category', sa.String(length=50), nullable=False),
            sa.Column('amount', sa.Numeric(precision=15, scale=2), nullable=False, server_default='0.00'),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('expense_date', sa.String(length=20), nullable=False),
            sa.Column('source_reference', sa.String(length=150), nullable=True),
            sa.Column('worker_id', sa.String(length=36), nullable=True),
            sa.Column('material_id', sa.String(length=36), nullable=True),
            sa.Column('equipment_id', sa.String(length=36), nullable=True),
            sa.Column('purchase_order_id', sa.String(length=36), nullable=True),
            sa.Column('created_by', sa.String(length=36), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['worker_id'], ['workers.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['material_id'], ['materials.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['equipment_id'], ['resources.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['purchase_order_id'], ['purchase_orders.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('expense_code')
        )
        op.create_index(op.f('ix_actual_expenses_expense_code'), 'actual_expenses', ['expense_code'], unique=True)
        op.create_index(op.f('ix_actual_expenses_project_id'), 'actual_expenses', ['project_id'], unique=False)
        op.create_index(op.f('ix_actual_expenses_category'), 'actual_expenses', ['category'], unique=False)
        op.create_index(op.f('ix_actual_expenses_expense_date'), 'actual_expenses', ['expense_date'], unique=False)


def downgrade() -> None:
    op.drop_table('actual_expenses')
    op.drop_table('cost_estimates')
    op.drop_table('budget_category_allocations')
    op.drop_table('project_budgets')

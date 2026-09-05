"""Add foreign key columns to assigned_tasks table

Revision ID: 010_update_task_foreign_keys
Revises: 009_budget_module
Create Date: 2026-09-04 08:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


revision = '010_update_task_foreign_keys'
down_revision = '009_budget_module'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [c['name'] for c in inspector.get_columns('assigned_tasks')] if 'assigned_tasks' in inspector.get_table_names() else []

    if 'assigned_tasks' in inspector.get_table_names():
        if 'project_id' not in columns:
            op.add_column('assigned_tasks', sa.Column('project_id', sa.String(length=36), sa.ForeignKey('projects.id'), nullable=True))
        if 'assigned_to_id' not in columns:
            op.add_column('assigned_tasks', sa.Column('assigned_to_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=True))
        if 'milestone_id' not in columns:
            op.add_column('assigned_tasks', sa.Column('milestone_id', sa.String(length=36), sa.ForeignKey('project_milestones.id'), nullable=True))
        if 'contractor_id' not in columns:
            op.add_column('assigned_tasks', sa.Column('contractor_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=True))
        if 'worker_id' not in columns:
            op.add_column('assigned_tasks', sa.Column('worker_id', sa.String(length=36), sa.ForeignKey('workers.id'), nullable=True))


def downgrade() -> None:
    pass

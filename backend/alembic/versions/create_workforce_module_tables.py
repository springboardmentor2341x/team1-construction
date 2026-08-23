"""Create workforce module tables

Revision ID: 006_workforce_module
Revises: 
Create Date: 2026-08-23 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '006_workforce_module'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Workforce Categories
    op.create_table(
        'workforce_categories',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_workforce_categories_name'), 'workforce_categories', ['name'], unique=True)

    # 2. Workers
    op.create_table(
        'workers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=50), nullable=False),
        sa.Column('worker_name', sa.String(length=150), nullable=False),
        sa.Column('contact_information', sa.String(length=100), nullable=True),
        sa.Column('workforce_category_id', sa.String(length=36), nullable=False),
        sa.Column('skill_or_work_type', sa.String(length=100), nullable=True),
        sa.Column('contractor_id', sa.String(length=36), nullable=True),
        sa.Column('joining_date', sa.String(length=20), nullable=False),
        sa.Column('worker_status', sa.String(length=30), nullable=False, server_default='Active'),
        sa.Column('pay_rate', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['contractor_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['workforce_category_id'], ['workforce_categories.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('worker_id')
    )
    op.create_index(op.f('ix_workers_worker_id'), 'workers', ['worker_id'], unique=True)
    op.create_index(op.f('ix_workers_worker_name'), 'workers', ['worker_name'], unique=False)
    op.create_index(op.f('ix_workers_workforce_category_id'), 'workers', ['workforce_category_id'], unique=False)
    op.create_index(op.f('ix_workers_contractor_id'), 'workers', ['contractor_id'], unique=False)
    op.create_index(op.f('ix_workers_worker_status'), 'workers', ['worker_status'], unique=False)

    # 3. Worker Project Assignments
    op.create_table(
        'worker_project_assignments',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('contractor_id', sa.String(length=36), nullable=True),
        sa.Column('work_activity', sa.String(length=200), nullable=True),
        sa.Column('assignment_start_date', sa.String(length=20), nullable=False),
        sa.Column('assignment_end_date', sa.String(length=20), nullable=True),
        sa.Column('assignment_status', sa.String(length=30), nullable=False, server_default='Active'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['contractor_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['worker_id'], ['workers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_worker_project_assignments_worker_id'), 'worker_project_assignments', ['worker_id'], unique=False)
    op.create_index(op.f('ix_worker_project_assignments_project_id'), 'worker_project_assignments', ['project_id'], unique=False)

    # 4. Worker Shift Assignments
    op.create_table(
        'worker_shift_assignments',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('shift_id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=36), nullable=False),
        sa.Column('assigned_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['shift_id'], ['shifts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['worker_id'], ['workers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Workforce Payrolls
    op.create_table(
        'workforce_payrolls',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('worker_id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('pay_period_start', sa.String(length=20), nullable=False),
        sa.Column('pay_period_end', sa.String(length=20), nullable=False),
        sa.Column('pay_rate', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('working_days', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('working_hours', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('overtime_hours', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('leave_days', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('attendance_reference', sa.Text(), nullable=True),
        sa.Column('estimated_pay', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('payroll_status', sa.String(length=30), nullable=False, server_default='Pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['worker_id'], ['workers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('workforce_payrolls')
    op.drop_table('worker_shift_assignments')
    op.drop_table('worker_project_assignments')
    op.drop_table('workers')
    op.drop_table('workforce_categories')

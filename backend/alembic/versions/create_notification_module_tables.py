"""Create notification module tables

Revision ID: 008_notification_module
Revises: 
Create Date: 2026-09-03 22:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


revision = '008_notifications_module'
down_revision = '007_procurement_module'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    tables = inspector.get_table_names()

    if 'notifications' not in tables:
        op.create_table(
            'notifications',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('project_id', sa.String(length=36), nullable=True),
            sa.Column('title', sa.String(length=200), nullable=False),
            sa.Column('message', sa.Text(), nullable=True),
            sa.Column('type', sa.String(length=50), nullable=False, server_default='SYSTEM'),
            sa.Column('notification_type', sa.String(length=50), nullable=True, server_default='info'),
            sa.Column('category', sa.String(length=50), nullable=True, server_default='System'),
            sa.Column('time', sa.String(length=30), nullable=True, server_default=''),
            sa.Column('reference_module', sa.String(length=50), nullable=True),
            sa.Column('reference_id', sa.String(length=36), nullable=True),
            sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
    else:
        existing_cols = [c['name'] for c in inspector.get_columns('notifications')]
        if 'user_id' not in existing_cols:
            op.add_column('notifications', sa.Column('user_id', sa.String(length=36), nullable=True))
            op.create_foreign_key('fk_notifications_user_id', 'notifications', 'users', ['user_id'], ['id'], ondelete='CASCADE')
        if 'project_id' not in existing_cols:
            op.add_column('notifications', sa.Column('project_id', sa.String(length=36), nullable=True))
            op.create_foreign_key('fk_notifications_project_id', 'notifications', 'projects', ['project_id'], ['id'], ondelete='CASCADE')
        if 'type' not in existing_cols:
            op.add_column('notifications', sa.Column('type', sa.String(length=50), nullable=False, server_default='SYSTEM'))
        if 'reference_module' not in existing_cols:
            op.add_column('notifications', sa.Column('reference_module', sa.String(length=50), nullable=True))
        if 'reference_id' not in existing_cols:
            op.add_column('notifications', sa.Column('reference_id', sa.String(length=36), nullable=True))
        if 'read_at' not in existing_cols:
            op.add_column('notifications', sa.Column('read_at', sa.DateTime(timezone=True), nullable=True))

    indexes = [idx['name'] for idx in inspector.get_indexes('notifications')]
    if 'ix_notifications_user_id' not in indexes:
        op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    if 'ix_notifications_project_id' not in indexes:
        op.create_index('ix_notifications_project_id', 'notifications', ['project_id'])
    if 'ix_notifications_type' not in indexes:
        op.create_index('ix_notifications_type', 'notifications', ['type'])
    if 'ix_notifications_is_read' not in indexes:
        op.create_index('ix_notifications_is_read', 'notifications', ['is_read'])
    if 'ix_notifications_created_at' not in indexes:
        op.create_index('ix_notifications_created_at', 'notifications', ['created_at'])
    if 'idx_notifications_user_unread_created' not in indexes:
        op.create_index('idx_notifications_user_unread_created', 'notifications', ['user_id', 'is_read', 'created_at'])


def downgrade() -> None:
    pass

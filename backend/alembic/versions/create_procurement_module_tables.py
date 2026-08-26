"""Create procurement module tables

Revision ID: 007_procurement_module
Revises: 006_workforce_module
Create Date: 2026-08-23 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '007_procurement_module'
down_revision = '006_workforce_module'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Procurement Categories
    op.create_table(
        'procurement_categories',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_procurement_categories_name'), 'procurement_categories', ['name'], unique=True)

    # 2. Vendors
    op.create_table(
        'vendors',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('vendor_id', sa.String(length=50), nullable=False),
        sa.Column('vendor_name', sa.String(length=150), nullable=False),
        sa.Column('contact_person', sa.String(length=100), nullable=True),
        sa.Column('contact_number', sa.String(length=50), nullable=True),
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('vendor_category', sa.String(length=100), nullable=True, server_default='Raw Materials'),
        sa.Column('products_or_services_supplied', sa.Text(), nullable=True),
        sa.Column('vendor_status', sa.String(length=30), nullable=False, server_default='Active'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('vendor_id')
    )
    op.create_index(op.f('ix_vendors_vendor_id'), 'vendors', ['vendor_id'], unique=True)
    op.create_index(op.f('ix_vendors_vendor_name'), 'vendors', ['vendor_name'], unique=False)
    op.create_index(op.f('ix_vendors_vendor_status'), 'vendors', ['vendor_status'], unique=False)

    # 3. Procurement Requests
    op.create_table(
        'procurement_requests',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('request_id', sa.String(length=50), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('category_name', sa.String(length=100), nullable=False, server_default='Raw Materials'),
        sa.Column('purpose', sa.Text(), nullable=True),
        sa.Column('priority', sa.String(length=20), nullable=False, server_default='Medium'),
        sa.Column('request_date', sa.String(length=20), nullable=False),
        sa.Column('request_status', sa.String(length=30), nullable=False, server_default='Pending'),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('requested_by_id', sa.String(length=36), nullable=True),
        sa.Column('requested_by_name', sa.String(length=150), nullable=False),
        sa.Column('approved_by_id', sa.String(length=36), nullable=True),
        sa.Column('approved_by_name', sa.String(length=150), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_by_id', sa.String(length=36), nullable=True),
        sa.Column('rejected_by_name', sa.String(length=150), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['approved_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['rejected_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['requested_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('request_id')
    )
    op.create_index(op.f('ix_procurement_requests_request_id'), 'procurement_requests', ['request_id'], unique=True)
    op.create_index(op.f('ix_procurement_requests_project_id'), 'procurement_requests', ['project_id'], unique=False)
    op.create_index(op.f('ix_procurement_requests_request_status'), 'procurement_requests', ['request_status'], unique=False)

    # 4. Procurement Request Items
    op.create_table(
        'procurement_request_items',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('procurement_request_id', sa.String(length=36), nullable=False),
        sa.Column('material_id', sa.String(length=36), nullable=True),
        sa.Column('item_description', sa.String(length=200), nullable=False),
        sa.Column('category_name', sa.String(length=100), nullable=True, server_default='Raw Materials'),
        sa.Column('required_quantity', sa.Float(), nullable=False),
        sa.Column('available_stock', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('net_procurement_quantity', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('unit', sa.String(length=50), nullable=True, server_default='Units'),
        sa.Column('required_date', sa.String(length=20), nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['material_id'], ['materials.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['procurement_request_id'], ['procurement_requests.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Purchase Orders
    op.create_table(
        'purchase_orders',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('purchase_order_id', sa.String(length=50), nullable=False),
        sa.Column('vendor_id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('procurement_request_id', sa.String(length=36), nullable=True),
        sa.Column('order_date', sa.String(length=20), nullable=False),
        sa.Column('expected_delivery_date', sa.String(length=20), nullable=False),
        sa.Column('subtotal', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('tax_amount', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('additional_charges', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('total_amount', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('purchase_order_status', sa.String(length=30), nullable=False, server_default='Draft'),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_by_id', sa.String(length=36), nullable=True),
        sa.Column('created_by_name', sa.String(length=150), nullable=False),
        sa.Column('approved_by_id', sa.String(length=36), nullable=True),
        sa.Column('approved_by_name', sa.String(length=150), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['approved_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['procurement_request_id'], ['procurement_requests.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('purchase_order_id')
    )
    op.create_index(op.f('ix_purchase_orders_purchase_order_id'), 'purchase_orders', ['purchase_order_id'], unique=True)
    op.create_index(op.f('ix_purchase_orders_vendor_id'), 'purchase_orders', ['vendor_id'], unique=False)
    op.create_index(op.f('ix_purchase_orders_project_id'), 'purchase_orders', ['project_id'], unique=False)

    # 6. Purchase Order Items
    op.create_table(
        'purchase_order_items',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('purchase_order_id', sa.String(length=36), nullable=False),
        sa.Column('material_id', sa.String(length=36), nullable=True),
        sa.Column('description', sa.String(length=200), nullable=False),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('received_quantity', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('unit', sa.String(length=50), nullable=True, server_default='Units'),
        sa.Column('unit_price', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('tax', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('discount', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('line_total', sa.Float(), nullable=True, server_default='0.0'),
        sa.ForeignKeyConstraint(['material_id'], ['materials.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['purchase_order_id'], ['purchase_orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 7. Invoices
    op.create_table(
        'invoices',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('invoice_id', sa.String(length=50), nullable=False),
        sa.Column('invoice_number', sa.String(length=100), nullable=False),
        sa.Column('vendor_id', sa.String(length=36), nullable=False),
        sa.Column('purchase_order_id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('invoice_date', sa.String(length=20), nullable=False),
        sa.Column('due_date', sa.String(length=20), nullable=False),
        sa.Column('invoice_amount', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('payment_status', sa.String(length=30), nullable=False, server_default='Pending'),
        sa.Column('invoice_status', sa.String(length=30), nullable=False, server_default='Received'),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['purchase_order_id'], ['purchase_orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('invoice_id')
    )
    op.create_index(op.f('ix_invoices_invoice_id'), 'invoices', ['invoice_id'], unique=True)
    op.create_index(op.f('ix_invoices_invoice_number'), 'invoices', ['invoice_number'], unique=False)
    op.create_index(op.f('ix_invoices_vendor_id'), 'invoices', ['vendor_id'], unique=False)
    op.create_index(op.f('ix_invoices_purchase_order_id'), 'invoices', ['purchase_order_id'], unique=False)


def downgrade() -> None:
    op.drop_table('invoices')
    op.drop_table('purchase_order_items')
    op.drop_table('purchase_orders')
    op.drop_table('procurement_request_items')
    op.drop_table('procurement_requests')
    op.drop_table('vendors')
    op.drop_table('procurement_categories')

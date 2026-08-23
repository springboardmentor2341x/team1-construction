import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base


class ProcurementCategoryModel(Base):
    __tablename__ = "procurement_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class VendorModel(Base):
    __tablename__ = "vendors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vendor_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    vendor_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    contact_person: Mapped[str] = mapped_column(String(100), nullable=True)
    contact_number: Mapped[str] = mapped_column(String(50), nullable=True)
    email: Mapped[str] = mapped_column(String(100), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    vendor_category: Mapped[str] = mapped_column(String(100), default="Raw Materials") # Raw Materials, Equipment, Machinery, Safety Equipment, Office Supplies
    products_or_services_supplied: Mapped[str] = mapped_column(Text, nullable=True)
    vendor_status: Mapped[str] = mapped_column(String(30), default="Active", index=True) # Active, Inactive, Blacklisted
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    purchase_orders = relationship("PurchaseOrderModel", back_populates="vendor")
    invoices = relationship("InvoiceModel", back_populates="vendor")


class ProcurementRequestModel(Base):
    __tablename__ = "procurement_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    category_name: Mapped[str] = mapped_column(String(100), default="Raw Materials")
    purpose: Mapped[str] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="Medium") # Low, Medium, High, Urgent
    request_date: Mapped[str] = mapped_column(String(20), default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"), index=True)
    request_status: Mapped[str] = mapped_column(String(30), default="Pending", index=True) # Pending, Approved, Rejected, Processing, Completed, Cancelled
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    requested_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    requested_by_name: Mapped[str] = mapped_column(String(150), nullable=False)
    approved_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by_name: Mapped[str] = mapped_column(String(150), nullable=True)
    approved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    rejected_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rejected_by_name: Mapped[str] = mapped_column(String(150), nullable=True)
    rejected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("Project")
    items = relationship("ProcurementRequestItemModel", back_populates="request", cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrderModel", back_populates="procurement_request")


class ProcurementRequestItemModel(Base):
    __tablename__ = "procurement_request_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    procurement_request_id: Mapped[str] = mapped_column(String(36), ForeignKey("procurement_requests.id", ondelete="CASCADE"), nullable=False)
    material_id: Mapped[str] = mapped_column(String(36), ForeignKey("materials.id", ondelete="SET NULL"), nullable=True)
    item_description: Mapped[str] = mapped_column(String(200), nullable=False)
    category_name: Mapped[str] = mapped_column(String(100), default="Raw Materials")
    required_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    available_stock: Mapped[float] = mapped_column(Float, default=0.0)
    net_procurement_quantity: Mapped[float] = mapped_column(Float, default=0.0)
    unit: Mapped[str] = mapped_column(String(50), default="Units")
    required_date: Mapped[str] = mapped_column(String(20), nullable=False)
    remarks: Mapped[str] = mapped_column(Text, nullable=True)

    request = relationship("ProcurementRequestModel", back_populates="items")
    material = relationship("MaterialModel")


class PurchaseOrderModel(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    purchase_order_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    vendor_id: Mapped[str] = mapped_column(String(36), ForeignKey("vendors.id", ondelete="RESTRICT"), nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    procurement_request_id: Mapped[str] = mapped_column(String(36), ForeignKey("procurement_requests.id", ondelete="SET NULL"), nullable=True, index=True)
    order_date: Mapped[str] = mapped_column(String(20), default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"), index=True)
    expected_delivery_date: Mapped[str] = mapped_column(String(20), nullable=False)
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    tax_amount: Mapped[float] = mapped_column(Float, default=0.0)
    additional_charges: Mapped[float] = mapped_column(Float, default=0.0)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    purchase_order_status: Mapped[str] = mapped_column(String(30), default="Draft", index=True) # Draft, Approved, Sent, Partially Received, Completed, Cancelled
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    created_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_by_name: Mapped[str] = mapped_column(String(150), nullable=False)
    approved_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by_name: Mapped[str] = mapped_column(String(150), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    vendor = relationship("VendorModel", back_populates="purchase_orders")
    project = relationship("Project")
    procurement_request = relationship("ProcurementRequestModel", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItemModel", back_populates="purchase_order", cascade="all, delete-orphan")
    invoices = relationship("InvoiceModel", back_populates="purchase_order")


class PurchaseOrderItemModel(Base):
    __tablename__ = "purchase_order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    purchase_order_id: Mapped[str] = mapped_column(String(36), ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False)
    material_id: Mapped[str] = mapped_column(String(36), ForeignKey("materials.id", ondelete="SET NULL"), nullable=True)
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    received_quantity: Mapped[float] = mapped_column(Float, default=0.0)
    unit: Mapped[str] = mapped_column(String(50), default="Units")
    unit_price: Mapped[float] = mapped_column(Float, default=0.0)
    tax: Mapped[float] = mapped_column(Float, default=0.0)
    discount: Mapped[float] = mapped_column(Float, default=0.0)
    line_total: Mapped[float] = mapped_column(Float, default=0.0)

    purchase_order = relationship("PurchaseOrderModel", back_populates="items")
    material = relationship("MaterialModel")


class InvoiceModel(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    invoice_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # Vendor reference number
    vendor_id: Mapped[str] = mapped_column(String(36), ForeignKey("vendors.id", ondelete="RESTRICT"), nullable=False, index=True)
    purchase_order_id: Mapped[str] = mapped_column(String(36), ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    invoice_date: Mapped[str] = mapped_column(String(20), default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"), index=True)
    due_date: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    invoice_amount: Mapped[float] = mapped_column(Float, default=0.0)
    payment_status: Mapped[str] = mapped_column(String(30), default="Pending", index=True) # Pending, Partially Paid, Paid, Overdue
    invoice_status: Mapped[str] = mapped_column(String(30), default="Received", index=True) # Received, Verified, Disputed, Cancelled
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    vendor = relationship("VendorModel", back_populates="invoices")
    purchase_order = relationship("PurchaseOrderModel", back_populates="invoices")
    project = relationship("Project")

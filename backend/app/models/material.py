import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, DateTime, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base


class MaterialCategoryModel(Base):
    __tablename__ = "material_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    materials = relationship("MaterialModel", back_populates="category_rel", cascade="all, delete-orphan")


class MaterialModel(Base):
    __tablename__ = "materials"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    material_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("material_categories.id", ondelete="SET NULL"), nullable=True)
    category_name: Mapped[str] = mapped_column(String(100), nullable=False)
    unit_of_measure: Mapped[str] = mapped_column(String(50), nullable=False, default="Units") # Bags, Tons, Pieces, Cubic Meter, Meters, Units
    unit_price: Mapped[float] = mapped_column(Float, default=0.0)
    min_stock_level: Mapped[float] = mapped_column(Float, default=100.0)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Active") # Active, Inactive
    created_by: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category_rel = relationship("MaterialCategoryModel", back_populates="materials")
    inventory = relationship("MaterialInventoryModel", back_populates="material", uselist=False, cascade="all, delete-orphan")
    requests = relationship("MaterialRequestModel", back_populates="material", cascade="all, delete-orphan")
    allocations = relationship("MaterialAllocationModel", back_populates="material", cascade="all, delete-orphan")
    movements = relationship("StockMovementModel", back_populates="material", cascade="all, delete-orphan")


class MaterialInventoryModel(Base):
    __tablename__ = "material_inventories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    material_id: Mapped[str] = mapped_column(String(36), ForeignKey("materials.id", ondelete="CASCADE"), unique=True, nullable=False)
    warehouse_location: Mapped[str] = mapped_column(String(150), default="Main Warehouse")
    total_stock: Mapped[float] = mapped_column(Float, default=0.0)
    allocated_stock: Mapped[float] = mapped_column(Float, default=0.0)
    consumed_stock: Mapped[float] = mapped_column(Float, default=0.0)
    available_stock: Mapped[float] = mapped_column(Float, default=0.0)
    min_stock_level: Mapped[float] = mapped_column(Float, default=100.0)
    status: Mapped[str] = mapped_column(String(30), default="In Stock") # In Stock, Low Stock, Out of Stock
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    material = relationship("MaterialModel", back_populates="inventory")


class MaterialRequestModel(Base):
    __tablename__ = "material_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    material_id: Mapped[str] = mapped_column(String(36), ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)
    material_name: Mapped[str] = mapped_column(String(150), nullable=False)
    category_name: Mapped[str] = mapped_column(String(100), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    required_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    required_date: Mapped[str] = mapped_column(String(20), nullable=False) # YYYY-MM-DD
    work_activity: Mapped[str] = mapped_column(String(150), nullable=False)
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    requested_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    requested_by_name: Mapped[str] = mapped_column(String(150), nullable=False)
    request_date: Mapped[str] = mapped_column(String(20), default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    status: Mapped[str] = mapped_column(String(30), default="Pending") # Pending, Approved, Rejected, Partially Fulfilled, Fulfilled
    review_remarks: Mapped[str] = mapped_column(Text, nullable=True)
    reviewed_by_id: Mapped[str] = mapped_column(String(36), nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project = relationship("Project")
    material = relationship("MaterialModel", back_populates="requests")
    allocations = relationship("MaterialAllocationModel", back_populates="request")


class MaterialAllocationModel(Base):
    __tablename__ = "material_allocations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    material_id: Mapped[str] = mapped_column(String(36), ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    consumed_quantity: Mapped[float] = mapped_column(Float, default=0.0)
    allocation_date: Mapped[str] = mapped_column(String(20), nullable=False) # YYYY-MM-DD
    work_activity: Mapped[str] = mapped_column(String(150), nullable=False)
    responsible_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    responsible_user_name: Mapped[str] = mapped_column(String(150), nullable=False)
    request_id: Mapped[str] = mapped_column(String(36), ForeignKey("material_requests.id", ondelete="SET NULL"), nullable=True)
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Allocated") # Allocated, Consumed, Returned, Cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project = relationship("Project")
    material = relationship("MaterialModel", back_populates="allocations")
    request = relationship("MaterialRequestModel", back_populates="allocations")


class StockMovementModel(Base):
    __tablename__ = "stock_movements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    material_id: Mapped[str] = mapped_column(String(36), ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    movement_type: Mapped[str] = mapped_column(String(30), nullable=False) # Received, Allocated, Consumed, Returned, Adjustment
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    movement_date: Mapped[str] = mapped_column(String(20), default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    user_id: Mapped[str] = mapped_column(String(36), nullable=True)
    user_name: Mapped[str] = mapped_column(String(150), nullable=False)
    reference_id: Mapped[str] = mapped_column(String(100), nullable=True)
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    material = relationship("MaterialModel", back_populates="movements")
    project = relationship("Project")

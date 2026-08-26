import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base


class ResourceModel(Base):
    __tablename__ = "resources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # Excavators, Concrete Mixers, Cranes, Dump Trucks, Generators, Safety Equipment
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Available", nullable=False)  # Available, Allocated, Under Maintenance, Out of Service
    location: Mapped[str] = mapped_column(String(150), default="Equipment Yard")
    responsible_person_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    responsible_person_name: Mapped[str] = mapped_column(String(100), nullable=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    serial_number: Mapped[str] = mapped_column(String(100), nullable=True)
    purchase_date: Mapped[str] = mapped_column(String(20), nullable=True)
    purchase_cost: Mapped[float] = mapped_column(Float, default=0.0)
    utilization_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", foreign_keys=[project_id])
    responsible_person = relationship("User", foreign_keys=[responsible_person_id])
    allocations = relationship("ResourceAllocationModel", back_populates="resource", cascade="all, delete-orphan")
    utilizations = relationship("ResourceUtilizationModel", back_populates="resource", cascade="all, delete-orphan")
    maintenances = relationship("ResourceMaintenanceModel", back_populates="resource", cascade="all, delete-orphan")


class ResourceAllocationModel(Base):
    __tablename__ = "resource_allocations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resource_id: Mapped[str] = mapped_column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    allocation_date: Mapped[str] = mapped_column(String(20), nullable=False)  # YYYY-MM-DD
    expected_return_date: Mapped[str] = mapped_column(String(20), nullable=False)  # YYYY-MM-DD
    actual_return_date: Mapped[str] = mapped_column(String(20), nullable=True)  # YYYY-MM-DD
    responsible_person_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    responsible_person_name: Mapped[str] = mapped_column(String(100), nullable=True)
    location: Mapped[str] = mapped_column(String(150), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Active")  # Active, Returned, Cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    resource = relationship("ResourceModel", back_populates="allocations")
    project = relationship("Project", foreign_keys=[project_id])


class ResourceUtilizationModel(Base):
    __tablename__ = "resource_utilizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resource_id: Mapped[str] = mapped_column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    date: Mapped[str] = mapped_column(String(20), nullable=False)  # YYYY-MM-DD
    operating_hours: Mapped[float] = mapped_column(Float, default=0.0)
    idle_hours: Mapped[float] = mapped_column(Float, default=0.0)
    total_available_hours: Mapped[float] = mapped_column(Float, default=10.0)
    utilization_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    resource = relationship("ResourceModel", back_populates="utilizations")
    project = relationship("Project", foreign_keys=[project_id])


class ResourceMaintenanceModel(Base):
    __tablename__ = "resource_maintenances"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resource_id: Mapped[str] = mapped_column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False)
    maintenance_date: Mapped[str] = mapped_column(String(20), nullable=False)  # YYYY-MM-DD
    next_maintenance_date: Mapped[str] = mapped_column(String(20), nullable=True)  # YYYY-MM-DD
    maintenance_type: Mapped[str] = mapped_column(String(50), default="Routine Inspection")  # Preventative, Corrective, Emergency, Routine Inspection
    service_engineer: Mapped[str] = mapped_column(String(100), nullable=True)
    maintenance_cost: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(30), default="Scheduled")  # Scheduled, In Progress, Completed, Cancelled
    description: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    resource = relationship("ResourceModel", back_populates="maintenances")

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base


from app.models.resource import ResourceModel as Resource


class Inventory(Base):
    __tablename__ = "inventory"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    item_name: Mapped[str] = mapped_column(String(100), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    project_id: Mapped[str] = mapped_column(String(36), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="In Stock")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Attendance(Base):
    __tablename__ = "attendance"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, default="")
    user_name: Mapped[str] = mapped_column(String(100), default="Robert Thorne")
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    day_name: Mapped[str] = mapped_column(String(20), default="")
    shift_type: Mapped[str] = mapped_column(String(20), default="Morning")
    check_in: Mapped[str] = mapped_column(String(10), nullable=True)
    check_out: Mapped[str] = mapped_column(String(10), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Present")
    hours_worked: Mapped[float] = mapped_column(Float, default=0.0)
    location: Mapped[str] = mapped_column(String(150), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Procurement(Base):
    __tablename__ = "procurements"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    project_id: Mapped[str] = mapped_column(String(36), nullable=True)
    material_id: Mapped[str] = mapped_column(String(36), nullable=True)
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="Pending Approval") # Pending Approval, Approved, Rejected
    requested_by: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=True)
    notification_type: Mapped[str] = mapped_column(String(20), default="info")
    time: Mapped[str] = mapped_column(String(30), default="")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    category: Mapped[str] = mapped_column(String(50), default="System")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_name: Mapped[str] = mapped_column(String(150), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


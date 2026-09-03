import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base


from app.models.resource import ResourceModel as Resource


from app.models.material import MaterialInventoryModel as Inventory


from app.models.workforce import AttendanceModel as Attendance



class Procurement(Base):
    __tablename__ = "procurements"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    supplier: Mapped[str] = mapped_column(String(150), nullable=True)
    material_name: Mapped[str] = mapped_column(String(150), nullable=True)
    expected_delivery_date: Mapped[str] = mapped_column(String(30), nullable=True)
    po_number: Mapped[str] = mapped_column(String(50), nullable=True)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    project_id: Mapped[str] = mapped_column(String(36), nullable=True)
    material_id: Mapped[str] = mapped_column(String(36), nullable=True)
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="Pending Approval") # Pending Approval, Approved, Rejected, PO Issued, Received
    requested_by: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


from app.models.notification import Notification


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_name: Mapped[str] = mapped_column(String(150), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


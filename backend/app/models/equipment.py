import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base

class EquipmentModel(Base):
    __tablename__ = "equipment_status"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    serial_no: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(150), nullable=False)
    operator: Mapped[str] = mapped_column(String(100), default="Unassigned")
    status: Mapped[str] = mapped_column(String(50), default="Operational")
    last_inspection: Mapped[str] = mapped_column(String(20), nullable=False)
    next_service: Mapped[str] = mapped_column(String(20), nullable=False)
    fuel_level: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

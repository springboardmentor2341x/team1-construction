import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base


class ShiftModel(Base):
    __tablename__ = "shifts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    worker_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    shift_type: Mapped[str] = mapped_column(String(20), default="Morning")
    shift_start: Mapped[str] = mapped_column(String(10), default="06:00")
    shift_end: Mapped[str] = mapped_column(String(10), default="14:00")
    location: Mapped[str] = mapped_column(String(150), default="")
    project: Mapped[str] = mapped_column(String(150), default="")
    status: Mapped[str] = mapped_column(String(20), default="Scheduled")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


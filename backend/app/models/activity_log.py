import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base

class ActivityLogModel(Base):
    __tablename__ = "daily_activity_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    location: Mapped[str] = mapped_column(String(150), nullable=False)
    activity: Mapped[str] = mapped_column(Text, nullable=False)
    progress_notes: Mapped[str] = mapped_column(Text, nullable=True)
    weather_condition: Mapped[str] = mapped_column(String(50), default="Sunny")
    workers_present: Mapped[int] = mapped_column(Integer, default=0)
    issues: Mapped[str] = mapped_column(Text, nullable=True)
    submitted_by: Mapped[str] = mapped_column(String(100), nullable=False, default="David Miller")
    status: Mapped[str] = mapped_column(String(30), default="Approved")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

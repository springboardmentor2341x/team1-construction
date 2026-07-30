from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
import enum
from database import Base


class WorkerCategory(str, enum.Enum):
    engineers = "Engineers"
    supervisors = "Supervisors"
    contractors = "Contractors"
    skilled_workers = "Skilled Workers"
    unskilled_workers = "Unskilled Workers"
    consultants = "Consultants"


class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(Enum(WorkerCategory), nullable=False)
    contact_number = Column(String)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    project = relationship("Project")
    attendance = relationship("Attendance", back_populates="worker", cascade="all, delete-orphan")


class AttendanceStatus(str, enum.Enum):
    present = "Present"
    absent = "Absent"
    on_leave = "On Leave"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.present)
    
    worker = relationship("Worker", back_populates="attendance")

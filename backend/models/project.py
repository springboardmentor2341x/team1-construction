from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from database import Base


class ProjectCategory(str, enum.Enum):
    residential = "Residential"
    commercial = "Commercial"
    industrial = "Industrial"
    infrastructure = "Infrastructure"
    government = "Government Projects"


class ProjectStatus(str, enum.Enum):
    planning = "Planning"
    in_progress = "In Progress"
    on_hold = "On Hold"
    completed = "Completed"
    closed = "Closed"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.planning)
    category = Column(Enum(ProjectCategory), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"))
    
    manager = relationship("User")
    milestones = relationship("ProjectMilestone", back_populates="project", cascade="all, delete-orphan")


class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    target_date = Column(Date, nullable=False)
    completion_status = Column(String, default="Pending")

    project = relationship("Project", back_populates="milestones")

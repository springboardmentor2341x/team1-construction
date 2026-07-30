from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from database import Base


class ResourceCategory(str, enum.Enum):
    excavators = "Excavators"
    concrete_mixers = "Concrete Mixers"
    cranes = "Cranes"
    dump_trucks = "Dump Trucks"
    generators = "Generators"
    safety_equipment = "Safety Equipment"


class ResourceStatus(str, enum.Enum):
    available = "Available"
    in_use = "In Use"
    under_maintenance = "Under Maintenance"


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(Enum(ResourceCategory), nullable=False)
    status = Column(Enum(ResourceStatus), default=ResourceStatus.available)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    project = relationship("Project")

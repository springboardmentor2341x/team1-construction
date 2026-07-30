from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
import enum
from database import Base


class MaterialCategory(str, enum.Enum):
    cement = "Cement"
    steel = "Steel"
    bricks = "Bricks"
    sand = "Sand"
    concrete = "Concrete"
    electrical = "Electrical Materials"
    plumbing = "Plumbing Materials"


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    category = Column(Enum(MaterialCategory), nullable=False)
    quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    project = relationship("Project")

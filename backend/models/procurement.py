from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Float, Date
from sqlalchemy.orm import relationship
import enum
from database import Base


class ProcurementCategory(str, enum.Enum):
    raw_materials = "Raw Materials"
    equipment = "Equipment"
    machinery = "Machinery"
    safety_equipment = "Safety Equipment"
    office_supplies = "Office Supplies"


class ProcurementStatus(str, enum.Enum):
    requested = "Requested"
    approved = "Approved"
    ordered = "Ordered"
    delivered = "Delivered"


class Procurement(Base):
    __tablename__ = "procurements"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    category = Column(Enum(ProcurementCategory), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    cost = Column(Float)
    status = Column(Enum(ProcurementStatus), default=ProcurementStatus.requested)
    order_date = Column(Date)
    delivery_date = Column(Date)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    project = relationship("Project")

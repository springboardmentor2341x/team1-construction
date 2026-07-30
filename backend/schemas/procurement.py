from pydantic import BaseModel
from typing import Optional
from datetime import date
from models.procurement import ProcurementCategory, ProcurementStatus

class ProcurementBase(BaseModel):
    item_name: str
    category: ProcurementCategory
    quantity: float
    unit: str
    cost: Optional[float] = None
    status: ProcurementStatus = ProcurementStatus.requested
    order_date: Optional[date] = None
    delivery_date: Optional[date] = None
    project_id: Optional[int] = None

class ProcurementCreate(ProcurementBase):
    pass

class ProcurementResponse(ProcurementBase):
    id: int

    class Config:
        from_attributes = True

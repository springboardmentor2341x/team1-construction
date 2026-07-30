from pydantic import BaseModel
from typing import Optional
from models.inventory import MaterialCategory

class InventoryBase(BaseModel):
    item_name: str
    category: MaterialCategory
    quantity: float
    unit: str
    project_id: Optional[int] = None

class InventoryCreate(InventoryBase):
    pass

class InventoryResponse(InventoryBase):
    id: int

    class Config:
        from_attributes = True

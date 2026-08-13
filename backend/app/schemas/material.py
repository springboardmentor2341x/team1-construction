from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime


# --- Material Category Schemas ---
class MaterialCategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None

class MaterialCategoryCreate(MaterialCategoryBase):
    pass

class MaterialCategoryRead(MaterialCategoryBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Material Schemas ---
class MaterialBase(BaseModel):
    materialCode: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=2, max_length=150)
    categoryId: Optional[str] = None
    categoryName: str = Field(..., min_length=2, max_length=100)
    unitOfMeasure: str = Field(..., min_length=1, max_length=50)
    unitPrice: Optional[float] = Field(default=0.0, ge=0.0)
    minStockLevel: float = Field(default=100.0, ge=0.0)
    description: Optional[str] = None
    status: Optional[str] = "Active"

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    categoryId: Optional[str] = None
    categoryName: Optional[str] = None
    unitOfMeasure: Optional[str] = None
    unitPrice: Optional[float] = Field(default=None, ge=0.0)
    minStockLevel: Optional[float] = Field(default=None, ge=0.0)
    description: Optional[str] = None
    status: Optional[str] = None

class MaterialRead(MaterialBase):
    id: str
    createdBy: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
    availableStock: float = 0.0
    allocatedStock: float = 0.0
    consumedStock: float = 0.0
    totalStock: float = 0.0
    stockStatus: str = "In Stock"

    class Config:
        from_attributes = True


# --- Inventory & Stock Schemas ---
class StockReceiveRequest(BaseModel):
    materialId: str
    quantity: float = Field(..., gt=0.0)
    warehouseLocation: Optional[str] = "Main Warehouse"
    remarks: Optional[str] = None

class DirectStockUpdateRequest(BaseModel):
    availableStock: float = Field(..., ge=0.0)
    totalStock: Optional[float] = None
    minStockLevel: Optional[float] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class InventoryRead(BaseModel):
    id: str
    materialId: str
    materialCode: str
    materialName: str
    categoryName: str
    unitOfMeasure: str
    warehouseLocation: str
    totalStock: float
    allocatedStock: float
    consumedStock: float
    availableStock: float
    minStockLevel: float
    status: str
    lastUpdated: datetime

    class Config:
        from_attributes = True


# --- Material Request Schemas ---
class MaterialRequestCreate(BaseModel):
    projectId: str
    materialId: str
    requiredQuantity: float = Field(..., gt=0.0)
    requiredDate: str # YYYY-MM-DD
    workActivity: str
    remarks: Optional[str] = None

class MaterialRequestReview(BaseModel):
    status: str # Approved, Rejected
    reviewRemarks: Optional[str] = None

class MaterialRequestRead(BaseModel):
    id: str
    requestCode: str
    projectId: str
    projectName: Optional[str] = None
    materialId: str
    materialName: str
    categoryName: str
    unit: str
    requiredQuantity: float
    availableStockNow: float = 0.0
    shortageQuantity: float = 0.0
    requiredDate: str
    workActivity: str
    remarks: Optional[str] = None
    requestedById: Optional[str] = None
    requestedByName: str
    requestDate: str
    status: str
    reviewRemarks: Optional[str] = None
    reviewedById: Optional[str] = None
    reviewedAt: Optional[datetime] = None
    createdAt: datetime

    class Config:
        from_attributes = True


# --- Material Allocation Schemas ---
class MaterialAllocationCreate(BaseModel):
    projectId: str
    materialId: str
    quantity: float = Field(..., gt=0.0)
    allocationDate: str # YYYY-MM-DD
    workActivity: str
    responsibleUserId: Optional[str] = None
    responsibleUserName: Optional[str] = None
    requestId: Optional[str] = None
    remarks: Optional[str] = None

class MaterialConsumptionCreate(BaseModel):
    consumedQuantity: float = Field(..., gt=0.0)
    remarks: Optional[str] = None

class MaterialReturnCreate(BaseModel):
    returnQuantity: float = Field(..., gt=0.0)
    remarks: Optional[str] = None

class MaterialAllocationRead(BaseModel):
    id: str
    projectId: str
    projectName: Optional[str] = None
    materialId: str
    materialName: str
    categoryName: str
    unit: str
    quantity: float
    consumedQuantity: float
    remainingQuantity: float
    allocationDate: str
    workActivity: str
    responsibleUserId: Optional[str] = None
    responsibleUserName: str
    requestId: Optional[str] = None
    remarks: Optional[str] = None
    status: str
    createdAt: datetime

    class Config:
        from_attributes = True


# --- Stock Movement Schemas ---
class StockMovementRead(BaseModel):
    id: str
    materialId: str
    materialName: str
    categoryName: str
    unit: str
    projectId: Optional[str] = None
    projectName: Optional[str] = None
    movementType: str # Received, Allocated, Consumed, Returned, Adjustment
    quantity: float
    movementDate: str
    userId: Optional[str] = None
    userName: str
    referenceId: Optional[str] = None
    remarks: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True


# --- Dashboard & Project Material Tracking Schemas ---
class ProjectMaterialUsageRead(BaseModel):
    projectId: str
    projectName: str
    materialId: str
    materialName: str
    unit: str
    requestedQuantity: float
    allocatedQuantity: float
    consumedQuantity: float
    remainingQuantity: float
    lastAllocationDate: Optional[str] = None
    workActivity: Optional[str] = None

class InventoryDashboardRead(BaseModel):
    totalMaterials: int
    totalAvailableStock: float
    totalAllocatedStock: float
    totalConsumedStock: float
    lowStockCount: int
    pendingRequestsCount: int
    recentMovementsCount: int

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any

RESOURCE_CATEGORIES = [
    "Excavators",
    "Concrete Mixers",
    "Cranes",
    "Dump Trucks",
    "Generators",
    "Safety Equipment",
]

RESOURCE_STATUSES = [
    "Available",
    "Allocated",
    "Under Maintenance",
    "Out of Service",
]

MAINTENANCE_STATUSES = [
    "Scheduled",
    "In Progress",
    "Completed",
    "Cancelled",
]

MAINTENANCE_TYPES = [
    "Preventative",
    "Corrective",
    "Emergency",
    "Routine Inspection",
]


class ResourceCreate(BaseModel):
    equipmentCode: str = Field(..., description="Unique equipment ID code, e.g., EXC-001")
    name: str = Field(..., description="Resource / Equipment Name")
    category: str = Field(..., description="Resource Category")
    description: Optional[str] = None
    status: str = Field(default="Available")
    location: str = Field(default="Equipment Yard")
    responsiblePersonId: Optional[str] = None
    responsiblePersonName: Optional[str] = None
    projectId: Optional[str] = None
    serialNumber: Optional[str] = None
    purchaseDate: Optional[str] = None
    purchaseCost: Optional[float] = Field(default=0.0, ge=0.0)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in RESOURCE_CATEGORIES:
            raise ValueError(f"Category must be one of {RESOURCE_CATEGORIES}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in RESOURCE_STATUSES:
            raise ValueError(f"Status must be one of {RESOURCE_STATUSES}")
        return v


class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    responsiblePersonId: Optional[str] = None
    responsiblePersonName: Optional[str] = None
    projectId: Optional[str] = None
    serialNumber: Optional[str] = None
    purchaseDate: Optional[str] = None
    purchaseCost: Optional[float] = Field(default=None, ge=0.0)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in RESOURCE_CATEGORIES:
            raise ValueError(f"Category must be one of {RESOURCE_CATEGORIES}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in RESOURCE_STATUSES:
            raise ValueError(f"Status must be one of {RESOURCE_STATUSES}")
        return v


class ResourceStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in RESOURCE_STATUSES:
            raise ValueError(f"Status must be one of {RESOURCE_STATUSES}")
        return v


class ResourceRead(BaseModel):
    id: str
    equipmentCode: str
    name: str
    category: str
    description: Optional[str] = None
    status: str
    location: str
    responsiblePersonId: Optional[str] = None
    responsiblePersonName: Optional[str] = None
    projectId: Optional[str] = None
    projectName: Optional[str] = None
    serialNumber: Optional[str] = None
    purchaseDate: Optional[str] = None
    purchaseCost: float = 0.0
    utilizationPercentage: float = 0.0
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True


class ResourceAllocationCreate(BaseModel):
    resourceId: str
    projectId: str
    allocationDate: str  # YYYY-MM-DD
    expectedReturnDate: str  # YYYY-MM-DD
    responsiblePersonId: Optional[str] = None
    responsiblePersonName: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class ResourceAllocationReturn(BaseModel):
    actualReturnDate: Optional[str] = None
    notes: Optional[str] = None


class ResourceAllocationRead(BaseModel):
    id: str
    resourceId: str
    resourceCode: Optional[str] = None
    resourceName: Optional[str] = None
    category: Optional[str] = None
    projectId: str
    projectName: Optional[str] = None
    allocationDate: str
    expectedReturnDate: str
    actualReturnDate: Optional[str] = None
    responsiblePersonId: Optional[str] = None
    responsiblePersonName: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: str
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


class ResourceUtilizationCreate(BaseModel):
    resourceId: str
    projectId: Optional[str] = None
    date: str  # YYYY-MM-DD
    operatingHours: float = Field(..., ge=0.0, le=24.0)
    idleHours: float = Field(default=0.0, ge=0.0, le=24.0)
    totalAvailableHours: float = Field(default=10.0, ge=1.0, le=24.0)
    notes: Optional[str] = None


class ResourceUtilizationRead(BaseModel):
    id: str
    resourceId: str
    resourceCode: Optional[str] = None
    resourceName: Optional[str] = None
    category: Optional[str] = None
    projectId: Optional[str] = None
    projectName: Optional[str] = None
    date: str
    operatingHours: float
    idleHours: float
    totalAvailableHours: float
    utilizationPercentage: float
    notes: Optional[str] = None
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


class ResourceMaintenanceCreate(BaseModel):
    resourceId: str
    maintenanceDate: str  # YYYY-MM-DD
    nextMaintenanceDate: Optional[str] = None  # YYYY-MM-DD
    maintenanceType: str = Field(default="Routine Inspection")
    serviceEngineer: Optional[str] = None
    maintenanceCost: float = Field(default=0.0, ge=0.0)
    status: str = Field(default="Scheduled")
    description: Optional[str] = None

    @field_validator("maintenanceType")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in MAINTENANCE_TYPES:
            raise ValueError(f"maintenanceType must be one of {MAINTENANCE_TYPES}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in MAINTENANCE_STATUSES:
            raise ValueError(f"status must be one of {MAINTENANCE_STATUSES}")
        return v


class ResourceMaintenanceUpdate(BaseModel):
    maintenanceDate: Optional[str] = None
    nextMaintenanceDate: Optional[str] = None
    maintenanceType: Optional[str] = None
    serviceEngineer: Optional[str] = None
    maintenanceCost: Optional[float] = Field(default=None, ge=0.0)
    status: Optional[str] = None
    description: Optional[str] = None

    @field_validator("maintenanceType")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in MAINTENANCE_TYPES:
            raise ValueError(f"maintenanceType must be one of {MAINTENANCE_TYPES}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in MAINTENANCE_STATUSES:
            raise ValueError(f"status must be one of {MAINTENANCE_STATUSES}")
        return v


class ResourceMaintenanceRead(BaseModel):
    id: str
    resourceId: str
    resourceCode: Optional[str] = None
    resourceName: Optional[str] = None
    category: Optional[str] = None
    maintenanceDate: str
    nextMaintenanceDate: Optional[str] = None
    maintenanceType: str
    serviceEngineer: Optional[str] = None
    maintenanceCost: float
    status: str
    description: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True


class ResourceDashboardRead(BaseModel):
    totalResources: int
    availableCount: int
    allocatedCount: int
    underMaintenanceCount: int
    outOfServiceCount: int
    upcomingMaintenanceCount: int
    avgUtilizationPercentage: float
    categoryCounts: Dict[str, int]
    statusCounts: Dict[str, int]
    recentAllocations: List[ResourceAllocationRead] = []
    recentMaintenances: List[ResourceMaintenanceRead] = []

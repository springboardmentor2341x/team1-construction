from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class CategoryAllocationInput(BaseModel):
    category: str = Field(..., description="Category name: Labor, Material, Equipment, Transportation, Maintenance, Administrative")
    allocated_amount: float = Field(..., ge=0, description="Allocated budget amount for this category")
    notes: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        valid = ["Labor", "Material", "Equipment", "Transportation", "Maintenance", "Administrative"]
        for cat in valid:
            if cat.lower() == v.strip().lower():
                return cat
        raise ValueError(f"Invalid category '{v}'. Allowed categories: {', '.join(valid)}")


class CategoryAllocationResponse(BaseModel):
    id: str
    budget_id: str
    category: str
    allocated_amount: float
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectBudgetCreate(BaseModel):
    overall_budget: float = Field(..., ge=0, description="Total planned project budget")
    currency: Optional[str] = "INR"
    notes: Optional[str] = None
    category_allocations: List[CategoryAllocationInput] = Field(default_factory=list, description="Allocations across categories")


class ProjectBudgetUpdate(BaseModel):
    overall_budget: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = None
    notes: Optional[str] = None
    category_allocations: Optional[List[CategoryAllocationInput]] = None


class ProjectBudgetResponse(BaseModel):
    id: str
    project_id: str
    overall_budget: float
    currency: str
    notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    allocations: List[CategoryAllocationResponse] = []

    class Config:
        from_attributes = True


class CostEstimateCreate(BaseModel):
    category: str = Field(..., description="Cost category")
    amount: float = Field(..., gt=0, description="Estimated cost amount")
    description: str = Field(..., min_length=1, description="Description of estimated cost")
    task_reference: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        valid = ["Labor", "Material", "Equipment", "Transportation", "Maintenance", "Administrative"]
        for cat in valid:
            if cat.lower() == v.strip().lower():
                return cat
        raise ValueError(f"Invalid category '{v}'. Allowed categories: {', '.join(valid)}")


class CostEstimateUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    task_reference: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        valid = ["Labor", "Material", "Equipment", "Transportation", "Maintenance", "Administrative"]
        for cat in valid:
            if cat.lower() == v.strip().lower():
                return cat
        raise ValueError(f"Invalid category '{v}'. Allowed categories: {', '.join(valid)}")


class CostEstimateResponse(BaseModel):
    id: str
    estimate_code: str
    project_id: str
    category: str
    amount: float
    description: str
    task_reference: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ActualExpenseCreate(BaseModel):
    category: str = Field(..., description="Cost category")
    amount: float = Field(..., gt=0, description="Actual expense amount")
    description: str = Field(..., min_length=1, description="Expense description")
    expense_date: str = Field(..., description="Expense date YYYY-MM-DD")
    source_reference: Optional[str] = None
    worker_id: Optional[str] = None
    material_id: Optional[str] = None
    equipment_id: Optional[str] = None
    purchase_order_id: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        valid = ["Labor", "Material", "Equipment", "Transportation", "Maintenance", "Administrative"]
        for cat in valid:
            if cat.lower() == v.strip().lower():
                return cat
        raise ValueError(f"Invalid category '{v}'. Allowed categories: {', '.join(valid)}")


class ActualExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    expense_date: Optional[str] = None
    source_reference: Optional[str] = None
    worker_id: Optional[str] = None
    material_id: Optional[str] = None
    equipment_id: Optional[str] = None
    purchase_order_id: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        valid = ["Labor", "Material", "Equipment", "Transportation", "Maintenance", "Administrative"]
        for cat in valid:
            if cat.lower() == v.strip().lower():
                return cat
        raise ValueError(f"Invalid category '{v}'. Allowed categories: {', '.join(valid)}")


class ActualExpenseResponse(BaseModel):
    id: str
    expense_code: str
    project_id: str
    category: str
    amount: float
    description: str
    expense_date: str
    source_reference: Optional[str] = None
    worker_id: Optional[str] = None
    worker_name: Optional[str] = None
    material_id: Optional[str] = None
    material_name: Optional[str] = None
    equipment_id: Optional[str] = None
    equipment_name: Optional[str] = None
    purchase_order_id: Optional[str] = None
    po_number: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CategoryComparison(BaseModel):
    category: str
    planned_amount: float
    estimated_amount: float
    actual_amount: float
    remaining_amount: float
    utilization_percentage: float


class ProjectFinancialSummaryResponse(BaseModel):
    project_id: str
    project_code: str
    project_name: str
    planned_budget: float
    total_estimated_cost: float
    total_actual_cost: float
    remaining_budget: float
    budget_utilization_percentage: float
    estimated_variance: float
    actual_variance: float
    budget_status: str
    category_summaries: List[CategoryComparison] = []

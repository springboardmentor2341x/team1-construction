from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from decimal import Decimal


# ========================================
# Cost Category Schemas
# ========================================
class CostCategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


# ========================================
# Budget Schemas
# ========================================
class BudgetCreate(BaseModel):
    projectId: str
    totalBudget: Decimal = Field(..., ge=0, description="Total budget amount (must be non-negative)")
    currency: str = "USD"
    status: str = "Draft"
    notes: Optional[str] = None


class BudgetUpdate(BaseModel):
    totalBudget: Optional[Decimal] = Field(None, ge=0, description="Total budget amount (must be non-negative)")
    currency: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class BudgetAllocationCreate(BaseModel):
    costCategoryId: str
    allocatedAmount: Decimal = Field(..., ge=0, description="Allocated amount (must be non-negative)")
    notes: Optional[str] = None


class BudgetAllocationUpdate(BaseModel):
    allocatedAmount: Optional[Decimal] = Field(None, ge=0, description="Allocated amount (must be non-negative)")
    notes: Optional[str] = None


class BudgetAllocationResponse(BaseModel):
    id: str
    projectBudgetId: str
    costCategory: CostCategoryResponse
    allocatedAmount: Decimal
    notes: Optional[str] = None
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True


class BudgetResponse(BaseModel):
    id: str
    projectId: str
    totalBudget: Decimal
    currency: str
    status: str
    notes: Optional[str] = None
    createdBy: Optional[str] = None
    createdAt: str
    updatedAt: str
    allocations: List[BudgetAllocationResponse] = []

    class Config:
        from_attributes = True


# ========================================
# Cost Estimation Schemas
# ========================================
class CostEstimateCreate(BaseModel):
    projectId: str
    costCategoryId: str
    estimateTitle: str
    estimatedAmount: Decimal = Field(..., ge=0, description="Estimated amount (must be non-negative)")
    estimateDate: str
    remarks: Optional[str] = None


class CostEstimateUpdate(BaseModel):
    estimateTitle: Optional[str] = None
    estimatedAmount: Optional[Decimal] = Field(None, ge=0, description="Estimated amount (must be non-negative)")
    estimateDate: Optional[str] = None
    remarks: Optional[str] = None


class CostEstimateResponse(BaseModel):
    id: str
    projectId: str
    costCategory: CostCategoryResponse
    estimateTitle: str
    estimatedAmount: Decimal
    estimateDate: str
    remarks: Optional[str] = None
    createdBy: Optional[str] = None
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True


# ========================================
# Expense Schemas
# ========================================
class ExpenseCreate(BaseModel):
    projectId: str
    costCategoryId: str
    expenseTitle: str
    amount: Decimal = Field(..., gt=0, description="Expense amount (must be positive)")
    expenseDate: str
    vendorOrPayee: Optional[str] = None
    referenceNo: Optional[str] = None
    notes: Optional[str] = None
    status: str = "Recorded"
    sourceType: str = "Manual"
    sourceId: Optional[str] = None


class ExpenseUpdate(BaseModel):
    expenseTitle: Optional[str] = None
    amount: Optional[Decimal] = Field(None, gt=0, description="Expense amount (must be positive)")
    expenseDate: Optional[str] = None
    vendorOrPayee: Optional[str] = None
    referenceNo: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: str
    projectId: str
    costCategory: CostCategoryResponse
    expenseTitle: str
    amount: Decimal
    expenseDate: str
    vendorOrPayee: Optional[str] = None
    referenceNo: Optional[str] = None
    notes: Optional[str] = None
    status: str
    sourceType: str
    sourceId: Optional[str] = None
    createdBy: Optional[str] = None
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True


# ========================================
# Financial Summary Schemas
# ========================================
class CategoryFinancialSummary(BaseModel):
    categoryId: str
    categoryName: str
    budgetAllocated: Decimal
    estimatedCost: Decimal
    actualExpense: Decimal
    remainingBudget: Decimal
    utilizationPercentage: Optional[float] = None


class FinancialSummaryResponse(BaseModel):
    projectId: str
    totalBudget: Decimal
    totalEstimatedCost: Decimal
    actualAmountSpent: Decimal
    remainingBudget: Decimal
    budgetUtilizationPercentage: Optional[float] = None
    categoryBreakdown: List[CategoryFinancialSummary] = []

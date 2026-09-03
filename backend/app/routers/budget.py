from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.services.budget_service import BudgetService
from app.schemas.budget import (
    BudgetCreate, BudgetUpdate, BudgetAllocationCreate, BudgetAllocationUpdate,
    CostEstimateCreate, CostEstimateUpdate, ExpenseCreate, ExpenseUpdate,
    BudgetResponse, BudgetAllocationResponse, CostEstimateResponse, 
    ExpenseResponse, FinancialSummaryResponse, CostCategoryResponse
)

router = APIRouter(prefix="/budget", tags=["Budget & Cost Management"])

# Define role groups for easier reference
ADMIN_PM = ["Administrator", "Project Manager"]
ALL_ROLES = ["Administrator", "Project Manager", "Site Engineer", "Contractor", "Worker", "Client"]


# ========================================
# Cost Categories Endpoints
# ========================================
@router.get("/categories", response_model=List[CostCategoryResponse])
def get_cost_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all active cost categories"""
    service = BudgetService(db)
    return service.get_all_categories()


# ========================================
# Budget Endpoints
# ========================================
@router.post("/budgets", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    req: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Create a new budget for a project"""
    service = BudgetService(db)
    return service.create_budget(req, current_user.id)


@router.get("/budgets/{project_id}", response_model=BudgetResponse)
def get_project_budget(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get budget details for a specific project"""
    service = BudgetService(db)
    return service.get_project_budget(project_id)


@router.put("/budgets/{project_id}", response_model=BudgetResponse)
def update_budget(
    project_id: str,
    updates: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Update budget details for a project"""
    service = BudgetService(db)
    return service.update_budget(project_id, updates, current_user.id)


# ========================================
# Budget Allocation Endpoints
# ========================================
@router.post("/budgets/{project_id}/allocations", response_model=BudgetAllocationResponse, status_code=status.HTTP_201_CREATED)
def create_budget_allocation(
    project_id: str,
    req: BudgetAllocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Create a category-wise budget allocation"""
    service = BudgetService(db)
    return service.create_allocation(project_id, req, current_user.id)


@router.put("/allocations/{allocation_id}", response_model=BudgetAllocationResponse)
def update_budget_allocation(
    allocation_id: str,
    updates: BudgetAllocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Update a budget allocation"""
    service = BudgetService(db)
    return service.update_allocation(allocation_id, updates)


@router.delete("/allocations/{allocation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget_allocation(
    allocation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Delete a budget allocation"""
    service = BudgetService(db)
    service.delete_allocation(allocation_id)
    return None


# ========================================
# Cost Estimate Endpoints
# ========================================
@router.post("/estimates", response_model=CostEstimateResponse, status_code=status.HTTP_201_CREATED)
def create_cost_estimate(
    req: CostEstimateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Create a new cost estimate"""
    service = BudgetService(db)
    return service.create_estimate(req, current_user.id)


@router.get("/estimates", response_model=List[CostEstimateResponse])
def get_project_estimates(
    projectId: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all cost estimates for a project"""
    service = BudgetService(db)
    return service.get_project_estimates(projectId)


@router.get("/estimates/{estimate_id}", response_model=CostEstimateResponse)
def get_cost_estimate(
    estimate_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific cost estimate by ID"""
    service = BudgetService(db)
    return service.get_estimate_by_id(estimate_id)


@router.put("/estimates/{estimate_id}", response_model=CostEstimateResponse)
def update_cost_estimate(
    estimate_id: str,
    updates: CostEstimateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Update a cost estimate"""
    service = BudgetService(db)
    return service.update_estimate(estimate_id, updates)


@router.delete("/estimates/{estimate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cost_estimate(
    estimate_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Delete a cost estimate"""
    service = BudgetService(db)
    service.delete_estimate(estimate_id)
    return None


# ========================================
# Expense Endpoints
# ========================================
@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    req: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Create a new expense record"""
    service = BudgetService(db)
    return service.create_expense(req, current_user.id)


@router.get("/expenses", response_model=List[ExpenseResponse])
def get_project_expenses(
    projectId: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all expenses for a project"""
    service = BudgetService(db)
    return service.get_project_expenses(projectId)


@router.get("/expenses/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific expense by ID"""
    service = BudgetService(db)
    return service.get_expense_by_id(expense_id)


@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: str,
    updates: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Update an expense record"""
    service = BudgetService(db)
    return service.update_expense(expense_id, updates)


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(ADMIN_PM))
):
    """Delete an expense record"""
    service = BudgetService(db)
    service.delete_expense(expense_id)
    return None


# ========================================
# Financial Summary Endpoints
# ========================================
@router.get("/summary/{project_id}", response_model=FinancialSummaryResponse)
def get_financial_summary(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive financial summary for a project"""
    service = BudgetService(db)
    return service.get_financial_summary(project_id)

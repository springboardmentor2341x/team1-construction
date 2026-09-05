from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.budget import (
    ProjectBudgetCreate,
    ProjectBudgetResponse,
    CostEstimateCreate,
    CostEstimateUpdate,
    CostEstimateResponse,
    ActualExpenseCreate,
    ActualExpenseUpdate,
    ActualExpenseResponse,
    ProjectFinancialSummaryResponse
)
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budget", tags=["Budget & Cost Management"])


@router.get("/projects/{project_id}", response_model=ProjectBudgetResponse)
def get_project_budget(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch project budget and category allocations."""
    try:
        budget = BudgetService.get_or_create_project_budget(db, current_user, project_id)
        return budget
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.post("/projects/{project_id}", response_model=ProjectBudgetResponse)
def create_or_update_project_budget(
    project_id: str,
    data: ProjectBudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update overall project budget and category allocations."""
    try:
        budget = BudgetService.create_or_update_project_budget(db, current_user, project_id, data)
        return budget
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.get("/projects/{project_id}/summary", response_model=ProjectFinancialSummaryResponse)
def get_project_financial_summary(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get live calculated financial metrics and category breakdown for a project."""
    try:
        summary = BudgetService.get_project_financial_summary(db, current_user, project_id)
        return summary
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


# =============================================================================
# COST ESTIMATES ENDPOINTS
# =============================================================================

@router.get("/projects/{project_id}/estimates", response_model=List[CostEstimateResponse])
def list_cost_estimates(
    project_id: str,
    category: Optional[str] = Query(None, description="Optional category filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List cost estimates for a project."""
    try:
        estimates = BudgetService.get_cost_estimates(db, current_user, project_id, category)
        return estimates
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.post("/projects/{project_id}/estimates", response_model=CostEstimateResponse, status_code=status.HTTP_201_CREATED)
def create_cost_estimate(
    project_id: str,
    data: CostEstimateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new cost estimate."""
    try:
        estimate = BudgetService.create_cost_estimate(db, current_user, project_id, data)
        return estimate
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.put("/estimates/{estimate_id}", response_model=CostEstimateResponse)
def update_cost_estimate(
    estimate_id: str,
    data: CostEstimateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing cost estimate."""
    try:
        estimate = BudgetService.update_cost_estimate(db, current_user, estimate_id, data)
        return estimate
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.delete("/estimates/{estimate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cost_estimate(
    estimate_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a cost estimate."""
    try:
        BudgetService.delete_cost_estimate(db, current_user, estimate_id)
        return None
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


# =============================================================================
# ACTUAL EXPENSES ENDPOINTS
# =============================================================================

@router.get("/projects/{project_id}/expenses", response_model=List[ActualExpenseResponse])
def list_actual_expenses(
    project_id: str,
    category: Optional[str] = Query(None, description="Optional category filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List actual expenses for a project."""
    try:
        expenses = BudgetService.get_actual_expenses(db, current_user, project_id, category)
        return expenses
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.post("/projects/{project_id}/expenses", response_model=ActualExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_actual_expense(
    project_id: str,
    data: ActualExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new actual expense."""
    try:
        expense = BudgetService.create_actual_expense(db, current_user, project_id, data)
        # Convert model to response format
        return {
            "id": expense.id,
            "expense_code": expense.expense_code,
            "project_id": expense.project_id,
            "category": expense.category,
            "amount": float(expense.amount),
            "description": expense.description,
            "expense_date": expense.expense_date,
            "source_reference": expense.source_reference,
            "worker_id": expense.worker_id,
            "worker_name": expense.worker.worker_name if expense.worker else None,
            "material_id": expense.material_id,
            "material_name": expense.material.name if expense.material else None,
            "equipment_id": expense.equipment_id,
            "equipment_name": expense.equipment.name if expense.equipment else None,
            "purchase_order_id": expense.purchase_order_id,
            "po_number": expense.purchase_order.purchase_order_id if expense.purchase_order else None,
            "created_by": expense.created_by,
            "created_at": expense.created_at,
            "updated_at": expense.updated_at
        }
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.put("/expenses/{expense_id}", response_model=ActualExpenseResponse)
def update_actual_expense(
    expense_id: str,
    data: ActualExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing actual expense."""
    try:
        expense = BudgetService.update_actual_expense(db, current_user, expense_id, data)
        return {
            "id": expense.id,
            "expense_code": expense.expense_code,
            "project_id": expense.project_id,
            "category": expense.category,
            "amount": float(expense.amount),
            "description": expense.description,
            "expense_date": expense.expense_date,
            "source_reference": expense.source_reference,
            "worker_id": expense.worker_id,
            "worker_name": expense.worker.worker_name if expense.worker else None,
            "material_id": expense.material_id,
            "material_name": expense.material.name if expense.material else None,
            "equipment_id": expense.equipment_id,
            "equipment_name": expense.equipment.name if expense.equipment else None,
            "purchase_order_id": expense.purchase_order_id,
            "po_number": expense.purchase_order.purchase_order_id if expense.purchase_order else None,
            "created_by": expense.created_by,
            "created_at": expense.created_at,
            "updated_at": expense.updated_at
        }
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_actual_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an actual expense."""
    try:
        BudgetService.delete_actual_expense(db, current_user, expense_id)
        return None
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))

from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from decimal import Decimal

from app.models.budget import (
    CostCategory, ProjectBudget, BudgetAllocation, 
    CostEstimate, ProjectExpense
)
from app.models.project import Project
from app.models.user import User
from app.schemas.budget import (
    BudgetCreate, BudgetUpdate, BudgetAllocationCreate, BudgetAllocationUpdate,
    CostEstimateCreate, CostEstimateUpdate, ExpenseCreate, ExpenseUpdate,
    BudgetResponse, BudgetAllocationResponse, CostEstimateResponse, 
    ExpenseResponse, FinancialSummaryResponse, CategoryFinancialSummary,
    CostCategoryResponse
)


class BudgetService:
    def __init__(self, db: Session):
        self.db = db

    # ========================================
    # Cost Category Methods
    # ========================================
    def get_all_categories(self) -> List[CostCategoryResponse]:
        categories = self.db.query(CostCategory).filter(
            CostCategory.is_active == True
        ).all()
        return [CostCategoryResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            is_active=cat.is_active
        ) for cat in categories]

    def get_category_by_id(self, category_id: str) -> CostCategory:
        category = self.db.query(CostCategory).filter(
            CostCategory.id == category_id
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cost category not found"
            )
        return category

    # ========================================
    # Budget Methods
    # ========================================
    def create_budget(self, req: BudgetCreate, current_user_id: str) -> BudgetResponse:
        # Verify project exists
        project = self.db.query(Project).filter(Project.id == req.projectId).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Check if budget already exists for this project
        existing_budget = self.db.query(ProjectBudget).filter(
            ProjectBudget.project_id == req.projectId
        ).first()
        if existing_budget:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Budget already exists for this project"
            )

        budget = ProjectBudget(
            project_id=req.projectId,
            total_budget=req.totalBudget,
            currency=req.currency,
            status=req.status,
            notes=req.notes,
            created_by=current_user_id
        )
        self.db.add(budget)
        self.db.commit()
        self.db.refresh(budget)
        return self._to_budget_response(budget)

    def get_project_budget(self, project_id: str) -> BudgetResponse:
        budget = self.db.query(ProjectBudget).filter(
            ProjectBudget.project_id == project_id
        ).first()
        if not budget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget not found for this project"
            )
        return self._to_budget_response(budget)

    def update_budget(self, project_id: str, updates: BudgetUpdate, current_user_id: str) -> BudgetResponse:
        budget = self.db.query(ProjectBudget).filter(
            ProjectBudget.project_id == project_id
        ).first()
        if not budget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget not found for this project"
            )

        if updates.totalBudget is not None:
            budget.total_budget = updates.totalBudget
        if updates.currency is not None:
            budget.currency = updates.currency
        if updates.status is not None:
            budget.status = updates.status
        if updates.notes is not None:
            budget.notes = updates.notes

        self.db.commit()
        self.db.refresh(budget)
        return self._to_budget_response(budget)

    # ========================================
    # Budget Allocation Methods
    # ========================================
    def create_allocation(
        self, 
        project_id: str, 
        req: BudgetAllocationCreate, 
        current_user_id: str
    ) -> BudgetAllocationResponse:
        budget = self.db.query(ProjectBudget).filter(
            ProjectBudget.project_id == project_id
        ).first()
        if not budget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget not found for this project"
            )

        # Verify cost category exists
        category = self.get_category_by_id(req.costCategoryId)

        # Check if allocation already exists for this category
        existing = self.db.query(BudgetAllocation).filter(
            BudgetAllocation.project_budget_id == budget.id,
            BudgetAllocation.cost_category_id == req.costCategoryId
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Allocation already exists for this cost category"
            )

        allocation = BudgetAllocation(
            project_budget_id=budget.id,
            cost_category_id=req.costCategoryId,
            allocated_amount=req.allocatedAmount,
            notes=req.notes
        )
        self.db.add(allocation)
        self.db.commit()
        self.db.refresh(allocation)
        return self._to_allocation_response(allocation)

    def update_allocation(
        self, 
        allocation_id: str, 
        updates: BudgetAllocationUpdate
    ) -> BudgetAllocationResponse:
        allocation = self.db.query(BudgetAllocation).filter(
            BudgetAllocation.id == allocation_id
        ).first()
        if not allocation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget allocation not found"
            )

        if updates.allocatedAmount is not None:
            allocation.allocated_amount = updates.allocatedAmount
        if updates.notes is not None:
            allocation.notes = updates.notes

        self.db.commit()
        self.db.refresh(allocation)
        return self._to_allocation_response(allocation)

    def delete_allocation(self, allocation_id: str) -> bool:
        allocation = self.db.query(BudgetAllocation).filter(
            BudgetAllocation.id == allocation_id
        ).first()
        if not allocation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget allocation not found"
            )
        self.db.delete(allocation)
        self.db.commit()
        return True

    # ========================================
    # Cost Estimate Methods
    # ========================================
    def create_estimate(self, req: CostEstimateCreate, current_user_id: str) -> CostEstimateResponse:
        # Verify project exists
        project = self.db.query(Project).filter(Project.id == req.projectId).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Verify cost category exists
        category = self.get_category_by_id(req.costCategoryId)

        estimate = CostEstimate(
            project_id=req.projectId,
            cost_category_id=req.costCategoryId,
            estimate_title=req.estimateTitle,
            estimated_amount=req.estimatedAmount,
            estimate_date=req.estimateDate,
            remarks=req.remarks,
            created_by=current_user_id
        )
        self.db.add(estimate)
        self.db.commit()
        self.db.refresh(estimate)
        return self._to_estimate_response(estimate)

    def get_project_estimates(self, project_id: str) -> List[CostEstimateResponse]:
        estimates = self.db.query(CostEstimate).filter(
            CostEstimate.project_id == project_id
        ).order_by(CostEstimate.created_at.desc()).all()
        return [self._to_estimate_response(est) for est in estimates]

    def get_estimate_by_id(self, estimate_id: str) -> CostEstimateResponse:
        estimate = self.db.query(CostEstimate).filter(
            CostEstimate.id == estimate_id
        ).first()
        if not estimate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cost estimate not found"
            )
        return self._to_estimate_response(estimate)

    def update_estimate(self, estimate_id: str, updates: CostEstimateUpdate) -> CostEstimateResponse:
        estimate = self.db.query(CostEstimate).filter(
            CostEstimate.id == estimate_id
        ).first()
        if not estimate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cost estimate not found"
            )

        if updates.estimateTitle is not None:
            estimate.estimate_title = updates.estimateTitle
        if updates.estimatedAmount is not None:
            estimate.estimated_amount = updates.estimatedAmount
        if updates.estimateDate is not None:
            estimate.estimate_date = updates.estimateDate
        if updates.remarks is not None:
            estimate.remarks = updates.remarks

        self.db.commit()
        self.db.refresh(estimate)
        return self._to_estimate_response(estimate)

    def delete_estimate(self, estimate_id: str) -> bool:
        estimate = self.db.query(CostEstimate).filter(
            CostEstimate.id == estimate_id
        ).first()
        if not estimate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cost estimate not found"
            )
        self.db.delete(estimate)
        self.db.commit()
        return True

    # ========================================
    # Expense Methods
    # ========================================
    def create_expense(self, req: ExpenseCreate, current_user_id: str) -> ExpenseResponse:
        # Verify project exists
        project = self.db.query(Project).filter(Project.id == req.projectId).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Verify cost category exists
        category = self.get_category_by_id(req.costCategoryId)

        expense = ProjectExpense(
            project_id=req.projectId,
            cost_category_id=req.costCategoryId,
            expense_title=req.expenseTitle,
            amount=req.amount,
            expense_date=req.expenseDate,
            vendor_or_payee=req.vendorOrPayee,
            reference_no=req.referenceNo,
            notes=req.notes,
            status=req.status,
            source_type=req.sourceType,
            source_id=req.sourceId,
            created_by=current_user_id
        )
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return self._to_expense_response(expense)

    def get_project_expenses(self, project_id: str) -> List[ExpenseResponse]:
        expenses = self.db.query(ProjectExpense).filter(
            ProjectExpense.project_id == project_id
        ).order_by(ProjectExpense.expense_date.desc(), ProjectExpense.created_at.desc()).all()
        return [self._to_expense_response(exp) for exp in expenses]

    def get_expense_by_id(self, expense_id: str) -> ExpenseResponse:
        expense = self.db.query(ProjectExpense).filter(
            ProjectExpense.id == expense_id
        ).first()
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        return self._to_expense_response(expense)

    def update_expense(self, expense_id: str, updates: ExpenseUpdate) -> ExpenseResponse:
        expense = self.db.query(ProjectExpense).filter(
            ProjectExpense.id == expense_id
        ).first()
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )

        if updates.expenseTitle is not None:
            expense.expense_title = updates.expenseTitle
        if updates.amount is not None:
            expense.amount = updates.amount
        if updates.expenseDate is not None:
            expense.expense_date = updates.expenseDate
        if updates.vendorOrPayee is not None:
            expense.vendor_or_payee = updates.vendorOrPayee
        if updates.referenceNo is not None:
            expense.reference_no = updates.referenceNo
        if updates.notes is not None:
            expense.notes = updates.notes
        if updates.status is not None:
            expense.status = updates.status

        self.db.commit()
        self.db.refresh(expense)
        return self._to_expense_response(expense)

    def delete_expense(self, expense_id: str) -> bool:
        expense = self.db.query(ProjectExpense).filter(
            ProjectExpense.id == expense_id
        ).first()
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        self.db.delete(expense)
        self.db.commit()
        return True

    # ========================================
    # Financial Summary Methods
    # ========================================
    def get_financial_summary(self, project_id: str) -> FinancialSummaryResponse:
        # Verify project exists
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Get project budget
        budget = self.db.query(ProjectBudget).filter(
            ProjectBudget.project_id == project_id
        ).first()
        
        total_budget = budget.total_budget if budget else Decimal("0.00")

        # Calculate total estimated cost
        total_estimated = self.db.query(
            func.sum(CostEstimate.estimated_amount)
        ).filter(
            CostEstimate.project_id == project_id
        ).scalar() or Decimal("0.00")

        # Calculate actual amount spent
        total_spent = self.db.query(
            func.sum(ProjectExpense.amount)
        ).filter(
            ProjectExpense.project_id == project_id
        ).scalar() or Decimal("0.00")

        # Calculate remaining budget
        remaining_budget = total_budget - total_spent

        # Calculate budget utilization percentage
        utilization_percentage = None
        if total_budget > 0:
            utilization_percentage = float((total_spent / total_budget) * 100)

        # Get category-wise breakdown
        category_breakdown = self._get_category_breakdown(project_id, budget)

        return FinancialSummaryResponse(
            projectId=project_id,
            totalBudget=total_budget,
            totalEstimatedCost=total_estimated,
            actualAmountSpent=total_spent,
            remainingBudget=remaining_budget,
            budgetUtilizationPercentage=utilization_percentage,
            categoryBreakdown=category_breakdown
        )

    def _get_category_breakdown(
        self, 
        project_id: str, 
        budget: Optional[ProjectBudget]
    ) -> List[CategoryFinancialSummary]:
        categories = self.db.query(CostCategory).filter(
            CostCategory.is_active == True
        ).all()

        breakdown = []
        for category in categories:
            # Get budget allocated for this category
            budget_allocated = Decimal("0.00")
            if budget:
                allocation = self.db.query(BudgetAllocation).filter(
                    BudgetAllocation.project_budget_id == budget.id,
                    BudgetAllocation.cost_category_id == category.id
                ).first()
                if allocation:
                    budget_allocated = allocation.allocated_amount

            # Get estimated cost for this category
            estimated_cost = self.db.query(
                func.sum(CostEstimate.estimated_amount)
            ).filter(
                CostEstimate.project_id == project_id,
                CostEstimate.cost_category_id == category.id
            ).scalar() or Decimal("0.00")

            # Get actual expense for this category
            actual_expense = self.db.query(
                func.sum(ProjectExpense.amount)
            ).filter(
                ProjectExpense.project_id == project_id,
                ProjectExpense.cost_category_id == category.id
            ).scalar() or Decimal("0.00")

            # Calculate remaining budget
            remaining = budget_allocated - actual_expense

            # Calculate utilization percentage
            utilization = None
            if budget_allocated > 0:
                utilization = float((actual_expense / budget_allocated) * 100)

            breakdown.append(CategoryFinancialSummary(
                categoryId=category.id,
                categoryName=category.name,
                budgetAllocated=budget_allocated,
                estimatedCost=estimated_cost,
                actualExpense=actual_expense,
                remainingBudget=remaining,
                utilizationPercentage=utilization
            ))

        return breakdown

    # ========================================
    # Helper Methods for Response Conversion
    # ========================================
    def _to_budget_response(self, budget: ProjectBudget) -> BudgetResponse:
        return BudgetResponse(
            id=budget.id,
            projectId=budget.project_id,
            totalBudget=budget.total_budget,
            currency=budget.currency,
            status=budget.status,
            notes=budget.notes,
            createdBy=budget.created_by,
            createdAt=budget.created_at.isoformat() if budget.created_at else None,
            updatedAt=budget.updated_at.isoformat() if budget.updated_at else None,
            allocations=[self._to_allocation_response(alloc) for alloc in budget.allocations]
        )

    def _to_allocation_response(self, allocation: BudgetAllocation) -> BudgetAllocationResponse:
        return BudgetAllocationResponse(
            id=allocation.id,
            projectBudgetId=allocation.project_budget_id,
            costCategory=CostCategoryResponse(
                id=allocation.cost_category.id,
                name=allocation.cost_category.name,
                description=allocation.cost_category.description,
                is_active=allocation.cost_category.is_active
            ),
            allocatedAmount=allocation.allocated_amount,
            notes=allocation.notes,
            createdAt=allocation.created_at.isoformat() if allocation.created_at else None,
            updatedAt=allocation.updated_at.isoformat() if allocation.updated_at else None
        )

    def _to_estimate_response(self, estimate: CostEstimate) -> CostEstimateResponse:
        return CostEstimateResponse(
            id=estimate.id,
            projectId=estimate.project_id,
            costCategory=CostCategoryResponse(
                id=estimate.cost_category.id,
                name=estimate.cost_category.name,
                description=estimate.cost_category.description,
                is_active=estimate.cost_category.is_active
            ),
            estimateTitle=estimate.estimate_title,
            estimatedAmount=estimate.estimated_amount,
            estimateDate=estimate.estimate_date,
            remarks=estimate.remarks,
            createdBy=estimate.created_by,
            createdAt=estimate.created_at.isoformat() if estimate.created_at else None,
            updatedAt=estimate.updated_at.isoformat() if estimate.updated_at else None
        )

    def _to_expense_response(self, expense: ProjectExpense) -> ExpenseResponse:
        return ExpenseResponse(
            id=expense.id,
            projectId=expense.project_id,
            costCategory=CostCategoryResponse(
                id=expense.cost_category.id,
                name=expense.cost_category.name,
                description=expense.cost_category.description,
                is_active=expense.cost_category.is_active
            ),
            expenseTitle=expense.expense_title,
            amount=expense.amount,
            expenseDate=expense.expense_date,
            vendorOrPayee=expense.vendor_or_payee,
            referenceNo=expense.reference_no,
            notes=expense.notes,
            status=expense.status,
            sourceType=expense.source_type,
            sourceId=expense.source_id,
            createdBy=expense.created_by,
            createdAt=expense.created_at.isoformat() if expense.created_at else None,
            updatedAt=expense.updated_at.isoformat() if expense.updated_at else None
        )

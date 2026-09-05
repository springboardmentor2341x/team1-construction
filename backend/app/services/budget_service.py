import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_

from app.models.user import User
from app.models.role import Role
from app.models.project import Project
from app.models.assignments import ProjectSiteEngineer, ProjectContractor, ProjectClient
from app.models.budget import ProjectBudget, BudgetCategoryAllocation, CostEstimate, ActualExpense, BUDGET_CATEGORIES
from app.models.workforce import Worker
from app.models.material import MaterialModel
from app.models.resource import ResourceModel
from app.models.procurement import PurchaseOrderModel
from app.schemas.budget import (
    ProjectBudgetCreate,
    ProjectBudgetUpdate,
    CostEstimateCreate,
    CostEstimateUpdate,
    ActualExpenseCreate,
    ActualExpenseUpdate
)
from app.services.notification_service import NotificationService


class BudgetService:

    @staticmethod
    def get_user_authorized_project_ids(db: Session, user: User) -> List[str]:
        """Fetch list of project IDs that the logged-in user is authorized to access."""
        if user.role_rel and user.role_rel.name == "Administrator":
            return [p.id for p in db.query(Project.id).all()]

        project_ids = set()

        # PM ownership
        for p in db.query(Project.id).filter(Project.project_manager_id == user.id).all():
            project_ids.add(p.id)

        # Site engineer assignment
        for p in db.query(ProjectSiteEngineer.project_id).filter(ProjectSiteEngineer.site_engineer_id == user.id).all():
            project_ids.add(p.project_id)

        # Contractor assignment
        for p in db.query(ProjectContractor.project_id).filter(ProjectContractor.contractor_id == user.id).all():
            project_ids.add(p.project_id)

        # Client assignment
        for p in db.query(ProjectClient.project_id).filter(ProjectClient.client_id == user.id).all():
            project_ids.add(p.project_id)

        return list(project_ids)

    @classmethod
    def validate_project_access(cls, db: Session, user: User, project_id: str) -> Project:
        """Validate JWT user project authorization or raise PermissionError (HTTP 403)."""
        authorized_ids = cls.get_user_authorized_project_ids(db, user)
        if project_id not in authorized_ids and (not user.role_rel or user.role_rel.name != "Administrator"):
            raise PermissionError(f"Access denied to project ID: {project_id}")

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} does not exist.")
        return project

    @classmethod
    def validate_write_permission(cls, user: User):
        """Validate that user role has financial modification privileges."""
        role_name = user.role_rel.name if user.role_rel else ""
        if role_name not in ["Administrator", "Project Manager"]:
            raise PermissionError(f"Role '{role_name}' is not authorized to modify financial records.")

    # =========================================================================
    # 1. BUDGET PLANNING & CATEGORY ALLOCATIONS
    # =========================================================================

    @classmethod
    def get_or_create_project_budget(cls, db: Session, user: User, project_id: str) -> ProjectBudget:
        """Fetch existing project budget or initialize an empty budget container."""
        cls.validate_project_access(db, user, project_id)

        budget = db.query(ProjectBudget).filter(ProjectBudget.project_id == project_id).first()
        if not budget:
            budget = ProjectBudget(
                id=str(uuid.uuid4()),
                project_id=project_id,
                overall_budget=0.0,
                currency="INR",
                notes="Initial budget container",
                created_by=user.id
            )
            db.add(budget)
            db.commit()
            db.refresh(budget)

            # Initialize 6 category allocations with 0.0
            for cat in BUDGET_CATEGORIES:
                alloc = BudgetCategoryAllocation(
                    id=str(uuid.uuid4()),
                    budget_id=budget.id,
                    category=cat,
                    allocated_amount=0.0,
                    notes=f"Initial allocation for {cat}"
                )
                db.add(alloc)
            db.commit()
            db.refresh(budget)

        return budget

    @classmethod
    def create_or_update_project_budget(cls, db: Session, user: User, project_id: str, data: ProjectBudgetCreate) -> ProjectBudget:
        """
        Create or update project budget with strict Single Source of Truth rule:
        Overall Budget MUST equal the sum of category allocations.
        """
        cls.validate_project_access(db, user, project_id)
        cls.validate_write_permission(user)

        # Enforce non-negative amounts
        if data.overall_budget < 0:
            raise ValueError("Overall budget amount cannot be negative.")

        allocations_input = data.category_allocations or []
        for alloc in allocations_input:
            if alloc.allocated_amount < 0:
                raise ValueError(f"Category allocation for '{alloc.category}' cannot be negative.")

        # Single Source of Truth equivalence check
        if allocations_input:
            sum_allocations = sum(float(a.allocated_amount) for a in allocations_input)
            if round(float(data.overall_budget), 2) != round(sum_allocations, 2):
                raise ValueError(
                    f"Overall Budget (₹{data.overall_budget:,.2f}) does not match the sum of category allocations (₹{sum_allocations:,.2f}). "
                    f"Category allocations must sum up exactly to the overall budget."
                )

        budget = db.query(ProjectBudget).filter(ProjectBudget.project_id == project_id).first()
        if not budget:
            budget = ProjectBudget(
                id=str(uuid.uuid4()),
                project_id=project_id,
                overall_budget=data.overall_budget,
                currency=data.currency or "INR",
                notes=data.notes,
                created_by=user.id
            )
            db.add(budget)
            db.flush()
        else:
            budget.overall_budget = data.overall_budget
            if data.currency:
                budget.currency = data.currency
            if data.notes is not None:
                budget.notes = data.notes

        # Upsert category allocations for all 6 categories
        existing_allocs = {a.category.lower(): a for a in budget.allocations}
        input_alloc_map = {a.category.lower(): a for a in allocations_input}

        for cat in BUDGET_CATEGORIES:
            cat_key = cat.lower()
            alloc_data = input_alloc_map.get(cat_key)
            amount = alloc_data.allocated_amount if alloc_data else 0.0
            notes = alloc_data.notes if alloc_data else None

            if cat_key in existing_allocs:
                existing_allocs[cat_key].allocated_amount = amount
                if notes is not None:
                    existing_allocs[cat_key].notes = notes
            else:
                new_alloc = BudgetCategoryAllocation(
                    id=str(uuid.uuid4()),
                    budget_id=budget.id,
                    category=cat,
                    allocated_amount=amount,
                    notes=notes
                )
                db.add(new_alloc)

        db.commit()
        db.refresh(budget)

        # Synchronize project.estimated_budget field
        proj = db.query(Project).filter(Project.id == project_id).first()
        if proj:
            proj.estimated_budget = float(budget.overall_budget)
            db.commit()

        return budget

    # =========================================================================
    # 2. COST ESTIMATES MANAGEMENT
    # =========================================================================

    @classmethod
    def create_cost_estimate(cls, db: Session, user: User, project_id: str, data: CostEstimateCreate) -> CostEstimate:
        cls.validate_project_access(db, user, project_id)
        cls.validate_write_permission(user)

        if data.amount <= 0:
            raise ValueError("Estimated cost amount must be greater than zero.")

        # Generate unique code EST-YYYYMMDD-XXXX
        code_prefix = f"EST-{datetime.now(timezone.utc).strftime('%Y%m%d')}"
        count = db.query(CostEstimate).filter(CostEstimate.estimate_code.like(f"{code_prefix}%")).count()
        estimate_code = f"{code_prefix}-{(count + 1):04d}"

        estimate = CostEstimate(
            id=str(uuid.uuid4()),
            estimate_code=estimate_code,
            project_id=project_id,
            category=data.category,
            amount=data.amount,
            description=data.description,
            task_reference=data.task_reference,
            created_by=user.id
        )
        db.add(estimate)
        db.commit()
        db.refresh(estimate)
        return estimate

    @classmethod
    def get_cost_estimates(cls, db: Session, user: User, project_id: str, category: Optional[str] = None) -> List[CostEstimate]:
        cls.validate_project_access(db, user, project_id)
        query = db.query(CostEstimate).filter(CostEstimate.project_id == project_id)
        if category:
            query = query.filter(func.lower(CostEstimate.category) == category.strip().lower())
        return query.order_by(desc(CostEstimate.created_at)).all()

    @classmethod
    def update_cost_estimate(cls, db: Session, user: User, estimate_id: str, data: CostEstimateUpdate) -> CostEstimate:
        cls.validate_write_permission(user)
        estimate = db.query(CostEstimate).filter(CostEstimate.id == estimate_id).first()
        if not estimate:
            raise ValueError(f"Cost estimate with ID {estimate_id} does not exist.")

        cls.validate_project_access(db, user, estimate.project_id)

        if data.amount is not None:
            if data.amount <= 0:
                raise ValueError("Estimated cost amount must be greater than zero.")
            estimate.amount = data.amount
        if data.category:
            estimate.category = data.category
        if data.description:
            estimate.description = data.description
        if data.task_reference is not None:
            estimate.task_reference = data.task_reference

        db.commit()
        db.refresh(estimate)
        return estimate

    @classmethod
    def delete_cost_estimate(cls, db: Session, user: User, estimate_id: str) -> bool:
        cls.validate_write_permission(user)
        estimate = db.query(CostEstimate).filter(CostEstimate.id == estimate_id).first()
        if not estimate:
            raise ValueError(f"Cost estimate with ID {estimate_id} does not exist.")

        cls.validate_project_access(db, user, estimate.project_id)

        db.delete(estimate)
        db.commit()
        return True

    # =========================================================================
    # 3. ACTUAL EXPENSE MANAGEMENT
    # =========================================================================

    @classmethod
    def create_actual_expense(cls, db: Session, user: User, project_id: str, data: ActualExpenseCreate) -> ActualExpense:
        cls.validate_project_access(db, user, project_id)
        cls.validate_write_permission(user)

        if data.amount <= 0:
            raise ValueError("Actual expense amount must be greater than zero.")

        # Validate cross-module references if provided
        if data.worker_id:
            w = db.query(Worker).filter(Worker.id == data.worker_id).first()
            if not w:
                raise ValueError(f"Worker with ID {data.worker_id} does not exist.")
        if data.material_id:
            m = db.query(MaterialModel).filter(MaterialModel.id == data.material_id).first()
            if not m:
                raise ValueError(f"Material with ID {data.material_id} does not exist.")
        if data.equipment_id:
            eq = db.query(ResourceModel).filter(ResourceModel.id == data.equipment_id).first()
            if not eq:
                raise ValueError(f"Equipment resource with ID {data.equipment_id} does not exist.")
        if data.purchase_order_id:
            po = db.query(PurchaseOrderModel).filter(PurchaseOrderModel.id == data.purchase_order_id).first()
            if not po:
                raise ValueError(f"Purchase Order with ID {data.purchase_order_id} does not exist.")

        # Generate unique code EXP-YYYYMMDD-XXXX
        code_prefix = f"EXP-{datetime.now(timezone.utc).strftime('%Y%m%d')}"
        count = db.query(ActualExpense).filter(ActualExpense.expense_code.like(f"{code_prefix}%")).count()
        expense_code = f"{code_prefix}-{(count + 1):04d}"

        expense = ActualExpense(
            id=str(uuid.uuid4()),
            expense_code=expense_code,
            project_id=project_id,
            category=data.category,
            amount=data.amount,
            description=data.description,
            expense_date=data.expense_date,
            source_reference=data.source_reference,
            worker_id=data.worker_id,
            material_id=data.material_id,
            equipment_id=data.equipment_id,
            purchase_order_id=data.purchase_order_id,
            created_by=user.id
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)

        # Check Module 8 Notification trigger for budget overflow
        cls._check_and_notify_budget_overflow(db, project_id)

        return expense

    @classmethod
    def get_actual_expenses(cls, db: Session, user: User, project_id: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
        cls.validate_project_access(db, user, project_id)
        query = db.query(ActualExpense).filter(ActualExpense.project_id == project_id)
        if category:
            query = query.filter(func.lower(ActualExpense.category) == category.strip().lower())
        
        records = query.order_by(desc(ActualExpense.expense_date), desc(ActualExpense.created_at)).all()
        result = []
        for r in records:
            item = {
                "id": r.id,
                "expense_code": r.expense_code,
                "project_id": r.project_id,
                "category": r.category,
                "amount": float(r.amount),
                "description": r.description,
                "expense_date": r.expense_date,
                "source_reference": r.source_reference,
                "worker_id": r.worker_id,
                "worker_name": r.worker.worker_name if r.worker else None,
                "material_id": r.material_id,
                "material_name": r.material.name if r.material else None,
                "equipment_id": r.equipment_id,
                "equipment_name": r.equipment.name if r.equipment else None,
                "purchase_order_id": r.purchase_order_id,
                "po_number": r.purchase_order.purchase_order_id if r.purchase_order else None,
                "created_by": r.created_by,
                "created_at": r.created_at,
                "updated_at": r.updated_at
            }
            result.append(item)
        return result

    @classmethod
    def update_actual_expense(cls, db: Session, user: User, expense_id: str, data: ActualExpenseUpdate) -> ActualExpense:
        cls.validate_write_permission(user)
        expense = db.query(ActualExpense).filter(ActualExpense.id == expense_id).first()
        if not expense:
            raise ValueError(f"Actual expense with ID {expense_id} does not exist.")

        cls.validate_project_access(db, user, expense.project_id)

        if data.amount is not None:
            if data.amount <= 0:
                raise ValueError("Actual expense amount must be greater than zero.")
            expense.amount = data.amount
        if data.category:
            expense.category = data.category
        if data.description:
            expense.description = data.description
        if data.expense_date:
            expense.expense_date = data.expense_date
        if data.source_reference is not None:
            expense.source_reference = data.source_reference
        if data.worker_id is not None:
            expense.worker_id = data.worker_id
        if data.material_id is not None:
            expense.material_id = data.material_id
        if data.equipment_id is not None:
            expense.equipment_id = data.equipment_id
        if data.purchase_order_id is not None:
            expense.purchase_order_id = data.purchase_order_id

        db.commit()
        db.refresh(expense)

        # Check Module 8 Notification trigger for budget overflow
        cls._check_and_notify_budget_overflow(db, expense.project_id)

        return expense

    @classmethod
    def delete_actual_expense(cls, db: Session, user: User, expense_id: str) -> bool:
        cls.validate_write_permission(user)
        expense = db.query(ActualExpense).filter(ActualExpense.id == expense_id).first()
        if not expense:
            raise ValueError(f"Actual expense with ID {expense_id} does not exist.")

        cls.validate_project_access(db, user, expense.project_id)
        pid = expense.project_id

        db.delete(expense)
        db.commit()

        # Recalculate summary notification state if necessary
        cls._check_and_notify_budget_overflow(db, pid)
        return True

    # =========================================================================
    # 4. FINANCIAL SUMMARY & MONITORING ENGINE
    # =========================================================================

    @classmethod
    def get_project_financial_summary(cls, db: Session, user: User, project_id: str) -> Dict[str, Any]:
        """
        Dynamically computes all project financial metrics directly from PostgreSQL records:
        - Planned Budget
        - Total Estimated Cost
        - Total Actual Cost / Amount Spent
        - Remaining Budget
        - Budget Utilization %
        - Estimated Variance & Actual Variance
        - Category-wise comparisons for all 6 categories
        """
        project = cls.validate_project_access(db, user, project_id)

        # 1. Planned Budget & Category Allocations
        budget_obj = db.query(ProjectBudget).filter(ProjectBudget.project_id == project_id).first()
        planned_budget_val = float(budget_obj.overall_budget) if (budget_obj and budget_obj.overall_budget > 0) else 0.0
        proj_budget_val = float(project.estimated_budget or 0.0)
        planned_budget = max(planned_budget_val, proj_budget_val)

        planned_alloc_map = {}
        if budget_obj and budget_obj.allocations:
            for alloc in budget_obj.allocations:
                planned_alloc_map[alloc.category.lower()] = float(alloc.allocated_amount)

        # 2. Total Cost Estimates
        estimates_by_cat = db.query(
            CostEstimate.category,
            func.sum(CostEstimate.amount).label("total")
        ).filter(CostEstimate.project_id == project_id).group_by(CostEstimate.category).all()

        estimated_cat_map = {row[0].lower(): float(row[1] or 0.0) for row in estimates_by_cat}
        total_estimated_cost = sum(estimated_cat_map.values())

        # 3. Total Actual Expenses
        expenses_by_cat = db.query(
            ActualExpense.category,
            func.sum(ActualExpense.amount).label("total")
        ).filter(ActualExpense.project_id == project_id).group_by(ActualExpense.category).all()

        actual_cat_map = {row[0].lower(): float(row[1] or 0.0) for row in expenses_by_cat}
        total_actual_cost = sum(actual_cat_map.values())

        # 4. Mathematical Calculations
        remaining_budget = planned_budget - total_actual_cost
        
        # Zero budget safe division
        if planned_budget > 0:
            budget_utilization_percentage = round((total_actual_cost / planned_budget) * 100.0, 2)
        else:
            budget_utilization_percentage = 0.0

        estimated_variance = planned_budget - total_estimated_cost
        actual_variance = total_estimated_cost - total_actual_cost

        # Status indicator
        if planned_budget == 0.0:
            budget_status = "No Budget Set"
        elif total_actual_cost > planned_budget:
            budget_status = "Over Budget"
        elif budget_utilization_percentage >= 90.0:
            budget_status = "Near Budget Cap"
        else:
            budget_status = "Within Budget"

        # 5. Category-wise Comparisons for all 6 standard categories
        category_summaries = []
        for cat in BUDGET_CATEGORIES:
            cat_key = cat.lower()
            c_planned = planned_alloc_map.get(cat_key, 0.0)
            c_estimated = estimated_cat_map.get(cat_key, 0.0)
            c_actual = actual_cat_map.get(cat_key, 0.0)
            c_remaining = c_planned - c_actual
            c_util_pct = round((c_actual / c_planned) * 100.0, 2) if c_planned > 0 else 0.0

            category_summaries.append({
                "category": cat,
                "planned_amount": round(c_planned, 2),
                "estimated_amount": round(c_estimated, 2),
                "actual_amount": round(c_actual, 2),
                "remaining_amount": round(c_remaining, 2),
                "utilization_percentage": c_util_pct
            })

        return {
            "project_id": project.id,
            "project_code": project.project_code,
            "project_name": getattr(project, 'project_name', getattr(project, 'name', '')),
            "planned_budget": round(planned_budget, 2),
            "total_estimated_cost": round(total_estimated_cost, 2),
            "total_actual_cost": round(total_actual_cost, 2),
            "remaining_budget": round(remaining_budget, 2),
            "budget_utilization_percentage": budget_utilization_percentage,
            "estimated_variance": round(estimated_variance, 2),
            "actual_variance": round(actual_variance, 2),
            "budget_status": budget_status,
            "category_summaries": category_summaries
        }

    # =========================================================================
    # 5. MODULE 8 NOTIFICATION INTEGRATION
    # =========================================================================

    @classmethod
    def _check_and_notify_budget_overflow(cls, db: Session, project_id: str):
        """Emit Module 8 notification if total actual expenses exceed planned budget."""
        budget_obj = db.query(ProjectBudget).filter(ProjectBudget.project_id == project_id).first()
        if not budget_obj or budget_obj.overall_budget <= 0:
            return

        planned = float(budget_obj.overall_budget)
        actual = float(db.query(func.sum(ActualExpense.amount)).filter(ActualExpense.project_id == project_id).scalar() or 0.0)

        if actual > planned:
            proj = db.query(Project).filter(Project.id == project_id).first()
            p_name = proj.project_name if proj else "Project"
            overflow = actual - planned

            recipients = NotificationService.get_relevant_project_user_ids(
                db, project_id, roles_filter=["Administrator", "Project Manager"]
            )
            for uid in recipients:
                from app.models.notification import Notification
                existing = db.query(Notification).filter(
                    Notification.user_id == uid,
                    Notification.project_id == project_id,
                    Notification.reference_module == "budget",
                    Notification.category == "Budget Alert",
                    Notification.is_read == False
                ).first()

                if not existing:
                    NotificationService.create_notification(
                        db=db,
                        user_id=uid,
                        title=f"Budget Overrun Alert: {p_name}",
                        message=f"Project '{p_name}' expenses (₹{actual:,.2f}) have exceeded planned budget (₹{planned:,.2f}) by ₹{overflow:,.2f}.",
                        type="DEADLINE",
                        project_id=project_id,
                        reference_module="budget",
                        reference_id=budget_obj.id,
                        category="Budget Alert"
                    )

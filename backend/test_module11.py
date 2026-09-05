import unittest
import os
import sys
from datetime import datetime, timezone

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine, Base
from app.models.role import Role
from app.models.user import User
from app.models.project import Project
from app.models.schedule import ProjectSchedule
from app.models.milestone import ProjectMilestone
from app.models.assignments import ProjectSiteEngineer, ProjectContractor, ContractorWorker, ProjectClient
from app.models.project_audit import ProjectAuditLog
from app.models.equipment import EquipmentModel
from app.models.task import TaskModel
from app.models.document import DocumentModel
from app.models.shift import ShiftModel
from app.models.site_progress import DailyProgressReport, WeeklyProgressReport, WorkCompletionStatus, DelayTracking, SiteActivityLog, ProgressPhotograph
from app.models.workforce import WorkforceCategory, Worker, WorkerProjectAssignment, WorkerShiftAssignment, AttendanceModel, WorkforcePayroll
from app.models.procurement import ProcurementCategoryModel, VendorModel, ProcurementRequestModel, ProcurementRequestItemModel, PurchaseOrderModel, PurchaseOrderItemModel, InvoiceModel
from app.models.budget import ProjectBudget, BudgetCategoryAllocation, CostEstimate, ActualExpense
from app.models.notification import Notification
from app.services.budget_service import BudgetService
from app.services.dashboard_service import DashboardService
from app.services.report_service import ReportService
from app.schemas.budget import ProjectBudgetCreate, CategoryAllocationInput, CostEstimateCreate, ActualExpenseCreate, ActualExpenseUpdate


class TestModule11BudgetAndCostManagement(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db: Session = SessionLocal()

        # Fetch Admin user
        cls.admin_user = cls.db.query(User).filter(User.email == "admin@buildtrack.com").first()
        if not cls.admin_user:
            cls.admin_user = cls.db.query(User).first()

        # Fetch PM user
        cls.pm_user = cls.db.query(User).filter(User.email == "pm.apex@buildtrack.com").first()
        if not cls.pm_user:
            cls.pm_user = cls.admin_user

        # Fetch test project
        cls.project = cls.db.query(Project).first()
        if not cls.project:
            cls.project = Project(
                id="test-project-m11-uuid",
                project_name="Apex Commercial Tower M11",
                project_code="PRJ-M11-001",
                category="Commercial",
                client_name="Apex Infra Ltd",
                location="Downtown Hub",
                estimated_budget=1000000.0,
                start_date="2026-01-01",
                expected_completion_date="2026-12-31"
            )
            cls.db.add(cls.project)
            cls.db.commit()

        cls.project_id = cls.project.id

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def setUp(self):
        # Clean existing Module 11 test records for project
        self.db.query(ActualExpense).filter(ActualExpense.project_id == self.project_id).delete()
        self.db.query(CostEstimate).filter(CostEstimate.project_id == self.project_id).delete()
        self.db.query(BudgetCategoryAllocation).filter(
            BudgetCategoryAllocation.budget_id.in_(
                self.db.query(ProjectBudget.id).filter(ProjectBudget.project_id == self.project_id)
            )
        ).delete(synchronize_session=False)
        self.db.query(ProjectBudget).filter(ProjectBudget.project_id == self.project_id).delete()
        self.db.commit()

    def test_01_single_source_of_truth_budget_rule(self):
        """Test Single Source of Truth rule: Overall Budget = Sum of Category Allocations."""
        # 1. Invalid budget: Overall = 10,00,000 but allocations sum to 9,00,000 -> MUST REJECT
        invalid_allocations = [
            CategoryAllocationInput(category="Labor", allocated_amount=300000.0),
            CategoryAllocationInput(category="Material", allocated_amount=400000.0),
            CategoryAllocationInput(category="Equipment", allocated_amount=100000.0), # 100k instead of 150k
            CategoryAllocationInput(category="Transportation", allocated_amount=50000.0),
            CategoryAllocationInput(category="Maintenance", allocated_amount=25000.0),
            CategoryAllocationInput(category="Administrative", allocated_amount=25000.0)
        ]
        invalid_payload = ProjectBudgetCreate(
            overall_budget=1000000.0,
            notes="Invalid allocation test",
            category_allocations=invalid_allocations
        )

        with self.assertRaises(ValueError) as ctx:
            BudgetService.create_or_update_project_budget(self.db, self.admin_user, self.project_id, invalid_payload)
        self.assertIn("does not match the sum of category allocations", str(ctx.exception))

        # 2. Valid budget: Overall = 10,00,000 and allocations sum to 10,00,000 -> MUST ACCEPT
        valid_allocations = [
            CategoryAllocationInput(category="Labor", allocated_amount=300000.0),
            CategoryAllocationInput(category="Material", allocated_amount=400000.0),
            CategoryAllocationInput(category="Equipment", allocated_amount=150000.0),
            CategoryAllocationInput(category="Transportation", allocated_amount=50000.0),
            CategoryAllocationInput(category="Maintenance", allocated_amount=50000.0),
            CategoryAllocationInput(category="Administrative", allocated_amount=50000.0)
        ]
        valid_payload = ProjectBudgetCreate(
            overall_budget=1000000.0,
            notes="Valid 10L baseline budget",
            category_allocations=valid_allocations
        )

        budget = BudgetService.create_or_update_project_budget(self.db, self.admin_user, self.project_id, valid_payload)
        self.assertEqual(float(budget.overall_budget), 1000000.0)
        self.assertEqual(len(budget.allocations), 6)
        print("\n[TEST 1 PASSED] Single Source of Truth Budget Equivalence Rule Verified.")

    def test_02_mandatory_financial_calculation_flow(self):
        """
        Test Mandatory User Scenario:
        Planned Budget = ₹10,00,000
        1. Add Material Expense = ₹2,00,000 -> Actual = ₹2,00,000, Remaining = ₹8,00,000, Utilization = 20%
        2. Update Expense = ₹3,00,000 -> Actual = ₹3,00,000, Remaining = ₹7,00,000, Utilization = 30%
        3. Delete Expense -> Actual = ₹0, Remaining = ₹10,00,000, Utilization = 0%
        """
        # Step A: Set Planned Budget = ₹10,00,000
        allocations = [
            CategoryAllocationInput(category="Labor", allocated_amount=300000.0),
            CategoryAllocationInput(category="Material", allocated_amount=400000.0),
            CategoryAllocationInput(category="Equipment", allocated_amount=150000.0),
            CategoryAllocationInput(category="Transportation", allocated_amount=50000.0),
            CategoryAllocationInput(category="Maintenance", allocated_amount=50000.0),
            CategoryAllocationInput(category="Administrative", allocated_amount=50000.0)
        ]
        BudgetService.create_or_update_project_budget(
            self.db, self.admin_user, self.project_id,
            ProjectBudgetCreate(overall_budget=1000000.0, category_allocations=allocations)
        )

        # Step B: Add Material Expense = ₹2,00,000
        exp_data = ActualExpenseCreate(
            category="Material",
            amount=200000.0,
            description="Portland Cement delivery batch 1",
            expense_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            source_reference="PO-MAT-101"
        )
        expense = BudgetService.create_actual_expense(self.db, self.admin_user, self.project_id, exp_data)

        # Verify Stage 1
        s1 = BudgetService.get_project_financial_summary(self.db, self.admin_user, self.project_id)
        self.assertEqual(s1["planned_budget"], 1000000.0)
        self.assertEqual(s1["total_actual_cost"], 200000.0)
        self.assertEqual(s1["remaining_budget"], 800000.0)
        self.assertEqual(s1["budget_utilization_percentage"], 20.0)
        print(" -> Stage 1: Added 2L expense -> Actual=2L, Remaining=8L, Utilization=20% OK")

        # Step C: Update Expense to 3,00,000
        BudgetService.update_actual_expense(self.db, self.admin_user, expense.id, ActualExpenseUpdate(amount=300000.0))

        # Verify Stage 2
        s2 = BudgetService.get_project_financial_summary(self.db, self.admin_user, self.project_id)
        self.assertEqual(s2["planned_budget"], 1000000.0)
        self.assertEqual(s2["total_actual_cost"], 300000.0)
        self.assertEqual(s2["remaining_budget"], 700000.0)
        self.assertEqual(s2["budget_utilization_percentage"], 30.0)
        print(" -> Stage 2: Updated expense to 3L -> Actual=3L, Remaining=7L, Utilization=30% OK")

        # Step D: Delete Expense
        BudgetService.delete_actual_expense(self.db, self.admin_user, expense.id)

        # Verify Stage 3
        s3 = BudgetService.get_project_financial_summary(self.db, self.admin_user, self.project_id)
        self.assertEqual(s3["planned_budget"], 1000000.0)
        self.assertEqual(s3["total_actual_cost"], 0.0)
        self.assertEqual(s3["remaining_budget"], 1000000.0)
        self.assertEqual(s3["budget_utilization_percentage"], 0.0)
        print(" -> Stage 3: Deleted expense -> Actual=0, Remaining=10L, Utilization=0% OK")
        print("[TEST 2 PASSED] Mandatory Financial Calculation Flow Verified.")

    def test_03_rbac_and_project_isolation(self):
        """Test Project Isolation: Accessing unauthorized project returns PermissionError (HTTP 403)."""
        pm_role = self.db.query(Role).filter(Role.name == "Project Manager").first()
        if not pm_role:
            pm_role = Role(id="pm-role-uuid", name="Project Manager", description="Project Manager Role")
            self.db.add(pm_role)
            self.db.commit()

        # Create a non-admin PM user who is NOT assigned to self.project_id
        non_assigned_pm = User(
            id="non-assigned-pm-m11-id",
            email="unauthorized.pm@buildtrack.com",
            full_name="Unauthorized PM User",
            password_hash="fakehash",
            role_id=pm_role.id,
            is_active=True
        )
        existing_pm = self.db.query(User).filter(User.email == "unauthorized.pm@buildtrack.com").first()
        if not existing_pm:
            self.db.add(non_assigned_pm)
            self.db.commit()
            pm_tester = non_assigned_pm
        else:
            pm_tester = existing_pm

        # Verify attempting to access self.project_id (which pm_tester is not assigned to) raises PermissionError
        with self.assertRaises(PermissionError):
            BudgetService.get_project_financial_summary(self.db, pm_tester, self.project_id)
        print("\n[TEST 3 PASSED] Project Security Isolation (HTTP 403) Verified.")

    def test_04_module8_notification_trigger(self):
        """Test Module 8 Notification integration when actual expenses exceed planned budget."""
        allocations = [CategoryAllocationInput(category=c, allocated_amount=10000.0) for c in ["Labor", "Material", "Equipment", "Transportation", "Maintenance", "Administrative"]]
        BudgetService.create_or_update_project_budget(self.db, self.admin_user, self.project_id, ProjectBudgetCreate(overall_budget=60000.0, category_allocations=allocations))

        # Add expense of ₹1,00,000 (exceeds ₹60,000 budget)
        exp_data = ActualExpenseCreate(
            category="Labor",
            amount=100000.0,
            description="Emergency labor payroll",
            expense_date=datetime.now(timezone.utc).strftime("%Y-%m-%d")
        )
        BudgetService.create_actual_expense(self.db, self.admin_user, self.project_id, exp_data)

        # Check notification table
        notif = self.db.query(Notification).filter(Notification.project_id == self.project_id, Notification.category == "Budget Alert").first()
        self.assertIsNotNone(notif)
        self.assertIn("exceeded planned budget", notif.message)
        print("\n[TEST 4 PASSED] Module 8 Budget Overflow Notification Trigger Verified.")

    def test_05_module9_dashboard_integration(self):
        """Test Module 9 PM Dashboard integration with Module 11 live figures."""
        pm_dash = DashboardService.get_pm_dashboard(self.db, self.admin_user, self.project_id)
        self.assertIn("budgetUtilization", pm_dash)
        b_util = pm_dash["budgetUtilization"]
        self.assertIn("totalPlannedBudget", b_util)
        self.assertIn("totalUtilized", b_util)
        self.assertIn("remainingBudget", b_util)
        self.assertIn("utilizationPercentage", b_util)
        print("\n[TEST 5 PASSED] Module 9 Dashboard Live Financial Integration Verified.")

    def test_06_module10_reports_pdf_and_excel_export(self):
        """Test Module 10 PDF and Excel exports consuming live Module 11 data."""
        pdf_bytes = ReportService.export_report_pdf(self.db, self.admin_user, self.project_id, "budget")
        self.assertIsNotNone(pdf_bytes)
        self.assertTrue(len(pdf_bytes) > 0)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

        excel_bytes = ReportService.export_report_excel(self.db, self.admin_user, self.project_id, "budget")
        self.assertIsNotNone(excel_bytes)
        self.assertTrue(len(excel_bytes) > 0)
        print("\n[TEST 6 PASSED] Module 10 PDF and Excel Binary Export Generation Verified.")


if __name__ == "__main__":
    unittest.main()

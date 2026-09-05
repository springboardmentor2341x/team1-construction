import unittest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from main import app
from app.database.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.project import Project
from app.models.milestone import ProjectMilestone
from app.models.site_progress import DailyProgressReport, DelayTracking
from app.models.resource import ResourceModel, ResourceAllocationModel
from app.models.equipment import EquipmentModel
from app.models.workforce import Worker, WorkerProjectAssignment, AttendanceModel
from app.models.procurement import ProcurementRequestModel, PurchaseOrderModel
from app.core.security import create_access_token, get_password_hash


class TestModule10ReportsDocumentation(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Seed roles
        admin_role = cls.db.query(Role).filter(Role.name == "Administrator").first()
        if not admin_role:
            admin_role = Role(name="Administrator", description="System Admin")
            cls.db.add(admin_role)

        pm_role = cls.db.query(Role).filter(Role.name == "Project Manager").first()
        if not pm_role:
            pm_role = Role(name="Project Manager", description="PM Role")
            cls.db.add(pm_role)

        worker_role = cls.db.query(Role).filter(Role.name == "Worker").first()
        if not worker_role:
            worker_role = Role(name="Worker", description="Worker Role")
            cls.db.add(worker_role)

        cls.db.commit()

        # Admin user
        cls.admin_user = cls.db.query(User).filter(User.email == "admin_m10@test.com").first()
        if not cls.admin_user:
            cls.admin_user = User(
                full_name="Admin M10 Tester",
                email="admin_m10@test.com",
                password_hash=get_password_hash("TestPass123!"),
                role_id=admin_role.id,
                is_active=True
            )
            cls.db.add(cls.admin_user)
            cls.db.commit()
            cls.db.refresh(cls.admin_user)

        # PM User
        cls.pm_user = cls.db.query(User).filter(User.email == "pm_m10@test.com").first()
        if not cls.pm_user:
            cls.pm_user = User(
                full_name="PM M10 Tester",
                email="pm_m10@test.com",
                password_hash=get_password_hash("TestPass123!"),
                role_id=pm_role.id,
                is_active=True
            )
            cls.db.add(cls.pm_user)
            cls.db.commit()
            cls.db.refresh(cls.pm_user)

        # Worker User
        cls.worker_user = cls.db.query(User).filter(User.email == "worker_m10@test.com").first()
        if not cls.worker_user:
            cls.worker_user = User(
                full_name="Worker M10 Tester",
                email="worker_m10@test.com",
                password_hash=get_password_hash("TestPass123!"),
                role_id=worker_role.id,
                is_active=True
            )
            cls.db.add(cls.worker_user)
            cls.db.commit()
            cls.db.refresh(cls.worker_user)

        # Assigned Project for PM
        cls.project_assigned = cls.db.query(Project).filter(Project.project_code == "BT-M10-P1").first()
        if not cls.project_assigned:
            cls.project_assigned = Project(
                project_name="M10 Assigned Tower",
                project_code="BT-M10-P1",
                category="Commercial",
                client_name="M10 Client Corp",
                location="Site Zone A",
                description="Test M10 Project",
                status="In Progress",
                estimated_budget=5000000.0,
                start_date="2026-01-01",
                expected_completion_date="2026-12-31",
                project_manager_id=cls.pm_user.id
            )
            cls.db.add(cls.project_assigned)
            cls.db.commit()
            cls.db.refresh(cls.project_assigned)
        else:
            cls.project_assigned.estimated_budget = 5000000.0
            from app.models.budget import ProjectBudget
            pb = cls.db.query(ProjectBudget).filter(ProjectBudget.project_id == cls.project_assigned.id).first()
            if pb:
                pb.overall_budget = 5000000.0
            cls.db.commit()

        # Unassigned Project for PM
        cls.project_unassigned = cls.db.query(Project).filter(Project.project_code == "BT-M10-P2").first()
        if not cls.project_unassigned:
            cls.project_unassigned = Project(
                project_name="M10 Unassigned Bridge",
                project_code="BT-M10-P2",
                category="Infrastructure",
                client_name="City Transit",
                location="Site Zone B",
                description="Test M10 Unassigned Project",
                status="Planning",
                estimated_budget=10000000.0,
                start_date="2026-03-01",
                expected_completion_date="2026-12-31",
                project_manager_id=cls.admin_user.id
            )
            cls.db.add(cls.project_unassigned)
            cls.db.commit()
            cls.db.refresh(cls.project_unassigned)

        # Milestone for assigned project
        if cls.db.query(ProjectMilestone).filter(ProjectMilestone.project_id == cls.project_assigned.id).count() == 0:
            ms1 = ProjectMilestone(project_id=cls.project_assigned.id, milestone_name="Foundation Concrete", description="Pouring foundation", planned_date="2026-06-01", completion_percentage=100, status="Completed")
            ms2 = ProjectMilestone(project_id=cls.project_assigned.id, milestone_name="Framing & Columns", description="Level 1 columns", planned_date="2026-09-01", completion_percentage=50, status="In Progress")
            cls.db.add_all([ms1, ms2])
            cls.db.commit()

        # Vendor & Purchase Order for assigned project
        from app.models.procurement import VendorModel
        vendor = cls.db.query(VendorModel).filter(VendorModel.vendor_id == "VEND-M10").first()
        if not vendor:
            vendor = VendorModel(vendor_id="VEND-M10", vendor_name="M10 Test Vendor", contact_person="Sales Rep", contact_number="+1 555-0199", email="sales@m10vendor.com")
            cls.db.add(vendor)
            cls.db.commit()
            cls.db.refresh(vendor)

        if cls.db.query(PurchaseOrderModel).filter(PurchaseOrderModel.project_id == cls.project_assigned.id).count() == 0:
            po = PurchaseOrderModel(
                purchase_order_id="PO-M10-001",
                vendor_id=vendor.id,
                project_id=cls.project_assigned.id,
                order_date="2026-05-10",
                expected_delivery_date="2026-06-10",
                total_amount=150000.0,
                purchase_order_status="Issued",
                created_by_name="Admin M10 Tester"
            )
            cls.db.add(po)
            cls.db.commit()

        cls.admin_token = create_access_token(cls.admin_user.id, "Administrator")
        cls.pm_token = create_access_token(cls.pm_user.id, "Project Manager")
        cls.worker_token = create_access_token(cls.worker_user.id, "Worker")

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_get_project_progress_report(self):
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get(f"/api/v1/reports/projects/{self.project_assigned.id}/progress", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["project_code"], "BT-M10-P1")
        self.assertEqual(data["total_milestones"], 2)
        self.assertEqual(data["completed_milestones"], 1)

    def test_02_get_resource_utilization_report(self):
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get(f"/api/v1/reports/projects/{self.project_assigned.id}/resources", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("equipment_fleet", data)
        self.assertIn("utilization_rate_percentage", data)

    def test_03_get_workforce_report(self):
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get(f"/api/v1/reports/projects/{self.project_assigned.id}/workforce", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("attendance_rate_percentage", data)
        self.assertIn("assigned_workers", data)

    def test_04_get_procurement_report(self):
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get(f"/api/v1/reports/projects/{self.project_assigned.id}/procurement", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["purchase_orders_count"], 1)
        self.assertEqual(data["purchase_orders_total_amount"], 150000.0)

    def test_05_get_budget_report(self):
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get(f"/api/v1/reports/projects/{self.project_assigned.id}/budget", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["estimated_budget"], 5000000.0)
        self.assertEqual(data["total_purchase_orders_spent"], 150000.0)
        self.assertIn("module_11_notice", data)

    def test_06_unauthorized_project_access_403(self):
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get(f"/api/v1/reports/projects/{self.project_unassigned.id}/progress", headers=headers)
        self.assertEqual(res.status_code, 403)
        self.assertIn("Access denied", res.json()["detail"])

    def test_07_export_pdf_success(self):
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get(f"/api/v1/reports/projects/{self.project_assigned.id}/progress/pdf", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers["content-type"], "application/pdf")
        self.assertTrue(res.content.startswith(b"%PDF"))

    def test_08_export_excel_success(self):
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get(f"/api/v1/reports/projects/{self.project_assigned.id}/progress/excel", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers["content-type"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        self.assertTrue(len(res.content) > 100)


if __name__ == "__main__":
    unittest.main()

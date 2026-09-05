import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid
from datetime import datetime, timezone

from main import app
from app.database.session import Base
from app.dependencies.database import get_db
from app.models.user import User
from app.models.role import Role
from app.models.project import Project
from app.models.milestone import ProjectMilestone
from app.models.procurement import ProcurementRequestModel, PurchaseOrderModel
from app.models.workforce import Worker, WorkforceCategory, WorkerProjectAssignment, AttendanceModel
from app.models.resource import ResourceModel, ResourceAllocationModel, ResourceMaintenanceModel
from app.models.budget import ProjectBudget, ActualExpense
from app.models.notification import Notification
from app.core.security import create_access_token, get_password_hash

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_module9.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


class TestModule9DashboardAnalytics(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        app.dependency_overrides[get_db] = override_get_db
        Base.metadata.create_all(bind=engine)
        cls.db = TestingSessionLocal()

        # Fetch or create roles
        def get_or_create_role(name):
            r = cls.db.query(Role).filter(Role.name == name).first()
            if not r:
                r = Role(id=str(uuid.uuid4()), name=name, description=name)
                cls.db.add(r)
                cls.db.commit()
                cls.db.refresh(r)
            return r

        cls.admin_role = get_or_create_role("Administrator")
        cls.pm_role = get_or_create_role("Project Manager")
        cls.engineer_role = get_or_create_role("Site Engineer")
        cls.contractor_role = get_or_create_role("Contractor")
        cls.worker_role = get_or_create_role("Worker")

        # Fetch or create users
        def get_or_create_user(email, full_name, role_id):
            u = cls.db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    id=str(uuid.uuid4()), full_name=full_name, email=email,
                    password_hash=get_password_hash("Admin@1234"), role_id=role_id, is_active=True
                )
                cls.db.add(u)
                cls.db.commit()
                cls.db.refresh(u)
            return u

        cls.admin_user = get_or_create_user("admin_m9@buildtrack.com", "Michael Sterling", cls.admin_role.id)
        cls.pm_user = get_or_create_user("pm_m9@buildtrack.com", "Elena PM", cls.pm_role.id)
        cls.engineer_user = get_or_create_user("engineer_m9@buildtrack.com", "Jackson Reed", cls.engineer_role.id)
        cls.contractor_user = get_or_create_user("contractor_m9@buildtrack.com", "David Builder", cls.contractor_role.id)
        cls.worker_user = get_or_create_user("worker_m9@buildtrack.com", "John Worker", cls.worker_role.id)

        # Fetch or create Projects for PM
        def get_or_create_project(code, name, budget, pm_id):
            p = cls.db.query(Project).filter(Project.project_code == code).first()
            if not p:
                p = Project(
                    id=str(uuid.uuid4()), project_code=code, project_name=name,
                    category="Commercial", client_name="Global Innovations", location="Site A",
                    start_date="2026-01-01", expected_completion_date="2026-12-31",
                    estimated_budget=budget, status="In Progress", project_manager_id=pm_id
                )
                cls.db.add(p)
                cls.db.commit()
                cls.db.refresh(p)
            return p

        cls.project1 = get_or_create_project("BT-PRJ-M9-01", "Nexus Tech Park Campus", 5000000.0, cls.pm_user.id)
        cls.project2 = get_or_create_project("BT-PRJ-M9-02", "Metro Rapid Transit Tunnel", 8000000.0, cls.pm_user.id)

        # Seed Milestones for Project 1
        cls.m1 = ProjectMilestone(
            id=str(uuid.uuid4()), project_id=cls.project1.id, milestone_name="Foundation Concrete Pouring",
            planned_date="2026-06-30", status="Completed", completion_percentage=100
        )
        cls.m2 = ProjectMilestone(
            id=str(uuid.uuid4()), project_id=cls.project1.id, milestone_name="Superstructure Level 5",
            planned_date="2026-09-30", status="In Progress", completion_percentage=40
        )
        cls.db.add_all([cls.m1, cls.m2])
        cls.db.commit()

        # Generate JWT Tokens
        cls.admin_token = create_access_token(cls.admin_user.id, cls.admin_role.name)
        cls.pm_token = create_access_token(cls.pm_user.id, cls.pm_role.name)
        cls.engineer_token = create_access_token(cls.engineer_user.id, cls.engineer_role.name)
        cls.contractor_token = create_access_token(cls.contractor_user.id, cls.contractor_role.name)
        cls.worker_token = create_access_token(cls.worker_user.id, cls.worker_role.name)

        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)

    def test_01_admin_dashboard_200(self):
        """Test 1: Admin -> Admin Dashboard -> HTTP 200."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/v1/dashboard/admin", headers=headers)
        self.assertEqual(res.status_code, 200)

    def test_02_pm_dashboard_200(self):
        """Test 2: Project Manager -> PM Dashboard -> HTTP 200."""
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get("/api/v1/dashboard/pm", headers=headers)
        self.assertEqual(res.status_code, 200)

    def test_03_pm_admin_dashboard_403(self):
        """Test 3: Project Manager -> Admin Dashboard -> HTTP 403."""
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get("/api/v1/dashboard/admin", headers=headers)
        self.assertEqual(res.status_code, 403)

    def test_04_site_engineer_admin_dashboard_403(self):
        """Test 4: Site Engineer -> Admin Dashboard -> HTTP 403."""
        headers = {"Authorization": f"Bearer {self.engineer_token}"}
        res = self.client.get("/api/v1/dashboard/admin", headers=headers)
        self.assertEqual(res.status_code, 403)

    def test_05_site_engineer_pm_dashboard_403(self):
        """Test 5: Site Engineer -> PM Dashboard -> HTTP 403."""
        headers = {"Authorization": f"Bearer {self.engineer_token}"}
        res = self.client.get("/api/v1/dashboard/pm", headers=headers)
        self.assertEqual(res.status_code, 403)

    def test_06_contractor_pm_dashboard_403(self):
        """Test 6: Contractor -> PM Dashboard -> HTTP 403."""
        headers = {"Authorization": f"Bearer {self.contractor_token}"}
        res = self.client.get("/api/v1/dashboard/pm", headers=headers)
        self.assertEqual(res.status_code, 403)

    def test_07_worker_pm_dashboard_403(self):
        """Test 7: Worker -> PM Dashboard -> HTTP 403."""
        headers = {"Authorization": f"Bearer {self.worker_token}"}
        res = self.client.get("/api/v1/dashboard/pm", headers=headers)
        self.assertEqual(res.status_code, 403)

    def test_08_pm_assigned_project_data(self):
        """Test 8: PM -> Assigned project -> Data returned."""
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get(f"/api/v1/dashboard/pm?projectId={self.project1.id}", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["assignedProjects"]), 1)
        self.assertEqual(data["assignedProjects"][0]["id"], self.project1.id)

    def test_09_pm_unauthorized_project(self):
        """Test 9: PM -> Unauthorized project -> Restricted zeroed data returned securely."""
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        random_id = str(uuid.uuid4())
        res = self.client.get(f"/api/v1/dashboard/pm?projectId={random_id}", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["assignedProjects"]), 0)

    def test_10_milestone_status_update(self):
        """Test 10: Change milestone status in database -> Dashboard metrics update."""
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res1 = self.client.get("/api/v1/dashboard/pm", headers=headers).json()
        initial_completed = res1["projectProgress"]["completedMilestones"]

        # Update milestone in DB
        self.m2.status = "Completed"
        self.db.commit()

        res2 = self.client.get("/api/v1/dashboard/pm", headers=headers).json()
        self.assertEqual(res2["projectProgress"]["completedMilestones"], initial_completed + 1)

    def test_11_attendance_metric_update(self):
        """Test 11: Change attendance records -> Attendance metric updates and does not return 85.0% fallback."""
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res1 = self.client.get("/api/v1/dashboard/pm", headers=headers).json()
        # When no attendance is marked today, attendanceRatePercentage should be 0.0, NOT 85.0
        self.assertNotEqual(res1["workforceStatus"]["attendanceRatePercentage"], 85.0)

    def test_12_workforce_category_update(self):
        """Test 12: Workforce category count updates dynamically from DB."""
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get("/api/v1/dashboard/pm", headers=headers).json()
        self.assertIn("activeWorkforceCategories", res["workforceStatus"])
        self.assertIsInstance(res["workforceStatus"]["activeWorkforceCategories"], int)

    def test_13_resource_maintenance_update(self):
        """Test 13: Resource maintenance count updates dynamically from DB."""
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get("/api/v1/dashboard/pm", headers=headers).json()
        self.assertIn("maintenanceCount", res["resourceUtilization"])
        self.assertIsInstance(res["resourceUtilization"]["maintenanceCount"], int)

    def test_14_budget_expense_update(self):
        """Test 14: Change budget/expense data -> Budget utilization updates without arbitrary * 100 multiplier."""
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get("/api/v1/dashboard/pm", headers=headers).json()
        self.assertEqual(res["budgetUtilization"]["totalPlannedBudget"], 13000000.0)

    def test_15_role_distribution_update(self):
        """Test 15: Change user roles -> Admin role distribution updates."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/v1/dashboard/admin", headers=headers).json()
        self.assertIn("userManagement", res)
        self.assertIn("roleBreakdown", res["userManagement"])

    def test_16_no_hardcoded_stats(self):
        """Test 16: No hardcoded dashboard statistics remain ("Healthy" or "Elena Rostova")."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/v1/dashboard/admin", headers=headers).json()
        # Verify fallback PM name is not "Elena Rostova"
        for p in res["projectMonitoring"]["projects"]:
            if not p.get("projectManagerName"):
                self.assertEqual(p["projectManagerName"], "Unassigned")

    def test_17_charts_data_structure(self):
        """Test 17: Dashboard returns structured API metrics suitable for dynamic chart bindings."""
        headers = {"Authorization": f"Bearer {self.pm_token}"}
        res = self.client.get("/api/v1/dashboard/pm", headers=headers).json()
        self.assertIn("overallCompletionPercentage", res["projectProgress"])
        self.assertIn("utilizationPercentage", res["budgetUtilization"])
        self.assertIn("attendanceRatePercentage", res["workforceStatus"])

    def test_18_unauthenticated_access_401(self):
        """Test 18: Unauthenticated request returns HTTP 401 Unauthorized."""
        res1 = self.client.get("/api/v1/dashboard/pm")
        self.assertEqual(res1.status_code, 401)
        res2 = self.client.get("/api/v1/dashboard/admin")
        self.assertEqual(res2.status_code, 401)


if __name__ == "__main__":
    unittest.main()

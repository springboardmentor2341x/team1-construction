import unittest
from fastapi.testclient import TestClient
from app.database.session import SessionLocal, Base, engine
from app.models.user import User
from app.models.role import Role
from app.models.project import Project
from app.models.assignments import ProjectSiteEngineer, ProjectContractor
from app.models.notification import Notification
from app.models.task import TaskModel
from app.core.security import create_access_token
from main import app
from app.services.notification_service import NotificationService


class TestModule8NotificationSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Fetch test users from seeded database
        cls.admin_user = cls.db.query(User).filter(User.email == "admin@buildtrack.com").first()
        cls.pm_user = cls.db.query(User).filter(User.email == "pm@buildtrack.com").first()
        cls.engineer_user = cls.db.query(User).filter(User.email == "engineer@buildtrack.com").first()
        cls.contractor_user = cls.db.query(User).filter(User.email == "contractor@buildtrack.com").first()
        cls.worker_user = cls.db.query(User).filter(User.email == "worker@buildtrack.com").first()
        cls.client_user = cls.db.query(User).filter(User.email == "client@buildtrack.com").first()

        # JWT tokens
        cls.admin_token = create_access_token(cls.admin_user.id, cls.admin_user.role_rel.name)
        cls.pm_token = create_access_token(cls.pm_user.id, cls.pm_user.role_rel.name)
        cls.engineer_token = create_access_token(cls.engineer_user.id, cls.engineer_user.role_rel.name)
        cls.contractor_token = create_access_token(cls.contractor_user.id, cls.contractor_user.role_rel.name)
        cls.worker_token = create_access_token(cls.worker_user.id, cls.worker_user.role_rel.name)
        cls.client_token = create_access_token(cls.client_user.id, cls.client_user.role_rel.name)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def setUp(self):
        # Clean test notifications before each test
        self.db.query(Notification).delete()
        self.db.commit()

    def test_01_create_notification_service(self):
        """Test NotificationService creation, recipient targeting, and field validation."""
        n = NotificationService.create_notification(
            db=self.db,
            user_id=self.engineer_user.id,
            title="Safety Gear Required",
            message="Hard hats required in Sector 4",
            type="ATTENDANCE",
            category="Safety"
        )
        self.assertIsNotNone(n)
        self.assertEqual(n.user_id, self.engineer_user.id)
        self.assertEqual(n.type, "ATTENDANCE")
        self.assertFalse(n.is_read)

        # Query via service
        notifs = NotificationService.get_user_notifications(self.db, user_id=self.engineer_user.id)
        self.assertEqual(len(notifs), 1)
        self.assertEqual(notifs[0].title, "Safety Gear Required")

    def test_02_user_security_and_rbac_isolation(self):
        """Verify strict user isolation (User A cannot view or modify User B's notifications)."""
        # Create notification for Engineer
        n_eng = NotificationService.create_notification(
            db=self.db,
            user_id=self.engineer_user.id,
            title="Engineer confidential alert",
            message="Only for engineer",
            type="SYSTEM"
        )

        # 1. Contractor tries to fetch notifications
        res = self.client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.contractor_token}"})
        self.assertEqual(res.status_code, 200)
        items = res.json()
        # Contractor must NOT see engineer's notification
        eng_notif_ids = [item["id"] for item in items if item["id"] == n_eng.id]
        self.assertEqual(len(eng_notif_ids), 0)

        # 2. Contractor tries to access engineer's notification detail directly
        res = self.client.get(f"/api/v1/notifications/{n_eng.id}", headers={"Authorization": f"Bearer {self.contractor_token}"})
        self.assertEqual(res.status_code, 404)

        # 3. Contractor tries to mark engineer's notification as read
        res = self.client.patch(f"/api/v1/notifications/{n_eng.id}/read", headers={"Authorization": f"Bearer {self.contractor_token}"})
        self.assertEqual(res.status_code, 404)

        # 4. Verify engineer can access their own notification
        res = self.client.get(f"/api/v1/notifications/{n_eng.id}", headers={"Authorization": f"Bearer {self.engineer_token}"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["title"], "Engineer confidential alert")

    def test_03_project_isolation(self):
        """Verify notifications are emitted only to users relevant to that project."""
        p1 = self.db.query(Project).filter(Project.project_code == "BT-PRJ-2026-01").first()

        # Update Project 1
        res = self.client.put(
            f"/api/v1/projects/{p1.id}",
            json={"projectName": "Nexus Tech Park Campus Revamped"},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(res.status_code, 200)

        # Check PM (assigned to Project 1) receives notification
        res_pm = self.client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.pm_token}"})
        self.assertEqual(res_pm.status_code, 200)
        pm_notifs = [n for n in res_pm.json() if n["type"] == "PROJECT_UPDATE"]
        self.assertGreaterEqual(len(pm_notifs), 1)

    def test_04_task_assignment_notification_flow(self):
        """Verify Task Assignment emits notification strictly to assigned user."""
        p1 = self.db.query(Project).filter(Project.project_code == "BT-PRJ-2026-01").first()

        task_data = {
            "title": "Install Reinforcement Mesh B",
            "description": "Install high-tensile steel mesh",
            "project": p1.project_name,
            "assignedTo": self.engineer_user.id,
            "dueDate": "2026-10-15",
            "priority": "High"
        }

        res = self.client.post("/api/v1/tasks", json=task_data, headers={"Authorization": f"Bearer {self.pm_token}"})
        self.assertEqual(res.status_code, 201)

        # Engineer must receive TASK_ASSIGNMENT notification
        res_eng = self.client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.engineer_token}"})
        self.assertEqual(res_eng.status_code, 200)
        eng_task_notifs = [n for n in res_eng.json() if n["type"] == "TASK_ASSIGNMENT"]
        self.assertEqual(len(eng_task_notifs), 1)
        self.assertIn("Install Reinforcement Mesh B", eng_task_notifs[0]["title"])

        # Contractor must NOT receive engineer's task assignment notification
        res_con = self.client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.contractor_token}"})
        self.assertEqual(res_con.status_code, 200)
        con_task_notifs = [n for n in res_con.json() if n["type"] == "TASK_ASSIGNMENT"]
        self.assertEqual(len(con_task_notifs), 0)

    def test_05_procurement_notification_flow(self):
        """Verify Procurement request creation & approval notification flow."""
        p1 = self.db.query(Project).filter(Project.project_code == "BT-PRJ-2026-01").first()

        req_data = {
            "projectId": p1.id,
            "categoryName": "Raw Materials",
            "purpose": "Concrete pouring batch 5",
            "priority": "High",
            "items": [
                {
                    "itemDescription": "Portland Cement Grade 53",
                    "categoryName": "Raw Materials",
                    "requiredQuantity": 100.0,
                    "unit": "Bags",
                    "requiredDate": "2026-10-01"
                }
            ]
        }

        # Engineer creates procurement request
        res = self.client.post("/api/v1/procurement/requests", json=req_data, headers={"Authorization": f"Bearer {self.engineer_token}"})
        self.assertEqual(res.status_code, 201)
        pr_id = res.json()["id"]

        # PM receives PROCUREMENT approval alert
        res_pm = self.client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.pm_token}"})
        self.assertEqual(res_pm.status_code, 200)
        proc_notifs = [n for n in res_pm.json() if n["type"] == "PROCUREMENT"]
        self.assertGreaterEqual(len(proc_notifs), 1)

        # PM approves procurement request
        res_app = self.client.post(f"/api/v1/procurement/requests/{pr_id}/approve", json={"remarks": "Approved for site work"}, headers={"Authorization": f"Bearer {self.pm_token}"})
        self.assertEqual(res_app.status_code, 200)

        # Engineer (requester) receives approval notification
        res_eng = self.client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.engineer_token}"})
        self.assertEqual(res_eng.status_code, 200)
        app_notifs = [n for n in res_eng.json() if n["type"] == "PROCUREMENT" and "Approved" in n["title"]]
        self.assertEqual(len(app_notifs), 1)

    def test_06_unread_count_and_mark_read_flow(self):
        """Verify unread-count, mark-as-read, and mark-all-as-read APIs."""
        NotificationService.create_notification(db=self.db, user_id=self.engineer_user.id, title="Alert 1", type="SYSTEM")
        NotificationService.create_notification(db=self.db, user_id=self.engineer_user.id, title="Alert 2", type="SYSTEM")

        # Check unread count
        res_cnt = self.client.get("/api/v1/notifications/unread-count", headers={"Authorization": f"Bearer {self.engineer_token}"})
        self.assertEqual(res_cnt.status_code, 200)
        self.assertEqual(res_cnt.json()["unread_count"], 2)

        # Get list & mark first as read
        notifs = self.client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.engineer_token}"}).json()
        first_id = notifs[0]["id"]

        res_read = self.client.patch(f"/api/v1/notifications/{first_id}/read", headers={"Authorization": f"Bearer {self.engineer_token}"})
        self.assertEqual(res_read.status_code, 200)
        self.assertTrue(res_read.json()["isRead"])

        # Unread count should now be 1
        res_cnt2 = self.client.get("/api/v1/notifications/unread-count", headers={"Authorization": f"Bearer {self.engineer_token}"})
        self.assertEqual(res_cnt2.json()["unread_count"], 1)

        # Mark all as read
        res_all = self.client.patch("/api/v1/notifications/read-all", headers={"Authorization": f"Bearer {self.engineer_token}"})
        self.assertEqual(res_all.status_code, 200)

        # Unread count should be 0
        res_cnt3 = self.client.get("/api/v1/notifications/unread-count", headers={"Authorization": f"Bearer {self.engineer_token}"})
        self.assertEqual(res_cnt3.json()["unread_count"], 0)


if __name__ == "__main__":
    unittest.main()

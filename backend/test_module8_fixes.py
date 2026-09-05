import unittest
import uuid
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.database.session import SessionLocal
from app.models.user import User
from app.models.project import Project
from app.models.notification import Notification
from app.models.task import TaskModel
from app.models.milestone import ProjectMilestone
from app.models.workforce import Worker, AttendanceModel
from app.models.budget import ProjectBudget, ActualExpense
from app.core.security import create_access_token
from main import app
from app.services.notification_service import NotificationService
from app.services.workforce_service import WorkforceService
from app.services.budget_service import BudgetService


class TestModule8Fixes(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Retrieve test users
        cls.admin_user = cls.db.query(User).filter(User.email == "admin@buildtrack.com").first()
        cls.pm_user = cls.db.query(User).filter(User.email == "pm@buildtrack.com").first()
        cls.engineer_user = cls.db.query(User).filter(User.email == "engineer@buildtrack.com").first()
        cls.contractor_user = cls.db.query(User).filter(User.email == "contractor@buildtrack.com").first()

        # Generate access tokens
        cls.admin_token = create_access_token(cls.admin_user.id, cls.admin_user.role_rel.name)
        cls.pm_token = create_access_token(cls.pm_user.id, cls.pm_user.role_rel.name)
        cls.engineer_token = create_access_token(cls.engineer_user.id, cls.engineer_user.role_rel.name)
        cls.contractor_token = create_access_token(cls.contractor_user.id, cls.contractor_user.role_rel.name)

        # Get primary project
        cls.project = cls.db.query(Project).filter(Project.project_code == "BT-PRJ-2026-01").first()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def setUp(self):
        # Clean notifications before each test
        self.db.rollback()
        self.db.query(Notification).delete()
        self.db.commit()

    def test_01_automatic_deadline_scheduler_execution(self):
        """Test 1 – Deadline: Verify NotificationService deadline check logic generates DB records."""
        # Create an overdue milestone for the project
        ms = ProjectMilestone(
            project_id=self.project.id,
            milestone_name="Test Overdue Milestone",
            description="Testing automatic deadline notification",
            planned_date="2020-01-01",
            status="In Progress"
        )
        self.db.add(ms)
        self.db.commit()

        # Run deadline check engine
        count = NotificationService.check_and_generate_deadline_notifications(self.db)
        self.assertGreaterEqual(count, 1)

        # Verify PM received DEADLINE notification
        pm_notifs = NotificationService.get_user_notifications(self.db, user_id=self.pm_user.id)
        deadline_notifs = [n for n in pm_notifs if n.type == "DEADLINE" and "Test Overdue Milestone" in n.title]
        self.assertGreaterEqual(len(deadline_notifs), 1)

    def test_02_workforce_attendance_notification(self):
        """Test 2 – Attendance: Verify Absent/Late/Review status via workforce service generates notifications."""
        worker = self.db.query(Worker).first()
        self.assertIsNotNone(worker)

        # Cleanup test attendance record for worker
        test_date = "2026-12-25"
        self.db.query(AttendanceModel).filter(
            AttendanceModel.worker_id == worker.id,
            AttendanceModel.date == test_date
        ).delete()
        self.db.commit()

        # Create attendance record with 'Absent' status via WorkforceService
        wf_service = WorkforceService(self.db)
        from app.schemas.workforce import AttendanceCreate
        att_req = AttendanceCreate(
            workerId=worker.id,
            projectId=self.project.id,
            date=test_date,
            status="Absent",
            remarks="Unexcused leave test"
        )
        res = wf_service.create_attendance(att_req, current_user=self.engineer_user)
        self.assertIsNotNone(res)

        # Verify supervisor (PM) received ATTENDANCE notification
        pm_notifs = NotificationService.get_user_notifications(self.db, user_id=self.pm_user.id)
        att_notifs = [n for n in pm_notifs if n.type == "ATTENDANCE" and worker.worker_name in n.title]
        self.assertGreaterEqual(len(att_notifs), 1)

    def test_03_task_assignment_notification(self):
        """Test 3 – Task Assignment: Create task assigned to user and verify receipt."""
        task_data = {
            "title": "Verify Concrete Curing",
            "description": "Check slump test and curing compound",
            "project": self.project.project_name,
            "projectId": self.project.id,
            "assignedTo": self.engineer_user.id,
            "assignedToId": self.engineer_user.id,
            "dueDate": "2026-10-20",
            "priority": "High"
        }
        res = self.client.post("/api/v1/tasks", json=task_data, headers={"Authorization": f"Bearer {self.pm_token}"})
        self.assertEqual(res.status_code, 201)

        # Engineer should have 1 task assignment notification
        eng_notifs = NotificationService.get_user_notifications(self.db, user_id=self.engineer_user.id)
        t_notifs = [n for n in eng_notifs if n.type == "TASK_ASSIGNMENT" and "Verify Concrete Curing" in n.title]
        self.assertEqual(len(t_notifs), 1)

    def test_04_task_reassignment_notification(self):
        """Test 4 – Task Reassignment: Reassign Task from User A (Engineer) to User B (Contractor)."""
        # 1. Create task assigned to Engineer
        task_data = {
            "title": "Formwork Assembly Grid 4",
            "description": "Assemble perimeter formwork",
            "project": self.project.project_name,
            "projectId": self.project.id,
            "assignedTo": self.engineer_user.id,
            "assignedToId": self.engineer_user.id,
            "dueDate": "2026-10-25"
        }
        res = self.client.post("/api/v1/tasks", json=task_data, headers={"Authorization": f"Bearer {self.pm_token}"})
        self.assertEqual(res.status_code, 201)
        task_id = res.json()["id"]

        # Clean notifications generated during creation
        self.db.query(Notification).delete()
        self.db.commit()

        # 2. Reassign task to Contractor
        update_data = {
            "assignedToId": self.contractor_user.id,
            "assignedTo": self.contractor_user.full_name
        }
        res_patch = self.client.patch(f"/api/v1/tasks/{task_id}", json=update_data, headers={"Authorization": f"Bearer {self.pm_token}"})
        self.assertEqual(res_patch.status_code, 200)

        # 3. Contractor (new assigned user) must receive Task Reassigned notification
        con_notifs = NotificationService.get_user_notifications(self.db, user_id=self.contractor_user.id)
        reassign_notifs = [n for n in con_notifs if n.type == "TASK_ASSIGNMENT" and "Task Reassigned" in n.title]
        self.assertEqual(len(reassign_notifs), 1)

    def test_05_task_status_notification(self):
        """Test 5 – Task Status: Update task status and verify notification to assigned user."""
        task = TaskModel(
            title="Inspect Scaffolding Tier 3",
            description="Safety check on tie-backs",
            project=self.project.project_name,
            project_id=self.project.id,
            assigned_to=self.engineer_user.full_name,
            assigned_to_id=self.engineer_user.id,
            due_date="2026-10-30",
            status="Open",
            priority="Medium"
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)

        # PM updates task status to 'Completed'
        res_patch = self.client.patch(
            f"/api/v1/tasks/{task.id}",
            json={"status": "Completed"},
            headers={"Authorization": f"Bearer {self.pm_token}"}
        )
        self.assertEqual(res_patch.status_code, 200)

        # Assigned engineer receives Task Status Updated notification
        eng_notifs = NotificationService.get_user_notifications(self.db, user_id=self.engineer_user.id)
        status_notifs = [n for n in eng_notifs if n.type == "TASK_ASSIGNMENT" and "Task Status Updated" in n.title]
        self.assertEqual(len(status_notifs), 1)

    def test_06_budget_overrun_notification(self):
        """Test 6 – Budget Overrun: Add expenses exceeding planned budget and verify notification."""
        budget = BudgetService.get_or_create_project_budget(self.db, self.admin_user, self.project.id)
        # Set small planned budget
        budget.overall_budget = 1000.0
        self.db.commit()

        # Add expense exceeding planned budget via BudgetService
        from app.schemas.budget import ActualExpenseCreate
        exp_data = ActualExpenseCreate(
            category="Material",
            amount=5000.0,
            description="Emergency concrete batch",
            expense_date="2026-09-05"
        )
        BudgetService.create_actual_expense(self.db, self.admin_user, self.project.id, exp_data)

        # Authorized PM & Admin receive Budget Overrun Alert
        pm_notifs = NotificationService.get_user_notifications(self.db, user_id=self.pm_user.id)
        budget_notifs = [n for n in pm_notifs if n.category == "Budget Alert" and "Budget Overrun" in n.title]
        self.assertGreaterEqual(len(budget_notifs), 1)

    def test_07_task_navigation_reference_data(self):
        """Test 7 – Task Navigation: Verify created task notification contains correct reference_module and reference_id."""
        task_data = {
            "title": "Core Drilling Column C3",
            "description": "Test core strength",
            "project": self.project.project_name,
            "projectId": self.project.id,
            "assignedTo": self.engineer_user.id,
            "assignedToId": self.engineer_user.id,
            "dueDate": "2026-10-30"
        }
        res = self.client.post("/api/v1/tasks", json=task_data, headers={"Authorization": f"Bearer {self.pm_token}"})
        self.assertEqual(res.status_code, 201)
        task_id = res.json()["id"]

        # Fetch notification via API for engineer
        res_notifs = self.client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.engineer_token}"})
        self.assertEqual(res_notifs.status_code, 200)
        task_notif = next(n for n in res_notifs.json() if n["referenceId"] == task_id)

        self.assertEqual(task_notif["referenceModule"], "tasks")
        self.assertEqual(task_notif["referenceId"], task_id)

    def test_08_security_user_and_project_isolation(self):
        """Test 8 – Security: Verify User A cannot access User B's notifications and project isolation holds."""
        # Create notification for PM
        n_pm = NotificationService.create_notification(
            self.db,
            user_id=self.pm_user.id,
            title="PM Secret Notification",
            type="SYSTEM"
        )

        # Contractor attempts to view PM's notification detail
        res = self.client.get(f"/api/v1/notifications/{n_pm.id}", headers={"Authorization": f"Bearer {self.contractor_token}"})
        self.assertEqual(res.status_code, 404)

        # Contractor attempts to mark PM's notification as read
        res_patch = self.client.patch(f"/api/v1/notifications/{n_pm.id}/read", headers={"Authorization": f"Bearer {self.contractor_token}"})
        self.assertEqual(res_patch.status_code, 404)


if __name__ == "__main__":
    unittest.main()

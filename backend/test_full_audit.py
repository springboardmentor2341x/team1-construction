import sys
import unittest
from fastapi.testclient import TestClient
from main import app
from app.database.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.project import Project
from app.models.milestone import ProjectMilestone
from app.models.schedule import ProjectSchedule
from app.models.assignments import ProjectContractor, ContractorWorker
from app.core.security import create_access_token, get_password_hash

class TestModule1And2FullAudit(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Retrieve seeded users
        cls.admin = cls.db.query(User).filter(User.email == "admin@buildtrack.com").first()
        cls.pm = cls.db.query(User).filter(User.email == "pm@buildtrack.com").first()
        cls.engineer = cls.db.query(User).filter(User.email == "engineer@buildtrack.com").first()
        cls.contractor = cls.db.query(User).filter(User.email == "contractor@buildtrack.com").first()
        cls.worker = cls.db.query(User).filter(User.email == "worker@buildtrack.com").first()

        # Generate tokens
        cls.admin_token = create_access_token(subject=cls.admin.id, role="Administrator")
        cls.contractor_token = create_access_token(subject=cls.contractor.id, role="Contractor")
        cls.worker_token = create_access_token(subject=cls.worker.id, role="Worker")

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    # --- MODULE 1 TESTS ---

    def test_01_active_user_api_access(self):
        """Active user + valid JWT -> successful API access (HTTP 200)."""
        response = self.client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "admin@buildtrack.com")

    def test_02_deactivated_user_jwt_rejection(self):
        """Deactivated user + existing JWT -> HTTP 403 Forbidden."""
        # 1. Create temporary worker user
        worker_role = self.db.query(Role).filter(Role.name == "Worker").first()
        temp_user = User(
            full_name="Temp Worker",
            email="temp_worker_deactivate@buildtrack.com",
            password_hash=get_password_hash("Admin@1234"),
            role_id=worker_role.id,
            is_active=True
        )
        self.db.add(temp_user)
        self.db.commit()
        self.db.refresh(temp_user)

        # 2. Issue valid JWT token while active
        token = create_access_token(subject=temp_user.id, role="Worker")
        res_before = self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res_before.status_code, 200)

        # 3. Deactivate user account in DB
        temp_user.is_active = False
        self.db.commit()

        # 4. Attempt API request using previously issued JWT
        res_after = self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res_after.status_code, 403)
        self.assertIn("deactivated", res_after.json()["detail"].lower())

        # 5. Reactivate user and verify restoration
        temp_user.is_active = True
        self.db.commit()
        res_reactivated = self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res_reactivated.status_code, 200)

        # Cleanup
        self.db.delete(temp_user)
        self.db.commit()

    # --- MODULE 2 CONTRACTOR-WORKER TESTS ---

    def test_03_contractor_worker_assignment_lifecycle(self):
        """Test complete Contractor -> Worker assignment, listing, duplicate rejection, and removal."""
        contractor_id = self.contractor.id
        worker_id = self.worker.id

        # Clean any existing assignment for test idempotency
        self.db.query(ContractorWorker).filter(ContractorWorker.contractor_id == contractor_id, ContractorWorker.worker_id == worker_id).delete()
        self.db.commit()

        # 1. Assign worker
        assign_res = self.client.post(
            f"/api/v1/contractors/{contractor_id}/workers",
            json={"workerId": worker_id},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(assign_res.status_code, 201)
        self.assertEqual(assign_res.json()["workerId"], worker_id)

        # 2. List contractor workers
        list_res = self.client.get(
            f"/api/v1/contractors/{contractor_id}/workers",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(list_res.status_code, 200)
        worker_ids = [w["workerId"] for w in list_res.json()]
        self.assertIn(worker_id, worker_ids)

        # 3. Prevent duplicate assignment
        dup_res = self.client.post(
            f"/api/v1/contractors/{contractor_id}/workers",
            json={"workerId": worker_id},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(dup_res.status_code, 400)
        self.assertIn("already assigned", dup_res.json()["detail"].lower())

        # 4. Remove worker
        del_res = self.client.delete(
            f"/api/v1/contractors/{contractor_id}/workers/{worker_id}",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(del_res.status_code, 204)

        # 5. Verify removal
        list_res_2 = self.client.get(
            f"/api/v1/contractors/{contractor_id}/workers",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        worker_ids_2 = [w["workerId"] for w in list_res_2.json()]
        self.assertNotIn(worker_id, worker_ids_2)

    def test_04_invalid_contractor_or_worker_errors(self):
        """Test proper error responses for invalid contractor/worker assignments."""
        # Invalid contractor ID
        res1 = self.client.get(
            "/api/v1/contractors/non-existent-id/workers",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(res1.status_code, 404)

        # Assign non-worker user (e.g. Admin user) as worker
        res2 = self.client.post(
            f"/api/v1/contractors/{self.contractor.id}/workers",
            json={"workerId": self.admin.id},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(res2.status_code, 400)

    def test_05_unauthorized_contractor_worker_access(self):
        """Worker role cannot manage contractor workers."""
        res = self.client.post(
            f"/api/v1/contractors/{self.contractor.id}/workers",
            json={"workerId": self.worker.id},
            headers={"Authorization": f"Bearer {self.worker_token}"}
        )
        self.assertEqual(res.status_code, 403)

    # --- MODULE 2 PROJECT CLOSURE & IMMUTABILITY TESTS ---

    def test_06_project_closure_and_immutability(self):
        """Test pre-closure validation and closed-project immutability."""
        # 1. Create a test project
        import uuid
        p_code = f"BT-AUDIT-{uuid.uuid4().hex[:6]}"
        create_res = self.client.post(
            "/api/v1/projects",
            json={
                "projectName": "Test Audit Project",
                "projectCode": p_code,
                "category": "Commercial",
                "clientName": "Test Client",
                "location": "Test Site",
                "estimatedBudget": 500000.0,
                "startDate": "2026-08-01",
                "expectedCompletionDate": "2026-12-31"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(create_res.status_code, 201)
        project_id = create_res.json()["id"]

        # 2. Add an incomplete milestone
        m1_res = self.client.post(
            "/api/v1/milestones",
            json={
                "projectId": project_id,
                "milestoneName": "Incomplete Test Milestone",
                "plannedDate": "2026-09-01",
                "completionPercentage": 50,
                "status": "In Progress"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(m1_res.status_code, 201)
        milestone_id = m1_res.json()["id"]

        # Add a schedule phase
        s1_res = self.client.post(
            "/api/v1/schedules",
            json={
                "projectId": project_id,
                "phaseName": "Phase 1 Execution",
                "plannedStartDate": "2026-08-01",
                "plannedEndDate": "2026-08-31",
                "estimatedDurationDays": 30
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(s1_res.status_code, 201)
        schedule_id = s1_res.json()["id"]

        # 3. Attempt to close project while milestone is incomplete -> Expect HTTP 400 rejection
        close_fail_res = self.client.post(
            f"/api/v1/projects/{project_id}/close",
            json={"reason": "Project completed early"},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(close_fail_res.status_code, 400)
        self.assertIn("incomplete milestones", close_fail_res.json()["detail"].lower())

        # 4. Update milestone to 100% complete
        m1_update_res = self.client.put(
            f"/api/v1/milestones/{milestone_id}",
            json={"completionPercentage": 100, "status": "Completed"},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(m1_update_res.status_code, 200)

        # 5. Now close project -> Expect HTTP 200 Success
        close_pass_res = self.client.post(
            f"/api/v1/projects/{project_id}/close",
            json={"reason": "All milestones finished"},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(close_pass_res.status_code, 200)
        self.assertEqual(close_pass_res.json()["status"], "Closed")

        # 6. Verify IMMUTABILITY on closed project
        # a) Modify project details
        mod_proj_res = self.client.put(
            f"/api/v1/projects/{project_id}",
            json={"projectName": "Closed Project Modified Name"},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(mod_proj_res.status_code, 400)

        # b) Modify assignments
        mod_assign_res = self.client.post(
            f"/api/v1/projects/{project_id}/assign-engineer",
            json={"userId": self.engineer.id},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(mod_assign_res.status_code, 400)

        # c) Create milestone on closed project
        mod_m_res = self.client.post(
            "/api/v1/milestones",
            json={
                "projectId": project_id,
                "milestoneName": "Post-closure milestone",
                "plannedDate": "2026-10-01"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(mod_m_res.status_code, 400)

        # d) Update existing milestone on closed project
        mod_m_upd = self.client.put(
            f"/api/v1/milestones/{milestone_id}",
            json={"milestoneName": "Updated name"},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(mod_m_upd.status_code, 400)

        # e) Create schedule on closed project
        mod_s_res = self.client.post(
            "/api/v1/schedules",
            json={
                "projectId": project_id,
                "phaseName": "Post-closure phase",
                "plannedStartDate": "2026-10-01",
                "plannedEndDate": "2026-10-15"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(mod_s_res.status_code, 400)

        # Cleanup test project directly via DB session
        test_p = self.db.query(Project).filter(Project.id == project_id).first()
        if test_p:
            self.db.delete(test_p)
            self.db.commit()

    # --- MODULE 3 CLOSED PROJECT PROTECTION TESTS ---

    def test_07_module3_closed_project_protection(self):
        """Test Module 3 closed-project protection for write operations and read-only access."""
        # 1. Create open project
        import uuid
        unique_code = f"BT-M3-{uuid.uuid4().hex[:6]}"
        create_res = self.client.post(
            "/api/v1/projects",
            json={
                "projectName": "Module 3 Closed Project Test",
                "projectCode": unique_code,
                "category": "Commercial",
                "clientName": "Client Corp",
                "location": "Site 3",
                "estimatedBudget": 100000.0,
                "startDate": "2026-08-01",
                "expectedCompletionDate": "2026-10-01"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(create_res.status_code, 201)
        project_id = create_res.json()["id"]

        # 2. Module 3 writes on OPEN project -> Expect Success
        # Daily report
        dpr_res = self.client.post(
            "/api/v1/site-progress/daily-reports",
            json={
                "projectId": project_id,
                "reportDate": "2026-08-05",
                "progressCategory": "Foundation",
                "workCompleted": "Foundation excavation",
                "progressPercentage": 100
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(dpr_res.status_code, 201)
        dpr_id = dpr_res.json()["id"]

        # Weekly report
        wpr_res = self.client.post(
            "/api/v1/site-progress/weekly-reports",
            json={
                "projectId": project_id,
                "weekStartDate": "2026-08-03",
                "weekEndDate": "2026-08-09"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(wpr_res.status_code, 201)

        # Activity log
        act_res = self.client.post(
            "/api/v1/site-progress/activity-logs",
            json={
                "projectId": project_id,
                "activityDate": "2026-08-05",
                "description": "Safety walkthrough",
                "eventType": "Safety Meeting",
                "responsiblePerson": "Safety Officer"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(act_res.status_code, 201)

        # Delay tracking
        delay_res = self.client.post(
            "/api/v1/site-progress/delays",
            json={
                "projectId": project_id,
                "reason": "Equipment delay",
                "durationDays": 1,
                "affectedWorkCategory": "Foundation",
                "reportedDate": "2026-08-05"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(delay_res.status_code, 201)

        # Photo upload
        photo_res = self.client.post(
            "/api/v1/site-progress/photographs",
            json={
                "reportId": dpr_id,
                "photoUrl": "https://example.com/site.jpg",
                "caption": "Foundation photo"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(photo_res.status_code, 201)

        # 3. Add milestone, complete it, and close project
        m_res = self.client.post(
            "/api/v1/milestones",
            json={
                "projectId": project_id,
                "milestoneName": "Foundation Phase",
                "plannedDate": "2026-08-05",
                "completionPercentage": 100,
                "status": "Completed"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(m_res.status_code, 201)

        close_res = self.client.post(
            f"/api/v1/projects/{project_id}/close",
            json={"reason": "Project completed"},
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(close_res.status_code, 200)

        # 4. Module 3 writes on CLOSED project -> Expect HTTP 400 Rejection
        # Daily report on closed project
        closed_dpr = self.client.post(
            "/api/v1/site-progress/daily-reports",
            json={
                "projectId": project_id,
                "reportDate": "2026-08-06",
                "progressCategory": "Foundation",
                "workCompleted": "Extra work",
                "progressPercentage": 100
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(closed_dpr.status_code, 400)
        self.assertIn("cannot log progress or modify data on a closed project", closed_dpr.json()["detail"].lower())

        # Weekly report on closed project
        closed_wpr = self.client.post(
            "/api/v1/site-progress/weekly-reports",
            json={
                "projectId": project_id,
                "weekStartDate": "2026-08-10",
                "weekEndDate": "2026-08-16"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(closed_wpr.status_code, 400)

        # Activity log on closed project
        closed_act = self.client.post(
            "/api/v1/site-progress/activity-logs",
            json={
                "projectId": project_id,
                "activityDate": "2026-08-06",
                "description": "Late log",
                "eventType": "Material Delivery",
                "responsiblePerson": "Driver"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(closed_act.status_code, 400)

        # Delay tracking on closed project
        closed_delay = self.client.post(
            "/api/v1/site-progress/delays",
            json={
                "projectId": project_id,
                "reason": "Late delay",
                "durationDays": 1,
                "affectedWorkCategory": "Foundation",
                "reportedDate": "2026-08-06"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(closed_delay.status_code, 400)

        # Photo upload on closed project
        closed_photo = self.client.post(
            "/api/v1/site-progress/photographs",
            json={
                "reportId": dpr_id,
                "photoUrl": "https://example.com/site2.jpg",
                "caption": "Late photo"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(closed_photo.status_code, 400)

        # 5. READ-ONLY ACCESS on closed project -> Expect HTTP 200 OK Success
        read_dpr = self.client.get(f"/api/v1/site-progress/daily-reports?projectId={project_id}", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(read_dpr.status_code, 200)

        read_wpr = self.client.get(f"/api/v1/site-progress/weekly-reports?projectId={project_id}", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(read_wpr.status_code, 200)

        read_act = self.client.get(f"/api/v1/site-progress/activity-logs?projectId={project_id}", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(read_act.status_code, 200)

        read_del = self.client.get(f"/api/v1/site-progress/delays?projectId={project_id}", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(read_del.status_code, 200)

        read_dash = self.client.get(f"/api/v1/site-progress/dashboard?projectId={project_id}", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(read_dash.status_code, 200)

        # Cleanup
        test_p2 = self.db.query(Project).filter(Project.id == project_id).first()
        if test_p2:
            self.db.delete(test_p2)
            self.db.commit()

if __name__ == "__main__":
    unittest.main()

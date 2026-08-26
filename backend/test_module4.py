import sys
import unittest
import uuid
from fastapi.testclient import TestClient
from main import app
from app.database.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.project import Project
from app.models.resource import (
    ResourceModel,
    ResourceAllocationModel,
    ResourceUtilizationModel,
    ResourceMaintenanceModel,
)
from app.core.security import create_access_token


class TestModule4ResourceManagement(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Users
        cls.admin = cls.db.query(User).filter(User.email == "admin@buildtrack.com").first()
        cls.pm = cls.db.query(User).filter(User.email == "pm@buildtrack.com").first()
        cls.engineer = cls.db.query(User).filter(User.email == "engineer@buildtrack.com").first()
        cls.worker = cls.db.query(User).filter(User.email == "worker@buildtrack.com").first()

        cls.admin_token = create_access_token(subject=cls.admin.id, role="Administrator")
        cls.pm_token = create_access_token(subject=cls.pm.id, role="Project Manager")
        cls.engineer_token = create_access_token(subject=cls.engineer.id, role="Site Engineer")
        cls.worker_token = create_access_token(subject=cls.worker.id, role="Worker")

        # Create a test project for allocation
        cls.p_code = f"BT-RSRC-{uuid.uuid4().hex[:6]}"
        cls.project = Project(
            project_name="Resource Audit Test Project",
            project_code=cls.p_code,
            category="Infrastructure",
            client_name="BuildCorp",
            location="Salem Yard Site",
            estimated_budget=250000.0,
            start_date="2026-08-01",
            expected_completion_date="2026-12-31",
            status="In Progress"
        )
        cls.db.add(cls.project)
        cls.db.commit()
        # Clean up any previous test resource records
        cls.db.query(ResourceModel).filter(ResourceModel.equipment_code.like("EXC-M4-%")).delete(synchronize_session=False)
        cls.db.commit()

    @classmethod
    def tearDownClass(cls):
        # Cleanup test project and any created resources
        cls.db.query(ResourceModel).filter(ResourceModel.equipment_code.like("EXC-M4-%")).delete(synchronize_session=False)
        p = cls.db.query(Project).filter(Project.id == cls.project.id).first()
        if p:
            cls.db.delete(p)
        cls.db.commit()
        cls.db.close()

    def test_01_create_resource_master_data(self):
        """Administrator creates equipment items with unique codes."""
        res = self.client.post(
            "/api/v1/resources",
            json={
                "equipmentCode": "EXC-M4-001",
                "name": "Heavy Excavator Komatsu PC210",
                "category": "Excavators",
                "description": "20-ton hydraulic excavator",
                "status": "Available",
                "location": "Central Yard",
                "purchaseCost": 120000.0
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["equipmentCode"], "EXC-M4-001")
        self.assertEqual(data["category"], "Excavators")
        self.assertEqual(data["status"], "Available")

    def test_02_duplicate_equipment_code_rejection(self):
        """Attempting to create duplicate equipment code must return HTTP 400."""
        res = self.client.post(
            "/api/v1/resources",
            json={
                "equipmentCode": "EXC-M4-001",  # Duplicate code
                "name": "Duplicate Excavator",
                "category": "Excavators"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("already exists", res.json()["detail"].lower())

    def test_03_invalid_category_validation(self):
        """Invalid category should fail Pydantic validation (HTTP 422)."""
        res = self.client.post(
            "/api/v1/resources",
            json={
                "equipmentCode": "INV-001",
                "name": "Invalid Category Equipment",
                "category": "Flying Helicopters"
            },
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(res.status_code, 422)

    def test_04_equipment_allocation_lifecycle(self):
        """Allocate available equipment to a project."""
        # 1. Get created resource
        r = self.db.query(ResourceModel).filter(ResourceModel.equipment_code == "EXC-M4-001").first()
        self.assertIsNotNone(r)

        # 2. Allocate to project
        alloc_res = self.client.post(
            "/api/v1/resources/allocations",
            json={
                "resourceId": r.id,
                "projectId": self.project.id,
                "allocationDate": "2026-08-10",
                "expectedReturnDate": "2026-08-20",
                "responsiblePersonName": "John Operator",
                "notes": "Excavation phase 1"
            },
            headers={"Authorization": f"Bearer {self.pm_token}"}
        )
        self.assertEqual(alloc_res.status_code, 201)
        alloc_data = alloc_res.json()
        self.assertEqual(alloc_data["status"], "Active")
        self.assertEqual(alloc_data["projectId"], self.project.id)

        # 3. Verify resource status updated to Allocated
        self.db.expire_all()
        updated_r = self.db.query(ResourceModel).filter(ResourceModel.id == r.id).first()
        self.assertEqual(updated_r.status, "Allocated")
        self.assertEqual(updated_r.project_id, self.project.id)

    def test_05_overlapping_allocation_rejection(self):
        """CRITICAL: Same equipment cannot be allocated during overlapping period."""
        r = self.db.query(ResourceModel).filter(ResourceModel.equipment_code == "EXC-M4-001").first()

        # Try allocating for overlapping period: Aug 15 to Aug 25 (overlaps Aug 10 - Aug 20)
        overlap_res = self.client.post(
            "/api/v1/resources/allocations",
            json={
                "resourceId": r.id,
                "projectId": self.project.id,
                "allocationDate": "2026-08-15",
                "expectedReturnDate": "2026-08-25",
                "notes": "Overlapping attempt"
            },
            headers={"Authorization": f"Bearer {self.pm_token}"}
        )
        self.assertEqual(overlap_res.status_code, 400)
        self.assertIn("already allocated", overlap_res.json()["detail"].lower())

    def test_06_allocation_return_lifecycle(self):
        """Return equipment and verify status restored to Available."""
        self.db.expire_all()
        r = self.db.query(ResourceModel).filter(ResourceModel.equipment_code == "EXC-M4-001").first()
        alloc = self.db.query(ResourceAllocationModel).filter(
            ResourceAllocationModel.resource_id == r.id,
            ResourceAllocationModel.status == "Active"
        ).first()

        ret_res = self.client.post(
            f"/api/v1/resources/allocations/{alloc.id}/return",
            headers={"Authorization": f"Bearer {self.engineer_token}"}
        )
        self.assertEqual(ret_res.status_code, 200)
        self.assertEqual(ret_res.json()["status"], "Returned")

        # Verify resource status is Available
        self.db.refresh(r)
        self.assertEqual(r.status, "Available")
        self.assertIsNone(r.project_id)

    def test_07_resource_utilization_tracking(self):
        """Record operating hours and verify utilization percentage calculation."""
        r = self.db.query(ResourceModel).filter(ResourceModel.equipment_code == "EXC-M4-001").first()

        util_res = self.client.post(
            "/api/v1/resources/utilization",
            json={
                "resourceId": r.id,
                "date": "2026-08-11",
                "operatingHours": 8.0,
                "idleHours": 2.0,
                "totalAvailableHours": 10.0,
                "notes": "Trench digging"
            },
            headers={"Authorization": f"Bearer {self.engineer_token}"}
        )
        self.assertEqual(util_res.status_code, 201)
        data = util_res.json()
        self.assertEqual(data["utilizationPercentage"], 80.0)

        # Check invalid hours rejection
        inv_res = self.client.post(
            "/api/v1/resources/utilization",
            json={
                "resourceId": r.id,
                "date": "2026-08-12",
                "operatingHours": -5.0,
                "idleHours": 2.0
            },
            headers={"Authorization": f"Bearer {self.engineer_token}"}
        )
        self.assertEqual(inv_res.status_code, 422)  # Pydantic ge=0 validation

    def test_08_maintenance_scheduling_and_status_lock(self):
        """Schedule maintenance, verify Under Maintenance status, and check allocation prevention."""
        r = self.db.query(ResourceModel).filter(ResourceModel.equipment_code == "EXC-M4-001").first()

        maint_res = self.client.post(
            "/api/v1/resources/maintenance",
            json={
                "resourceId": r.id,
                "maintenanceDate": "2026-08-12",
                "nextMaintenanceDate": "2026-09-12",
                "maintenanceType": "Preventative",
                "serviceEngineer": "Mike Technician",
                "maintenanceCost": 500.0,
                "status": "In Progress",
                "description": "Oil change & hydraulic filter replacement"
            },
            headers={"Authorization": f"Bearer {self.pm_token}"}
        )
        self.assertEqual(maint_res.status_code, 201)
        maint_id = maint_res.json()["id"]

        # Verify resource status is Under Maintenance
        self.db.refresh(r)
        self.assertEqual(r.status, "Under Maintenance")

        # Attempt to allocate equipment under maintenance -> Must return HTTP 400
        alloc_maint_res = self.client.post(
            "/api/v1/resources/allocations",
            json={
                "resourceId": r.id,
                "projectId": self.project.id,
                "allocationDate": "2026-08-13",
                "expectedReturnDate": "2026-08-20"
            },
            headers={"Authorization": f"Bearer {self.pm_token}"}
        )
        self.assertEqual(alloc_maint_res.status_code, 400)
        self.assertIn("under maintenance", alloc_maint_res.json()["detail"].lower())

        # Complete maintenance
        comp_res = self.client.put(
            f"/api/v1/resources/maintenance/{maint_id}",
            json={"status": "Completed"},
            headers={"Authorization": f"Bearer {self.pm_token}"}
        )
        self.assertEqual(comp_res.status_code, 200)

        # Verify resource status restored to Available
        self.db.refresh(r)
        self.assertEqual(r.status, "Available")

    def test_09_resource_dashboard_and_due_alerts(self):
        """Query dashboard statistics and maintenance alerts."""
        dash_res = self.client.get("/api/v1/resources/dashboard", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(dash_res.status_code, 200)
        dash = dash_res.json()
        self.assertGreaterEqual(dash["totalResources"], 1)
        self.assertIn("Excavators", dash["categoryCounts"])

        due_res = self.client.get("/api/v1/resources/maintenance/due", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(due_res.status_code, 200)

    def test_10_rbac_unauthorized_action(self):
        """Worker role cannot create equipment resources."""
        res = self.client.post(
            "/api/v1/resources",
            json={
                "equipmentCode": "WORKER-001",
                "name": "Worker Created Crane",
                "category": "Cranes"
            },
            headers={"Authorization": f"Bearer {self.worker_token}"}
        )
        self.assertEqual(res.status_code, 403)


if __name__ == "__main__":
    unittest.main()

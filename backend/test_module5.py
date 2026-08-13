import unittest
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.database.session import SessionLocal, engine
from app.models.role import Role
from app.models.user import User
from app.models.project import Project
from app.models.schedule import ProjectSchedule
from app.models.milestone import ProjectMilestone
from app.models.assignments import (
    ProjectSiteEngineer,
    ProjectContractor,
    ContractorWorker,
    ProjectClient,
)
from app.models.project_audit import ProjectAuditLog
from app.models.resource import (
    ResourceModel,
    ResourceAllocationModel,
    ResourceUtilizationModel,
    ResourceMaintenanceModel,
)
from app.models.site_progress import (
    DailyProgressReport,
    WeeklyProgressReport,
    WorkCompletionStatus,
    DelayTracking,
    SiteActivityLog,
    ProgressPhotograph,
)
from app.models.material import (
    MaterialCategoryModel,
    MaterialModel,
    MaterialInventoryModel,
    MaterialRequestModel,
    MaterialAllocationModel,
    StockMovementModel,
)
from app.services.material_service import MaterialService
from app.schemas.material import (
    MaterialCategoryCreate,
    MaterialCreate,
    MaterialUpdate,
    StockReceiveRequest,
    MaterialRequestCreate,
    MaterialRequestReview,
    MaterialAllocationCreate,
    MaterialConsumptionCreate,
)
from app.dependencies.rbac import RequireRole


class TestModule5MaterialInventory(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db: Session = SessionLocal()
        cls.service = MaterialService(cls.db)

        # Retrieve existing preserved BuildTrack users
        cls.admin_user = cls.db.query(User).filter(User.email == "admin@buildtrack.com").first()
        cls.pm_user = cls.db.query(User).filter(User.email == "pm@buildtrack.com").first()
        cls.engineer_user = cls.db.query(User).filter(User.email == "engineer@buildtrack.com").first()
        cls.worker_user = cls.db.query(User).filter(User.email == "worker@buildtrack.com").first()

        # Retrieve active project
        cls.project = cls.db.query(Project).filter(Project.status != "Closed").first()

        # Seed categories
        cls.service.seed_categories()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_category_listing_and_material_creation(self):
        """Scenario 1: Category listing & material creation with unique material code."""
        cats = self.service.get_categories()
        self.assertGreaterEqual(len(cats), 7)
        cat_names = [c.name for c in cats]
        self.assertIn("Cement", cat_names)
        self.assertIn("Steel", cat_names)

        mat_code = f"TEST-MAT-{uuid.uuid4().hex[:4].upper()}"
        mat = self.service.create_material(
            MaterialCreate(
                materialCode=mat_code,
                name="Audit High-Performance OPC Cement",
                categoryName="Cement",
                unitOfMeasure="Bags",
                minStockLevel=200.0,
                description="Structural pour cement"
            ),
            self.admin_user
        )
        self.assertEqual(mat["materialCode"], mat_code)
        self.assertEqual(mat["unitOfMeasure"], "Bags")
        self.assertEqual(mat["availableStock"], 0.0)

        TestModule5MaterialInventory.test_mat_id = mat["id"]

    def test_02_minimum_stock_level_setting(self):
        """Scenario 2: Minimum stock level setting stored in PostgreSQL & updated dynamically."""
        mat_id = getattr(self, "test_mat_id")
        updated = self.service.update_material(mat_id, MaterialUpdate(minStockLevel=250.0))
        self.assertEqual(updated["minStockLevel"], 250.0)

        # Verify DB model
        mat_db = self.db.query(MaterialModel).filter(MaterialModel.id == mat_id).first()
        self.assertEqual(mat_db.min_stock_level, 250.0)
        self.assertEqual(mat_db.inventory.min_stock_level, 250.0)

    def test_03_stock_receiving(self):
        """Scenario 3: Stock receipt increases Total Stock & Available Stock (Total +, Available +)."""
        mat_id = getattr(self, "test_mat_id")
        rcv = self.service.receive_stock(
            StockReceiveRequest(
                materialId=mat_id,
                quantity=1000.0,
                warehouseLocation="Central Depot A",
                remarks="Received 1000 bags delivery"
            ),
            self.admin_user
        )
        self.assertEqual(rcv["totalStock"], 1000.0)
        self.assertEqual(rcv["availableStock"], 1000.0)
        self.assertEqual(rcv["allocatedStock"], 0.0)

    def test_04_inventory_view_and_available_stock_formula(self):
        """Scenario 4: Inventory view verifying Available = Total - Allocated."""
        inv_list = self.service.get_inventory()
        mat_id = getattr(self, "test_mat_id")
        item = next((i for i in inv_list if i["materialId"] == mat_id), None)
        self.assertIsNotNone(item)
        self.assertEqual(item["availableStock"], item["totalStock"] - item["allocatedStock"])

    def test_05_material_request_creation_no_inventory_reduction(self):
        """Scenario 5: Site Engineer material request creation does NOT alter inventory stock."""
        mat_id = getattr(self, "test_mat_id")
        req = self.service.create_request(
            MaterialRequestCreate(
                projectId=self.project.id,
                materialId=mat_id,
                requiredQuantity=300.0,
                requiredDate="2026-08-25",
                workActivity="Basement slab casting",
                remarks="Urgent request"
            ),
            self.engineer_user
        )
        self.assertEqual(req["status"], "Pending")

        # Verify stock remains untouched (Available = 1000)
        mat = self.service.get_material(mat_id)
        self.assertEqual(mat["availableStock"], 1000.0)

        TestModule5MaterialInventory.test_req_id = req["id"]

    def test_06_material_request_shortage_calculation(self):
        """Scenario 6: Request shortage calculation (Required = 500, Available = 100 -> Shortage = 400)."""
        # Create a material with only 100 bags available
        mat = self.service.create_material(
            MaterialCreate(
                materialCode=f"SHORT-{uuid.uuid4().hex[:4].upper()}",
                name="Shortage Test Material",
                categoryName="Cement",
                unitOfMeasure="Bags",
                minStockLevel=50.0
            ),
            self.admin_user
        )
        self.service.receive_stock(
            StockReceiveRequest(materialId=mat["id"], quantity=100.0),
            self.admin_user
        )

        # Create request for 500 bags
        req = self.service.create_request(
            MaterialRequestCreate(
                projectId=self.project.id,
                materialId=mat["id"],
                requiredQuantity=500.0,
                requiredDate="2026-08-25",
                workActivity="Shortage test pour"
            ),
            self.engineer_user
        )

        # Verify exact calculation: Required 500, Available 100 -> Shortage 400
        self.assertEqual(req["requiredQuantity"], 500.0)
        self.assertEqual(req["availableStockNow"], 100.0)
        self.assertEqual(req["shortageQuantity"], 400.0)

    def test_07_material_request_approval_workflow(self):
        """Scenario 7: Request approval workflow by PM/Admin."""
        req_id = getattr(self, "test_req_id")
        rev = self.service.review_request(
            req_id,
            MaterialRequestReview(status="Approved", reviewRemarks="Approved for basement slab phase"),
            self.pm_user
        )
        self.assertEqual(rev["status"], "Approved")
        self.assertEqual(rev["reviewedById"], self.pm_user.id)

    def test_08_material_allocation_and_available_stock_reduction(self):
        """Scenario 8: Material allocation increases Allocated stock and decreases Available stock."""
        mat_id = getattr(self, "test_mat_id")
        req_id = getattr(self, "test_req_id")

        alloc = self.service.create_allocation(
            MaterialAllocationCreate(
                projectId=self.project.id,
                materialId=mat_id,
                quantity=300.0,
                allocationDate="2026-08-12",
                workActivity="Basement slab casting",
                requestId=req_id,
                remarks="Allocated 300 bags"
            ),
            self.pm_user
        )
        self.assertEqual(alloc["quantity"], 300.0)

        # Stock state: Total = 1000, Allocated = 300, Available = 700
        mat = self.service.get_material(mat_id)
        self.assertEqual(mat["totalStock"], 1000.0)
        self.assertEqual(mat["allocatedStock"], 300.0)
        self.assertEqual(mat["availableStock"], 700.0)

        TestModule5MaterialInventory.test_alloc_id = alloc["id"]

    def test_09_over_allocation_prevention(self):
        """Scenario 9: Over-allocation prevention with HTTP 400 Bad Request."""
        mat_id = getattr(self, "test_mat_id")

        with self.assertRaises(HTTPException) as cm:
            self.service.create_allocation(
                MaterialAllocationCreate(
                    projectId=self.project.id,
                    materialId=mat_id,
                    quantity=800.0, # Available is 700!
                    allocationDate="2026-08-12",
                    workActivity="Excessive allocation attempt"
                ),
                self.pm_user
            )
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("Only 700.0", cm.exception.detail)

    def test_10_material_consumption(self):
        """Scenario 10: Material consumption (Allocated -> Consumed) and rejection if consumed > allocated."""
        alloc_id = getattr(self, "test_alloc_id")
        mat_id = getattr(self, "test_mat_id")

        # Consume 200 bags out of 300 allocated
        cons = self.service.consume_allocation(
            alloc_id,
            MaterialConsumptionCreate(consumedQuantity=200.0, remarks="Used for slab pour"),
            self.engineer_user
        )
        self.assertEqual(cons["consumedQuantity"], 200.0)
        self.assertEqual(cons["remainingQuantity"], 100.0)

        # Attempt to consume more than remaining (150 > 100 remaining)
        with self.assertRaises(HTTPException) as cm:
            self.service.consume_allocation(
                alloc_id,
                MaterialConsumptionCreate(consumedQuantity=150.0),
                self.engineer_user
            )
        self.assertEqual(cm.exception.status_code, 400)

        # Stock state: Total 1000, Allocated 100, Consumed 200, Available 900
        mat = self.service.get_material(mat_id)
        self.assertEqual(mat["allocatedStock"], 100.0)
        self.assertEqual(mat["consumedStock"], 200.0)
        self.assertEqual(mat["availableStock"], 900.0)

    def test_11_stock_return(self):
        """Scenario 11: Stock return (Allocated - quantity, Available + quantity)."""
        alloc_id = getattr(self, "test_alloc_id")
        mat_id = getattr(self, "test_mat_id")

        # Return remaining 100 allocated bags back to available warehouse stock
        ret = self.service.return_allocation(alloc_id, 100.0, "Returning unused bags to store", self.engineer_user)
        self.assertEqual(ret["quantity"], 200.0) # remaining quantity = 0 unconsumed

        # Stock state: Total 1000, Allocated 0, Consumed 200, Available 1000
        mat = self.service.get_material(mat_id)
        self.assertEqual(mat["allocatedStock"], 0.0)
        self.assertEqual(mat["availableStock"], 1000.0)
        self.assertEqual(mat["availableStock"], mat["totalStock"] - mat["allocatedStock"])

    def test_12_low_stock_detection(self):
        """Scenario 12: Low-stock detection when available stock falls below min_stock_level."""
        mat = self.service.create_material(
            MaterialCreate(
                materialCode=f"LOWALERT-{uuid.uuid4().hex[:4].upper()}",
                name="Low Stock Alert Wire",
                categoryName="Electrical Materials",
                unitOfMeasure="Units",
                minStockLevel=500.0
            ),
            self.admin_user
        )
        self.service.receive_stock(
            StockReceiveRequest(materialId=mat["id"], quantity=150.0),
            self.admin_user
        )
        low_items = self.service.get_low_stock_inventory()
        item = next((i for i in low_items if i["materialId"] == mat["id"]), None)
        self.assertIsNotNone(item)
        self.assertEqual(item["status"], "Low Stock")

    def test_13_stock_movement_history(self):
        """Scenario 13: Stock movement audit log history for Received, Allocated, Consumed, and Returned."""
        mat_id = getattr(self, "test_mat_id")
        movs = self.service.get_stock_movements(material_id=mat_id)
        self.assertGreaterEqual(len(movs), 4)

        m_types = [m["movementType"] for m in movs]
        self.assertIn("Received", m_types)
        self.assertIn("Allocated", m_types)
        self.assertIn("Consumed", m_types)
        self.assertIn("Returned", m_types)

    def test_14_project_wise_material_tracking(self):
        """Scenario 14: Project-wise material tracking summary."""
        usage = self.service.get_project_material_usage(project_id=self.project.id)
        self.assertGreaterEqual(len(usage), 1)
        p_item = usage[0]
        self.assertIn("requestedQuantity", p_item)
        self.assertIn("allocatedQuantity", p_item)
        self.assertIn("consumedQuantity", p_item)
        self.assertIn("remainingQuantity", p_item)

    def test_15_rbac_and_postgresql_persistence(self):
        """Scenario 15: RBAC authorization rejection (HTTP 403) and PostgreSQL persistence across reloads."""
        # 1. RBAC check using RequireRole dependency
        require_admin_pm = RequireRole(["Administrator", "Project Manager"])
        with self.assertRaises(HTTPException) as cm:
            require_admin_pm(current_user=self.worker_user)
        self.assertEqual(cm.exception.status_code, 403)
        self.assertIn("Access denied", cm.exception.detail)

        # 2. PostgreSQL persistence check across session closing/reloading
        mat_id = getattr(self, "test_mat_id")
        self.db.close()

        # Open fresh DB session
        new_db = SessionLocal()
        try:
            m_persisted = new_db.query(MaterialModel).filter(MaterialModel.id == mat_id).first()
            self.assertIsNotNone(m_persisted)
            self.assertEqual(m_persisted.inventory.available_stock, 1000.0)
            self.assertEqual(m_persisted.inventory.consumed_stock, 200.0)
        finally:
            new_db.close()


if __name__ == "__main__":
    unittest.main()

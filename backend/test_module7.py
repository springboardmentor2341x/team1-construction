import sys
import os
import unittest
from datetime import datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal, engine, Base
from app.models import (
    schedule, milestone, assignments, placeholders, site_progress,
    workforce, material, resource, equipment, document, task, shift, activity_log, project_audit
)


from app.models.user import User
from app.models.role import Role
from app.models.project import Project

from app.models.material import MaterialCategoryModel, MaterialModel, MaterialInventoryModel, StockMovementModel
from app.models.procurement import (
    ProcurementCategoryModel,
    VendorModel,
    ProcurementRequestModel,
    ProcurementRequestItemModel,
    PurchaseOrderModel,
    PurchaseOrderItemModel,
    InvoiceModel,
)
from app.services.procurement_service import ProcurementService
from app.schemas.procurement import (
    VendorCreate,
    VendorUpdate,
    InventoryCheckItemRequest,
    ProcurementRequestCreate,
    ProcurementRequestItemCreate,
    PurchaseOrderCreate,
    PurchaseOrderItemCreate,
    GoodsReceiptInput,
    GoodsReceiptItemInput,
    InvoiceCreate,
)


class TestModule7ProcurementManagement(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        from sqlalchemy import text
        old_v = db.query(VendorModel).filter(VendorModel.vendor_id == "VND-TEST-001").first()
        if old_v:
            db.execute(text("DELETE FROM invoices WHERE vendor_id = :vid"), {"vid": old_v.id})
            db.execute(text("DELETE FROM purchase_orders WHERE vendor_id = :vid"), {"vid": old_v.id})
            db.execute(text("DELETE FROM vendors WHERE id = :vid"), {"vid": old_v.id})

        old_p = db.query(Project).filter(Project.project_code == "PROJ-PROC-TEST").first()
        if old_p:
            db.execute(text("DELETE FROM invoices WHERE project_id = :pid"), {"pid": old_p.id})
            db.execute(text("DELETE FROM purchase_orders WHERE project_id = :pid"), {"pid": old_p.id})
            db.execute(text("DELETE FROM procurement_requests WHERE project_id = :pid"), {"pid": old_p.id})
            db.execute(text("DELETE FROM stock_movements WHERE project_id = :pid"), {"pid": old_p.id})
            db.execute(text("DELETE FROM projects WHERE id = :pid"), {"pid": old_p.id})

        old_m = db.query(MaterialModel).filter(MaterialModel.material_code == "MAT-PROC-TEST").first()
        if old_m:
            db.execute(text("DELETE FROM material_inventories WHERE material_id = :mid"), {"mid": old_m.id})
            db.execute(text("DELETE FROM stock_movements WHERE material_id = :mid"), {"mid": old_m.id})
            db.execute(text("DELETE FROM materials WHERE id = :mid"), {"mid": old_m.id})
        db.commit()
        db.close()

    def setUp(self):
        self.db = SessionLocal()

        # Seed roles if missing


        for r_name in ["Administrator", "Project Manager", "Site Engineer", "Contractor", "Client"]:
            r = self.db.query(Role).filter(Role.name == r_name).first()
            if not r:
                self.db.add(Role(name=r_name, description=f"{r_name} role"))
        self.db.commit()

        # Admin user
        admin_role = self.db.query(Role).filter(Role.name == "Administrator").first()
        self.admin = self.db.query(User).filter(User.email == "admin_proc@test.com").first()
        if not self.admin:
            self.admin = User(
                email="admin_proc@test.com",
                password_hash="hashed_pass_test",

                full_name="Admin Procurement User",
                role_id=admin_role.id
            )
            self.db.add(self.admin)
            self.db.commit()
            self.db.refresh(self.admin)

        # PM user
        pm_role = self.db.query(Role).filter(Role.name == "Project Manager").first()
        self.pm = self.db.query(User).filter(User.email == "pm_proc@test.com").first()
        if not self.pm:
            self.pm = User(
                email="pm_proc@test.com",
                password_hash="hashed_pass_test",

                full_name="PM Procurement User",
                role_id=pm_role.id
            )
            self.db.add(self.pm)
            self.db.commit()
            self.db.refresh(self.pm)

        # Test project
        self.project = self.db.query(Project).filter(Project.project_code == "PROJ-PROC-TEST").first()
        if not self.project:
            self.project = Project(
                project_name="Procurement Test Tower",
                project_code="PROJ-PROC-TEST",
                category="Commercial Construction",
                client_name="BuildTrack Test Client",
                location="Sector 62, Test City",
                start_date="2026-01-01",
                expected_completion_date="2026-12-31",
                estimated_budget=5000000.0,
                status="In Progress",
                project_manager_id=self.pm.id
            )
            self.db.add(self.project)
            self.db.commit()
            self.db.refresh(self.project)


        # Test Material & Inventory (Module 5)
        self.mat_cat = self.db.query(MaterialCategoryModel).filter(MaterialCategoryModel.name == "Structural Materials").first()
        if not self.mat_cat:
            self.mat_cat = MaterialCategoryModel(name="Structural Materials", description="Cement, steel, sand")
            self.db.add(self.mat_cat)
            self.db.commit()

        self.material = self.db.query(MaterialModel).filter(MaterialModel.material_code == "MAT-PROC-TEST").first()
        if not self.material:
            self.material = MaterialModel(
                material_code="MAT-PROC-TEST",
                name="Portland Cement 50kg",
                category_id=self.mat_cat.id,
                category_name=self.mat_cat.name,
                unit_of_measure="Bags",
                unit_price=450.0,
                min_stock_level=50.0
            )
            self.db.add(self.material)
            self.db.commit()


        self.inventory = self.db.query(MaterialInventoryModel).filter(MaterialInventoryModel.material_id == self.material.id).first()
        if not self.inventory:
            self.inventory = MaterialInventoryModel(
                material_id=self.material.id,
                total_stock=100.0,
                allocated_stock=20.0,
                consumed_stock=10.0,
                available_stock=70.0,
                min_stock_level=50.0,
                status="In Stock"
            )
            self.db.add(self.inventory)
            self.db.commit()

        self.service = ProcurementService(self.db)

    def tearDown(self):
        self.db.close()

    def test_01_vendor_management(self):
        """Test vendor registration, unique ID check, and status update."""
        v_create = VendorCreate(
            vendorId="VND-TEST-001",
            vendorName="Apex Cement Corp",
            contactPerson="John Apex",
            contactNumber="+1 555-9988",
            email="sales@apexcement.com",
            address="100 Supply Ave",
            vendorCategory="Raw Materials",
            productsOrServicesSupplied="Cement & Concrete Mix",
            vendorStatus="Active"
        )
        vendor = self.service.create_vendor(v_create, self.admin)
        self.assertIsNotNone(vendor.id)
        self.assertEqual(vendor.vendorName, "Apex Cement Corp")

        # Duplicate ID check
        with self.assertRaises(Exception):
            self.service.create_vendor(v_create, self.admin)

        # Status Update
        updated_v = self.service.update_vendor_status(vendor.id, "Inactive", self.admin)
        self.assertEqual(updated_v.vendorStatus, "Inactive")

        # Reactivate
        reactivated = self.service.update_vendor_status(vendor.id, "Active", self.admin)
        self.assertEqual(reactivated.vendorStatus, "Active")

    def test_02_inventory_check_integration(self):
        """Test Module 5 stock check integration."""
        items_check = [
            InventoryCheckItemRequest(
                materialId=self.material.id,
                itemDescription="Portland Cement 50kg",
                requiredQuantity=150.0
            )
        ]
        res = self.service.check_inventory_stock(items_check)
        self.assertTrue(res.hasStockShortage)
        self.assertEqual(res.items[0].availableStock, 70.0)
        self.assertEqual(res.items[0].netProcurementQuantity, 80.0)
        self.assertFalse(res.items[0].isSufficientStock)

    def test_03_procurement_request_lifecycle(self):
        """Test raising a procurement request and approval/rejection workflow."""
        req_item = ProcurementRequestItemCreate(
            materialId=self.material.id,
            itemDescription="Portland Cement 50kg",
            categoryName="Raw Materials",
            requiredQuantity=200.0,
            unit="Bags",
            requiredDate="2026-09-01",
            remarks="Stage 2 pouring"
        )
        req_create = ProcurementRequestCreate(
            projectId=self.project.id,
            categoryName="Raw Materials",
            purpose="Cement requirement for Slab 2",
            priority="High",
            remarks="Urgent delivery needed",
            items=[req_item]
        )
        pr = self.service.create_procurement_request(req_create, self.pm)
        self.assertIsNotNone(pr.id)
        self.assertTrue(pr.requestId.startswith("PR-"))
        self.assertEqual(pr.requestStatus, "Pending")
        self.assertEqual(pr.items[0].availableStock, 70.0)
        self.assertEqual(pr.items[0].netProcurementQuantity, 130.0)

        # Approve Request
        approved_pr = self.service.approve_procurement_request(pr.id, "Approved by PM for Slab 2", self.pm)
        self.assertEqual(approved_pr.requestStatus, "Approved")
        self.assertIsNotNone(approved_pr.approvedAt)

    def test_04_purchase_order_and_financials(self):
        """Test Purchase Order creation, financial calculations, and stock immutability on PO creation."""
        vendor = self.db.query(VendorModel).filter(VendorModel.vendor_id == "VND-TEST-001").first()
        initial_stock = self.inventory.total_stock

        po_item = PurchaseOrderItemCreate(
            materialId=self.material.id,
            description="Portland Cement 50kg",
            quantity=100.0,
            unit="Bags",
            unitPrice=400.0,
            tax=2000.0,
            discount=1000.0
        )
        # Line total = (100 * 400) + 2000 - 1000 = 41000.0
        po_create = PurchaseOrderCreate(
            vendorId=vendor.id,
            projectId=self.project.id,
            expectedDeliveryDate="2026-09-05",
            taxAmount=1000.0,
            additionalCharges=500.0,
            remarks="Standard purchase order",
            items=[po_item]
        )

        po = self.service.create_purchase_order(po_create, self.admin)
        self.assertIsNotNone(po.id)
        self.assertTrue(po.purchaseOrderId.startswith("PO-"))
        self.assertEqual(po.subtotal, 41000.0)
        self.assertEqual(po.totalAmount, 42500.0)

        # Verify PO creation did NOT touch inventory
        self.db.refresh(self.inventory)
        self.assertEqual(self.inventory.total_stock, initial_stock)

    def test_05_goods_receiving_inventory_integration(self):
        """Test Goods Receiving workflow updating Module 5 Inventory stock and creating stock movements."""
        po = self.db.query(PurchaseOrderModel).filter(PurchaseOrderModel.project_id == self.project.id).first()
        initial_total_stock = self.inventory.total_stock
        initial_avail_stock = self.inventory.available_stock

        po_item = po.items[0]

        # Receive 50 bags
        recv_input = GoodsReceiptInput(
            items=[
                GoodsReceiptItemInput(itemId=po_item.id, receivedQuantity=50.0)
            ],
            receiptDate="2026-09-03",
            remarks="Partial delivery challan #DC-101"
        )
        updated_po = self.service.receive_goods_for_po(po.id, recv_input, self.admin)
        self.assertEqual(updated_po.purchaseOrderStatus, "Partially Received")

        # Verify Inventory Stock increased by 50
        self.db.refresh(self.inventory)
        self.assertEqual(self.inventory.total_stock, initial_total_stock + 50.0)
        self.assertEqual(self.inventory.available_stock, initial_avail_stock + 50.0)

        # Verify Stock Movement record created
        sm = self.db.query(StockMovementModel).filter(
            StockMovementModel.reference_id == po.purchase_order_id,
            StockMovementModel.movement_type == "Received"
        ).first()
        self.assertIsNotNone(sm)
        self.assertEqual(sm.quantity, 50.0)

        # Receive remaining 50 bags
        recv_remaining = GoodsReceiptInput(
            items=[
                GoodsReceiptItemInput(itemId=po_item.id, receivedQuantity=50.0)
            ],
            receiptDate="2026-09-05",
            remarks="Final delivery completed"
        )
        completed_po = self.service.receive_goods_for_po(po.id, recv_remaining, self.admin)
        self.assertEqual(completed_po.purchaseOrderStatus, "Completed")

    def test_06_invoice_management(self):
        """Test vendor invoice registration, validation, and payment status updates."""
        vendor = self.db.query(VendorModel).filter(VendorModel.vendor_id == "VND-TEST-001").first()
        po = self.db.query(PurchaseOrderModel).filter(PurchaseOrderModel.project_id == self.project.id).first()

        inv_create = InvoiceCreate(
            invoiceNumber="INV-APEX-9901",
            vendorId=vendor.id,
            purchaseOrderId=po.id,
            projectId=self.project.id,
            invoiceDate="2026-09-06",
            dueDate="2026-10-06",
            invoiceAmount=42500.0,
            paymentStatus="Pending",
            remarks="Initial bill received"
        )

        inv = self.service.create_invoice(inv_create, self.admin)
        self.assertIsNotNone(inv.id)
        self.assertTrue(inv.invoiceId.startswith("INV-"))
        self.assertEqual(inv.invoiceAmount, 42500.0)

        # Payment Status Update
        updated_inv = self.service.update_invoice_payment_status(inv.id, "Paid", "Paid via NEFT", self.admin)
        self.assertEqual(updated_inv.paymentStatus, "Paid")

    def test_07_dashboard_and_workflow_detail(self):
        """Test Executive Dashboard stats and 360-degree workflow detail API."""
        stats = self.service.get_dashboard_stats(self.project.id, self.admin)
        self.assertGreaterEqual(stats.totalRequests, 1)
        self.assertGreaterEqual(stats.totalProcurementValue, 42500.0)

        pr = self.db.query(ProcurementRequestModel).filter(ProcurementRequestModel.project_id == self.project.id).first()
        wf = self.service.get_procurement_lifecycle_detail(pr.id, self.admin)
        self.assertIn("request", wf)
        self.assertIn("purchaseOrders", wf)
        self.assertIn("invoices", wf)


if __name__ == "__main__":
    unittest.main()

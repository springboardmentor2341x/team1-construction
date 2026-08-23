import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.material import (
    MaterialCategoryModel,
    MaterialModel,
    MaterialInventoryModel,
    MaterialRequestModel,
    MaterialAllocationModel,
    StockMovementModel,
)
from app.models.project import Project
from app.models.user import User
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


STANDARD_CATEGORIES = [
    ("Civil", "Civil engineering construction materials, cement, rebar, gravel, and bricks."),
    ("Cement", "Structural binding materials, OPC, PPC, and specialized cement bags."),
    ("Steel", "High-strength TMT rebar, structural steel beams, binding wire, and mesh."),
    ("Bricks", "Standard red clay bricks, fly-ash bricks, AAC lightweight concrete blocks."),
    ("Sand", "M-Sand (Manufactured Sand), River Sand, and fine aggregate materials."),
    ("Concrete", "Ready-Mix Concrete (RMC), precast concrete elements, and aggregate."),
    ("Electrical Materials", "Conduit pipes, copper wiring, DB panels, switches, and junction boxes."),
    ("Plumbing Materials", "PVC/CPVC pipes, fittings, valves, water tanks, and sanitary fixtures."),
]


class MaterialService:
    def __init__(self, db: Session):
        self.db = db

    def seed_categories(self) -> List[MaterialCategoryModel]:
        """Ensure standard material categories exist in database."""
        for name, desc in STANDARD_CATEGORIES:
            cat = self.db.query(MaterialCategoryModel).filter(MaterialCategoryModel.name == name).first()
            if not cat:
                cat = MaterialCategoryModel(name=name, description=desc)
                self.db.add(cat)
        self.db.commit()
        return self.db.query(MaterialCategoryModel).all()

    # --- CATEGORIES ---
    def get_categories(self) -> List[MaterialCategoryModel]:
        self.seed_categories()
        return self.db.query(MaterialCategoryModel).order_by(MaterialCategoryModel.name.asc()).all()

    def create_category(self, req: MaterialCategoryCreate) -> MaterialCategoryModel:
        existing = self.db.query(MaterialCategoryModel).filter(MaterialCategoryModel.name == req.name).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Category '{req.name}' already exists.")
        cat = MaterialCategoryModel(name=req.name, description=req.description)
        self.db.add(cat)
        self.db.commit()
        self.db.refresh(cat)
        return cat

    # --- MATERIALS ---
    def get_materials(self, category_id: Optional[str] = None) -> List[dict]:
        query = self.db.query(MaterialModel)
        if category_id:
            query = query.filter(MaterialModel.category_id == category_id)
        materials = query.order_by(MaterialModel.name.asc()).all()

        res = []
        for m in materials:
            inv = m.inventory
            res.append({
                "id": m.id,
                "materialCode": m.material_code,
                "name": m.name,
                "categoryId": m.category_id,
                "categoryName": m.category_name,
                "unitOfMeasure": m.unit_of_measure,
                "unitPrice": getattr(m, "unit_price", 0.0) or 0.0,
                "minStockLevel": m.min_stock_level,
                "description": m.description,
                "status": m.status,
                "createdBy": m.created_by,
                "createdAt": m.created_at,
                "updatedAt": m.updated_at,
                "totalStock": inv.total_stock if inv else 0.0,
                "allocatedStock": inv.allocated_stock if inv else 0.0,
                "consumedStock": inv.consumed_stock if inv else 0.0,
                "availableStock": inv.available_stock if inv else 0.0,
                "stockStatus": inv.status if inv else "Out of Stock",
            })
        return res

    def get_material(self, material_id: str) -> dict:
        m = self.db.query(MaterialModel).filter(MaterialModel.id == material_id).first()
        if not m:
            raise HTTPException(status_code=404, detail="Material not found.")
        inv = m.inventory
        return {
            "id": m.id,
            "materialCode": m.material_code,
            "name": m.name,
            "categoryId": m.category_id,
            "categoryName": m.category_name,
            "unitOfMeasure": m.unit_of_measure,
            "unitPrice": getattr(m, "unit_price", 0.0) or 0.0,
            "minStockLevel": m.min_stock_level,
            "description": m.description,
            "status": m.status,
            "createdBy": m.created_by,
            "createdAt": m.created_at,
            "updatedAt": m.updated_at,
            "totalStock": inv.total_stock if inv else 0.0,
            "allocatedStock": inv.allocated_stock if inv else 0.0,
            "consumedStock": inv.consumed_stock if inv else 0.0,
            "availableStock": inv.available_stock if inv else 0.0,
            "stockStatus": inv.status if inv else "Out of Stock",
        }

    def create_material(self, req: MaterialCreate, current_user: User) -> dict:
        dup = self.db.query(MaterialModel).filter(MaterialModel.material_code == req.materialCode).first()
        if dup:
            raise HTTPException(status_code=400, detail=f"Material code '{req.materialCode}' already exists.")

        mat = MaterialModel(
            material_code=req.materialCode,
            name=req.name,
            category_id=req.categoryId,
            category_name=req.categoryName,
            unit_of_measure=req.unitOfMeasure,
            unit_price=getattr(req, "unitPrice", 0.0) or 0.0,
            min_stock_level=req.minStockLevel,
            description=req.description,
            status=req.status or "Active",
            created_by=current_user.full_name,
        )
        self.db.add(mat)
        self.db.commit()
        self.db.refresh(mat)

        inv = MaterialInventoryModel(
            material_id=mat.id,
            total_stock=0.0,
            allocated_stock=0.0,
            consumed_stock=0.0,
            available_stock=0.0,
            min_stock_level=req.minStockLevel,
            status="Out of Stock"
        )
        self.db.add(inv)
        self.db.commit()

        return self.get_material(mat.id)

    def update_material(self, material_id: str, req: MaterialUpdate) -> dict:
        mat = self.db.query(MaterialModel).filter(MaterialModel.id == material_id).first()
        if not mat:
            raise HTTPException(status_code=404, detail="Material not found.")

        if req.name is not None:
            mat.name = req.name
        if req.categoryId is not None:
            mat.category_id = req.categoryId
        if req.categoryName is not None:
            mat.category_name = req.categoryName
        if req.unitOfMeasure is not None:
            mat.unit_of_measure = req.unitOfMeasure
        if getattr(req, "unitPrice", None) is not None:
            mat.unit_price = req.unitPrice
        if req.minStockLevel is not None:
            mat.min_stock_level = req.minStockLevel
            if mat.inventory:
                mat.inventory.min_stock_level = req.minStockLevel
                self._update_inventory_status(mat.inventory)
        if req.description is not None:
            mat.description = req.description
        if req.status is not None:
            mat.status = req.status

        self.db.commit()
        return self.get_material(material_id)

    # --- INVENTORY & STOCK RECEIVING ---
    def _update_inventory_status(self, inv: MaterialInventoryModel):
        inv.available_stock = max(0.0, inv.total_stock - inv.allocated_stock)
        if inv.available_stock <= 0:
            inv.status = "Out of Stock"
        elif inv.available_stock <= inv.min_stock_level:
            inv.status = "Low Stock"
        else:
            inv.status = "In Stock"

    def get_inventory(self) -> List[dict]:
        invs = self.db.query(MaterialInventoryModel).all()
        res = []
        for inv in invs:
            m = inv.material
            if not m:
                continue
            self._update_inventory_status(inv)
            res.append({
                "id": inv.id,
                "materialId": m.id,
                "materialCode": m.material_code,
                "materialName": m.name,
                "categoryName": m.category_name,
                "unitOfMeasure": m.unit_of_measure,
                "warehouseLocation": inv.warehouse_location,
                "totalStock": inv.total_stock,
                "allocatedStock": inv.allocated_stock,
                "consumedStock": inv.consumed_stock,
                "availableStock": inv.available_stock,
                "minStockLevel": inv.min_stock_level,
                "status": inv.status,
                "lastUpdated": inv.last_updated,
            })
        self.db.commit()
        return res

    def get_low_stock_inventory(self) -> List[dict]:
        all_inv = self.get_inventory()
        return [item for item in all_inv if item["status"] in ["Low Stock", "Out of Stock"]]

    def receive_stock(self, req: StockReceiveRequest, current_user: User) -> dict:
        mat = self.db.query(MaterialModel).filter(MaterialModel.id == req.materialId).first()
        if not mat:
            raise HTTPException(status_code=404, detail="Material not found.")

        inv = mat.inventory
        if not inv:
            inv = MaterialInventoryModel(
                material_id=mat.id,
                total_stock=0.0,
                allocated_stock=0.0,
                consumed_stock=0.0,
                available_stock=0.0,
                min_stock_level=mat.min_stock_level
            )
            self.db.add(inv)
            self.db.commit()
            self.db.refresh(inv)

        # Stock Receive Math: Total +, Available +
        inv.total_stock += req.quantity
        inv.warehouse_location = req.warehouseLocation or inv.warehouse_location
        self._update_inventory_status(inv)

        # Create Stock Movement Audit Record
        mov = StockMovementModel(
            material_id=mat.id,
            project_id=None,
            movement_type="Received",
            quantity=req.quantity,
            movement_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            user_id=current_user.id,
            user_name=current_user.full_name,
            reference_id=f"RCV-{uuid.uuid4().hex[:6].upper()}",
            remarks=req.remarks or f"Received {req.quantity} {mat.unit_of_measure} into {inv.warehouse_location}"
        )
        self.db.add(mov)
        self.db.commit()

        return self.get_material(mat.id)

    def update_direct_stock(self, material_id: str, req, current_user: User) -> dict:
        mat = self.db.query(MaterialModel).filter(MaterialModel.id == material_id).first()
        if not mat:
            raise HTTPException(status_code=404, detail="Material not found.")

        inv = mat.inventory
        if not inv:
            inv = MaterialInventoryModel(
                material_id=mat.id,
                total_stock=req.availableStock,
                allocated_stock=0.0,
                consumed_stock=0.0,
                available_stock=req.availableStock,
                min_stock_level=mat.min_stock_level
            )
            self.db.add(inv)
            self.db.commit()
            self.db.refresh(inv)

        old_avail = inv.available_stock
        diff = req.availableStock - old_avail

        inv.available_stock = req.availableStock
        if req.totalStock is not None:
            inv.total_stock = req.totalStock
        else:
            inv.total_stock = max(inv.total_stock, inv.available_stock + inv.allocated_stock)

        if req.minStockLevel is not None:
            inv.min_stock_level = req.minStockLevel
            mat.min_stock_level = req.minStockLevel

        if req.status:
            inv.status = req.status
        else:
            self._update_inventory_status(inv)

        movement_type = "Received" if diff >= 0 else "Adjustment"
        mov = StockMovementModel(
            material_id=mat.id,
            movement_type=movement_type,
            quantity=abs(diff),
            movement_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            user_id=current_user.id,
            user_name=current_user.full_name,
            reference_id=f"ADJ-{uuid.uuid4().hex[:6].upper()}",
            remarks=req.remarks or f"Direct stock updated to {req.availableStock} {mat.unit_of_measure} by {current_user.full_name}"
        )
        self.db.add(mov)
        self.db.commit()
        return self.get_material(mat.id)

    # --- MATERIAL REQUESTS ---
    def get_requests(self, project_id: Optional[str] = None, status_filter: Optional[str] = None) -> List[dict]:
        query = self.db.query(MaterialRequestModel)
        if project_id:
            query = query.filter(MaterialRequestModel.project_id == project_id)
        if status_filter:
            query = query.filter(MaterialRequestModel.status == status_filter)
        requests = query.order_by(MaterialRequestModel.created_at.desc()).all()

        res = []
        for r in requests:
            proj = r.project
            mat = r.material
            inv = mat.inventory if mat else None
            avail = inv.available_stock if inv else 0.0
            shortage = max(0.0, r.required_quantity - avail)

            res.append({
                "id": r.id,
                "requestCode": r.request_code,
                "projectId": r.project_id,
                "projectName": proj.project_name if proj else "N/A",
                "materialId": r.material_id,
                "materialName": r.material_name,
                "categoryName": r.category_name,
                "unit": r.unit,
                "requiredQuantity": r.required_quantity,
                "availableStockNow": avail,
                "shortageQuantity": shortage,
                "requiredDate": r.required_date,
                "workActivity": r.work_activity,
                "remarks": r.remarks,
                "requestedById": r.requested_by_id,
                "requestedByName": r.requested_by_name,
                "requestDate": r.request_date,
                "status": r.status,
                "reviewRemarks": r.review_remarks,
                "reviewedById": r.reviewed_by_id,
                "reviewedAt": r.reviewed_at,
                "createdAt": r.created_at,
            })
        return res

    def get_request(self, request_id: str) -> dict:
        r = self.db.query(MaterialRequestModel).filter(MaterialRequestModel.id == request_id).first()
        if not r:
            raise HTTPException(status_code=404, detail="Material request not found.")
        proj = r.project
        mat = r.material
        inv = mat.inventory if mat else None
        avail = inv.available_stock if inv else 0.0
        shortage = max(0.0, r.required_quantity - avail)

        return {
            "id": r.id,
            "requestCode": r.request_code,
            "projectId": r.project_id,
            "projectName": proj.project_name if proj else "N/A",
            "materialId": r.material_id,
            "materialName": r.material_name,
            "categoryName": r.category_name,
            "unit": r.unit,
            "requiredQuantity": r.required_quantity,
            "availableStockNow": avail,
            "shortageQuantity": shortage,
            "requiredDate": r.required_date,
            "workActivity": r.work_activity,
            "remarks": r.remarks,
            "requestedById": r.requested_by_id,
            "requestedByName": r.requested_by_name,
            "requestDate": r.request_date,
            "status": r.status,
            "reviewRemarks": r.review_remarks,
            "reviewedById": r.reviewed_by_id,
            "reviewedAt": r.reviewed_at,
            "createdAt": r.created_at,
        }

    def create_request(self, req: MaterialRequestCreate, current_user: User) -> dict:
        proj = self.db.query(Project).filter(Project.id == req.projectId).first()
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found.")

        # Closed project check
        if proj.status == "Closed":
            raise HTTPException(status_code=400, detail="Cannot create material request for a closed project.")

        mat = self.db.query(MaterialModel).filter(MaterialModel.id == req.materialId).first()
        if not mat:
            raise HTTPException(status_code=404, detail="Material not found.")

        request_code = f"MRQ-{uuid.uuid4().hex[:6].upper()}"

        r = MaterialRequestModel(
            request_code=request_code,
            project_id=req.projectId,
            material_id=req.materialId,
            material_name=mat.name,
            category_name=mat.category_name,
            unit=mat.unit_of_measure,
            required_quantity=req.requiredQuantity,
            required_date=req.requiredDate,
            work_activity=req.workActivity,
            remarks=req.remarks,
            requested_by_id=current_user.id,
            requested_by_name=current_user.full_name,
            request_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            status="Pending"
        )
        self.db.add(r)
        self.db.commit()
        self.db.refresh(r)

        return self.get_request(r.id)

    def review_request(self, request_id: str, req: MaterialRequestReview, current_user: User) -> dict:
        r = self.db.query(MaterialRequestModel).filter(MaterialRequestModel.id == request_id).first()
        if not r:
            raise HTTPException(status_code=404, detail="Material request not found.")

        if r.status in ["Approved", "Rejected", "Fulfilled"]:
            raise HTTPException(status_code=400, detail=f"Request is already {r.status}.")

        if req.status not in ["Approved", "Rejected"]:
            raise HTTPException(status_code=400, detail="Invalid review status. Must be 'Approved' or 'Rejected'.")

        r.status = req.status
        r.review_remarks = req.reviewRemarks
        r.reviewed_by_id = current_user.id
        r.reviewed_at = datetime.now(timezone.utc)

        self.db.commit()
        return self.get_request(request_id)

    # --- MATERIAL ALLOCATIONS ---
    def get_allocations(self, project_id: Optional[str] = None) -> List[dict]:
        query = self.db.query(MaterialAllocationModel)
        if project_id:
            query = query.filter(MaterialAllocationModel.project_id == project_id)
        allocations = query.order_by(MaterialAllocationModel.created_at.desc()).all()

        res = []
        for a in allocations:
            proj = a.project
            mat = a.material
            remaining = max(0.0, a.quantity - a.consumed_quantity)

            res.append({
                "id": a.id,
                "projectId": a.project_id,
                "projectName": proj.project_name if proj else "N/A",
                "materialId": a.material_id,
                "materialName": mat.name if mat else "N/A",
                "categoryName": mat.category_name if mat else "N/A",
                "unit": mat.unit_of_measure if mat else "N/A",
                "quantity": a.quantity,
                "consumedQuantity": a.consumed_quantity,
                "remainingQuantity": remaining,
                "allocationDate": a.allocation_date,
                "workActivity": a.work_activity,
                "responsibleUserId": a.responsible_user_id,
                "responsibleUserName": a.responsible_user_name,
                "requestId": a.request_id,
                "remarks": a.remarks,
                "status": a.status,
                "createdAt": a.created_at,
            })
        return res

    def create_allocation(self, req: MaterialAllocationCreate, current_user: User) -> dict:
        proj = self.db.query(Project).filter(Project.id == req.projectId).first()
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found.")

        if proj.status == "Closed":
            raise HTTPException(status_code=400, detail="Cannot allocate material to a closed project.")

        mat = self.db.query(MaterialModel).filter(MaterialModel.id == req.materialId).first()
        if not mat:
            raise HTTPException(status_code=404, detail="Material not found.")

        inv = mat.inventory
        if not inv:
            raise HTTPException(status_code=400, detail="Inventory record not initialized for material.")

        self._update_inventory_status(inv)

        # STRICT OVER-ALLOCATION CHECK
        if req.quantity > inv.available_stock:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot allocate {req.quantity} {mat.unit_of_measure}. Only {inv.available_stock} {mat.unit_of_measure} available in stock."
            )

        # Stock Allocation Math: Allocated +, Available -
        inv.allocated_stock += req.quantity
        self._update_inventory_status(inv)

        alloc = MaterialAllocationModel(
            project_id=req.projectId,
            material_id=req.materialId,
            quantity=req.quantity,
            consumed_quantity=0.0,
            allocation_date=req.allocationDate,
            work_activity=req.workActivity,
            responsible_user_id=req.responsibleUserId or current_user.id,
            responsible_user_name=req.responsibleUserName or current_user.full_name,
            request_id=req.requestId,
            remarks=req.remarks,
            status="Allocated"
        )
        self.db.add(alloc)

        # Update Material Request status to Fulfilled if linked
        if req.requestId:
            mreq = self.db.query(MaterialRequestModel).filter(MaterialRequestModel.id == req.requestId).first()
            if mreq:
                mreq.status = "Fulfilled"

        # Create Stock Movement Audit Record
        mov = StockMovementModel(
            material_id=mat.id,
            project_id=proj.id,
            movement_type="Allocated",
            quantity=req.quantity,
            movement_date=req.allocationDate,
            user_id=current_user.id,
            user_name=current_user.full_name,
            reference_id=f"ALC-{uuid.uuid4().hex[:6].upper()}",
            remarks=req.remarks or f"Allocated {req.quantity} {mat.unit_of_measure} to {proj.project_name} for {req.workActivity}"
        )
        self.db.add(mov)
        self.db.commit()
        self.db.refresh(alloc)

        return {
            "id": alloc.id,
            "projectId": alloc.project_id,
            "projectName": proj.project_name,
            "materialId": alloc.material_id,
            "materialName": mat.name,
            "categoryName": mat.category_name,
            "unit": mat.unit_of_measure,
            "quantity": alloc.quantity,
            "consumedQuantity": alloc.consumed_quantity,
            "remainingQuantity": alloc.quantity,
            "allocationDate": alloc.allocation_date,
            "workActivity": alloc.work_activity,
            "responsibleUserId": alloc.responsible_user_id,
            "responsibleUserName": alloc.responsible_user_name,
            "requestId": alloc.request_id,
            "remarks": alloc.remarks,
            "status": alloc.status,
            "createdAt": alloc.created_at,
        }

    def consume_allocation(self, allocation_id: str, req: MaterialConsumptionCreate, current_user: User) -> dict:
        alloc = self.db.query(MaterialAllocationModel).filter(MaterialAllocationModel.id == allocation_id).first()
        if not alloc:
            raise HTTPException(status_code=404, detail="Material allocation not found.")

        remaining = max(0.0, alloc.quantity - alloc.consumed_quantity)
        if req.consumedQuantity > remaining:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot consume {req.consumedQuantity}. Only {remaining} remaining in this allocation."
            )

        mat = alloc.material
        inv = mat.inventory

        # Stock Consumption Math: Allocated -, Consumed +
        alloc.consumed_quantity += req.consumedQuantity
        if alloc.consumed_quantity >= alloc.quantity:
            alloc.status = "Consumed"

        if inv:
            inv.allocated_stock = max(0.0, inv.allocated_stock - req.consumedQuantity)
            inv.consumed_stock += req.consumedQuantity
            self._update_inventory_status(inv)

        # Create Stock Movement Audit Record
        mov = StockMovementModel(
            material_id=alloc.material_id,
            project_id=alloc.project_id,
            movement_type="Consumed",
            quantity=req.consumedQuantity,
            movement_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            user_id=current_user.id,
            user_name=current_user.full_name,
            reference_id=f"CNS-{uuid.uuid4().hex[:6].upper()}",
            remarks=req.remarks or f"Consumed {req.consumedQuantity} {mat.unit_of_measure} for {alloc.work_activity}"
        )
        self.db.add(mov)
        self.db.commit()

        return {
            "id": alloc.id,
            "projectId": alloc.project_id,
            "projectName": alloc.project.project_name if alloc.project else "N/A",
            "materialId": alloc.material_id,
            "materialName": mat.name if mat else "N/A",
            "categoryName": mat.category_name if mat else "N/A",
            "unit": mat.unit_of_measure if mat else "N/A",
            "quantity": alloc.quantity,
            "consumedQuantity": alloc.consumed_quantity,
            "remainingQuantity": max(0.0, alloc.quantity - alloc.consumed_quantity),
            "allocationDate": alloc.allocation_date,
            "workActivity": alloc.work_activity,
            "responsibleUserId": alloc.responsible_user_id,
            "responsibleUserName": alloc.responsible_user_name,
            "requestId": alloc.request_id,
            "remarks": alloc.remarks,
            "status": alloc.status,
            "createdAt": alloc.created_at,
        }

    def return_allocation(self, allocation_id: str, return_qty: float, remarks: Optional[str], current_user: User) -> dict:
        alloc = self.db.query(MaterialAllocationModel).filter(MaterialAllocationModel.id == allocation_id).first()
        if not alloc:
            raise HTTPException(status_code=404, detail="Material allocation not found.")

        remaining = max(0.0, alloc.quantity - alloc.consumed_quantity)
        if return_qty > remaining:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot return {return_qty}. Only {remaining} remaining unconsumed in this allocation."
            )

        mat = alloc.material
        inv = mat.inventory

        # Stock Return Math: Allocated -, Available +
        alloc.quantity = max(0.0, alloc.quantity - return_qty)
        if alloc.quantity <= alloc.consumed_quantity:
            alloc.status = "Returned" if alloc.quantity == 0 else "Consumed"

        if inv:
            inv.allocated_stock = max(0.0, inv.allocated_stock - return_qty)
            self._update_inventory_status(inv)

        # Create Stock Movement Audit Record
        mov = StockMovementModel(
            material_id=alloc.material_id,
            project_id=alloc.project_id,
            movement_type="Returned",
            quantity=return_qty,
            movement_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            user_id=current_user.id,
            user_name=current_user.full_name,
            reference_id=f"RET-{uuid.uuid4().hex[:6].upper()}",
            remarks=remarks or f"Returned {return_qty} {mat.unit_of_measure} to warehouse stock"
        )
        self.db.add(mov)
        self.db.commit()

        return {
            "id": alloc.id,
            "projectId": alloc.project_id,
            "projectName": alloc.project.project_name if alloc.project else "N/A",
            "materialId": alloc.material_id,
            "materialName": mat.name if mat else "N/A",
            "categoryName": mat.category_name if mat else "N/A",
            "unit": mat.unit_of_measure if mat else "N/A",
            "quantity": alloc.quantity,
            "consumedQuantity": alloc.consumed_quantity,
            "remainingQuantity": max(0.0, alloc.quantity - alloc.consumed_quantity),
            "allocationDate": alloc.allocation_date,
            "workActivity": alloc.work_activity,
            "responsibleUserId": alloc.responsible_user_id,
            "responsibleUserName": alloc.responsible_user_name,
            "requestId": alloc.request_id,
            "remarks": alloc.remarks,
            "status": alloc.status,
            "createdAt": alloc.created_at,
        }

    # --- STOCK MOVEMENTS ---
    def get_stock_movements(self, material_id: Optional[str] = None, project_id: Optional[str] = None) -> List[dict]:
        query = self.db.query(StockMovementModel)
        if material_id:
            query = query.filter(StockMovementModel.material_id == material_id)
        if project_id:
            query = query.filter(StockMovementModel.project_id == project_id)
        movements = query.order_by(StockMovementModel.created_at.desc()).all()

        res = []
        for m in movements:
            mat = m.material
            proj = m.project
            res.append({
                "id": m.id,
                "materialId": m.material_id,
                "materialName": mat.name if mat else "N/A",
                "categoryName": mat.category_name if mat else "N/A",
                "unit": mat.unit_of_measure if mat else "N/A",
                "projectId": m.project_id,
                "projectName": proj.project_name if proj else "N/A",
                "movementType": m.movement_type,
                "quantity": m.quantity,
                "movementDate": m.movement_date,
                "userId": m.user_id,
                "userName": m.user_name,
                "referenceId": m.reference_id,
                "remarks": m.remarks,
                "createdAt": m.created_at,
            })
        return res

    # --- PROJECT-WISE MATERIAL TRACKING & DASHBOARD METRICS ---
    def get_project_material_usage(self, project_id: Optional[str] = None) -> List[dict]:
        query = self.db.query(MaterialAllocationModel)
        if project_id:
            query = query.filter(MaterialAllocationModel.project_id == project_id)
        allocs = query.all()

        usage_map = {}
        for a in allocs:
            key = f"{a.project_id}_{a.material_id}"
            mat = a.material
            proj = a.project
            if not mat or not proj:
                continue

            if key not in usage_map:
                # Find total requested for this project & material
                req_qty = self.db.query(func.sum(MaterialRequestModel.required_quantity)).filter(
                    MaterialRequestModel.project_id == a.project_id,
                    MaterialRequestModel.material_id == a.material_id
                ).scalar() or 0.0

                usage_map[key] = {
                    "projectId": a.project_id,
                    "projectName": proj.project_name,
                    "materialId": a.material_id,
                    "materialName": mat.name,
                    "unit": mat.unit_of_measure,
                    "requestedQuantity": float(req_qty),
                    "allocatedQuantity": 0.0,
                    "consumedQuantity": 0.0,
                    "remainingQuantity": 0.0,
                    "lastAllocationDate": a.allocation_date,
                    "workActivity": a.work_activity,
                }

            usage_map[key]["allocatedQuantity"] += a.quantity
            usage_map[key]["consumedQuantity"] += a.consumed_quantity
            usage_map[key]["remainingQuantity"] = max(0.0, usage_map[key]["allocatedQuantity"] - usage_map[key]["consumedQuantity"])

        return list(usage_map.values())

    def get_dashboard_metrics(self) -> dict:
        total_materials = self.db.query(MaterialModel).count()
        inv_sums = self.db.query(
            func.sum(MaterialInventoryModel.available_stock),
            func.sum(MaterialInventoryModel.allocated_stock),
            func.sum(MaterialInventoryModel.consumed_stock)
        ).first()

        total_avail = float(inv_sums[0] or 0.0)
        total_alloc = float(inv_sums[1] or 0.0)
        total_cons = float(inv_sums[2] or 0.0)

        low_stock_cnt = len(self.get_low_stock_inventory())
        pending_req_cnt = self.db.query(MaterialRequestModel).filter(MaterialRequestModel.status == "Pending").count()
        recent_mov_cnt = self.db.query(StockMovementModel).count()

        return {
            "totalMaterials": total_materials,
            "totalAvailableStock": total_avail,
            "totalAllocatedStock": total_alloc,
            "totalConsumedStock": total_cons,
            "lowStockCount": low_stock_cnt,
            "pendingRequestsCount": pending_req_cnt,
            "recentMovementsCount": recent_mov_cnt,
        }

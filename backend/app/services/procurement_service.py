import math
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.models.user import User
from app.models.project import Project
from app.models.material import MaterialModel, MaterialInventoryModel, StockMovementModel
from app.models.procurement import (
    ProcurementCategoryModel,
    VendorModel,
    ProcurementRequestModel,
    ProcurementRequestItemModel,
    PurchaseOrderModel,
    PurchaseOrderItemModel,
    InvoiceModel,
)
from app.models.assignments import ProjectSiteEngineer, ProjectContractor
from app.services.notification_service import NotificationService
from app.schemas.procurement import (
    ProcurementCategoryCreate,
    ProcurementCategoryRead,
    VendorCreate,
    VendorUpdate,
    VendorRead,
    PaginatedVendorsResponse,
    InventoryCheckItemRequest,
    InventoryCheckItemResponse,
    InventoryCheckResponse,
    ProcurementRequestCreate,
    ProcurementRequestRead,
    ProcurementRequestItemRead,
    PaginatedProcurementRequestsResponse,
    PurchaseOrderCreate,
    PurchaseOrderRead,
    PurchaseOrderItemRead,
    PaginatedPurchaseOrdersResponse,
    GoodsReceiptInput,
    InvoiceCreate,
    InvoiceRead,
    PaginatedInvoicesResponse,
    ProcurementDashboardStats,
)


class ProcurementService:
    def __init__(self, db: Session):
        self.db = db

    # ---------------------------------------------------------
    # RBAC Authorization Helper
    # ---------------------------------------------------------
    def verify_permission(
        self,
        user: User,
        project_id: Optional[str] = None,
        vendor_id: Optional[str] = None,
        read_only: bool = False
    ):
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

        role_name = user.role_rel.name if user.role_rel else ""

        # Administrators have global access
        if role_name == "Administrator":
            return

        # Read-only roles check
        if read_only and role_name in ["Client", "Project Manager", "Site Engineer", "Contractor"]:
            if project_id:
                self._verify_project_access(user, role_name, project_id)
            return

        # Project Managers
        if role_name == "Project Manager":
            if project_id:
                self._verify_project_access(user, role_name, project_id)
            return

        # Site Engineers
        if role_name == "Site Engineer":
            if project_id:
                self._verify_project_access(user, role_name, project_id)
            return

        # Contractors
        if role_name == "Contractor":
            if project_id:
                self._verify_project_access(user, role_name, project_id)
            return

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User role '{role_name}' is not authorized to perform this procurement action"
        )

    def _verify_project_access(self, user: User, role_name: str, project_id: str):
        if role_name == "Administrator":
            return

        if role_name == "Project Manager":
            proj = self.db.query(Project).filter(Project.id == project_id, Project.project_manager_id == user.id).first()

            if not proj:
                # Fallback check
                proj_any = self.db.query(Project).filter(Project.id == project_id).first()
                if not proj_any:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        elif role_name == "Site Engineer":
            assigned = self.db.query(ProjectSiteEngineer).filter(
                ProjectSiteEngineer.project_id == project_id,
                ProjectSiteEngineer.site_engineer_id == user.id
            ).first()
            if not assigned:
                proj_any = self.db.query(Project).filter(Project.id == project_id).first()
                if not proj_any:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        elif role_name == "Contractor":
            assigned = self.db.query(ProjectContractor).filter(
                ProjectContractor.project_id == project_id,
                ProjectContractor.contractor_id == user.id
            ).first()
            if not assigned:
                proj_any = self.db.query(Project).filter(Project.id == project_id).first()
                if not proj_any:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # ---------------------------------------------------------
    # Procurement Categories
    # ---------------------------------------------------------
    def seed_default_categories(self):
        defaults = [
            ("Raw Materials", "Cement, steel, aggregates, brickwork, concrete, timber"),
            ("Equipment", "Scaffolding, power tools, generators, safety equipment, measuring tools"),
            ("Machinery", "Excavators, cranes, loaders, concrete mixers, heavy vehicles"),
            ("Safety Equipment", "Helmets, harnesses, safety boots, gloves, high-vis vests"),
            ("Office Supplies", "Site office computers, stationeries, documents, utilities")
        ]
        for name, desc in defaults:
            cat = self.db.query(ProcurementCategoryModel).filter(ProcurementCategoryModel.name == name).first()
            if not cat:
                self.db.add(ProcurementCategoryModel(name=name, description=desc))
        self.db.commit()

    def get_categories(self) -> List[ProcurementCategoryRead]:
        self.seed_default_categories()
        cats = self.db.query(ProcurementCategoryModel).order_by(ProcurementCategoryModel.name).all()
        return [ProcurementCategoryRead.model_validate(c) for c in cats]

    # ---------------------------------------------------------
    # Vendor Management
    # ---------------------------------------------------------
    def _build_vendor_read(self, v: VendorModel) -> VendorRead:
        return VendorRead(
            id=v.id,
            vendorId=v.vendor_id,
            vendorName=v.vendor_name,
            contactPerson=v.contact_person,
            contactNumber=v.contact_number,
            email=v.email,
            address=v.address,
            vendorCategory=v.vendor_category,
            productsOrServicesSupplied=v.products_or_services_supplied,
            vendorStatus=v.vendor_status,
            createdAt=v.created_at.isoformat() if v.created_at else None,
            updatedAt=v.updated_at.isoformat() if v.updated_at else None
        )

    def get_vendors(
        self,
        search: Optional[str] = None,
        vendorCategory: Optional[str] = None,
        vendorStatus: Optional[str] = None,
        page: int = 1,
        pageSize: int = 10,
        current_user: User = None
    ) -> PaginatedVendorsResponse:
        self.verify_permission(current_user, read_only=True)
        query = self.db.query(VendorModel)

        if search and search.strip():
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    VendorModel.vendor_id.ilike(s),
                    VendorModel.vendor_name.ilike(s),
                    VendorModel.contact_person.ilike(s),
                    VendorModel.products_or_services_supplied.ilike(s)
                )
            )

        if vendorCategory and vendorCategory.strip():
            query = query.filter(VendorModel.vendor_category == vendorCategory.strip())

        if vendorStatus and vendorStatus.strip():
            query = query.filter(VendorModel.vendor_status == vendorStatus.strip())

        total = query.count()
        totalPages = math.ceil(total / pageSize) if total > 0 else 1
        page = min(page, totalPages) if totalPages > 0 else 1
        offset = (page - 1) * pageSize

        vendors = query.order_by(VendorModel.vendor_name).offset(offset).limit(pageSize).all()
        items = [self._build_vendor_read(v) for v in vendors]

        return PaginatedVendorsResponse(
            items=items,
            total=total,
            page=page,
            pageSize=pageSize,
            totalPages=totalPages
        )

    def get_vendor_by_id(self, vendor_id: str, current_user: User) -> VendorRead:
        self.verify_permission(current_user, read_only=True)
        v = self.db.query(VendorModel).filter(VendorModel.id == vendor_id).first()
        if not v:
            v = self.db.query(VendorModel).filter(VendorModel.vendor_id == vendor_id).first()
        if not v:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor record not found")
        return self._build_vendor_read(v)

    def create_vendor(self, req: VendorCreate, current_user: User) -> VendorRead:
        self.verify_permission(current_user)

        existing = self.db.query(VendorModel).filter(VendorModel.vendor_id == req.vendorId.strip()).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Vendor ID '{req.vendorId}' is already registered")

        new_v = VendorModel(
            vendor_id=req.vendorId.strip(),
            vendor_name=req.vendorName.strip(),
            contact_person=req.contactPerson,
            contact_number=req.contactNumber,
            email=req.email,
            address=req.address,
            vendor_category=req.vendorCategory or "Raw Materials",
            products_or_services_supplied=req.productsOrServicesSupplied,
            vendor_status=req.vendorStatus or "Active"
        )
        self.db.add(new_v)
        self.db.commit()
        self.db.refresh(new_v)
        return self._build_vendor_read(new_v)

    def update_vendor(self, vendor_id: str, req: VendorUpdate, current_user: User) -> VendorRead:
        self.verify_permission(current_user)
        v = self.db.query(VendorModel).filter(VendorModel.id == vendor_id).first()
        if not v:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor record not found")

        if req.vendorName is not None: v.vendor_name = req.vendorName.strip()
        if req.contactPerson is not None: v.contact_person = req.contactPerson
        if req.contactNumber is not None: v.contact_number = req.contactNumber
        if req.email is not None: v.email = req.email
        if req.address is not None: v.address = req.address
        if req.vendorCategory is not None: v.vendor_category = req.vendorCategory
        if req.productsOrServicesSupplied is not None: v.products_or_services_supplied = req.productsOrServicesSupplied
        if req.vendorStatus is not None: v.vendor_status = req.vendorStatus

        self.db.commit()
        self.db.refresh(v)
        return self._build_vendor_read(v)

    def update_vendor_status(self, vendor_id: str, new_status: str, current_user: User) -> VendorRead:
        self.verify_permission(current_user)
        v = self.db.query(VendorModel).filter(VendorModel.id == vendor_id).first()
        if not v:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor record not found")

        if new_status not in ["Active", "Inactive", "Blacklisted"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid vendor status")

        v.vendor_status = new_status
        self.db.commit()
        self.db.refresh(v)
        return self._build_vendor_read(v)

    # ---------------------------------------------------------
    # Module 5 Inventory Integration Check
    # ---------------------------------------------------------
    def check_inventory_stock(self, items: List[InventoryCheckItemRequest]) -> InventoryCheckResponse:
        results: List[InventoryCheckItemResponse] = []
        has_shortage = False

        for item in items:
            avail_stock = 0.0
            if item.materialId and item.materialId.strip():
                inv = self.db.query(MaterialInventoryModel).filter(MaterialInventoryModel.material_id == item.materialId.strip()).first()
                if inv:
                    avail_stock = inv.available_stock
            else:
                # Try matching by name
                mat = self.db.query(MaterialModel).filter(MaterialModel.name.ilike(f"%{item.itemDescription.strip()}%")).first()
                if mat and mat.inventory:
                    avail_stock = mat.inventory.available_stock

            net_procurement = max(0.0, item.requiredQuantity - avail_stock)
            is_sufficient = avail_stock >= item.requiredQuantity
            if not is_sufficient:
                has_shortage = True

            results.append(
                InventoryCheckItemResponse(
                    materialId=item.materialId,
                    itemDescription=item.itemDescription,
                    requiredQuantity=item.requiredQuantity,
                    availableStock=avail_stock,
                    netProcurementQuantity=net_procurement,
                    isSufficientStock=is_sufficient
                )
            )

        return InventoryCheckResponse(items=results, hasStockShortage=has_shortage)

    # ---------------------------------------------------------
    # Procurement Requests & Approval Workflow
    # ---------------------------------------------------------
    def _generate_request_id() -> str:
        count = self.db.query(func.count(ProcurementRequestModel.id)).scalar() or 0
        year = datetime.now(timezone.utc).year
        return f"PR-{year}-{(count + 1):03d}"

    def _build_request_read(self, r: ProcurementRequestModel) -> ProcurementRequestRead:
        items_read = []
        for it in r.items:
            mat_name = it.material.name if it.material else None
            items_read.append(
                ProcurementRequestItemRead(
                    id=it.id,
                    procurementRequestId=it.procurement_request_id,
                    materialId=it.material_id,
                    itemDescription=it.item_description,
                    categoryName=it.category_name,
                    requiredQuantity=it.required_quantity,
                    availableStock=it.available_stock,
                    netProcurementQuantity=it.net_procurement_quantity,
                    unit=it.unit,
                    requiredDate=it.required_date,
                    remarks=it.remarks,
                    materialName=mat_name
                )
            )

        return ProcurementRequestRead(
            id=r.id,
            requestId=r.request_id,
            projectId=r.project_id,
            projectName=r.project.project_name if r.project else None,
            projectCode=r.project.project_code if r.project else None,
            categoryName=r.category_name,
            purpose=r.purpose,
            priority=r.priority,
            requestDate=r.request_date,
            requestStatus=r.request_status,
            remarks=r.remarks,
            requestedById=r.requested_by_id,
            requestedByName=r.requested_by_name,
            approvedById=r.approved_by_id,
            approvedByName=r.approved_by_name,
            approvedAt=r.approved_at.isoformat() if r.approved_at else None,
            rejectedById=r.rejected_by_id,
            rejectedByName=r.rejected_by_name,
            rejectedAt=r.rejected_at.isoformat() if r.rejected_at else None,
            rejectionReason=r.rejection_reason,
            createdAt=r.created_at.isoformat() if r.created_at else None,
            items=items_read
        )

    def create_procurement_request(self, req: ProcurementRequestCreate, current_user: User) -> ProcurementRequestRead:
        self.verify_permission(current_user, project_id=req.projectId)

        project = self.db.query(Project).filter(Project.id == req.projectId).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        if not req.items or len(req.items) == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Procurement request must contain at least one item")

        # Generate Request ID (Ensure unique)
        year = datetime.now(timezone.utc).year
        count = self.db.query(func.count(ProcurementRequestModel.id)).scalar() or 0
        req_code = f"PR-{year}-{(count + 1):03d}"
        while self.db.query(ProcurementRequestModel).filter(ProcurementRequestModel.request_id == req_code).first():
            count += 1
            req_code = f"PR-{year}-{(count + 1):03d}"

        new_req = ProcurementRequestModel(
            request_id=req_code,
            project_id=req.projectId,
            category_name=req.categoryName or "Raw Materials",
            purpose=req.purpose,
            priority=req.priority or "Medium",
            request_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            request_status="Pending",
            remarks=req.remarks,
            requested_by_id=current_user.id,
            requested_by_name=current_user.full_name
        )
        self.db.add(new_req)
        self.db.flush()

        # Add Items with Inventory Check
        for item in req.items:
            m_id = item.materialId if (item.materialId and item.materialId.strip() != "") else None
            avail_stock = 0.0
            if m_id:
                inv = self.db.query(MaterialInventoryModel).filter(MaterialInventoryModel.material_id == m_id).first()
                if inv:
                    avail_stock = inv.available_stock

            net_qty = max(0.0, item.requiredQuantity - avail_stock)

            req_item = ProcurementRequestItemModel(
                procurement_request_id=new_req.id,
                material_id=m_id,
                item_description=item.itemDescription.strip(),
                category_name=item.categoryName or req.categoryName or "Raw Materials",
                required_quantity=item.requiredQuantity,
                available_stock=avail_stock,
                net_procurement_quantity=net_qty,
                unit=item.unit or "Units",
                required_date=item.requiredDate,
                remarks=item.remarks
            )
            self.db.add(req_item)

        self.db.commit()
        self.db.refresh(new_req)

        # Emit Procurement Notification to PM & Admins for project
        approvers = NotificationService.get_relevant_project_user_ids(
            self.db, new_req.project_id, exclude_user_id=current_user.id, roles_filter=["Administrator", "Project Manager"]
        )
        if approvers:
            NotificationService.create_bulk_notifications(
                db=self.db,
                user_ids=approvers,
                title=f"Procurement Approval Required: {new_req.request_id}",
                message=f"Procurement request '{new_req.request_id}' created by {current_user.full_name} for project '{project.project_name}' requires approval.",
                type="PROCUREMENT",
                project_id=new_req.project_id,
                reference_module="procurement_requests",
                reference_id=new_req.id,
                category="Procurement"
            )

        return self._build_request_read(new_req)

    def get_procurement_requests(
        self,
        projectId: Optional[str] = None,
        categoryName: Optional[str] = None,
        requestStatus: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        pageSize: int = 10,
        current_user: User = None
    ) -> PaginatedProcurementRequestsResponse:
        self.verify_permission(current_user, project_id=projectId, read_only=True)
        query = self.db.query(ProcurementRequestModel)

        if projectId:
            query = query.filter(ProcurementRequestModel.project_id == projectId)
        if categoryName:
            query = query.filter(ProcurementRequestModel.category_name == categoryName)
        if requestStatus:
            query = query.filter(ProcurementRequestModel.request_status == requestStatus)
        if priority:
            query = query.filter(ProcurementRequestModel.priority == priority)
        if search and search.strip():
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    ProcurementRequestModel.request_id.ilike(s),
                    ProcurementRequestModel.purpose.ilike(s),
                    ProcurementRequestModel.requested_by_name.ilike(s)
                )
            )

        total = query.count()
        totalPages = math.ceil(total / pageSize) if total > 0 else 1
        page = min(page, totalPages) if totalPages > 0 else 1
        offset = (page - 1) * pageSize

        requests = query.order_by(ProcurementRequestModel.created_at.desc()).offset(offset).limit(pageSize).all()
        items = [self._build_request_read(r) for r in requests]

        return PaginatedProcurementRequestsResponse(
            items=items,
            total=total,
            page=page,
            pageSize=pageSize,
            totalPages=totalPages
        )

    def get_request_by_id(self, request_id: str, current_user: User) -> ProcurementRequestRead:
        self.verify_permission(current_user, read_only=True)
        r = self.db.query(ProcurementRequestModel).filter(ProcurementRequestModel.id == request_id).first()
        if not r:
            r = self.db.query(ProcurementRequestModel).filter(ProcurementRequestModel.request_id == request_id).first()
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Procurement request not found")
        return self._build_request_read(r)

    def approve_procurement_request(self, request_id: str, remarks: Optional[str], current_user: User) -> ProcurementRequestRead:
        r = self.db.query(ProcurementRequestModel).filter(ProcurementRequestModel.id == request_id).first()
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Procurement request not found")

        self.verify_permission(current_user, project_id=r.project_id)

        # Ensure user has approval permissions (Administrator or Project Manager)
        role_name = current_user.role_rel.name if current_user.role_rel else ""
        if role_name not in ["Administrator", "Project Manager"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Administrator or Project Manager can approve procurement requests")

        if r.request_status in ["Approved", "Completed", "Cancelled"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Request is already in '{r.request_status}' status")

        r.request_status = "Approved"
        r.approved_by_id = current_user.id
        r.approved_by_name = current_user.full_name
        r.approved_at = datetime.now(timezone.utc)
        if remarks:
            r.remarks = f"{r.remarks}\nApproval Note: {remarks}" if r.remarks else f"Approval Note: {remarks}"

        self.db.commit()
        self.db.refresh(r)

        # Notify Requester of Approval
        if r.requested_by_id and r.requested_by_id != current_user.id:
            NotificationService.create_notification(
                db=self.db,
                user_id=r.requested_by_id,
                title=f"Procurement Request Approved: {r.request_id}",
                message=f"Your procurement request '{r.request_id}' has been approved by {current_user.full_name}.",
                type="PROCUREMENT",
                project_id=r.project_id,
                reference_module="procurement_requests",
                reference_id=r.id,
                category="Procurement"
            )

        return self._build_request_read(r)

    def reject_procurement_request(self, request_id: str, rejection_reason: str, current_user: User) -> ProcurementRequestRead:
        r = self.db.query(ProcurementRequestModel).filter(ProcurementRequestModel.id == request_id).first()
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Procurement request not found")

        self.verify_permission(current_user, project_id=r.project_id)

        role_name = current_user.role_rel.name if current_user.role_rel else ""
        if role_name not in ["Administrator", "Project Manager"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Administrator or Project Manager can reject procurement requests")

        r.request_status = "Rejected"
        r.rejected_by_id = current_user.id
        r.rejected_by_name = current_user.full_name
        r.rejected_at = datetime.now(timezone.utc)
        r.rejection_reason = rejection_reason or "Request rejected by management"

        self.db.commit()
        self.db.refresh(r)

        # Notify Requester of Rejection
        if r.requested_by_id and r.requested_by_id != current_user.id:
            NotificationService.create_notification(
                db=self.db,
                user_id=r.requested_by_id,
                title=f"Procurement Request Rejected: {r.request_id}",
                message=f"Your procurement request '{r.request_id}' was rejected. Reason: {r.rejection_reason}.",
                type="PROCUREMENT",
                project_id=r.project_id,
                reference_module="procurement_requests",
                reference_id=r.id,
                category="Procurement"
            )

        return self._build_request_read(r)

    # ---------------------------------------------------------
    # Purchase Orders & Financial Calculation
    # ---------------------------------------------------------
    def _build_po_read(self, po: PurchaseOrderModel) -> PurchaseOrderRead:
        items_read = []
        for it in po.items:
            mat_name = it.material.name if it.material else None
            items_read.append(
                PurchaseOrderItemRead(
                    id=it.id,
                    purchaseOrderId=it.purchase_order_id,
                    materialId=it.material_id,
                    description=it.description,
                    quantity=it.quantity,
                    receivedQuantity=it.received_quantity,
                    unit=it.unit,
                    unitPrice=it.unit_price,
                    tax=it.tax,
                    discount=it.discount,
                    lineTotal=it.line_total,
                    materialName=mat_name
                )
            )

        return PurchaseOrderRead(
            id=po.id,
            purchaseOrderId=po.purchase_order_id,
            vendorId=po.vendor_id,
            vendorName=po.vendor.vendor_name if po.vendor else None,
            projectId=po.project_id,
            projectName=po.project.project_name if po.project else None,
            projectCode=po.project.project_code if po.project else None,
            procurementRequestId=po.procurement_request_id,
            procurementRequestCode=po.procurement_request.request_id if po.procurement_request else None,
            orderDate=po.order_date,
            expectedDeliveryDate=po.expected_delivery_date,
            subtotal=po.subtotal,
            taxAmount=po.tax_amount,
            additionalCharges=po.additional_charges,
            totalAmount=po.total_amount,
            purchaseOrderStatus=po.purchase_order_status,
            remarks=po.remarks,
            createdById=po.created_by_id,
            createdByName=po.created_by_name,
            approvedByName=po.approved_by_name,
            createdAt=po.created_at.isoformat() if po.created_at else None,
            items=items_read
        )

    def create_purchase_order(self, req: PurchaseOrderCreate, current_user: User) -> PurchaseOrderRead:
        self.verify_permission(current_user, project_id=req.projectId)

        vendor = self.db.query(VendorModel).filter(VendorModel.id == req.vendorId).first()
        if not vendor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        if vendor.vendor_status != "Active":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot create PO against vendor in '{vendor.vendor_status}' status")

        project = self.db.query(Project).filter(Project.id == req.projectId).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        pr_id = req.procurementRequestId if (req.procurementRequestId and req.procurementRequestId.strip() != "") else None
        if pr_id:
            pr = self.db.query(ProcurementRequestModel).filter(ProcurementRequestModel.id == pr_id).first()
            if not pr:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced procurement request not found")
            if pr.request_status != "Approved":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Purchase Order can only be created from an APPROVED procurement request")
            # Update PR status to Processing
            pr.request_status = "Processing"

        if not req.items or len(req.items) == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Purchase order must contain at least one line item")

        # Generate PO ID
        count = self.db.query(func.count(PurchaseOrderModel.id)).scalar() or 0
        year = datetime.now(timezone.utc).year
        po_code = f"PO-{year}-{(count + 1):03d}"

        # Calculate Financials on Backend
        subtotal = 0.0
        po_items_to_add = []

        for item in req.items:
            m_id = item.materialId if (item.materialId and item.materialId.strip() != "") else None
            # Line total = quantity * unit_price + tax - discount
            line_tot = round((item.quantity * item.unitPrice) + (item.tax or 0.0) - (item.discount or 0.0), 2)
            subtotal += line_tot

            po_items_to_add.append(
                {
                    "material_id": m_id,
                    "description": item.description.strip(),
                    "quantity": item.quantity,
                    "received_quantity": 0.0,
                    "unit": item.unit or "Units",
                    "unit_price": item.unitPrice,
                    "tax": item.tax or 0.0,
                    "discount": item.discount or 0.0,
                    "line_total": line_tot
                }
            )

        tax_amt = req.taxAmount or 0.0
        add_charges = req.additionalCharges or 0.0
        grand_total = round(subtotal + tax_amt + add_charges, 2)

        new_po = PurchaseOrderModel(
            purchase_order_id=po_code,
            vendor_id=req.vendorId,
            project_id=req.projectId,
            procurement_request_id=pr_id,
            order_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            expected_delivery_date=req.expectedDeliveryDate,
            subtotal=subtotal,
            tax_amount=tax_amt,
            additional_charges=add_charges,
            total_amount=grand_total,
            purchase_order_status="Approved", # Auto-approved if created by authorized user
            remarks=req.remarks,
            created_by_id=current_user.id,
            created_by_name=current_user.full_name,
            approved_by_id=current_user.id,
            approved_by_name=current_user.full_name
        )
        self.db.add(new_po)
        self.db.flush()

        for pit in po_items_to_add:
            item_model = PurchaseOrderItemModel(
                purchase_order_id=new_po.id,
                **pit
            )
            self.db.add(item_model)

        self.db.commit()
        self.db.refresh(new_po)
        return self._build_po_read(new_po)

    def get_purchase_orders(
        self,
        projectId: Optional[str] = None,
        vendorId: Optional[str] = None,
        purchaseOrderStatus: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        pageSize: int = 10,
        current_user: User = None
    ) -> PaginatedPurchaseOrdersResponse:
        self.verify_permission(current_user, project_id=projectId, read_only=True)
        query = self.db.query(PurchaseOrderModel)

        if projectId:
            query = query.filter(PurchaseOrderModel.project_id == projectId)
        if vendorId:
            query = query.filter(PurchaseOrderModel.vendor_id == vendorId)
        if purchaseOrderStatus:
            query = query.filter(PurchaseOrderModel.purchase_order_status == purchaseOrderStatus)
        if search and search.strip():
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    PurchaseOrderModel.purchase_order_id.ilike(s),
                    PurchaseOrderModel.remarks.ilike(s),
                    PurchaseOrderModel.created_by_name.ilike(s)
                )
            )

        total = query.count()
        totalPages = math.ceil(total / pageSize) if total > 0 else 1
        page = min(page, totalPages) if totalPages > 0 else 1
        offset = (page - 1) * pageSize

        orders = query.order_by(PurchaseOrderModel.created_at.desc()).offset(offset).limit(pageSize).all()
        items = [self._build_po_read(po) for po in orders]

        return PaginatedPurchaseOrdersResponse(
            items=items,
            total=total,
            page=page,
            pageSize=pageSize,
            totalPages=totalPages
        )

    def get_purchase_order_by_id(self, po_id: str, current_user: User) -> PurchaseOrderRead:
        self.verify_permission(current_user, read_only=True)
        po = self.db.query(PurchaseOrderModel).filter(PurchaseOrderModel.id == po_id).first()
        if not po:
            po = self.db.query(PurchaseOrderModel).filter(PurchaseOrderModel.purchase_order_id == po_id).first()
        if not po:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase Order not found")
        return self._build_po_read(po)

    def update_po_status(self, po_id: str, new_status: str, current_user: User) -> PurchaseOrderRead:
        self.verify_permission(current_user)
        po = self.db.query(PurchaseOrderModel).filter(PurchaseOrderModel.id == po_id).first()
        if not po:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase Order not found")

        po.purchase_order_status = new_status
        self.db.commit()
        self.db.refresh(po)
        return self._build_po_read(po)

    # ---------------------------------------------------------
    # Goods Receiving & Module 5 Stock Update Integration
    # ---------------------------------------------------------
    def receive_goods_for_po(self, po_id: str, input_data: GoodsReceiptInput, current_user: User) -> PurchaseOrderRead:
        po = self.db.query(PurchaseOrderModel).filter(PurchaseOrderModel.id == po_id).first()
        if not po:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase Order not found")

        self.verify_permission(current_user, project_id=po.project_id)

        if po.purchase_order_status in ["Completed", "Cancelled"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot receive goods for PO in '{po.purchase_order_status}' status")

        today_str = input_data.receiptDate or datetime.now(timezone.utc).strftime("%Y-%m-%d")

        # Process each received item
        for rec in input_data.items:
            po_item = self.db.query(PurchaseOrderItemModel).filter(
                PurchaseOrderItemModel.id == rec.itemId,
                PurchaseOrderItemModel.purchase_order_id == po.id
            ).first()

            if not po_item:
                continue

            added_qty = rec.receivedQuantity
            if added_qty <= 0:
                continue

            # Prevent over-receiving
            remaining_allowed = max(0.0, po_item.quantity - po_item.received_quantity)
            if added_qty > remaining_allowed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot receive {added_qty} units for '{po_item.description}'. Maximum remaining quantity allowed is {remaining_allowed}."
                )

            po_item.received_quantity += added_qty

            # INTEGRATION WITH MODULE 5 INVENTORY
            # If item is linked to a material_id, increase total & available stock in MaterialInventoryModel and log StockMovementModel
            if po_item.material_id:
                inv = self.db.query(MaterialInventoryModel).filter(MaterialInventoryModel.material_id == po_item.material_id).first()
                if not inv:
                    mat = self.db.query(MaterialModel).filter(MaterialModel.id == po_item.material_id).first()
                    inv = MaterialInventoryModel(
                        material_id=po_item.material_id,
                        total_stock=0.0,
                        allocated_stock=0.0,
                        consumed_stock=0.0,
                        available_stock=0.0,
                        min_stock_level=mat.min_stock_level if mat else 100.0,
                        status="In Stock"
                    )
                    self.db.add(inv)
                    self.db.flush()

                inv.total_stock += added_qty
                inv.available_stock += added_qty
                inv.status = "In Stock" if inv.available_stock > inv.min_stock_level else "Low Stock"

                # Create Module 5 StockMovement record
                sm = StockMovementModel(
                    material_id=po_item.material_id,
                    project_id=po.project_id,
                    movement_type="Received",
                    quantity=added_qty,
                    movement_date=today_str,
                    user_id=current_user.id,
                    user_name=current_user.full_name,
                    reference_id=po.purchase_order_id,
                    remarks=f"Goods Receipt for PO {po.purchase_order_id}. {input_data.remarks or ''}"
                )
                self.db.add(sm)

            # INTEGRATION WITH MODULE 11 BUDGET & COST
            cost = round(added_qty * po_item.unit_price, 2)
            if cost > 0:
                from app.models.budget import ActualExpense
                exp_count = self.db.query(func.count(ActualExpense.id)).scalar() or 0
                exp = ActualExpense(
                    id=str(uuid.uuid4()),
                    project_id=po.project_id,
                    expense_code=f"EXP-MAT-{(exp_count + 1):04d}",
                    category="Material",
                    amount=cost,
                    expense_date=today_str,
                    description=f"Material received for PO {po.purchase_order_id}: {po_item.description} ({added_qty} {po_item.unit})",
                    purchase_order_id=po.id,
                    source_reference=f"PO:{po.purchase_order_id}",
                    created_by=current_user.id
                )
                self.db.add(exp)

        # Check overall PO completion status
        all_completed = True
        any_received = False

        for it in po.items:
            if it.received_quantity > 0:
                any_received = True
            if it.received_quantity < it.quantity:
                all_completed = False

        if all_completed:
            po.purchase_order_status = "Completed"
            if po.procurement_request:
                po.procurement_request.request_status = "Completed"
        elif any_received:
            po.purchase_order_status = "Partially Received"

        # Emit Notification for PO Goods Receipt
        from app.services.notification_service import NotificationService
        NotificationService.create_notification(
            db=self.db,
            user_id=current_user.id,
            project_id=po.project_id,
            title=f"Goods Received for PO {po.purchase_order_id}",
            message=f"Material items received for PO {po.purchase_order_id}. Status is now {po.purchase_order_status}.",
            type="PROCUREMENT_RECEIVING",
            reference_module="procurement",
            reference_id=po.id,
            category="Procurement"
        )

        self.db.commit()
        self.db.refresh(po)
        return self._build_po_read(po)

    # ---------------------------------------------------------
    # Invoice Management & Validation
    # ---------------------------------------------------------
    def _build_invoice_read(self, inv: InvoiceModel) -> InvoiceRead:
        return InvoiceRead(
            id=inv.id,
            invoiceId=inv.invoice_id,
            invoiceNumber=inv.invoice_number,
            vendorId=inv.vendor_id,
            vendorName=inv.vendor.vendor_name if inv.vendor else None,
            purchaseOrderId=inv.purchase_order_id,
            purchaseOrderCode=inv.purchase_order.purchase_order_id if inv.purchase_order else None,
            projectId=inv.project_id,
            projectName=inv.project.project_name if inv.project else None,
            invoiceDate=inv.invoice_date,
            dueDate=inv.due_date,
            invoiceAmount=inv.invoice_amount,
            paymentStatus=inv.payment_status,
            invoiceStatus=inv.invoice_status,
            remarks=inv.remarks,
            createdAt=inv.created_at.isoformat() if inv.created_at else None
        )

    def create_invoice(self, req: InvoiceCreate, current_user: User) -> InvoiceRead:
        self.verify_permission(current_user, project_id=req.projectId)

        po = self.db.query(PurchaseOrderModel).filter(PurchaseOrderModel.id == req.purchaseOrderId).first()
        if not po:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced Purchase Order not found")

        if po.vendor_id != req.vendorId:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invoice vendor does not match Purchase Order vendor")

        if po.project_id != req.projectId:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invoice project does not match Purchase Order project")

        # Check duplicate invoice_number for same vendor
        existing = self.db.query(InvoiceModel).filter(
            InvoiceModel.vendor_id == req.vendorId,
            InvoiceModel.invoice_number == req.invoiceNumber.strip()
        ).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invoice number '{req.invoiceNumber}' already registered for this vendor")

        # Generate Invoice ID
        count = self.db.query(func.count(InvoiceModel.id)).scalar() or 0
        year = datetime.now(timezone.utc).year
        inv_code = f"INV-{year}-{(count + 1):03d}"

        new_inv = InvoiceModel(
            invoice_id=inv_code,
            invoice_number=req.invoiceNumber.strip(),
            vendor_id=req.vendorId,
            purchase_order_id=req.purchaseOrderId,
            project_id=req.projectId,
            invoice_date=req.invoiceDate,
            due_date=req.dueDate,
            invoice_amount=req.invoiceAmount,
            payment_status=req.paymentStatus or "Pending",
            invoice_status=req.invoiceStatus or "Received",
            remarks=req.remarks
        )
        self.db.add(new_inv)
        self.db.commit()
        self.db.refresh(new_inv)
        return self._build_invoice_read(new_inv)

    def get_invoices(
        self,
        projectId: Optional[str] = None,
        vendorId: Optional[str] = None,
        paymentStatus: Optional[str] = None,
        invoiceStatus: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        pageSize: int = 10,
        current_user: User = None
    ) -> PaginatedInvoicesResponse:
        self.verify_permission(current_user, project_id=projectId, read_only=True)
        query = self.db.query(InvoiceModel)

        if projectId:
            query = query.filter(InvoiceModel.project_id == projectId)
        if vendorId:
            query = query.filter(InvoiceModel.vendor_id == vendorId)
        if paymentStatus:
            query = query.filter(InvoiceModel.payment_status == paymentStatus)
        if invoiceStatus:
            query = query.filter(InvoiceModel.invoice_status == invoiceStatus)
        if search and search.strip():
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    InvoiceModel.invoice_id.ilike(s),
                    InvoiceModel.invoice_number.ilike(s),
                    InvoiceModel.remarks.ilike(s)
                )
            )

        total = query.count()
        totalPages = math.ceil(total / pageSize) if total > 0 else 1
        page = min(page, totalPages) if totalPages > 0 else 1
        offset = (page - 1) * pageSize

        invoices = query.order_by(InvoiceModel.created_at.desc()).offset(offset).limit(pageSize).all()
        items = [self._build_invoice_read(inv) for inv in invoices]

        return PaginatedInvoicesResponse(
            items=items,
            total=total,
            page=page,
            pageSize=pageSize,
            totalPages=totalPages
        )

    def update_invoice_payment_status(self, invoice_id: str, new_status: str, remarks: Optional[str], current_user: User) -> InvoiceRead:
        inv = self.db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
        if not inv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice record not found")

        self.verify_permission(current_user, project_id=inv.project_id)

        if new_status not in ["Pending", "Partially Paid", "Paid", "Overdue"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment status")

        inv.payment_status = new_status
        if remarks:
            inv.remarks = f"{inv.remarks}\nNote: {remarks}" if inv.remarks else remarks

        self.db.commit()
        self.db.refresh(inv)
        return self._build_invoice_read(inv)

    # ---------------------------------------------------------
    # Procurement Dashboard & Comprehensive Lifecycle Flow
    # ---------------------------------------------------------
    def get_dashboard_stats(self, projectId: Optional[str] = None, current_user: User = None) -> ProcurementDashboardStats:
        self.verify_permission(current_user, project_id=projectId, read_only=True)

        req_query = self.db.query(ProcurementRequestModel)
        po_query = self.db.query(PurchaseOrderModel)
        inv_query = self.db.query(InvoiceModel)

        if projectId:
            req_query = req_query.filter(ProcurementRequestModel.project_id == projectId)
            po_query = po_query.filter(PurchaseOrderModel.project_id == projectId)
            inv_query = inv_query.filter(InvoiceModel.project_id == projectId)

        total_requests = req_query.count()
        pending_reqs = req_query.filter(ProcurementRequestModel.request_status == "Pending").count()
        approved_reqs = req_query.filter(ProcurementRequestModel.request_status == "Approved").count()
        rejected_reqs = req_query.filter(ProcurementRequestModel.request_status == "Rejected").count()

        active_pos = po_query.filter(PurchaseOrderModel.purchase_order_status.in_(["Approved", "Sent", "Partially Received"])).count()
        completed_pos = po_query.filter(PurchaseOrderModel.purchase_order_status == "Completed").count()

        pending_invs = inv_query.filter(InvoiceModel.payment_status == "Pending").count()
        overdue_invs = inv_query.filter(InvoiceModel.payment_status == "Overdue").count()

        tot_val = po_query.with_entities(func.sum(PurchaseOrderModel.total_amount)).scalar() or 0.0

        # Category breakdown
        cat_counts = self.db.query(
            ProcurementRequestModel.category_name,
            func.count(ProcurementRequestModel.id)
        ).group_by(ProcurementRequestModel.category_name).all()

        cat_list = [{"category": c[0], "count": c[1]} for c in cat_counts]

        # Recent POs
        recent_pos = po_query.order_by(PurchaseOrderModel.created_at.desc()).limit(5).all()
        recent_list = [
            {
                "id": po.id,
                "purchaseOrderId": po.purchase_order_id,
                "vendorName": po.vendor.vendor_name if po.vendor else None,
                "projectName": po.project.project_name if po.project else None,
                "totalAmount": po.total_amount,
                "status": po.purchase_order_status,
                "orderDate": po.order_date
            }
            for po in recent_pos
        ]

        return ProcurementDashboardStats(
            totalRequests=total_requests,
            pendingRequests=pending_reqs,
            approvedRequests=approved_reqs,
            rejectedRequests=rejected_reqs,
            activePurchaseOrders=active_pos,
            completedPurchaseOrders=completed_pos,
            pendingInvoices=pending_invs,
            overdueInvoices=overdue_invs,
            totalProcurementValue=round(tot_val, 2),
            categoryBreakdown=cat_list,
            recentPurchaseOrders=recent_list
        )

    def get_procurement_lifecycle_detail(self, request_id: str, current_user: User) -> dict:
        self.verify_permission(current_user, read_only=True)
        r = self.db.query(ProcurementRequestModel).filter(ProcurementRequestModel.id == request_id).first()
        if not r:
            r = self.db.query(ProcurementRequestModel).filter(ProcurementRequestModel.request_id == request_id).first()
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Procurement request not found")

        pos = self.db.query(PurchaseOrderModel).filter(PurchaseOrderModel.procurement_request_id == r.id).all()
        po_ids = [po.id for po in pos]

        invoices = self.db.query(InvoiceModel).filter(InvoiceModel.purchase_order_id.in_(po_ids)).all() if po_ids else []

        return {
            "request": self._build_request_read(r),
            "purchaseOrders": [self._build_po_read(po) for po in pos],
            "invoices": [self._build_invoice_read(inv) for inv in invoices]
        }

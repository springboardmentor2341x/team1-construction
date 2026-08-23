from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.procurement_service import ProcurementService
from app.schemas.procurement import (
    ProcurementCategoryRead,
    VendorCreate,
    VendorUpdate,
    VendorStatusUpdate,
    VendorRead,
    PaginatedVendorsResponse,
    InventoryCheckItemRequest,
    InventoryCheckResponse,
    ProcurementRequestCreate,
    ProcurementRequestApproveReject,
    ProcurementRequestRead,
    PaginatedProcurementRequestsResponse,
    PurchaseOrderCreate,
    PurchaseOrderStatusUpdate,
    PurchaseOrderRead,
    PaginatedPurchaseOrdersResponse,
    GoodsReceiptInput,
    InvoiceCreate,
    InvoicePaymentStatusUpdate,
    InvoiceRead,
    PaginatedInvoicesResponse,
    ProcurementDashboardStats,
)

router = APIRouter(prefix="/procurement", tags=["Procurement Management"])


# ---------------------------------------------------------
# Categories
# ---------------------------------------------------------
@router.get("/categories", response_model=List[ProcurementCategoryRead])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.get_categories()


# ---------------------------------------------------------
# Vendors
# ---------------------------------------------------------
@router.get("/vendors", response_model=PaginatedVendorsResponse)
def get_vendors(
    search: Optional[str] = Query(None, description="Search by vendor ID, name, or contact"),
    vendorCategory: Optional[str] = Query(None, alias="vendorCategory"),
    vendorStatus: Optional[str] = Query(None, alias="vendorStatus"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=1000, alias="pageSize"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.get_vendors(
        search=search,
        vendorCategory=vendorCategory,
        vendorStatus=vendorStatus,
        page=page,
        pageSize=pageSize,
        current_user=current_user
    )


@router.get("/vendors/{vendor_id}", response_model=VendorRead)
def get_vendor_by_id(
    vendor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.get_vendor_by_id(vendor_id, current_user)


@router.post("/vendors", response_model=VendorRead, status_code=status.HTTP_201_CREATED)
def create_vendor(
    req: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.create_vendor(req, current_user)


@router.put("/vendors/{vendor_id}", response_model=VendorRead)
def update_vendor(
    vendor_id: str,
    req: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.update_vendor(vendor_id, req, current_user)


@router.put("/vendors/{vendor_id}/status", response_model=VendorRead)
def update_vendor_status(
    vendor_id: str,
    req: VendorStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.update_vendor_status(vendor_id, req.vendorStatus, current_user)


# ---------------------------------------------------------
# Module 5 Inventory Check
# ---------------------------------------------------------
@router.post("/requests/check-inventory", response_model=InventoryCheckResponse)
def check_inventory(
    items: List[InventoryCheckItemRequest],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.check_inventory_stock(items)


# ---------------------------------------------------------
# Procurement Requests & Approvals
# ---------------------------------------------------------
@router.get("/requests", response_model=PaginatedProcurementRequestsResponse)
def get_procurement_requests(
    projectId: Optional[str] = Query(None, alias="projectId"),
    categoryName: Optional[str] = Query(None, alias="categoryName"),
    requestStatus: Optional[str] = Query(None, alias="requestStatus"),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=1000, alias="pageSize"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.get_procurement_requests(
        projectId=projectId,
        categoryName=categoryName,
        requestStatus=requestStatus,
        priority=priority,
        search=search,
        page=page,
        pageSize=pageSize,
        current_user=current_user
    )


@router.get("/requests/{request_id}", response_model=ProcurementRequestRead)
def get_request_by_id(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.get_request_by_id(request_id, current_user)


@router.post("/requests", response_model=ProcurementRequestRead, status_code=status.HTTP_201_CREATED)
def create_procurement_request(
    req: ProcurementRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.create_procurement_request(req, current_user)


@router.post("/requests/{request_id}/approve", response_model=ProcurementRequestRead)
def approve_procurement_request(
    request_id: str,
    req: Optional[ProcurementRequestApproveReject] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    remarks = req.remarks if req else None
    return service.approve_procurement_request(request_id, remarks, current_user)


@router.post("/requests/{request_id}/reject", response_model=ProcurementRequestRead)
def reject_procurement_request(
    request_id: str,
    req: ProcurementRequestApproveReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    reason = req.rejectionReason or "Rejected by management"
    return service.reject_procurement_request(request_id, reason, current_user)


# ---------------------------------------------------------
# Purchase Orders & Goods Receiving
# ---------------------------------------------------------
@router.get("/purchase-orders", response_model=PaginatedPurchaseOrdersResponse)
def get_purchase_orders(
    projectId: Optional[str] = Query(None, alias="projectId"),
    vendorId: Optional[str] = Query(None, alias="vendorId"),
    purchaseOrderStatus: Optional[str] = Query(None, alias="purchaseOrderStatus"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=1000, alias="pageSize"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.get_purchase_orders(
        projectId=projectId,
        vendorId=vendorId,
        purchaseOrderStatus=purchaseOrderStatus,
        search=search,
        page=page,
        pageSize=pageSize,
        current_user=current_user
    )


@router.get("/purchase-orders/{po_id}", response_model=PurchaseOrderRead)
def get_purchase_order_by_id(
    po_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.get_purchase_order_by_id(po_id, current_user)


@router.post("/purchase-orders", response_model=PurchaseOrderRead, status_code=status.HTTP_201_CREATED)
def create_purchase_order(
    req: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.create_purchase_order(req, current_user)


@router.put("/purchase-orders/{po_id}/status", response_model=PurchaseOrderRead)
def update_po_status(
    po_id: str,
    req: PurchaseOrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.update_po_status(po_id, req.purchaseOrderStatus, current_user)


@router.post("/purchase-orders/{po_id}/receive", response_model=PurchaseOrderRead)
def receive_goods(
    po_id: str,
    input_data: GoodsReceiptInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.receive_goods_for_po(po_id, input_data, current_user)


# ---------------------------------------------------------
# Invoices & Payment Status
# ---------------------------------------------------------
@router.get("/invoices", response_model=PaginatedInvoicesResponse)
def get_invoices(
    projectId: Optional[str] = Query(None, alias="projectId"),
    vendorId: Optional[str] = Query(None, alias="vendorId"),
    paymentStatus: Optional[str] = Query(None, alias="paymentStatus"),
    invoiceStatus: Optional[str] = Query(None, alias="invoiceStatus"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=1000, alias="pageSize"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.get_invoices(
        projectId=projectId,
        vendorId=vendorId,
        paymentStatus=paymentStatus,
        invoiceStatus=invoiceStatus,
        search=search,
        page=page,
        pageSize=pageSize,
        current_user=current_user
    )


@router.post("/invoices", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
def create_invoice(
    req: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.create_invoice(req, current_user)


@router.put("/invoices/{invoice_id}/payment-status", response_model=InvoiceRead)
def update_invoice_payment_status(
    invoice_id: str,
    req: InvoicePaymentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.update_invoice_payment_status(invoice_id, req.paymentStatus, req.remarks, current_user)


# ---------------------------------------------------------
# Executive Dashboard & Lifecycle Details
# ---------------------------------------------------------
@router.get("/dashboard", response_model=ProcurementDashboardStats)
def get_dashboard_stats(
    projectId: Optional[str] = Query(None, alias="projectId"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.get_dashboard_stats(projectId=projectId, current_user=current_user)


@router.get("/workflow/{request_id}")
def get_procurement_workflow_detail(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProcurementService(db)
    return service.get_procurement_lifecycle_detail(request_id, current_user)

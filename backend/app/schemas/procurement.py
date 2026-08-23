from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime


# --- Category Schemas ---
class ProcurementCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProcurementCategoryCreate(ProcurementCategoryBase):
    pass


class ProcurementCategoryRead(ProcurementCategoryBase):
    id: str
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


# --- Vendor Schemas ---
class VendorBase(BaseModel):
    vendorId: str
    vendorName: str
    contactPerson: Optional[str] = None
    contactNumber: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    vendorCategory: Optional[str] = "Raw Materials"
    productsOrServicesSupplied: Optional[str] = None
    vendorStatus: Optional[str] = "Active"


class VendorCreate(VendorBase):
    pass


class VendorUpdate(BaseModel):
    vendorName: Optional[str] = None
    contactPerson: Optional[str] = None
    contactNumber: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    vendorCategory: Optional[str] = None
    productsOrServicesSupplied: Optional[str] = None
    vendorStatus: Optional[str] = None


class VendorStatusUpdate(BaseModel):
    vendorStatus: str


class VendorRead(VendorBase):
    id: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True


class PaginatedVendorsResponse(BaseModel):
    items: List[VendorRead]
    total: int
    page: int
    pageSize: int
    totalPages: int


# --- Inventory Check Models ---
class InventoryCheckItemRequest(BaseModel):
    materialId: Optional[str] = None
    itemDescription: str
    requiredQuantity: float


class InventoryCheckItemResponse(BaseModel):
    materialId: Optional[str] = None
    itemDescription: str
    requiredQuantity: float
    availableStock: float
    netProcurementQuantity: float
    isSufficientStock: bool


class InventoryCheckResponse(BaseModel):
    items: List[InventoryCheckItemResponse]
    hasStockShortage: bool


# --- Procurement Request Item Schemas ---
class ProcurementRequestItemBase(BaseModel):
    materialId: Optional[str] = None
    itemDescription: str
    categoryName: Optional[str] = "Raw Materials"
    requiredQuantity: float
    unit: Optional[str] = "Units"
    requiredDate: str
    remarks: Optional[str] = None


class ProcurementRequestItemCreate(ProcurementRequestItemBase):
    pass


class ProcurementRequestItemRead(ProcurementRequestItemBase):
    id: str
    procurementRequestId: str
    availableStock: Optional[float] = 0.0
    netProcurementQuantity: Optional[float] = 0.0
    materialName: Optional[str] = None

    class Config:
        from_attributes = True


# --- Procurement Request Schemas ---
class ProcurementRequestBase(BaseModel):
    projectId: str
    categoryName: Optional[str] = "Raw Materials"
    purpose: Optional[str] = None
    priority: Optional[str] = "Medium"
    remarks: Optional[str] = None


class ProcurementRequestCreate(ProcurementRequestBase):
    items: List[ProcurementRequestItemCreate]


class ProcurementRequestApproveReject(BaseModel):
    rejectionReason: Optional[str] = None
    remarks: Optional[str] = None


class ProcurementRequestRead(ProcurementRequestBase):
    id: str
    requestId: str
    projectName: Optional[str] = None
    projectCode: Optional[str] = None
    requestDate: str
    requestStatus: str
    requestedById: Optional[str] = None
    requestedByName: str
    approvedById: Optional[str] = None
    approvedByName: Optional[str] = None
    approvedAt: Optional[str] = None
    rejectedById: Optional[str] = None
    rejectedByName: Optional[str] = None
    rejectedAt: Optional[str] = None
    rejectionReason: Optional[str] = None
    createdAt: Optional[str] = None
    items: List[ProcurementRequestItemRead] = []

    class Config:
        from_attributes = True


class PaginatedProcurementRequestsResponse(BaseModel):
    items: List[ProcurementRequestRead]
    total: int
    page: int
    pageSize: int
    totalPages: int


# --- Purchase Order Item Schemas ---
class PurchaseOrderItemBase(BaseModel):
    materialId: Optional[str] = None
    description: str
    quantity: float
    unit: Optional[str] = "Units"
    unitPrice: float = 0.0
    tax: Optional[float] = 0.0
    discount: Optional[float] = 0.0


class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass


class PurchaseOrderItemRead(PurchaseOrderItemBase):
    id: str
    purchaseOrderId: str
    receivedQuantity: float = 0.0
    lineTotal: float = 0.0
    materialName: Optional[str] = None

    class Config:
        from_attributes = True


# --- Purchase Order Schemas ---
class PurchaseOrderBase(BaseModel):
    vendorId: str
    projectId: str
    procurementRequestId: Optional[str] = None
    expectedDeliveryDate: str
    taxAmount: Optional[float] = 0.0
    additionalCharges: Optional[float] = 0.0
    remarks: Optional[str] = None


class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]


class PurchaseOrderStatusUpdate(BaseModel):
    purchaseOrderStatus: str


class GoodsReceiptItemInput(BaseModel):
    itemId: str
    receivedQuantity: float


class GoodsReceiptInput(BaseModel):
    items: List[GoodsReceiptItemInput]
    receiptDate: Optional[str] = None
    remarks: Optional[str] = None


class PurchaseOrderRead(PurchaseOrderBase):
    id: str
    purchaseOrderId: str
    vendorName: Optional[str] = None
    projectName: Optional[str] = None
    projectCode: Optional[str] = None
    procurementRequestId: Optional[str] = None
    procurementRequestCode: Optional[str] = None
    orderDate: str
    subtotal: float = 0.0
    taxAmount: float = 0.0
    additionalCharges: float = 0.0
    totalAmount: float = 0.0
    purchaseOrderStatus: str
    createdById: Optional[str] = None
    createdByName: str
    approvedByName: Optional[str] = None
    createdAt: Optional[str] = None
    items: List[PurchaseOrderItemRead] = []

    class Config:
        from_attributes = True


class PaginatedPurchaseOrdersResponse(BaseModel):
    items: List[PurchaseOrderRead]
    total: int
    page: int
    pageSize: int
    totalPages: int


# --- Invoice Schemas ---
class InvoiceBase(BaseModel):
    invoiceNumber: str
    vendorId: str
    purchaseOrderId: str
    projectId: str
    invoiceDate: str
    dueDate: str
    invoiceAmount: float
    paymentStatus: Optional[str] = "Pending"
    invoiceStatus: Optional[str] = "Received"
    remarks: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoicePaymentStatusUpdate(BaseModel):
    paymentStatus: str
    remarks: Optional[str] = None


class InvoiceRead(InvoiceBase):
    id: str
    invoiceId: str
    vendorName: Optional[str] = None
    projectName: Optional[str] = None
    purchaseOrderCode: Optional[str] = None
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


class PaginatedInvoicesResponse(BaseModel):
    items: List[InvoiceRead]
    total: int
    page: int
    pageSize: int
    totalPages: int


# --- Dashboard Stats Schema ---
class ProcurementDashboardStats(BaseModel):
    totalRequests: int
    pendingRequests: int
    approvedRequests: int
    rejectedRequests: int
    activePurchaseOrders: int
    completedPurchaseOrders: int
    pendingInvoices: int
    overdueInvoices: int
    totalProcurementValue: float
    categoryBreakdown: List[dict]
    recentPurchaseOrders: List[dict]

export interface ProcurementCategory {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface Vendor {
  id: string;
  vendorId: string;
  vendorName: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  vendorCategory?: string;
  productsOrServicesSupplied?: string;
  vendorStatus: 'Active' | 'Inactive' | 'Blacklisted';
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedVendorsResponse {
  items: Vendor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InventoryCheckItemRequest {
  materialId?: string;
  itemDescription: string;
  requiredQuantity: number;
}

export interface InventoryCheckItemResponse {
  materialId?: string;
  itemDescription: string;
  requiredQuantity: number;
  availableStock: number;
  netProcurementQuantity: number;
  isSufficientStock: boolean;
}

export interface InventoryCheckResponse {
  items: InventoryCheckItemResponse[];
  hasStockShortage: boolean;
}

export interface ProcurementRequestItem {
  id?: string;
  procurementRequestId?: string;
  materialId?: string;
  itemDescription: string;
  categoryName?: string;
  requiredQuantity: number;
  availableStock?: number;
  netProcurementQuantity?: number;
  unit?: string;
  requiredDate: string;
  remarks?: string;
  materialName?: string;
}

export interface ProcurementRequest {
  id: string;
  requestId: string;
  projectId: string;
  projectName?: string;
  projectCode?: string;
  categoryName?: string;
  purpose?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  requestDate: string;
  requestStatus: 'Pending' | 'Approved' | 'Rejected' | 'Processing' | 'Completed' | 'Cancelled';
  remarks?: string;
  requestedById?: string;
  requestedByName: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedById?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  items: ProcurementRequestItem[];
}

export interface PaginatedProcurementRequestsResponse {
  items: ProcurementRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PurchaseOrderItem {
  id?: string;
  purchaseOrderId?: string;
  materialId?: string;
  description: string;
  quantity: number;
  receivedQuantity?: number;
  unit?: string;
  unitPrice: number;
  tax?: number;
  discount?: number;
  lineTotal?: number;
  materialName?: string;
}

export interface PurchaseOrder {
  id: string;
  purchaseOrderId: string;
  vendorId: string;
  vendorName?: string;
  projectId: string;
  projectName?: string;
  projectCode?: string;
  procurementRequestId?: string;
  procurementRequestCode?: string;
  orderDate: string;
  expectedDeliveryDate: string;
  subtotal: number;
  taxAmount: number;
  additionalCharges: number;
  totalAmount: number;
  purchaseOrderStatus: 'Draft' | 'Approved' | 'Sent' | 'Partially Received' | 'Completed' | 'Cancelled';
  remarks?: string;
  createdById?: string;
  createdByName: string;
  approvedByName?: string;
  createdAt?: string;
  items: PurchaseOrderItem[];
}

export interface PaginatedPurchaseOrdersResponse {
  items: PurchaseOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GoodsReceiptItemInput {
  itemId: string;
  receivedQuantity: number;
}

export interface GoodsReceiptInput {
  items: GoodsReceiptItemInput[];
  receiptDate?: string;
  remarks?: string;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName?: string;
  purchaseOrderId: string;
  purchaseOrderCode?: string;
  projectId: string;
  projectName?: string;
  invoiceDate: string;
  dueDate: string;
  invoiceAmount: number;
  paymentStatus: 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue';
  invoiceStatus: 'Received' | 'Verified' | 'Disputed' | 'Cancelled';
  remarks?: string;
  createdAt?: string;
}

export interface PaginatedInvoicesResponse {
  items: Invoice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProcurementDashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  activePurchaseOrders: number;
  completedPurchaseOrders: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalProcurementValue: number;
  categoryBreakdown: { category: string; count: number }[];
  recentPurchaseOrders: any[];
}

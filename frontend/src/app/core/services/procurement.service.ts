import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProcurementCategory,
  Vendor,
  PaginatedVendorsResponse,
  InventoryCheckItemRequest,
  InventoryCheckResponse,
  ProcurementRequest,
  PaginatedProcurementRequestsResponse,
  PurchaseOrder,
  PaginatedPurchaseOrdersResponse,
  GoodsReceiptInput,
  Invoice,
  PaginatedInvoicesResponse,
  ProcurementDashboardStats,
} from '../models/procurement.model';

export type { ProcurementRequest } from '../models/procurement.model';


@Injectable({
  providedIn: 'root'
})
export class ProcurementService {
  private apiUrl = `${environment.apiUrl}/procurement`;

  constructor(private http: HttpClient) {}

  // --- Legacy Compatibility Methods ---
  getProcurements(projectId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('project_id', projectId);
    return this.http.get<any[]>(`${environment.apiUrl}/procurements`, { params });
  }

  createProcurement(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/procurements`, data);
  }

  updateProcurement(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/procurements/${id}`, data);
  }

  issuePO(id: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/procurements/${id}/issue-po`, {});
  }

  markReceived(id: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/procurements/${id}/mark-received`, {});
  }

  deleteProcurement(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/procurements/${id}`);
  }


  // --- Categories ---
  getCategories(): Observable<ProcurementCategory[]> {
    return this.http.get<ProcurementCategory[]>(`${this.apiUrl}/categories`);
  }

  // --- Vendors ---
  getVendors(filters?: {
    search?: string;
    vendorCategory?: string;
    vendorStatus?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedVendorsResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.vendorCategory) params = params.set('vendorCategory', filters.vendorCategory);
      if (filters.vendorStatus) params = params.set('vendorStatus', filters.vendorStatus);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }
    return this.http.get<PaginatedVendorsResponse>(`${this.apiUrl}/vendors`, { params });
  }

  getVendorById(id: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.apiUrl}/vendors/${id}`);
  }

  createVendor(data: Partial<Vendor>): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.apiUrl}/vendors`, data);
  }

  updateVendor(id: string, data: Partial<Vendor>): Observable<Vendor> {
    return this.http.put<Vendor>(`${this.apiUrl}/vendors/${id}`, data);
  }

  updateVendorStatus(id: string, status: string): Observable<Vendor> {
    return this.http.put<Vendor>(`${this.apiUrl}/vendors/${id}/status`, { vendorStatus: status });
  }

  // --- Inventory Check ---
  checkInventory(items: InventoryCheckItemRequest[]): Observable<InventoryCheckResponse> {
    return this.http.post<InventoryCheckResponse>(`${this.apiUrl}/requests/check-inventory`, items);
  }

  // --- Procurement Requests ---
  getProcurementRequests(filters?: {
    projectId?: string;
    categoryName?: string;
    requestStatus?: string;
    priority?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedProcurementRequestsResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.categoryName) params = params.set('categoryName', filters.categoryName);
      if (filters.requestStatus) params = params.set('requestStatus', filters.requestStatus);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }
    return this.http.get<PaginatedProcurementRequestsResponse>(`${this.apiUrl}/requests`, { params });
  }

  getRequestById(id: string): Observable<ProcurementRequest> {
    return this.http.get<ProcurementRequest>(`${this.apiUrl}/requests/${id}`);
  }

  createProcurementRequest(data: any): Observable<ProcurementRequest> {
    return this.http.post<ProcurementRequest>(`${this.apiUrl}/requests`, data);
  }

  approveRequest(id: string, remarks?: string): Observable<ProcurementRequest> {
    return this.http.post<ProcurementRequest>(`${this.apiUrl}/requests/${id}/approve`, { remarks });
  }

  rejectRequest(id: string, rejectionReason: string): Observable<ProcurementRequest> {
    return this.http.post<ProcurementRequest>(`${this.apiUrl}/requests/${id}/reject`, { rejectionReason });
  }

  // --- Purchase Orders ---
  getPurchaseOrders(filters?: {
    projectId?: string;
    vendorId?: string;
    purchaseOrderStatus?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedPurchaseOrdersResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.vendorId) params = params.set('vendorId', filters.vendorId);
      if (filters.purchaseOrderStatus) params = params.set('purchaseOrderStatus', filters.purchaseOrderStatus);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }
    return this.http.get<PaginatedPurchaseOrdersResponse>(`${this.apiUrl}/purchase-orders`, { params });
  }

  getPurchaseOrderById(id: string): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/purchase-orders/${id}`);
  }

  createPurchaseOrder(data: any): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/purchase-orders`, data);
  }

  updatePOStatus(id: string, status: string): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}/purchase-orders/${id}/status`, { purchaseOrderStatus: status });
  }

  receiveGoods(id: string, input: GoodsReceiptInput): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/purchase-orders/${id}/receive`, input);
  }

  // --- Invoices ---
  getInvoices(filters?: {
    projectId?: string;
    vendorId?: string;
    paymentStatus?: string;
    invoiceStatus?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedInvoicesResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.vendorId) params = params.set('vendorId', filters.vendorId);
      if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);
      if (filters.invoiceStatus) params = params.set('invoiceStatus', filters.invoiceStatus);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }
    return this.http.get<PaginatedInvoicesResponse>(`${this.apiUrl}/invoices`, { params });
  }

  createInvoice(data: any): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/invoices`, data);
  }

  updateInvoicePaymentStatus(id: string, paymentStatus: string, remarks?: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/invoices/${id}/payment-status`, { paymentStatus, remarks });
  }

  // --- Dashboard & Lifecycle ---
  getDashboardStats(projectId?: string): Observable<ProcurementDashboardStats> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<ProcurementDashboardStats>(`${this.apiUrl}/dashboard`, { params });
  }

  getProcurementWorkflowDetail(requestId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/workflow/${requestId}`);
  }
}

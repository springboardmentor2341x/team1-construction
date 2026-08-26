import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  materialCode: string;
  name: string;
  categoryId?: string;
  categoryName: string;
  unitOfMeasure: string;
  unitPrice?: number;
  minStockLevel: number;
  description?: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  totalStock: number;
  allocatedStock: number;
  consumedStock: number;
  availableStock: number;
  stockStatus: string;
}

export interface InventoryItem {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  categoryName: string;
  unitOfMeasure: string;
  warehouseLocation: string;
  totalStock: number;
  allocatedStock: number;
  consumedStock: number;
  availableStock: number;
  minStockLevel: number;
  status: string;
  lastUpdated: string;
}

export interface MaterialRequest {
  id: string;
  requestCode: string;
  projectId: string;
  projectName?: string;
  materialId: string;
  materialName: string;
  categoryName: string;
  unit: string;
  requiredQuantity: number;
  availableStockNow: number;
  shortageQuantity: number;
  requiredDate: string;
  workActivity: string;
  remarks?: string;
  requestedById?: string;
  requestedByName: string;
  requestDate: string;
  status: string;
  reviewRemarks?: string;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface MaterialAllocation {
  id: string;
  projectId: string;
  projectName?: string;
  materialId: string;
  materialName: string;
  categoryName: string;
  unit: string;
  quantity: number;
  consumedQuantity: number;
  remainingQuantity: number;
  allocationDate: string;
  workActivity: string;
  responsibleUserId?: string;
  responsibleUserName: string;
  requestId?: string;
  remarks?: string;
  status: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  materialId: string;
  materialName: string;
  categoryName: string;
  unit: string;
  projectId?: string;
  projectName?: string;
  movementType: string;
  quantity: number;
  movementDate: string;
  userId?: string;
  userName: string;
  referenceId?: string;
  remarks?: string;
  createdAt: string;
}

export interface ProjectMaterialUsage {
  projectId: string;
  projectName: string;
  materialId: string;
  materialName: string;
  unit: string;
  requestedQuantity: number;
  allocatedQuantity: number;
  consumedQuantity: number;
  remainingQuantity: number;
  lastAllocationDate?: string;
  workActivity?: string;
}

export interface InventoryDashboard {
  totalMaterials: number;
  totalAvailableStock: number;
  totalAllocatedStock: number;
  totalConsumedStock: number;
  lowStockCount: number;
  pendingRequestsCount: number;
  recentMovementsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Categories
  getCategories(): Observable<MaterialCategory[]> {
    return this.http.get<MaterialCategory[]>(`${this.apiUrl}/materials/categories`);
  }

  createCategory(category: { name: string; description?: string }): Observable<MaterialCategory> {
    return this.http.post<MaterialCategory>(`${this.apiUrl}/materials/categories`, category);
  }

  // Materials Master
  getMaterials(categoryId?: string): Observable<Material[]> {
    let params = new HttpParams();
    if (categoryId) params = params.set('category_id', categoryId);
    return this.http.get<Material[]>(`${this.apiUrl}/materials`, { params });
  }

  getMaterial(id: string): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/materials/${id}`);
  }

  createMaterial(material: any): Observable<Material> {
    return this.http.post<Material>(`${this.apiUrl}/materials`, material);
  }

  updateMaterial(id: string, update: any): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/materials/${id}`, update);
  }

  // Inventory & Stock Receiving
  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory`);
  }

  getLowStockInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory/low-stock`);
  }

  getProjectMaterialUsage(projectId?: string): Observable<ProjectMaterialUsage[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('project_id', projectId);
    return this.http.get<ProjectMaterialUsage[]>(`${this.apiUrl}/inventory/project-usage`, { params });
  }

  getInventoryDashboard(): Observable<InventoryDashboard> {
    return this.http.get<InventoryDashboard>(`${this.apiUrl}/inventory/dashboard`);
  }

  receiveStock(req: { materialId: string; quantity: number; warehouseLocation?: string; remarks?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventory/receive`, req);
  }

  updateDirectStock(materialId: string, data: { availableStock: number; totalStock?: number; minStockLevel?: number; status?: string; remarks?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/inventory/${materialId}/stock`, data);
  }

  // Material Requests
  getMaterialRequests(projectId?: string, statusFilter?: string): Observable<MaterialRequest[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('project_id', projectId);
    if (statusFilter) params = params.set('status_filter', statusFilter);
    return this.http.get<MaterialRequest[]>(`${this.apiUrl}/material-requests`, { params });
  }

  createMaterialRequest(req: any): Observable<MaterialRequest> {
    return this.http.post<MaterialRequest>(`${this.apiUrl}/material-requests`, req);
  }

  reviewMaterialRequest(id: string, review: { status: string; reviewRemarks?: string }): Observable<MaterialRequest> {
    return this.http.put<MaterialRequest>(`${this.apiUrl}/material-requests/${id}/approve`, review);
  }

  // Material Allocations
  getMaterialAllocations(projectId?: string): Observable<MaterialAllocation[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('project_id', projectId);
    return this.http.get<MaterialAllocation[]>(`${this.apiUrl}/material-allocations`, { params });
  }

  createMaterialAllocation(allocation: any): Observable<MaterialAllocation> {
    return this.http.post<MaterialAllocation>(`${this.apiUrl}/material-allocations`, allocation);
  }

  consumeMaterialAllocation(id: string, consumption: { consumedQuantity: number; remarks?: string }): Observable<MaterialAllocation> {
    return this.http.post<MaterialAllocation>(`${this.apiUrl}/material-allocations/${id}/consume`, consumption);
  }

  // Stock Movements History
  getStockMovements(materialId?: string, projectId?: string): Observable<StockMovement[]> {
    let params = new HttpParams();
    if (materialId) params = params.set('material_id', materialId);
    if (projectId) params = params.set('project_id', projectId);
    return this.http.get<StockMovement[]>(`${this.apiUrl}/stock-movements`, { params });
  }
}

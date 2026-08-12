import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Resource {
  id: string;
  equipmentCode: string;
  name: string;
  category: string;
  description?: string;
  status: string;
  location: string;
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  projectId?: string;
  projectName?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  utilizationPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  resourceCode?: string;
  resourceName?: string;
  category?: string;
  projectId: string;
  projectName?: string;
  allocationDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  location?: string;
  notes?: string;
  status: string;
  createdAt?: string;
}

export interface ResourceUtilization {
  id: string;
  resourceId: string;
  resourceCode?: string;
  resourceName?: string;
  category?: string;
  projectId?: string;
  projectName?: string;
  date: string;
  operatingHours: number;
  idleHours: number;
  totalAvailableHours: number;
  utilizationPercentage: number;
  notes?: string;
  createdAt?: string;
}

export interface ResourceMaintenance {
  id: string;
  resourceId: string;
  resourceCode?: string;
  resourceName?: string;
  category?: string;
  maintenanceDate: string;
  nextMaintenanceDate?: string;
  maintenanceType: string;
  serviceEngineer?: string;
  maintenanceCost: number;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceDashboard {
  totalResources: number;
  availableCount: number;
  allocatedCount: number;
  underMaintenanceCount: number;
  outOfServiceCount: number;
  upcomingMaintenanceCount: number;
  avgUtilizationPercentage: number;
  categoryCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  recentAllocations: ResourceAllocation[];
  recentMaintenances: ResourceMaintenance[];
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiUrl = `${environment.apiUrl}/resources`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getDashboard(): Observable<ResourceDashboard> {
    return this.http.get<ResourceDashboard>(`${this.apiUrl}/dashboard`);
  }

  getResources(filters?: {
    search?: string;
    category?: string;
    status?: string;
    projectId?: string;
    location?: string;
  }): Observable<Resource[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.projectId) params = params.set('projectId', filters.projectId);
      if (filters.location) params = params.set('location', filters.location);
    }
    return this.http.get<Resource[]>(this.apiUrl, { params });
  }

  getResource(id: string): Observable<Resource> {
    return this.http.get<Resource>(`${this.apiUrl}/${id}`);
  }

  createResource(data: Partial<Resource>): Observable<Resource> {
    return this.http.post<Resource>(this.apiUrl, data);
  }

  updateResource(id: string, data: Partial<Resource>): Observable<Resource> {
    return this.http.put<Resource>(`${this.apiUrl}/${id}`, data);
  }

  updateStatus(id: string, status: string): Observable<Resource> {
    return this.http.patch<Resource>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteResource(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  checkAvailability(category?: string, startDate?: string, endDate?: string): Observable<Resource[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<Resource[]>(`${this.apiUrl}/availability`, { params });
  }

  // Allocations
  getAllocations(projectId?: string, resourceId?: string, status?: string): Observable<ResourceAllocation[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    if (resourceId) params = params.set('resourceId', resourceId);
    if (status) params = params.set('status', status);
    return this.http.get<ResourceAllocation[]>(`${this.apiUrl}/allocations/list`, { params });
  }

  createAllocation(data: Partial<ResourceAllocation>): Observable<ResourceAllocation> {
    return this.http.post<ResourceAllocation>(`${this.apiUrl}/allocations`, data);
  }

  returnAllocation(allocationId: string, actualReturnDate?: string): Observable<ResourceAllocation> {
    return this.http.post<ResourceAllocation>(`${this.apiUrl}/allocations/${allocationId}/return`, { actualReturnDate });
  }

  // Utilization
  getUtilizations(resourceId?: string, projectId?: string): Observable<ResourceUtilization[]> {
    let params = new HttpParams();
    if (resourceId) params = params.set('resourceId', resourceId);
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<ResourceUtilization[]>(`${this.apiUrl}/utilization/list`, { params });
  }

  createUtilization(data: Partial<ResourceUtilization>): Observable<ResourceUtilization> {
    return this.http.post<ResourceUtilization>(`${this.apiUrl}/utilization`, data);
  }

  // Maintenance
  getMaintenances(resourceId?: string, status?: string): Observable<ResourceMaintenance[]> {
    let params = new HttpParams();
    if (resourceId) params = params.set('resourceId', resourceId);
    if (status) params = params.set('status', status);
    return this.http.get<ResourceMaintenance[]>(`${this.apiUrl}/maintenance/list`, { params });
  }

  getMaintenanceDue(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/maintenance/due`);
  }

  createMaintenance(data: Partial<ResourceMaintenance>): Observable<ResourceMaintenance> {
    return this.http.post<ResourceMaintenance>(`${this.apiUrl}/maintenance`, data);
  }

  updateMaintenance(id: string, data: Partial<ResourceMaintenance>): Observable<ResourceMaintenance> {
    return this.http.put<ResourceMaintenance>(`${this.apiUrl}/maintenance/${id}`, data);
  }
}

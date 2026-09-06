import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InventoryItem {
  id: string;
  item_name?: string;
  materialId?: string;
  materialCode?: string;
  materialName?: string;
  categoryName?: string;
  unitOfMeasure?: string;
  warehouseLocation?: string;
  quantity?: number;
  totalStock?: number;
  allocatedStock?: number;
  consumedStock?: number;
  availableStock?: number;
  minStockLevel?: number;
  project_id?: string;
  status: string;
  lastUpdated?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getInventory(projectId?: string): Observable<InventoryItem[]> {
    let url = this.apiUrl;
    if (projectId) {
      url += `?project_id=${projectId}`;
    }
    return this.http.get<InventoryItem[]>(url);
  }

  createInventoryItem(data: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl, data);
  }

  updateInventoryItem(id: string, data: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, data);
  }

  deleteInventoryItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

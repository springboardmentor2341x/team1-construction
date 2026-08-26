import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { MaterialService, InventoryItem, InventoryDashboard, ProjectMaterialUsage, Material } from '../../../core/services/material.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block"><app-sidebar></app-sidebar></div>
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">

          <!-- Header -->
          <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <nav aria-label="breadcrumb"><ol class="breadcrumb small mb-1">
                <li class="breadcrumb-item"><a routerLink="/dashboard/admin" class="text-decoration-none text-warning">Dashboard</a></li>
                <li class="breadcrumb-item active">Inventory Monitoring</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-boxes me-2 text-warning"></i>Inventory Stock & Monitoring</h2>
              <p class="text-muted small mb-0">Real-time stock calculations (Available = Total - Allocated), low-stock alerts, and stock receipt.</p>
            </div>
            <div class="d-flex gap-2">
              <a routerLink="/inventory/procurement" class="btn btn-warning btn-sm fw-bold"><i class="bi bi-cart-fill me-1"></i>Procurement Requests</a>
              <button class="btn btn-bt-primary btn-sm" (click)="openReceiveModal()"><i class="bi bi-box-arrow-in-down me-1"></i>Receive Stock</button>
            </div>
          </div>

          <!-- Alert -->
          <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show small" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            <button type="button" class="btn-close" (click)="errorMessage=''"></button>
          </div>
          <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show small" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
            <button type="button" class="btn-close" (click)="successMessage=''"></button>
          </div>

          <!-- Real KPI Dashboard Summary Cards -->
          <div class="row g-3 mb-4" *ngIf="dashboard() as d">
            <div class="col-6 col-lg-2">
              <div class="card card-custom border-0 p-3 text-center h-100">
                <div class="small text-muted mb-1">Total Materials</div>
                <div class="fw-bold fs-4 text-dark">{{ d.totalMaterials }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-2">
              <div class="card card-custom border-0 p-3 text-center h-100">
                <div class="small text-muted mb-1">Available Stock</div>
                <div class="fw-bold fs-4 text-success">{{ d.totalAvailableStock | number:'1.0-1' }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-2">
              <div class="card card-custom border-0 p-3 text-center h-100">
                <div class="small text-muted mb-1">Allocated Stock</div>
                <div class="fw-bold fs-4 text-primary">{{ d.totalAllocatedStock | number:'1.0-1' }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-2">
              <div class="card card-custom border-0 p-3 text-center h-100">
                <div class="small text-muted mb-1">Consumed Stock</div>
                <div class="fw-bold fs-4 text-secondary">{{ d.totalConsumedStock | number:'1.0-1' }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-2">
              <div class="card card-custom border-0 p-3 text-center h-100" [ngClass]="{'border-danger border': d.lowStockCount > 0}">
                <div class="small text-muted mb-1">Low Stock Alerts</div>
                <div class="fw-bold fs-4" [ngClass]="d.lowStockCount > 0 ? 'text-danger' : 'text-dark'">{{ d.lowStockCount }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-2">
              <div class="card card-custom border-0 p-3 text-center h-100">
                <div class="small text-muted mb-1">Pending Requests</div>
                <div class="fw-bold fs-4 text-warning">{{ d.pendingRequestsCount }}</div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <ul class="nav nav-tabs border-bottom mb-4">
            <li class="nav-item">
              <button class="nav-link py-2 px-3 fw-semibold" [ngClass]="{'active': activeTab === 'all'}" (click)="activeTab = 'all'">
                <i class="bi bi-list-columns-reverse me-1"></i>All Inventory Stock
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-2 px-3 fw-semibold" [ngClass]="{'active': activeTab === 'low'}" (click)="activeTab = 'low'">
                <i class="bi bi-exclamation-octagon me-1"></i>Low-Stock Alert Monitor
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-2 px-3 fw-semibold" [ngClass]="{'active': activeTab === 'project'}" (click)="activeTab = 'project'; loadProjectUsage()">
                <i class="bi bi-diagram-3 me-1"></i>Project-wise Usage Tracking
              </button>
            </li>
          </ul>

          <!-- Tab 1: All Inventory Stock -->
          <div *ngIf="activeTab === 'all'">
            <div class="card card-custom border-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light small text-uppercase">
                    <tr>
                      <th>Material Code</th>
                      <th>Material Name</th>
                      <th>Warehouse</th>
                      <th>Total Stock</th>
                      <th>Allocated</th>
                      <th>Consumed</th>
                      <th>Available Stock</th>
                      <th>Min Level</th>
                      <th>Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="small">
                    <tr *ngFor="let item of inventory()">
                      <td><span class="badge bg-dark-subtle text-dark font-monospace">{{ item.materialCode }}</span></td>
                      <td class="fw-bold text-dark">{{ item.materialName }}</td>
                      <td><i class="bi bi-geo-alt me-1 text-muted"></i>{{ item.warehouseLocation }}</td>
                      <td>{{ item.totalStock | number:'1.0-2' }} {{ item.unitOfMeasure }}</td>
                      <td class="text-primary fw-semibold">{{ item.allocatedStock | number:'1.0-2' }}</td>
                      <td class="text-secondary">{{ item.consumedStock | number:'1.0-2' }}</td>
                      <td class="fw-bold fs-6" [ngClass]="item.availableStock <= item.minStockLevel ? 'text-danger' : 'text-success'">
                        {{ item.availableStock | number:'1.0-2' }} {{ item.unitOfMeasure }}
                      </td>
                      <td>{{ item.minStockLevel | number:'1.0-2' }}</td>
                      <td>
                        <span class="badge rounded-pill" [ngClass]="getStatusBadge(item.status)">{{ item.status }}</span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary" (click)="openUpdateStockModal(item)"><i class="bi bi-pencil-square me-1"></i>Update Stock</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Tab 2: Low-Stock Monitor -->
          <div *ngIf="activeTab === 'low'">
            <div class="card card-custom border-0 p-3">
              <h6 class="fw-bold text-danger mb-3"><i class="bi bi-exclamation-triangle-fill me-2"></i>Critical Low-Stock Materials Detection</h6>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light small text-uppercase">
                    <tr>
                      <th>Material Code</th>
                      <th>Material Name</th>
                      <th>Available Stock</th>
                      <th>Minimum Threshold</th>
                      <th>Shortage Amount</th>
                      <th>Status</th>
                      <th class="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody class="small">
                    <tr *ngFor="let item of lowStockInventory()">
                      <td><span class="badge bg-dark-subtle text-dark font-monospace">{{ item.materialCode }}</span></td>
                      <td class="fw-bold text-dark">{{ item.materialName }}</td>
                      <td class="fw-bold text-danger">{{ item.availableStock | number:'1.0-2' }} {{ item.unitOfMeasure }}</td>
                      <td>{{ item.minStockLevel | number:'1.0-2' }} {{ item.unitOfMeasure }}</td>
                      <td class="text-danger fw-bold">+{{ (item.minStockLevel - item.availableStock) | number:'1.0-2' }}</td>
                      <td><span class="badge rounded-pill" [ngClass]="getStatusBadge(item.status)">{{ item.status }}</span></td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-bt-primary" (click)="openReceiveModalFor(item.materialId)"><i class="bi bi-box-arrow-in-down me-1"></i>Restock</button>
                      </td>
                    </tr>
                    <tr *ngIf="lowStockInventory().length === 0">
                      <td colspan="7" class="text-center py-4 text-success">
                        <i class="bi bi-check-circle fs-2 d-block mb-1"></i>All materials have sufficient stock above minimum thresholds.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Tab 3: Project-wise Usage -->
          <div *ngIf="activeTab === 'project'">
            <div class="card card-custom border-0 p-3">
              <h6 class="fw-bold text-dark mb-3"><i class="bi bi-diagram-3-fill me-2 text-warning"></i>Project-wise Material Tracking Summary</h6>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light small text-uppercase">
                    <tr>
                      <th>Project Name</th>
                      <th>Material</th>
                      <th>Requested</th>
                      <th>Allocated</th>
                      <th>Consumed</th>
                      <th>Remaining</th>
                      <th>Work Activity</th>
                    </tr>
                  </thead>
                  <tbody class="small">
                    <tr *ngFor="let p of projectUsage()">
                      <td class="fw-bold text-dark"><i class="bi bi-building me-1 text-warning"></i>{{ p.projectName }}</td>
                      <td class="fw-bold">{{ p.materialName }}</td>
                      <td>{{ p.requestedQuantity | number:'1.0-2' }} {{ p.unit }}</td>
                      <td class="text-primary font-monospace">{{ p.allocatedQuantity | number:'1.0-2' }}</td>
                      <td class="text-success font-monospace">{{ p.consumedQuantity | number:'1.0-2' }}</td>
                      <td class="fw-bold" [ngClass]="p.remainingQuantity > 0 ? 'text-warning' : 'text-muted'">
                        {{ p.remainingQuantity | number:'1.0-2' }} {{ p.unit }}
                      </td>
                      <td class="text-muted">{{ p.workActivity || 'N/A' }}</td>
                    </tr>
                    <tr *ngIf="projectUsage().length === 0">
                      <td colspan="7" class="text-center py-4 text-muted">
                        No active project material allocations found.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Receive Stock Modal -->
    <div class="modal fade" id="receiveModal" tabindex="-1" [ngClass]="{'show d-block': showReceiveModal}" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-box-arrow-in-down me-2 text-warning"></i>Receive Stock Shipment</h5>
            <button type="button" class="btn-close" (click)="closeReceiveModal()"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="submitReceiveStock()">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Select Material *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="receiveForm.materialId" name="materialId" required>
                    <option value="">-- Select Material --</option>
                    <option *ngFor="let m of materials()" [value]="m.id">{{ m.materialCode }} - {{ m.name }} ({{ m.unitOfMeasure }})</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Quantity Received *</label>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="receiveForm.quantity" name="quantity" min="0.1" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Warehouse Location</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="receiveForm.warehouseLocation" name="warehouseLocation" placeholder="Main Warehouse">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Shipment Remarks / Vendor</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="receiveForm.remarks" name="remarks" placeholder="Vendor invoice # / Delivery note details...">
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" class="btn btn-sm btn-secondary" (click)="closeReceiveModal()">Cancel</button>
                <button type="submit" class="btn btn-sm btn-bt-primary">Receive Stock</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Direct Update Stock Modal -->
    <div class="modal fade" id="updateStockModal" tabindex="-1" [ngClass]="{'show d-block': showUpdateStockModal}" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-pencil-square me-2 text-primary"></i>Update Material Stock</h5>
            <button type="button" class="btn-close" (click)="closeUpdateStockModal()"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="submitUpdateStock()">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label small fw-bold">Material Name</label>
                  <input type="text" class="form-control form-control-sm bg-light" [value]="selectedItemName" disabled>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Available Stock *</label>
                  <input type="number" min="0" step="0.1" class="form-control form-control-sm" [(ngModel)]="stockForm.availableStock" name="availableStock" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Minimum Stock Level</label>
                  <input type="number" min="0" step="0.1" class="form-control form-control-sm" [(ngModel)]="stockForm.minStockLevel" name="minStockLevel">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Stock Status Override</label>
                  <select class="form-select form-select-sm" [(ngModel)]="stockForm.status" name="status">
                    <option value="">Auto-calculate from thresholds</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Adjustment Reason / Remarks</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="stockForm.remarks" name="remarks" placeholder="e.g. Physical inventory audit recount">
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" class="btn btn-sm btn-secondary" (click)="closeUpdateStockModal()">Cancel</button>
                <button type="submit" class="btn btn-sm btn-primary">Save Stock Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InventoryManagementComponent implements OnInit {
  inventory = signal<InventoryItem[]>([]);
  lowStockInventory = signal<InventoryItem[]>([]);
  projectUsage = signal<ProjectMaterialUsage[]>([]);
  dashboard = signal<InventoryDashboard | null>(null);
  materials = signal<Material[]>([]);

  activeTab: 'all' | 'low' | 'project' = 'all';
  errorMessage = '';
  successMessage = '';

  showReceiveModal = false;
  receiveForm = {
    materialId: '',
    quantity: 100,
    warehouseLocation: 'Main Warehouse',
    remarks: ''
  };

  showUpdateStockModal = false;
  editingMaterialId = '';
  selectedItemName = '';
  stockForm = {
    availableStock: 0,
    minStockLevel: 100,
    status: '',
    remarks: ''
  };

  constructor(
    private materialService: MaterialService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.materialService.getInventory().subscribe({
      next: (data) => this.inventory.set(data),
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to load inventory.'
    });

    this.materialService.getLowStockInventory().subscribe({
      next: (data) => this.lowStockInventory.set(data)
    });

    this.materialService.getInventoryDashboard().subscribe({
      next: (d) => this.dashboard.set(d)
    });

    this.materialService.getMaterials().subscribe({
      next: (mats) => this.materials.set(mats)
    });
  }

  loadProjectUsage(): void {
    this.materialService.getProjectMaterialUsage().subscribe({
      next: (data) => this.projectUsage.set(data)
    });
  }

  openReceiveModal(): void {
    this.receiveForm = { materialId: '', quantity: 100, warehouseLocation: 'Main Warehouse', remarks: '' };
    this.showReceiveModal = true;
  }

  openReceiveModalFor(materialId: string): void {
    this.receiveForm = { materialId: materialId, quantity: 500, warehouseLocation: 'Main Warehouse', remarks: 'Low stock restocking' };
    this.showReceiveModal = true;
  }

  closeReceiveModal(): void {
    this.showReceiveModal = false;
  }

  openUpdateStockModal(item: InventoryItem): void {
    this.editingMaterialId = item.materialId;
    this.selectedItemName = `${item.materialCode} - ${item.materialName}`;
    this.stockForm = {
      availableStock: item.availableStock,
      minStockLevel: item.minStockLevel,
      status: item.status,
      remarks: 'Direct stock update'
    };
    this.showUpdateStockModal = true;
  }

  closeUpdateStockModal(): void {
    this.showUpdateStockModal = false;
  }

  submitUpdateStock(): void {
    if (!this.editingMaterialId) return;
    this.materialService.updateDirectStock(this.editingMaterialId, this.stockForm).subscribe({
      next: () => {
        this.successMessage = 'Material stock level updated successfully!';
        this.loadAll();
        this.closeUpdateStockModal();
      },
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to update material stock.'
    });
  }

  submitReceiveStock(): void {
    if (!this.receiveForm.materialId || this.receiveForm.quantity <= 0) {
      this.errorMessage = 'Please select a material and enter a valid positive quantity.';
      return;
    }

    this.materialService.receiveStock(this.receiveForm).subscribe({
      next: () => {
        this.successMessage = 'Stock shipment received and logged into PostgreSQL inventory successfully!';
        this.loadAll();
        this.closeReceiveModal();
      },
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to receive stock.'
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'In Stock': return 'bg-success text-white';
      case 'Low Stock': return 'bg-warning text-dark';
      case 'Out of Stock': return 'bg-danger text-white';
      default: return 'bg-secondary';
    }
  }
}

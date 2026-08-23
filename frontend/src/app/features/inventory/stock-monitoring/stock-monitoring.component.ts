import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { InventoryService, InventoryItem } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-stock-monitoring',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block"><app-sidebar></app-sidebar></div>
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <div class="mb-4">
            <h2 class="fw-bold text-dark mb-0"><i class="bi bi-activity me-2 text-danger"></i>Stock Monitoring & Alerts</h2>
            <p class="text-muted small">Monitor material thresholds and identify stock shortages.</p>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm border-start border-4 border-danger">
                <span class="text-muted small">Out of Stock Alerts</span>
                <h4 class="fw-bold mb-0 text-danger">{{ getCount('Out of Stock') }}</h4>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm border-start border-4 border-warning">
                <span class="text-muted small">Low Stock Warnings</span>
                <h4 class="fw-bold mb-0 text-warning">{{ getCount('Low Stock') }}</h4>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm border-start border-4 border-success">
                <span class="text-muted small">Healthy Inventory</span>
                <h4 class="fw-bold mb-0 text-success">{{ getCount('In Stock') }}</h4>
              </div>
            </div>
          </div>

          <div class="card card-custom border-0 p-4 shadow-sm bg-white">
            <h6 class="fw-bold mb-3 text-danger"><i class="bi bi-exclamation-triangle me-1"></i>Critical Stock Items</h6>
            <div class="table-responsive">
              <table class="table table-hover align-middle small">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Material Name</th>
                    <th>Quantity Remaining</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of getCriticalItems()">
                    <td class="fw-semibold">{{ item.item_name }}</td>
                    <td class="fw-bold text-danger">{{ item.quantity }}</td>
                    <td>
                      <span class="badge" [ngClass]="{'bg-warning text-dark': item.status === 'Low Stock', 'bg-danger': item.status === 'Out of Stock'}">
                        {{ item.status }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary" routerLink="/inventory/procurement">Order Now</button>
                    </td>
                  </tr>
                  <tr *ngIf="!getCriticalItems().length"><td colspan="4" class="text-center py-3 text-success"><i class="bi bi-check-circle me-1"></i>No critical stock issues detected.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StockMonitoringComponent implements OnInit {
  inventory: InventoryItem[] = [];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.inventoryService.getInventory().subscribe((data: InventoryItem[]) => this.inventory = data);
  }

  getCount(status: string): number {
    return this.inventory.filter(i => i.status === status).length;
  }

  getCriticalItems(): InventoryItem[] {
    return this.inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { InventoryService, InventoryItem } from '../../../core/services/inventory.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-material-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block"><app-sidebar></app-sidebar></div>
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-box-seam me-2 text-warning"></i>Material Inventory</h2>
              <p class="text-muted small mb-0">Track materials and stock quantities.</p>
            </div>
            <button class="btn btn-bt-accent" (click)="openForm()"><i class="bi bi-plus-lg me-1"></i>Add Material</button>
          </div>

          <div *ngIf="showForm" class="card card-custom border-0 p-4 mb-4 bg-white shadow-sm">
            <h6 class="fw-bold mb-3">{{ editingId ? 'Edit Material' : 'New Material' }}</h6>
            <form (ngSubmit)="saveItem()" class="row g-3">
              <div class="col-md-6">
                <label class="form-label small">Material Name</label>
                <input type="text" class="form-control" [(ngModel)]="currentItem.item_name" name="item_name" required>
              </div>
              <div class="col-md-3">
                <label class="form-label small">Quantity</label>
                <input type="number" class="form-control" [(ngModel)]="currentItem.quantity" name="quantity" required>
              </div>
              <div class="col-md-3">
                <label class="form-label small">Project Assignment</label>
                <select class="form-select" [(ngModel)]="currentItem.project_id" name="project_id">
                  <option [value]="null">Central Warehouse</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>
              <div class="col-12 text-end">
                <button type="button" class="btn btn-outline-secondary me-2" (click)="showForm = false">Cancel</button>
                <button type="submit" class="btn btn-warning">Save Material</button>
              </div>
            </form>
          </div>

          <div class="card card-custom border-0 p-4 shadow-sm bg-white">
            <div class="table-responsive">
              <table class="table table-hover align-middle small">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Material Name</th>
                    <th>Project Location</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of inventory">
                    <td class="fw-semibold">{{ item.item_name }}</td>
                    <td>{{ getProjectName(item.project_id) }}</td>
                    <td class="fw-bold">{{ item.quantity }}</td>
                    <td>
                      <span class="badge" [ngClass]="{'bg-success': item.status === 'In Stock', 'bg-warning': item.status === 'Low Stock', 'bg-danger': item.status === 'Out of Stock'}">
                        {{ item.status }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-secondary me-1" (click)="edit(item)"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-sm btn-outline-danger" (click)="delete(item.id)"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                  <tr *ngIf="!inventory.length"><td colspan="5" class="text-center py-3 text-muted">No inventory found.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MaterialInventoryComponent implements OnInit {
  inventory: InventoryItem[] = [];
  projects: Project[] = [];
  showForm = false;
  editingId: string | null = null;
  currentItem: Partial<InventoryItem> = {};

  constructor(private inventoryService: InventoryService, private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadData();
    this.projectService.getProjects().subscribe((p: Project[]) => this.projects = p);
  }

  loadData(): void {
    this.inventoryService.getInventory().subscribe((data: InventoryItem[]) => this.inventory = data);
  }

  getProjectName(id?: string): string {
    if (!id) return 'Central Warehouse';
    return this.projects.find(p => p.id === id)?.projectName || 'Unknown';
  }

  openForm(): void {
    this.editingId = null;
    this.currentItem = { quantity: 0, status: 'In Stock' };
    this.showForm = true;
  }

  edit(item: InventoryItem): void {
    this.editingId = item.id;
    this.currentItem = { ...item };
    this.showForm = true;
  }

  saveItem(): void {
    if (this.editingId) {
      this.inventoryService.updateInventoryItem(this.editingId, this.currentItem).subscribe(() => {
        this.loadData();
        this.showForm = false;
      });
    } else {
      this.inventoryService.createInventoryItem(this.currentItem).subscribe(() => {
        this.loadData();
        this.showForm = false;
      });
    }
  }

  delete(id: string): void {
    if (confirm('Delete this material?')) {
      this.inventoryService.deleteInventoryItem(id).subscribe(() => this.loadData());
    }
  }
}

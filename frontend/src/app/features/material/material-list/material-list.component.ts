import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { MaterialService, Material, MaterialCategory } from '../../../core/services/material.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-material-list',
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
                <li class="breadcrumb-item active">Materials Master</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-box-seam-fill me-2 text-warning"></i>Materials Master Catalog</h2>
              <p class="text-muted small mb-0">Manage construction material definitions, standard units, and minimum stock thresholds stored in PostgreSQL.</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-dark btn-sm" (click)="openCategoryModal()"><i class="bi bi-tags me-1"></i>Categories</button>
              <button class="btn btn-bt-primary btn-sm" (click)="openCreateModal()"><i class="bi bi-plus-lg me-1"></i>Add Material</button>
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

          <!-- Filters -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-2 align-items-center">
              <div class="col-md-4">
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" class="form-control border-start-0" placeholder="Search code or material name..." [(ngModel)]="searchTerm">
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select form-select-sm" [(ngModel)]="selectedCategoryFilter" (change)="loadMaterials()">
                  <option value="">All Categories</option>
                  <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select form-select-sm" [(ngModel)]="selectedStatusFilter">
                  <option value="">All Stock Statuses</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Materials Table -->
          <div class="card card-custom border-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small text-uppercase">
                  <tr>
                    <th>Material Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Unit Price (₹)</th>
                    <th>Total Stock</th>
                    <th>Available</th>
                    <th>Min Level</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let m of filteredMaterials()">
                    <td><span class="badge bg-dark-subtle text-dark font-monospace">{{ m.materialCode }}</span></td>
                    <td class="fw-bold text-dark">{{ m.name }}</td>
                    <td><span class="badge bg-secondary-subtle text-secondary">{{ m.categoryName }}</span></td>
                    <td>{{ m.unitOfMeasure }}</td>
                    <td class="fw-semibold text-primary">₹{{ m.unitPrice || 0 | number:'1.2-2' }}</td>
                    <td>{{ m.totalStock | number:'1.0-2' }}</td>
                    <td class="fw-bold" [ngClass]="m.availableStock <= m.minStockLevel ? 'text-danger' : 'text-success'">
                      {{ m.availableStock | number:'1.0-2' }}
                    </td>
                    <td>{{ m.minStockLevel | number:'1.0-2' }}</td>
                    <td>
                      <span class="badge rounded-pill" [ngClass]="getStockBadgeClass(m.stockStatus)">{{ m.stockStatus }}</span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-secondary me-1" (click)="openEditModal(m)"><i class="bi bi-pencil"></i></button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredMaterials().length === 0">
                    <td colspan="10" class="text-center py-4 text-muted">
                      <i class="bi bi-box fs-2 d-block mb-1 opacity-50"></i>No materials matching filters.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Create/Edit Material Modal -->
    <div class="modal fade" id="materialModal" tabindex="-1" [ngClass]="{'show d-block': showModal}" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-box-seam me-2 text-warning"></i>{{ isEditMode ? 'Edit Material' : 'Add New Material' }}</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveMaterial()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Material Code *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="materialForm.materialCode" name="materialCode" placeholder="e.g. MAT-CEM-02" required [disabled]="isEditMode">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Category *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="selectedCategoryObj" name="category" (change)="onCategoryChange()" required>
                    <option [ngValue]="null">-- Select Category --</option>
                    <option *ngFor="let c of categories()" [ngValue]="c">{{ c.name }}</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Material Name *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="materialForm.name" name="name" placeholder="e.g. Portland Cement 50kg" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold text-dark">Unit of Measure *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="materialForm.unitOfMeasure" name="unitOfMeasure" required>
                    <option value="Bags">Bags</option>
                    <option value="Tons">Tons</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Cubic Meter">Cubic Meter</option>
                    <option value="Meters">Meters</option>
                    <option value="Units">Units</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold text-dark">Unit Price (₹) *</label>
                  <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="materialForm.unitPrice" name="unitPrice" min="0" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold text-dark">Min Stock Threshold *</label>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="materialForm.minStockLevel" name="minStockLevel" min="0" required>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Description</label>
                  <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="materialForm.description" name="description" placeholder="Material specifications..."></textarea>
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" class="btn btn-sm btn-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-sm btn-bt-primary">Save Material</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MaterialListComponent implements OnInit {
  materials = signal<Material[]>([]);
  categories = signal<MaterialCategory[]>([]);
  searchTerm = '';
  selectedCategoryFilter = '';
  selectedStatusFilter = '';
  errorMessage = '';
  successMessage = '';

  showModal = false;
  isEditMode = false;
  editingId = '';

  selectedCategoryObj: MaterialCategory | null = null;
  materialForm = {
    materialCode: '',
    name: '',
    categoryId: '',
    categoryName: '',
    unitOfMeasure: 'Bags',
    unitPrice: 0,
    minStockLevel: 100,
    description: '',
    status: 'Active'
  };

  constructor(
    private materialService: MaterialService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadMaterials();
  }

  loadCategories(): void {
    this.materialService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to load categories.'
    });
  }

  loadMaterials(): void {
    this.materialService.getMaterials(this.selectedCategoryFilter).subscribe({
      next: (data) => this.materials.set(data),
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to load materials.'
    });
  }

  filteredMaterials(): Material[] {
    return this.materials().filter(m => {
      const matchSearch = !this.searchTerm ||
        m.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.materialCode.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.selectedStatusFilter || m.stockStatus === this.selectedStatusFilter;
      return matchSearch && matchStatus;
    });
  }

  onCategoryChange(): void {
    if (this.selectedCategoryObj) {
      this.materialForm.categoryId = this.selectedCategoryObj.id;
      this.materialForm.categoryName = this.selectedCategoryObj.name;
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.editingId = '';
    this.selectedCategoryObj = null;
    this.materialForm = {
      materialCode: '',
      name: '',
      categoryId: '',
      categoryName: '',
      unitOfMeasure: 'Bags',
      unitPrice: 0,
      minStockLevel: 100,
      description: '',
      status: 'Active'
    };
    this.showModal = true;
  }

  openEditModal(m: Material): void {
    this.isEditMode = true;
    this.editingId = m.id;
    this.selectedCategoryObj = this.categories().find(c => c.name === m.categoryName) || null;
    this.materialForm = {
      materialCode: m.materialCode,
      name: m.name,
      categoryId: m.categoryId || '',
      categoryName: m.categoryName,
      unitOfMeasure: m.unitOfMeasure,
      unitPrice: m.unitPrice || 0,
      minStockLevel: m.minStockLevel,
      description: m.description || '',
      status: m.status
    };
    this.showModal = true;
  }

  openCategoryModal(): void {
    this.successMessage = 'Categories standard list is synchronized in database.';
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMaterial(): void {
    if (this.isEditMode) {
      this.materialService.updateMaterial(this.editingId, this.materialForm).subscribe({
        next: () => {
          this.successMessage = 'Material updated successfully!';
          this.loadMaterials();
          this.closeModal();
        },
        error: (err) => this.errorMessage = err?.error?.detail || 'Failed to update material.'
      });
    } else {
      this.materialService.createMaterial(this.materialForm).subscribe({
        next: () => {
          this.successMessage = 'Material added successfully!';
          this.loadMaterials();
          this.closeModal();
        },
        error: (err) => this.errorMessage = err?.error?.detail || 'Failed to create material.'
      });
    }
  }

  getStockBadgeClass(status: string): string {
    switch (status) {
      case 'In Stock': return 'bg-success text-white';
      case 'Low Stock': return 'bg-warning text-dark';
      case 'Out of Stock': return 'bg-danger text-white';
      default: return 'bg-secondary';
    }
  }
}

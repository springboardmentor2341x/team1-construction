import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ProcurementService } from '../../../core/services/procurement.service';
import { Vendor, PaginatedVendorsResponse } from '../../../core/models/procurement.model';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <!-- Header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb small mb-1">
                  <li class="breadcrumb-item"><a routerLink="/procurement/dashboard" class="text-decoration-none text-warning">Procurement</a></li>
                  <li class="breadcrumb-item active">Vendor Directory</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-shop me-2 text-warning"></i>Vendor & Supplier Directory</h2>
              <p class="text-muted small mb-0">Register, manage, and audit construction material vendors, equipment suppliers, & service providers.</p>
            </div>

            <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" (click)="openAddModal()">
              <i class="bi bi-plus-circle-fill"></i> Add New Vendor
            </button>
          </div>

          <!-- Success Banner -->
          <div *ngIf="message" class="alert alert-success alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> {{ message }}
            <button type="button" class="btn-close" (click)="message = ''"></button>
          </div>

          <!-- Filters Bar -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-4">
                <div class="input-group">
                  <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control" placeholder="Search Vendor ID, Name, or Services..." [(ngModel)]="search" (keyup.enter)="loadVendors()">
                </div>
              </div>

              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="selectedCategory" (change)="loadVendors()">
                  <option value="">-- All Categories --</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                  <option value="Office Supplies">Office Supplies</option>
                </select>
              </div>

              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="selectedStatus" (change)="loadVendors()">
                  <option value="">-- All Statuses --</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blacklisted">Blacklisted</option>
                </select>
              </div>

              <div class="col-md-2 text-end">
                <button class="btn btn-outline-secondary w-100" (click)="resetFilters()">Reset</button>
              </div>
            </div>
          </div>

          <!-- Vendor Table -->
          <div class="card card-custom border-0 p-4">
            <div *ngIf="loading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div>
            </div>

            <div *ngIf="!loading">
              <div class="table-responsive" *ngIf="response && response.items.length; else noVendors">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Vendor ID</th>
                      <th>Vendor Name</th>
                      <th>Category</th>
                      <th>Contact Person</th>
                      <th>Supplied Products / Services</th>
                      <th>Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let v of response.items">
                      <td class="fw-bold">
                        <span class="badge bg-light text-dark border font-monospace">{{ v.vendorId }}</span>
                      </td>
                      <td class="fw-bold">
                        <a [routerLink]="['/procurement/vendors', v.id]" class="text-dark text-decoration-none hover-warning">
                          {{ v.vendorName }}
                        </a>
                      </td>
                      <td><span class="badge bg-warning text-dark">{{ v.vendorCategory }}</span></td>
                      <td>
                        <div>{{ v.contactPerson || '-' }}</div>
                        <div class="extra-small text-muted" *ngIf="v.contactNumber || v.email">{{ v.contactNumber }} {{ v.email ? '(' + v.email + ')' : '' }}</div>
                      </td>
                      <td class="text-muted">{{ v.productsOrServicesSupplied || 'General Construction Supplies' }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-success': v.vendorStatus === 'Active',
                          'bg-secondary': v.vendorStatus === 'Inactive',
                          'bg-danger': v.vendorStatus === 'Blacklisted'
                        }">{{ v.vendorStatus }}</span>
                      </td>
                      <td class="text-end">
                        <div class="btn-group btn-group-sm">
                          <a [routerLink]="['/procurement/vendors', v.id]" class="btn btn-outline-dark" title="View Details">
                            <i class="bi bi-eye"></i> Details
                          </a>
                          <button class="btn btn-outline-primary" (click)="openEditModal(v)" title="Edit Vendor">
                            <i class="bi bi-pencil"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <ng-template #noVendors>
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-shop d-block fs-1 opacity-50 mb-2"></i>
                  <h5>No Vendors Found</h5>
                  <p class="small mb-3">No construction suppliers match the selected search criteria.</p>
                  <button class="btn btn-bt-accent btn-sm" (click)="openAddModal()">Register First Vendor</button>
                </div>
              </ng-template>

              <!-- Pagination -->
              <div *ngIf="response && response.totalPages > 1" class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <span class="small text-muted">Page <strong>{{ response.page }}</strong> of <strong>{{ response.totalPages }}</strong> (Total <strong>{{ response.total }}</strong>)</span>
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" [class.disabled]="response.page === 1">
                    <button class="page-link" (click)="changePage(response.page - 1)">Previous</button>
                  </li>
                  <li *ngFor="let p of getPagesArray(response.totalPages)" class="page-item" [class.active]="p === response.page">
                    <button class="page-link" (click)="changePage(p)">{{ p }}</button>
                  </li>
                  <li class="page-item" [class.disabled]="response.page === response.totalPages">
                    <button class="page-link" (click)="changePage(response.page + 1)">Next</button>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          <!-- Add / Edit Modal -->
          <div *ngIf="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-shop me-2 text-warning"></i>{{ isEdit ? 'Edit Vendor Information' : 'Register New Vendor' }}</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <form (ngSubmit)="saveVendor()">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Vendor ID <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" [(ngModel)]="formData.vendorId" name="vendorId" required placeholder="e.g. VND-2026-001" [disabled]="isEdit">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Vendor / Company Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" [(ngModel)]="formData.vendorName" name="vendorName" required placeholder="e.g. National Cement Corp">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Vendor Category</label>
                        <select class="form-select" [(ngModel)]="formData.vendorCategory" name="vendorCategory">
                          <option value="Raw Materials">Raw Materials</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Machinery">Machinery</option>
                          <option value="Safety Equipment">Safety Equipment</option>
                          <option value="Office Supplies">Office Supplies</option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Vendor Status</label>
                        <select class="form-select" [(ngModel)]="formData.vendorStatus" name="vendorStatus">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Blacklisted">Blacklisted</option>
                        </select>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Contact Person</label>
                        <input type="text" class="form-control" [(ngModel)]="formData.contactPerson" name="contactPerson" placeholder="e.g. Robert Smith">
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Contact Phone</label>
                        <input type="text" class="form-control" [(ngModel)]="formData.contactNumber" name="contactNumber" placeholder="e.g. +1 555-0199">
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Contact Email</label>
                        <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" placeholder="e.g. sales@vendor.com">
                      </div>

                      <div class="col-md-12">
                        <label class="form-label small fw-bold">Products / Services Supplied</label>
                        <input type="text" class="form-control" [(ngModel)]="formData.productsOrServicesSupplied" name="productsOrServicesSupplied" placeholder="e.g. OPC 53 Grade Cement, Ready Mix Concrete">
                      </div>

                      <div class="col-md-12">
                        <label class="form-label small fw-bold">Business Address</label>
                        <textarea class="form-control" rows="2" [(ngModel)]="formData.address" name="address" placeholder="e.g. 100 Industrial Parkway, Zone 4"></textarea>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="showModal = false">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4" [disabled]="saving">
                        <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
                        {{ isEdit ? 'Save Changes' : 'Register Vendor' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.76rem; }
  `]
})
export class VendorListComponent implements OnInit {
  response: PaginatedVendorsResponse | null = null;
  loading = true;
  saving = false;

  search = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 1;
  pageSize = 10;

  message = '';
  showModal = false;
  isEdit = false;
  selectedVendorId = '';

  formData: Partial<Vendor> = {
    vendorId: '',
    vendorName: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    address: '',
    vendorCategory: 'Raw Materials',
    productsOrServicesSupplied: '',
    vendorStatus: 'Active'
  };

  constructor(private procurementService: ProcurementService) {}

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.loading = true;
    this.procurementService.getVendors({
      search: this.search,
      vendorCategory: this.selectedCategory,
      vendorStatus: this.selectedStatus,
      page: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        this.response = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.search = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadVendors();
  }

  changePage(newPage: number): void {
    if (this.response && newPage >= 1 && newPage <= this.response.totalPages) {
      this.currentPage = newPage;
      this.loadVendors();
    }
  }

  getPagesArray(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  openAddModal(): void {
    this.isEdit = false;
    this.formData = {
      vendorId: `VND-2026-${Math.floor(100 + Math.random() * 900)}`,
      vendorName: '',
      contactPerson: '',
      contactNumber: '',
      email: '',
      address: '',
      vendorCategory: 'Raw Materials',
      productsOrServicesSupplied: '',
      vendorStatus: 'Active'
    };
    this.showModal = true;
  }

  openEditModal(v: Vendor): void {
    this.isEdit = true;
    this.selectedVendorId = v.id;
    this.formData = { ...v };
    this.showModal = true;
  }

  saveVendor(): void {
    if (!this.formData.vendorId || !this.formData.vendorName) return;

    this.saving = true;
    this.message = '';

    if (this.isEdit) {
      this.procurementService.updateVendor(this.selectedVendorId, this.formData).subscribe({
        next: (updated) => {
          this.saving = false;
          this.showModal = false;
          this.message = `Vendor ${updated.vendorName} updated successfully!`;
          this.loadVendors();
        },
        error: () => this.saving = false
      });
    } else {
      this.procurementService.createVendor(this.formData).subscribe({
        next: (created) => {
          this.saving = false;
          this.showModal = false;
          this.message = `Vendor ${created.vendorName} (${created.vendorId}) registered successfully!`;
          this.loadVendors();
        },
        error: () => this.saving = false
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ProcurementService } from '../../../core/services/procurement.service';
import { ProjectService } from '../../../core/services/project.service';
import { Invoice, PaginatedInvoicesResponse, Vendor, PurchaseOrder } from '../../../core/models/procurement.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-invoice-list',
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
                  <li class="breadcrumb-item active">Invoice Tracking</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-receipt me-2 text-warning"></i>Vendor Invoice Tracking & Billing</h2>
              <p class="text-muted small mb-0">Record vendor invoices, link PO references, verify billing amounts, and manage payment disburshment statuses.</p>
            </div>

            <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" (click)="openRegisterModal()">
              <i class="bi bi-plus-circle-fill"></i> Register New Invoice
            </button>
          </div>

          <!-- Alert Messages -->
          <div *ngIf="message" class="alert alert-success alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> {{ message }}
            <button type="button" class="btn-close" (click)="message = ''"></button>
          </div>
          <div *ngIf="error" class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
            <button type="button" class="btn-close" (click)="error = ''"></button>
          </div>

          <!-- Filter Controls -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="filterProjectId" (change)="loadInvoices()">
                  <option value="">-- All Projects --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>

              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="filterVendorId" (change)="loadInvoices()">
                  <option value="">-- All Vendors --</option>
                  <option *ngFor="let v of vendors" [value]="v.id">{{ v.vendorName }}</option>
                </select>
              </div>

              <div class="col-md-4">
                <select class="form-select" [(ngModel)]="filterPaymentStatus" (change)="loadInvoices()">
                  <option value="">-- All Payment Statuses --</option>
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div class="col-md-2 text-end">
                <button class="btn btn-outline-secondary w-100" (click)="resetFilters()">Reset</button>
              </div>
            </div>
          </div>

          <!-- Invoice Table -->
          <div class="card card-custom border-0 p-4">
            <div *ngIf="loading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div>
            </div>

            <div *ngIf="!loading">
              <div class="table-responsive" *ngIf="response && response.items.length; else noInvoices">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Invoice ID</th>
                      <th>Vendor Ref No.</th>
                      <th>Vendor Name</th>
                      <th>PO Ref</th>
                      <th>Invoice Date</th>
                      <th>Due Date</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let inv of response.items">
                      <td class="fw-bold text-dark">{{ inv.invoiceId }}</td>
                      <td><span class="badge bg-light text-dark border font-monospace">{{ inv.invoiceNumber }}</span></td>
                      <td>{{ inv.vendorName }}</td>
                      <td>{{ inv.purchaseOrderCode || '-' }}</td>
                      <td>{{ inv.invoiceDate }}</td>
                      <td>{{ inv.dueDate }}</td>
                      <td class="fw-bold text-success fs-6">₹{{ inv.invoiceAmount | number }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-warning text-dark': inv.paymentStatus === 'Pending',
                          'bg-info text-dark': inv.paymentStatus === 'Partially Paid',
                          'bg-success': inv.paymentStatus === 'Paid',
                          'bg-danger': inv.paymentStatus === 'Overdue'
                        }">{{ inv.paymentStatus }}</span>
                      </td>
                      <td class="text-end">
                        <div class="dropdown">
                          <button class="btn btn-sm btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Payment
                          </button>
                          <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                            <li><button class="dropdown-item small" (click)="updateStatus(inv.id, 'Pending')">Set Pending</button></li>
                            <li><button class="dropdown-item small text-info" (click)="updateStatus(inv.id, 'Partially Paid')">Set Partially Paid</button></li>
                            <li><button class="dropdown-item small text-success fw-bold" (click)="updateStatus(inv.id, 'Paid')">Mark Paid</button></li>
                            <li><button class="dropdown-item small text-danger" (click)="updateStatus(inv.id, 'Overdue')">Mark Overdue</button></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <ng-template #noInvoices>
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-receipt d-block fs-1 opacity-50 mb-2"></i>
                  <h5>No Invoices Found</h5>
                  <p class="small mb-3">Record vendor billing invoices against active Purchase Orders.</p>
                  <button class="btn btn-bt-accent btn-sm" (click)="openRegisterModal()">Register Invoice</button>
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

          <!-- Register Invoice Modal -->
          <div *ngIf="showRegisterModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-receipt me-2 text-warning"></i>Register Vendor Invoice</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showRegisterModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <form (ngSubmit)="submitInvoice()">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Select Vendor <span class="text-danger">*</span></label>
                        <select class="form-select" [(ngModel)]="newInv.vendorId" name="vendorId" required (change)="onVendorSelectForInvoice()">
                          <option value="">-- Choose Vendor --</option>
                          <option *ngFor="let v of vendors" [value]="v.id">{{ v.vendorName }} ({{ v.vendorId }})</option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Select Purchase Order <span class="text-danger">*</span></label>
                        <select class="form-select" [(ngModel)]="newInv.purchaseOrderId" name="purchaseOrderId" required (change)="onPOSelectForInvoice()">
                          <option value="">-- Choose Purchase Order --</option>
                          <option *ngFor="let po of vendorPOs" [value]="po.id">{{ po.purchaseOrderId }} (Amount: ₹{{ po.totalAmount }})</option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Target Project <span class="text-danger">*</span></label>
                        <select class="form-select" [(ngModel)]="newInv.projectId" name="projectId" required disabled>
                          <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Vendor Invoice Ref No. <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" [(ngModel)]="newInv.invoiceNumber" name="invoiceNumber" required placeholder="e.g. INV-VENDOR-88192">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Invoice Date <span class="text-danger">*</span></label>
                        <input type="date" class="form-control" [(ngModel)]="newInv.invoiceDate" name="invoiceDate" required>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Payment Due Date <span class="text-danger">*</span></label>
                        <input type="date" class="form-control" [(ngModel)]="newInv.dueDate" name="dueDate" required>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Invoice Billed Amount (₹) <span class="text-danger">*</span></label>
                        <input type="number" class="form-control fw-bold text-success" [(ngModel)]="newInv.invoiceAmount" name="invoiceAmount" required placeholder="e.g. 50000">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Initial Payment Status</label>
                        <select class="form-select" [(ngModel)]="newInv.paymentStatus" name="paymentStatus">
                          <option value="Pending">Pending</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>

                      <div class="col-md-12">
                        <label class="form-label small fw-bold">Remarks / Payment Notes</label>
                        <textarea class="form-control" rows="2" [(ngModel)]="newInv.remarks" name="remarks" placeholder="Optional notes..."></textarea>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="showRegisterModal = false">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4" [disabled]="saving">Register Vendor Invoice</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class InvoiceListComponent implements OnInit {
  response: PaginatedInvoicesResponse | null = null;
  projects: Project[] = [];
  vendors: Vendor[] = [];
  vendorPOs: PurchaseOrder[] = [];

  loading = true;
  saving = false;

  filterProjectId = '';
  filterVendorId = '';
  filterPaymentStatus = '';
  currentPage = 1;
  pageSize = 10;

  message = '';
  error = '';

  showRegisterModal = false;
  newInv = {
    invoiceNumber: '',
    vendorId: '',
    purchaseOrderId: '',
    projectId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    invoiceAmount: 0,
    paymentStatus: 'Pending',
    remarks: ''
  };

  constructor(
    private procurementService: ProcurementService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(p => this.projects = p);
    this.procurementService.getVendors({ pageSize: 500 }).subscribe(v => this.vendors = v.items);
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.procurementService.getInvoices({
      projectId: this.filterProjectId,
      vendorId: this.filterVendorId,
      paymentStatus: this.filterPaymentStatus,
      page: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        this.response = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  resetFilters(): void {
    this.filterProjectId = '';
    this.filterVendorId = '';
    this.filterPaymentStatus = '';
    this.currentPage = 1;
    this.loadInvoices();
  }

  changePage(newPage: number): void {
    if (this.response && newPage >= 1 && newPage <= this.response.totalPages) {
      this.currentPage = newPage;
      this.loadInvoices();
    }
  }

  getPagesArray(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  openRegisterModal(): void {
    this.newInv = {
      invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      vendorId: this.vendors.length ? this.vendors[0].id : '',
      purchaseOrderId: '',
      projectId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      invoiceAmount: 0,
      paymentStatus: 'Pending',
      remarks: ''
    };
    this.onVendorSelectForInvoice();
    this.showRegisterModal = true;
  }

  onVendorSelectForInvoice(): void {
    if (this.newInv.vendorId) {
      this.procurementService.getPurchaseOrders({ vendorId: this.newInv.vendorId, pageSize: 100 }).subscribe(pos => {
        this.vendorPOs = pos.items;
        if (this.vendorPOs.length > 0) {
          this.newInv.purchaseOrderId = this.vendorPOs[0].id;
          this.onPOSelectForInvoice();
        }
      });
    }
  }

  onPOSelectForInvoice(): void {
    if (this.newInv.purchaseOrderId) {
      const po = this.vendorPOs.find(p => p.id === this.newInv.purchaseOrderId);
      if (po) {
        this.newInv.projectId = po.projectId;
        this.newInv.invoiceAmount = po.totalAmount;
      }
    }
  }

  submitInvoice(): void {
    if (!this.newInv.vendorId || !this.newInv.purchaseOrderId || !this.newInv.invoiceNumber || !this.newInv.invoiceAmount) return;

    this.saving = true;
    this.message = '';
    this.error = '';

    this.procurementService.createInvoice(this.newInv).subscribe({
      next: (created) => {
        this.saving = false;
        this.showRegisterModal = false;
        this.message = `Invoice ${created.invoiceId} (Ref ${created.invoiceNumber}) registered successfully!`;
        this.loadInvoices();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Failed to register invoice.';
      }
    });
  }

  updateStatus(invoiceId: string, status: string): void {
    this.procurementService.updateInvoicePaymentStatus(invoiceId, status).subscribe({
      next: () => {
        this.message = `Payment status updated to ${status}.`;
        this.loadInvoices();
      }
    });
  }
}

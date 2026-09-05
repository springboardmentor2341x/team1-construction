import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ProcurementService } from '../../../core/services/procurement.service';
import { ProjectService } from '../../../core/services/project.service';
import { MaterialService } from '../../../core/services/material.service';
import {
  PurchaseOrder,
  PaginatedPurchaseOrdersResponse,
  PurchaseOrderItem,
  Vendor,
  ProcurementRequest
} from '../../../core/models/procurement.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-purchase-order-list',
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
                  <li class="breadcrumb-item active">Purchase Orders</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-receipt-cutoff me-2 text-warning"></i>Purchase Orders & Goods Receiving</h2>
              <p class="text-muted small mb-0">Issue financial purchase orders to vendors and perform goods receipts to update inventory stock.</p>
            </div>

            <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" (click)="openCreateModal()">
              <i class="bi bi-plus-circle-fill"></i> Create Purchase Order
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
                <select class="form-select" [(ngModel)]="filterProjectId" (change)="loadPOs()">
                  <option value="">-- All Projects --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>

              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="filterVendorId" (change)="loadPOs()">
                  <option value="">-- All Vendors --</option>
                  <option *ngFor="let v of vendors" [value]="v.id">{{ v.vendorName }} ({{ v.vendorId }})</option>
                </select>
              </div>

              <div class="col-md-4">
                <select class="form-select" [(ngModel)]="filterStatus" (change)="loadPOs()">
                  <option value="">-- All PO Statuses --</option>
                  <option value="Approved">Approved</option>
                  <option value="Sent">Sent</option>
                  <option value="Partially Received">Partially Received</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div class="col-md-2 text-end">
                <button class="btn btn-outline-secondary w-100" (click)="resetFilters()">Reset</button>
              </div>
            </div>
          </div>

          <!-- PO Table -->
          <div class="card card-custom border-0 p-4">
            <div *ngIf="loading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div>
            </div>

            <div *ngIf="!loading">
              <div class="table-responsive" *ngIf="response && response.items.length; else noPOs">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>PO ID</th>
                      <th>Vendor</th>
                      <th>Project</th>
                      <th>Ref Request</th>
                      <th>Order Date</th>
                      <th>Delivery Date</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let po of response.items">
                      <td class="fw-bold text-dark">{{ po.purchaseOrderId }}</td>
                      <td>{{ po.vendorName }}</td>
                      <td>{{ po.projectName }}</td>
                      <td><span class="badge bg-light text-dark border">{{ po.procurementRequestCode || 'Direct PO' }}</span></td>
                      <td>{{ po.orderDate }}</td>
                      <td>{{ po.expectedDeliveryDate }}</td>
                      <td class="fw-bold text-success fs-6">₹{{ po.totalAmount | number }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-warning text-dark': po.purchaseOrderStatus === 'Draft',
                          'bg-primary': po.purchaseOrderStatus === 'Approved' || po.purchaseOrderStatus === 'Sent',
                          'bg-info text-dark': po.purchaseOrderStatus === 'Partially Received',
                          'bg-success': po.purchaseOrderStatus === 'Completed',
                          'bg-danger': po.purchaseOrderStatus === 'Cancelled'
                        }">{{ po.purchaseOrderStatus }}</span>
                      </td>
                      <td class="text-end">
                        <div class="btn-group btn-group-sm">
                          <a [routerLink]="['/procurement/workflow', po.procurementRequestId || po.id]" class="btn btn-outline-dark" title="View Integrated Detail">
                            <i class="bi bi-eye"></i> Detail
                          </a>
                          <button *ngIf="po.purchaseOrderStatus !== 'Completed' && po.purchaseOrderStatus !== 'Cancelled'" class="btn btn-outline-success" (click)="openReceiveModal(po)" title="Receive Goods into Inventory">
                            <i class="bi bi-box-arrow-in-down"></i> Receive Goods
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <ng-template #noPOs>
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-receipt-cutoff d-block fs-1 opacity-50 mb-2"></i>
                  <h5>No Purchase Orders Found</h5>
                  <p class="small mb-3">Issue purchase orders to vendor suppliers for approved procurement requirements.</p>
                  <button class="btn btn-bt-accent btn-sm" (click)="openCreateModal()">Create Purchase Order</button>
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

          <!-- Create PO Modal -->
          <div *ngIf="showCreateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-xl modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-receipt-cutoff me-2 text-warning"></i>Create Vendor Purchase Order</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showCreateModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <form (ngSubmit)="submitPO()">
                    <div class="row g-3 mb-4">
                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Select Active Vendor <span class="text-danger">*</span></label>
                        <select class="form-select" [(ngModel)]="newPO.vendorId" name="vendorId" required>
                          <option value="">-- Choose Vendor --</option>
                          <option *ngFor="let v of activeVendors" [value]="v.id">{{ v.vendorName }} ({{ v.vendorId }}) - {{ v.vendorCategory }}</option>
                        </select>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Target Project <span class="text-danger">*</span></label>
                        <select class="form-select" [(ngModel)]="newPO.projectId" name="projectId" required (change)="onProjectSelectForPO()">
                          <option value="">-- Choose Project --</option>
                          <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                        </select>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Link Approved Request (Optional)</label>
                        <select class="form-select" [(ngModel)]="newPO.procurementRequestId" name="procurementRequestId" (change)="onRefRequestSelect()">
                          <option value="">-- Direct PO / Unlinked --</option>
                          <option *ngFor="let r of approvedRequests" [value]="r.id">{{ r.requestId }} - {{ r.categoryName }} ({{ r.requestedByName }})</option>
                        </select>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Expected Delivery Date <span class="text-danger">*</span></label>
                        <input type="date" class="form-control" [(ngModel)]="newPO.expectedDeliveryDate" name="expectedDeliveryDate" required>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Tax Amount (₹)</label>
                        <input type="number" class="form-control" [(ngModel)]="newPO.taxAmount" name="taxAmount" (change)="calcTotals()">
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Freight / Additional Charges (₹)</label>
                        <input type="number" class="form-control" [(ngModel)]="newPO.additionalCharges" name="additionalCharges" (change)="calcTotals()">
                      </div>
                    </div>

                    <!-- Line Items Calculator Table -->
                    <div class="card p-3 bg-light border mb-4">
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="fw-bold text-dark small"><i class="bi bi-calculator-fill me-1 text-warning"></i> Order Line Items & Financial Calculator:</span>
                        <button type="button" class="btn btn-sm btn-outline-warning" (click)="addPOLineItem()">+ Add Item</button>
                      </div>

                      <div *ngFor="let item of poItems; let i = index" class="row g-2 align-items-center mb-2 p-2 bg-white rounded border">
                        <div class="col-md-3">
                          <label class="extra-small text-muted d-block">Description *</label>
                          <input type="text" class="form-control form-control-sm" [(ngModel)]="item.description" [name]="'po_desc_' + i" required (change)="calcTotals()">
                        </div>

                        <div class="col-md-2">
                          <label class="extra-small text-muted d-block">Quantity *</label>
                          <input type="number" class="form-control form-control-sm" [(ngModel)]="item.quantity" [name]="'po_qty_' + i" required (change)="calcTotals()">
                        </div>

                        <div class="col-md-2">
                          <label class="extra-small text-muted d-block">Unit Price (₹) *</label>
                          <input type="number" class="form-control form-control-sm" [(ngModel)]="item.unitPrice" [name]="'po_price_' + i" required (change)="calcTotals()">
                        </div>

                        <div class="col-md-2">
                          <label class="extra-small text-muted d-block">Tax / Line (₹)</label>
                          <input type="number" class="form-control form-control-sm" [(ngModel)]="item.tax" [name]="'po_tax_' + i" (change)="calcTotals()">
                        </div>

                        <div class="col-md-2">
                          <label class="extra-small text-muted d-block">Line Total (₹)</label>
                          <input type="number" class="form-control form-control-sm fw-bold text-success" [value]="getLineTotal(item)" readonly>
                        </div>

                        <div class="col-md-1 text-end pt-3">
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="removePOLineItem(i)" [disabled]="poItems.length === 1">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>

                      <!-- Subtotal & Grand Total Summary Box -->
                      <div class="d-flex justify-content-end align-items-center gap-4 mt-3 pt-3 border-top text-dark">
                        <div>Subtotal: <strong>₹{{ calculatedSubtotal | number }}</strong></div>
                        <div>Taxes & Fees: <strong>₹{{ (newPO.taxAmount || 0) + (newPO.additionalCharges || 0) | number }}</strong></div>
                        <div class="fs-5 fw-bold text-success">Grand Total: ₹{{ calculatedGrandTotal | number }}</div>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="showCreateModal = false">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4" [disabled]="saving">Create Purchase Order</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- Goods Receiving Modal (Module 5 Stock Integration) -->
          <div *ngIf="showReceiveModal && selectedPO" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-box-arrow-in-down me-2 text-warning"></i>Receive Goods for PO {{ selectedPO.purchaseOrderId }}</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showReceiveModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <p class="small text-muted mb-3">
                    Entering received quantities will <strong>update Inventory stock</strong> and record a <code>Received</code> stock movement transaction.
                  </p>

                  <div class="table-responsive mb-3">
                    <table class="table table-bordered align-middle small">
                      <thead class="table-light">
                        <tr>
                          <th>Item Description</th>
                          <th>Ordered Qty</th>
                          <th>Previously Received</th>
                          <th>Receive Today Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let it of receivingInputItems">
                          <td class="fw-bold">{{ it.description }}</td>
                          <td>{{ it.orderedQty }}</td>
                          <td><span class="badge bg-secondary">{{ it.previouslyReceivedQty }}</span></td>
                          <td style="width: 150px;">
                            <input type="number" class="form-control form-control-sm" [(ngModel)]="it.receivedQuantity" [max]="it.orderedQty - it.previouslyReceivedQty" min="0">
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="mb-3">
                    <label class="form-label small fw-bold">Receipt Notes / Delivery Note No.</label>
                    <input type="text" class="form-control" [(ngModel)]="receiptNotes" placeholder="e.g. Delivery challan #DC-8891 received by Site Engineer">
                  </div>

                  <div class="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" class="btn btn-outline-secondary" (click)="showReceiveModal = false">Cancel</button>
                    <button type="button" class="btn btn-success px-4" (click)="submitGoodsReceipt()" [disabled]="saving">Process Goods Receipt & Update Stock</button>
                  </div>
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
export class PurchaseOrderListComponent implements OnInit {
  response: PaginatedPurchaseOrdersResponse | null = null;
  projects: Project[] = [];
  vendors: Vendor[] = [];
  activeVendors: Vendor[] = [];
  approvedRequests: ProcurementRequest[] = [];
  masterMaterials: any[] = [];

  loading = true;
  saving = false;

  filterProjectId = '';
  filterVendorId = '';
  filterStatus = '';
  currentPage = 1;
  pageSize = 10;

  message = '';
  error = '';

  showCreateModal = false;
  showReceiveModal = false;

  selectedPO: PurchaseOrder | null = null;
  receivingInputItems: any[] = [];
  receiptNotes = '';

  newPO = {
    vendorId: '',
    projectId: '',
    procurementRequestId: '',
    expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    taxAmount: 0,
    additionalCharges: 0,
    remarks: ''
  };

  poItems: Partial<PurchaseOrderItem>[] = [
    { materialId: '', description: '', quantity: 100, unit: 'Units', unitPrice: 50, tax: 0, discount: 0 }
  ];

  calculatedSubtotal = 0;
  calculatedGrandTotal = 0;

  constructor(
    private procurementService: ProcurementService,
    private projectService: ProjectService,
    private materialService: MaterialService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(p => this.projects = p);
    this.procurementService.getVendors({ pageSize: 500 }).subscribe(v => {
      this.vendors = v.items;
      this.activeVendors = v.items.filter(i => i.vendorStatus === 'Active');
    });
    this.materialService.getMaterials().subscribe(m => this.masterMaterials = m);

    this.loadPOs();
  }

  loadPOs(): void {
    this.loading = true;
    this.procurementService.getPurchaseOrders({
      projectId: this.filterProjectId,
      vendorId: this.filterVendorId,
      purchaseOrderStatus: this.filterStatus,
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
    this.filterStatus = '';
    this.currentPage = 1;
    this.loadPOs();
  }

  changePage(newPage: number): void {
    if (this.response && newPage >= 1 && newPage <= this.response.totalPages) {
      this.currentPage = newPage;
      this.loadPOs();
    }
  }

  getPagesArray(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  openCreateModal(): void {
    this.newPO = {
      vendorId: this.activeVendors.length ? this.activeVendors[0].id : '',
      projectId: this.projects.length ? this.projects[0].id : '',
      procurementRequestId: '',
      expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      taxAmount: 0,
      additionalCharges: 0,
      remarks: ''
    };
    this.poItems = [
      { materialId: '', description: 'Portland Cement 50kg bags', quantity: 100, unit: 'Bags', unitPrice: 400, tax: 0, discount: 0 }
    ];
    this.onProjectSelectForPO();
    this.calcTotals();
    this.showCreateModal = true;
  }

  onProjectSelectForPO(): void {
    if (this.newPO.projectId) {
      this.procurementService.getProcurementRequests({
        projectId: this.newPO.projectId,
        requestStatus: 'Approved',
        pageSize: 100
      }).subscribe(reqs => this.approvedRequests = reqs.items);
    }
  }

  onRefRequestSelect(): void {
    if (this.newPO.procurementRequestId) {
      const pr = this.approvedRequests.find(r => r.id === this.newPO.procurementRequestId);
      if (pr && pr.items.length) {
        this.poItems = pr.items.map(it => ({
          materialId: it.materialId || '',
          description: it.itemDescription,
          quantity: it.netProcurementQuantity || it.requiredQuantity,
          unit: it.unit || 'Units',
          unitPrice: 500,
          tax: 0,
          discount: 0
        }));
        this.calcTotals();
      }
    }
  }

  addPOLineItem(): void {
    this.poItems.push({
      materialId: '',
      description: '',
      quantity: 10,
      unit: 'Units',
      unitPrice: 100,
      tax: 0,
      discount: 0
    });
    this.calcTotals();
  }

  removePOLineItem(index: number): void {
    if (this.poItems.length > 1) {
      this.poItems.splice(index, 1);
      this.calcTotals();
    }
  }

  getLineTotal(item: Partial<PurchaseOrderItem>): number {
    const qty = item.quantity || 0;
    const price = item.unitPrice || 0;
    const tax = item.tax || 0;
    const disc = item.discount || 0;
    return Math.max(0, (qty * price) + tax - disc);
  }

  calcTotals(): void {
    this.calculatedSubtotal = this.poItems.reduce((sum, item) => sum + this.getLineTotal(item), 0);
    const tax = this.newPO.taxAmount || 0;
    const addChg = this.newPO.additionalCharges || 0;
    this.calculatedGrandTotal = this.calculatedSubtotal + tax + addChg;
  }

  submitPO(): void {
    if (!this.newPO.vendorId || !this.newPO.projectId || !this.poItems.length) return;

    this.saving = true;
    this.message = '';
    this.error = '';

    const payload = {
      ...this.newPO,
      items: this.poItems
    };

    this.procurementService.createPurchaseOrder(payload).subscribe({
      next: (created) => {
        this.saving = false;
        this.showCreateModal = false;
        this.message = `Purchase Order ${created.purchaseOrderId} created and approved successfully!`;
        this.loadPOs();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Failed to create Purchase Order.';
      }
    });
  }

  openReceiveModal(po: PurchaseOrder): void {
    this.selectedPO = po;
    this.receiptNotes = '';
    this.receivingInputItems = po.items.map(it => ({
      itemId: it.id,
      description: it.description,
      orderedQty: it.quantity,
      previouslyReceivedQty: it.receivedQuantity || 0,
      receivedQuantity: Math.max(0, it.quantity - (it.receivedQuantity || 0))
    }));
    this.showReceiveModal = true;
  }

  submitGoodsReceipt(): void {
    if (!this.selectedPO) return;

    this.saving = true;
    this.message = '';
    this.error = '';

    const input = {
      items: this.receivingInputItems.map(i => ({ itemId: i.itemId, receivedQuantity: i.receivedQuantity })),
      remarks: this.receiptNotes
    };

    this.procurementService.receiveGoods(this.selectedPO.id, input).subscribe({
      next: (updated) => {
        this.saving = false;
        this.showReceiveModal = false;
        this.message = `Goods receipt processed for PO ${updated.purchaseOrderId}! Inventory stock updated.`;
        this.loadPOs();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Failed to process goods receipt.';
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ProcurementService } from '../../../core/services/procurement.service';
import { ProcurementRequest, PurchaseOrder, Invoice } from '../../../core/models/procurement.model';

@Component({
  selector: 'app-procurement-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <!-- Loading -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted mt-2 small">Loading comprehensive 360 procurement lifecycle detail...</p>
          </div>

          <div *ngIf="!loading && workflow">
            <!-- Breadcrumbs -->
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb small mb-2">
                <li class="breadcrumb-item"><a routerLink="/procurement/dashboard" class="text-decoration-none text-warning">Procurement</a></li>
                <li class="breadcrumb-item"><a routerLink="/procurement/requests" class="text-decoration-none text-warning">Procurement Requests</a></li>
                <li class="breadcrumb-item active">{{ request?.requestId }}</li>
              </ol>
            </nav>

            <!-- Header -->
            <div class="card card-custom border-0 p-4 mb-4 bg-white shadow-sm">
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <div class="d-flex align-items-center gap-2">
                    <h3 class="fw-bold text-dark mb-0">Procurement Lifecycle: {{ request?.requestId }}</h3>
                    <span class="badge bg-warning text-dark">{{ request?.categoryName }}</span>
                    <span class="badge" [ngClass]="{
                      'bg-warning text-dark': request?.requestStatus === 'Pending',
                      'bg-success': request?.requestStatus === 'Approved',
                      'bg-danger': request?.requestStatus === 'Rejected',
                      'bg-info text-dark': request?.requestStatus === 'Processing',
                      'bg-primary': request?.requestStatus === 'Completed'
                    }">{{ request?.requestStatus }}</span>
                  </div>
                  <p class="text-muted small mb-0 mt-1">
                    Project: <strong class="text-dark">{{ request?.projectName }}</strong> • Requested By: <strong>{{ request?.requestedByName }}</strong> on {{ request?.requestDate }}
                  </p>
                </div>

                <div class="text-end">
                  <div class="text-muted small">Priority Level</div>
                  <span class="badge fs-6" [ngClass]="{
                    'bg-secondary': request?.priority === 'Low',
                    'bg-info text-dark': request?.priority === 'Medium',
                    'bg-warning text-dark': request?.priority === 'High',
                    'bg-danger': request?.priority === 'Urgent'
                  }">{{ request?.priority }}</span>
                </div>
              </div>
            </div>

            <!-- Connected Workflow Pipeline (Visual Timeline) -->
            <div class="card card-custom border-0 p-4 mb-4">
              <h6 class="fw-bold text-dark mb-3"><i class="bi bi-diagram-3 me-2 text-warning"></i> End-to-End Procurement Workflow Pipeline</h6>

              <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 bg-light rounded-3 text-center">
                <!-- Step 1: Requisition -->
                <div class="p-2 flex-fill border rounded bg-white shadow-sm">
                  <div class="extra-small text-muted fw-bold uppercase">1. Requisition</div>
                  <div class="fw-bold text-dark mt-1">{{ request?.requestId }}</div>
                  <span class="badge bg-success-subtle text-success extra-small">Raised</span>
                </div>
                <i class="bi bi-arrow-right text-muted fs-5 d-none d-md-block"></i>

                <!-- Step 2: Inventory Check -->
                <div class="p-2 flex-fill border rounded bg-white shadow-sm">
                  <div class="extra-small text-muted fw-bold uppercase">2. Module 5 Stock Check</div>
                  <div class="fw-bold text-dark mt-1">Inventory Evaluated</div>
                  <span class="badge bg-info-subtle text-info extra-small">Shortage Computed</span>
                </div>
                <i class="bi bi-arrow-right text-muted fs-5 d-none d-md-block"></i>

                <!-- Step 3: Approval -->
                <div class="p-2 flex-fill border rounded bg-white shadow-sm">
                  <div class="extra-small text-muted fw-bold uppercase">3. Approval</div>
                  <div class="fw-bold text-dark mt-1">{{ request?.approvedByName || 'Pending PM' }}</div>
                  <span class="badge" [ngClass]="request?.requestStatus === 'Approved' || request?.requestStatus === 'Processing' || request?.requestStatus === 'Completed' ? 'bg-success' : 'bg-warning text-dark'">
                    {{ request?.requestStatus }}
                  </span>
                </div>
                <i class="bi bi-arrow-right text-muted fs-5 d-none d-md-block"></i>

                <!-- Step 4: Purchase Order -->
                <div class="p-2 flex-fill border rounded bg-white shadow-sm">
                  <div class="extra-small text-muted fw-bold uppercase">4. Purchase Order</div>
                  <div class="fw-bold text-dark mt-1">{{ purchaseOrders.length ? purchaseOrders[0].purchaseOrderId : 'Awaiting PO' }}</div>
                  <span class="badge" [ngClass]="purchaseOrders.length ? 'bg-primary' : 'bg-secondary'">
                    {{ purchaseOrders.length ? purchaseOrders[0].purchaseOrderStatus : 'Not Issued' }}
                  </span>
                </div>
                <i class="bi bi-arrow-right text-muted fs-5 d-none d-md-block"></i>

                <!-- Step 5: Goods Receiving & Stock -->
                <div class="p-2 flex-fill border rounded bg-white shadow-sm">
                  <div class="extra-small text-muted fw-bold uppercase">5. Goods Receiving</div>
                  <div class="fw-bold text-dark mt-1">Inventory Stock</div>
                  <span class="badge bg-success-subtle text-success extra-small">Module 5 Stock +</span>
                </div>
                <i class="bi bi-arrow-right text-muted fs-5 d-none d-md-block"></i>

                <!-- Step 6: Invoice & Payment -->
                <div class="p-2 flex-fill border rounded bg-white shadow-sm">
                  <div class="extra-small text-muted fw-bold uppercase">6. Invoice & Payment</div>
                  <div class="fw-bold text-dark mt-1">{{ invoices.length ? invoices[0].invoiceId : 'Awaiting Invoice' }}</div>
                  <span class="badge" [ngClass]="invoices.length && invoices[0].paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'">
                    {{ invoices.length ? invoices[0].paymentStatus : 'Pending' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Detailed Section 1: Requisition Items & Module 5 Inventory Check -->
            <div class="card card-custom border-0 p-4 mb-4">
              <h5 class="fw-bold text-dark mb-3"><i class="bi bi-cart-check me-2 text-warning"></i> Requisition Items & Inventory Analysis</h5>
              <div class="table-responsive">
                <table class="table table-hover align-middle small mb-0">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Item Description</th>
                      <th>Category</th>
                      <th>Required Quantity</th>
                      <th>Module 5 Available Stock</th>
                      <th>Net Procurement Needed</th>
                      <th>Required Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let it of request?.items">
                      <td class="fw-bold">{{ it.itemDescription }}</td>
                      <td><span class="badge bg-light text-dark border">{{ it.categoryName }}</span></td>
                      <td>{{ it.requiredQuantity }} {{ it.unit }}</td>
                      <td class="fw-bold text-info">{{ it.availableStock }} {{ it.unit }}</td>
                      <td class="fw-bold text-danger">{{ it.netProcurementQuantity }} {{ it.unit }}</td>
                      <td>{{ it.requiredDate }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Detailed Section 2: Associated Purchase Orders -->
            <div class="card card-custom border-0 p-4 mb-4">
              <h5 class="fw-bold text-dark mb-3"><i class="bi bi-receipt-cutoff me-2 text-warning"></i> Linked Purchase Orders & Goods Receiving Status</h5>
              <div *ngIf="purchaseOrders.length; else noPOs">
                <div *ngFor="let po of purchaseOrders" class="border rounded p-3 mb-3 bg-white">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong class="text-dark fs-6">{{ po.purchaseOrderId }}</strong> • Vendor: <strong>{{ po.vendorName }}</strong>
                      <span class="ms-2 badge bg-light text-dark border">Order Date: {{ po.orderDate }}</span>
                    </div>
                    <div class="fw-bold fs-5 text-success">Total Amount: ₹{{ po.totalAmount | number }}</div>
                  </div>

                  <div class="table-responsive">
                    <table class="table table-sm table-bordered extra-small mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Ordered Qty</th>
                          <th>Received Qty</th>
                          <th>Unit Price</th>
                          <th>Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let pit of po.items">
                          <td>{{ pit.description }}</td>
                          <td>{{ pit.quantity }} {{ pit.unit }}</td>
                          <td class="fw-bold text-success">{{ pit.receivedQuantity }} {{ pit.unit }}</td>
                          <td>₹{{ pit.unitPrice }}</td>
                          <td class="fw-bold">₹{{ pit.lineTotal | number }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <ng-template #noPOs>
                <div class="text-muted small py-2 text-center">No Purchase Orders created for this requisition yet.</div>
              </ng-template>
            </div>

            <!-- Detailed Section 3: Linked Invoices -->
            <div class="card card-custom border-0 p-4">
              <h5 class="fw-bold text-dark mb-3"><i class="bi bi-receipt me-2 text-warning"></i> Linked Invoices & Payment Tracking</h5>
              <div class="table-responsive" *ngIf="invoices.length; else noInvs">
                <table class="table table-hover align-middle small mb-0">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Invoice ID</th>
                      <th>Vendor Ref</th>
                      <th>PO Code</th>
                      <th>Due Date</th>
                      <th>Invoice Amount</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let inv of invoices">
                      <td class="fw-bold">{{ inv.invoiceId }}</td>
                      <td><span class="badge bg-light text-dark border font-monospace">{{ inv.invoiceNumber }}</span></td>
                      <td>{{ inv.purchaseOrderCode }}</td>
                      <td>{{ inv.dueDate }}</td>
                      <td class="fw-bold text-success">₹{{ inv.invoiceAmount | number }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-warning text-dark': inv.paymentStatus === 'Pending',
                          'bg-info text-dark': inv.paymentStatus === 'Partially Paid',
                          'bg-success': inv.paymentStatus === 'Paid',
                          'bg-danger': inv.paymentStatus === 'Overdue'
                        }">{{ inv.paymentStatus }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noInvs>
                <div class="text-muted small py-2 text-center">No invoices recorded for this procurement workflow yet.</div>
              </ng-template>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.76rem; }
    .uppercase { text-transform: uppercase; }
  `]
})
export class ProcurementDetailComponent implements OnInit {
  requestIdParam = '';
  workflow: any = null;
  request: ProcurementRequest | null = null;
  purchaseOrders: PurchaseOrder[] = [];
  invoices: Invoice[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private procurementService: ProcurementService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.requestIdParam = p['id'];
      if (this.requestIdParam) {
        this.loadWorkflow();
      }
    });
  }

  loadWorkflow(): void {
    this.loading = true;
    this.procurementService.getProcurementWorkflowDetail(this.requestIdParam).subscribe({
      next: (res) => {
        this.workflow = res;
        this.request = res.request;
        this.purchaseOrders = res.purchaseOrders || [];
        this.invoices = res.invoices || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}

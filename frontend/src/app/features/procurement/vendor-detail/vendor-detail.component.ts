import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ProcurementService } from '../../../core/services/procurement.service';
import { Vendor, PurchaseOrder, Invoice } from '../../../core/models/procurement.model';

@Component({
  selector: 'app-vendor-detail',
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
            <p class="text-muted mt-2 small">Loading vendor profile & transaction history...</p>
          </div>

          <div *ngIf="!loading && vendor">
            <!-- Breadcrumbs -->
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb small mb-2">
                <li class="breadcrumb-item"><a routerLink="/procurement/dashboard" class="text-decoration-none text-warning">Procurement</a></li>
                <li class="breadcrumb-item"><a routerLink="/procurement/vendors" class="text-decoration-none text-warning">Vendor Directory</a></li>
                <li class="breadcrumb-item active">{{ vendor.vendorName }}</li>
              </ol>
            </nav>

            <!-- Vendor Profile Header Card -->
            <div class="card card-custom border-0 p-4 mb-4 bg-white shadow-sm">
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center fs-3 shadow-sm" style="width: 64px; height: 64px;">
                    <i class="bi bi-shop"></i>
                  </div>
                  <div>
                    <div class="d-flex align-items-center gap-2">
                      <h3 class="fw-bold text-dark mb-0">{{ vendor.vendorName }}</h3>
                      <span class="badge bg-light text-dark border font-monospace">{{ vendor.vendorId }}</span>
                      <span class="badge" [ngClass]="{
                        'bg-success': vendor.vendorStatus === 'Active',
                        'bg-secondary': vendor.vendorStatus === 'Inactive',
                        'bg-danger': vendor.vendorStatus === 'Blacklisted'
                      }">{{ vendor.vendorStatus }}</span>
                    </div>
                    <p class="text-muted small mb-0 mt-1">
                      <span class="fw-semibold text-warning me-2"><i class="bi bi-tag-fill me-1"></i>{{ vendor.vendorCategory }}</span>
                      • Contact: <strong>{{ vendor.contactPerson || 'N/A' }}</strong> ({{ vendor.contactNumber || 'N/A' }})
                    </p>
                  </div>
                </div>

                <div class="text-end">
                  <div class="text-muted small">Products & Services</div>
                  <div class="fw-bold text-dark">{{ vendor.productsOrServicesSupplied || 'General Construction Supplies' }}</div>
                </div>
              </div>
            </div>

            <!-- Tabbed History & Orders -->
            <div class="card card-custom border-0 p-4">
              <ul class="nav nav-tabs nav-tabs-custom mb-4">
                <li class="nav-item">
                  <button class="nav-link" [class.active]="activeTab === 'pos'" (click)="activeTab = 'pos'">
                    <i class="bi bi-receipt-cutoff me-1"></i> Purchase Orders ({{ purchaseOrders.length }})
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link" [class.active]="activeTab === 'invoices'" (click)="activeTab = 'invoices'">
                    <i class="bi bi-receipt me-1"></i> Invoices & Billing ({{ invoices.length }})
                  </button>
                </li>
              </ul>

              <!-- Tab 1: Purchase Orders -->
              <div *ngIf="activeTab === 'pos'">
                <div class="table-responsive" *ngIf="purchaseOrders.length; else noPO">
                  <table class="table table-hover align-middle small">
                    <thead class="table-light text-muted">
                      <tr>
                        <th>PO ID</th>
                        <th>Project</th>
                        <th>Order Date</th>
                        <th>Expected Delivery</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let po of purchaseOrders">
                        <td class="fw-bold text-dark">{{ po.purchaseOrderId }}</td>
                        <td>{{ po.projectName }}</td>
                        <td>{{ po.orderDate }}</td>
                        <td>{{ po.expectedDeliveryDate }}</td>
                        <td class="fw-bold text-success">₹{{ po.totalAmount | number }}</td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-warning text-dark': po.purchaseOrderStatus === 'Draft',
                            'bg-primary': po.purchaseOrderStatus === 'Approved' || po.purchaseOrderStatus === 'Sent',
                            'bg-info text-dark': po.purchaseOrderStatus === 'Partially Received',
                            'bg-success': po.purchaseOrderStatus === 'Completed'
                          }">{{ po.purchaseOrderStatus }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ng-template #noPO>
                  <div class="text-muted small py-3 text-center">No purchase orders issued for this vendor yet.</div>
                </ng-template>
              </div>

              <!-- Tab 2: Invoices -->
              <div *ngIf="activeTab === 'invoices'">
                <div class="table-responsive" *ngIf="invoices.length; else noInv">
                  <table class="table table-hover align-middle small">
                    <thead class="table-light text-muted">
                      <tr>
                        <th>Invoice ID</th>
                        <th>Vendor Ref No.</th>
                        <th>PO Code</th>
                        <th>Invoice Date</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let inv of invoices">
                        <td class="fw-bold">{{ inv.invoiceId }}</td>
                        <td><span class="badge bg-light text-dark border">{{ inv.invoiceNumber }}</span></td>
                        <td>{{ inv.purchaseOrderCode || '-' }}</td>
                        <td>{{ inv.invoiceDate }}</td>
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
                <ng-template #noInv>
                  <div class="text-muted small py-3 text-center">No invoices recorded for this vendor.</div>
                </ng-template>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-tabs-custom .nav-link { color: #495057; font-weight: 600; font-size: 0.88rem; }
    .nav-tabs-custom .nav-link.active { color: #d97706; border-bottom: 2px solid #d97706; background: transparent; }
  `]
})
export class VendorDetailComponent implements OnInit {
  vendorIdParam = '';
  vendor: Vendor | null = null;
  purchaseOrders: PurchaseOrder[] = [];
  invoices: Invoice[] = [];

  loading = true;
  activeTab = 'pos';

  constructor(
    private route: ActivatedRoute,
    private procurementService: ProcurementService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.vendorIdParam = p['id'];
      if (this.vendorIdParam) {
        this.loadProfile();
      }
    });
  }

  loadProfile(): void {
    this.loading = true;
    this.procurementService.getVendorById(this.vendorIdParam).subscribe({
      next: (v) => {
        this.vendor = v;
        this.procurementService.getPurchaseOrders({ vendorId: v.id, pageSize: 50 }).subscribe(pos => this.purchaseOrders = pos.items);
        this.procurementService.getInvoices({ vendorId: v.id, pageSize: 50 }).subscribe(invs => this.invoices = invs.items);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ProcurementService } from '../../../core/services/procurement.service';
import { ProjectService } from '../../../core/services/project.service';
import { ProcurementDashboardStats } from '../../../core/models/procurement.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-procurement-dashboard',
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
          <!-- Page Header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-warning text-dark px-2 py-1 uppercase fw-bold">Module 7</span>
                <h2 class="fw-bold text-dark mb-0">Procurement Management Dashboard</h2>
              </div>
              <p class="text-muted small mb-0">Centralized oversight for material requests, approvals, vendor POs, goods receiving, & invoice tracking.</p>
            </div>
            
            <div class="d-flex align-items-center gap-2">
              <a routerLink="/procurement/requests" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm">
                <i class="bi bi-cart-plus-fill"></i> Raise Request
              </a>
              <a routerLink="/procurement/purchase-orders" class="btn btn-outline-dark d-flex align-items-center gap-2 shadow-sm">
                <i class="bi bi-receipt-cutoff"></i> Purchase Orders
              </a>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted mt-2 small">Loading live procurement statistics...</p>
          </div>

          <div *ngIf="!loading && stats">
            <!-- Project Filter Bar -->
            <div class="card card-custom border-0 p-3 mb-4">
              <div class="row g-3 align-items-center">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted mb-1">Filter Statistics by Project</label>
                  <select class="form-select" [(ngModel)]="selectedProjectId" (change)="loadStats()">
                    <option value="">-- All Projects --</option>
                    <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Top Stats Row (5 Key Metrics) -->
            <div class="row g-3 mb-4">
              <div class="col-xl-3 col-md-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Procurement Requests</span>
                      <h3 class="fw-bold text-dark mb-0 mt-1">{{ stats.totalRequests }}</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-primary-subtle text-primary fs-4">
                      <i class="bi bi-cart-check-fill"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">
                    <span class="text-warning fw-bold me-1">{{ stats.pendingRequests }} Pending</span> • 
                    <span class="text-success fw-bold ms-1">{{ stats.approvedRequests }} Approved</span>
                  </div>
                </div>
              </div>

              <div class="col-xl-3 col-md-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Active Purchase Orders</span>
                      <h3 class="fw-bold text-success mb-0 mt-1">{{ stats.activePurchaseOrders }}</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-success-subtle text-success fs-4">
                      <i class="bi bi-receipt-cutoff"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">{{ stats.completedPurchaseOrders }} Orders Completed</div>
                </div>
              </div>

              <div class="col-xl-3 col-md-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Pending / Overdue Invoices</span>
                      <h3 class="fw-bold text-danger mb-0 mt-1">{{ stats.pendingInvoices }} <span class="fs-6 text-muted">/ {{ stats.overdueInvoices }} Overdue</span></h3>
                    </div>
                    <div class="stat-icon-wrapper bg-danger-subtle text-danger fs-4">
                      <i class="bi bi-exclamation-octagon-fill"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">Invoice tracking status</div>
                </div>
              </div>

              <div class="col-xl-3 col-md-6">
                <div class="card card-custom p-3 border-0 h-100">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <span class="text-muted small fw-semibold">Total Procurement Value</span>
                      <h3 class="fw-bold text-warning mb-0 mt-1">₹{{ stats.totalProcurementValue | number }}</h3>
                    </div>
                    <div class="stat-icon-wrapper bg-warning-subtle text-warning fs-4">
                      <i class="bi bi-cash-coin"></i>
                    </div>
                  </div>
                  <div class="mt-2 extra-small text-muted">Calculated PO spend</div>
                </div>
              </div>
            </div>

            <!-- Categories Breakdown & Recent POs -->
            <div class="row g-4 mb-4">
              <!-- Category Breakdown -->
              <div class="col-lg-5">
                <div class="card card-custom border-0 p-4 h-100">
                  <h5 class="fw-bold text-dark mb-3"><i class="bi bi-tags-fill me-2 text-warning"></i> Procurement Category Requests</h5>
                  <div class="space-y-3">
                    <div *ngFor="let cat of stats.categoryBreakdown" class="p-2 border-bottom">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-semibold text-dark small">{{ cat.category }}</span>
                        <span class="badge bg-secondary rounded-pill">{{ cat.count }} Requests</span>
                      </div>
                      <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-warning" [style.width]="getCategoryPercent(cat.count) + '%'"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent Purchase Orders Table -->
              <div class="col-lg-7">
                <div class="card card-custom border-0 p-4 h-100">
                  <div class="d-flex align-items-center justify-content-between mb-3">
                    <h5 class="fw-bold text-dark mb-0"><i class="bi bi-clock-history me-2 text-warning"></i> Recent Purchase Orders</h5>
                    <a routerLink="/procurement/purchase-orders" class="btn btn-sm btn-outline-dark">View All POs</a>
                  </div>

                  <div class="table-responsive" *ngIf="stats.recentPurchaseOrders.length; else noPOs">
                    <table class="table table-hover align-middle small">
                      <thead class="table-light text-muted">
                        <tr>
                          <th>PO ID</th>
                          <th>Vendor</th>
                          <th>Project</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let po of stats.recentPurchaseOrders">
                          <td class="fw-bold text-dark">{{ po.purchaseOrderId }}</td>
                          <td>{{ po.vendorName }}</td>
                          <td>{{ po.projectName }}</td>
                          <td class="fw-bold text-success">₹{{ po.totalAmount | number }}</td>
                          <td>
                            <span class="badge" [ngClass]="{
                              'bg-warning text-dark': po.status === 'Draft',
                              'bg-primary': po.status === 'Approved' || po.status === 'Sent',
                              'bg-info text-dark': po.status === 'Partially Received',
                              'bg-success': po.status === 'Completed'
                            }">{{ po.status }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <ng-template #noPOs>
                    <div class="text-muted small py-3 text-center">No recent purchase orders found.</div>
                  </ng-template>
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
    .space-y-3 > * + * { margin-top: 0.5rem; }
  `]
})
export class ProcurementDashboardComponent implements OnInit {
  stats: ProcurementDashboardStats | null = null;
  loading = true;
  projects: Project[] = [];
  selectedProjectId = '';

  constructor(
    private procurementService: ProcurementService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(p => this.projects = p);
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.procurementService.getDashboardStats(this.selectedProjectId).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getCategoryPercent(count: number): number {
    if (!this.stats || !this.stats.totalRequests) return 0;
    return Math.round((count / this.stats.totalRequests) * 100);
  }
}

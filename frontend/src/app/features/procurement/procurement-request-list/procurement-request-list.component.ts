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
  ProcurementRequest,
  PaginatedProcurementRequestsResponse,
  ProcurementRequestItem,
  InventoryCheckResponse
} from '../../../core/models/procurement.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-procurement-request-list',
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
                  <li class="breadcrumb-item active">Procurement Requests</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-cart-plus-fill me-2 text-warning"></i>Procurement Requests & Inventory Integration</h2>
              <p class="text-muted small mb-0">Raise multi-item procurement requisitions, run automated Module 5 stock checks, & process approvals.</p>
            </div>

            <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" (click)="openRaiseModal()">
              <i class="bi bi-plus-circle-fill"></i> Raise New Request
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
              <div class="col-xl-3 col-md-6">
                <select class="form-select" [(ngModel)]="filterProjectId" (change)="loadRequests()">
                  <option value="">-- All Projects --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>

              <div class="col-xl-3 col-md-6">
                <select class="form-select" [(ngModel)]="filterCategoryName" (change)="loadRequests()">
                  <option value="">-- All Categories --</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                  <option value="Office Supplies">Office Supplies</option>
                </select>
              </div>

              <div class="col-xl-2 col-md-4">
                <select class="form-select" [(ngModel)]="filterStatus" (change)="loadRequests()">
                  <option value="">-- All Statuses --</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div class="col-xl-2 col-md-4">
                <select class="form-select" [(ngModel)]="filterPriority" (change)="loadRequests()">
                  <option value="">-- All Priorities --</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div class="col-xl-2 col-md-4 text-end">
                <button class="btn btn-outline-secondary w-100" (click)="resetFilters()">Reset</button>
              </div>
            </div>
          </div>

          <!-- Request Table -->
          <div class="card card-custom border-0 p-4">
            <div *ngIf="loading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div>
            </div>

            <div *ngIf="!loading">
              <div class="table-responsive" *ngIf="response && response.items.length; else noRequests">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Request ID</th>
                      <th>Project</th>
                      <th>Category / Priority</th>
                      <th>Requested By</th>
                      <th>Items Count</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of response.items">
                      <td class="fw-bold text-dark">
                        <a [routerLink]="['/procurement/workflow', r.id]" class="text-dark text-decoration-none hover-warning">
                          {{ r.requestId }}
                        </a>
                      </td>
                      <td>{{ r.projectName }}</td>
                      <td>
                        <span class="badge bg-warning text-dark me-1">{{ r.categoryName }}</span>
                        <span class="badge" [ngClass]="{
                          'bg-secondary': r.priority === 'Low',
                          'bg-info text-dark': r.priority === 'Medium',
                          'bg-warning text-dark': r.priority === 'High',
                          'bg-danger': r.priority === 'Urgent'
                        }">{{ r.priority }}</span>
                      </td>
                      <td>{{ r.requestedByName }}</td>
                      <td><span class="badge bg-light text-dark border">{{ r.items.length }} Items</span></td>
                      <td>{{ r.requestDate }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-warning text-dark': r.requestStatus === 'Pending',
                          'bg-success': r.requestStatus === 'Approved',
                          'bg-danger': r.requestStatus === 'Rejected',
                          'bg-info text-dark': r.requestStatus === 'Processing',
                          'bg-primary': r.requestStatus === 'Completed'
                        }">{{ r.requestStatus }}</span>
                      </td>
                      <td class="text-end">
                        <div class="btn-group btn-group-sm">
                          <a [routerLink]="['/procurement/workflow', r.id]" class="btn btn-outline-dark" title="View Integrated Lifecycle">
                            <i class="bi bi-diagram-3-fill"></i> Detail
                          </a>
                          <button *ngIf="r.requestStatus === 'Pending'" class="btn btn-outline-success" (click)="openApproveModal(r)" title="Approve Request">
                            <i class="bi bi-check-circle"></i> Approve
                          </button>
                          <button *ngIf="r.requestStatus === 'Pending'" class="btn btn-outline-danger" (click)="openRejectModal(r)" title="Reject Request">
                            <i class="bi bi-x-circle"></i> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noRequests>
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-cart d-block fs-1 opacity-50 mb-2"></i>
                  <h5>No Procurement Requests Found</h5>
                  <p class="small mb-3">Raise procurement requests when project site material stock is insufficient.</p>
                  <button class="btn btn-bt-accent btn-sm" (click)="openRaiseModal()">Raise First Request</button>
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

          <!-- Raise Request Modal -->
          <div *ngIf="showRaiseModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-xl modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-cart-plus-fill me-2 text-warning"></i>Raise Multi-Item Procurement Request</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showRaiseModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <form (ngSubmit)="submitRequest()">
                    <div class="row g-3 mb-4">
                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Target Project <span class="text-danger">*</span></label>
                        <select class="form-select" [(ngModel)]="newReq.projectId" name="projectId" required>
                          <option value="">-- Select Project --</option>
                          <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                        </select>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Procurement Category</label>
                        <select class="form-select" [(ngModel)]="newReq.categoryName" name="categoryName">
                          <option value="Raw Materials">Raw Materials</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Machinery">Machinery</option>
                          <option value="Safety Equipment">Safety Equipment</option>
                          <option value="Office Supplies">Office Supplies</option>
                        </select>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Priority Level</label>
                        <select class="form-select" [(ngModel)]="newReq.priority" name="priority">
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>

                      <div class="col-md-12">
                        <label class="form-label small fw-bold">Purpose / Justification</label>
                        <input type="text" class="form-control" [(ngModel)]="newReq.purpose" name="purpose" placeholder="e.g. Concrete mix supply for Foundation Pouring Stage 2">
                      </div>
                    </div>

                    <!-- Multi-Item Line Items Manager -->
                    <div class="card p-3 bg-light border mb-4">
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="fw-bold text-dark small"><i class="bi bi-list-check me-1 text-warning"></i> Requested Items List:</span>
                        <button type="button" class="btn btn-sm btn-outline-warning" (click)="addItemRow()">+ Add Item Row</button>
                      </div>

                      <div *ngFor="let item of reqItems; let i = index" class="row g-2 align-items-center mb-2 p-2 bg-white rounded border">
                        <div class="col-md-3">
                          <label class="extra-small text-muted d-block">Select Material (Module 5)</label>
                          <select class="form-select form-select-sm" [(ngModel)]="item.materialId" [name]="'mat_' + i" (change)="onMaterialSelect(i)">
                            <option value="">-- Custom Item / Unlinked --</option>
                            <option *ngFor="let m of masterMaterials" [value]="m.id">{{ m.name }} ({{ m.materialCode }})</option>
                          </select>
                        </div>

                        <div class="col-md-3">
                          <label class="extra-small text-muted d-block">Item Description *</label>
                          <input type="text" class="form-control form-control-sm" [(ngModel)]="item.itemDescription" [name]="'desc_' + i" required placeholder="e.g. Portland Cement 50kg">
                        </div>

                        <div class="col-md-2">
                          <label class="extra-small text-muted d-block">Req Quantity *</label>
                          <input type="number" class="form-control form-control-sm" [(ngModel)]="item.requiredQuantity" [name]="'qty_' + i" required (change)="runStockCheck()">
                        </div>

                        <div class="col-md-2">
                          <label class="extra-small text-muted d-block">Required Date *</label>
                          <input type="date" class="form-control form-control-sm" [(ngModel)]="item.requiredDate" [name]="'date_' + i" required>
                        </div>

                        <div class="col-md-2 text-end pt-3">
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeItemRow(i)" [disabled]="reqItems.length === 1">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Module 5 Automated Stock Check Results Box -->
                    <div *ngIf="stockCheckResult" class="p-3 mb-3 rounded border" [ngClass]="stockCheckResult.hasStockShortage ? 'bg-warning-subtle border-warning' : 'bg-success-subtle border-success'">
                      <div class="fw-bold small mb-2">
                        <i class="bi me-1" [ngClass]="stockCheckResult.hasStockShortage ? 'bi-exclamation-triangle-fill text-warning' : 'bi-check-circle-fill text-success'"></i>
                        Module 5 Inventory Integration Stock Check:
                      </div>
                      <div class="table-responsive">
                        <table class="table table-sm table-borderless extra-small mb-0">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Requested</th>
                              <th>Available Stock</th>
                              <th>Net Required</th>
                              <th>Stock Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr *ngFor="let s of stockCheckResult.items">
                              <td class="fw-bold">{{ s.itemDescription }}</td>
                              <td>{{ s.requiredQuantity }}</td>
                              <td>{{ s.availableStock }}</td>
                              <td class="fw-bold text-danger">{{ s.netProcurementQuantity }}</td>
                              <td>
                                <span class="badge" [ngClass]="s.isSufficientStock ? 'bg-success' : 'bg-warning text-dark'">
                                  {{ s.isSufficientStock ? 'Stock Available' : 'Shortage - Procurement Needed' }}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="showRaiseModal = false">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4" [disabled]="saving">Submit Procurement Request</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- Approve Modal -->
          <div *ngIf="showApproveModal && selectedReq" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-check-circle-fill me-2 text-success"></i>Approve Procurement Request {{ selectedReq.requestId }}</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showApproveModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <p class="small text-muted mb-3">Approving this request will allow Purchase Orders to be created against active vendors.</p>
                  <div class="mb-3">
                    <label class="form-label small fw-bold">Approval Note / Remarks</label>
                    <textarea class="form-control" rows="2" [(ngModel)]="approvalRemarks" placeholder="Optional notes..."></textarea>
                  </div>
                  <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-outline-secondary" (click)="showApproveModal = false">Cancel</button>
                    <button type="button" class="btn btn-success px-4" (click)="submitApprove()" [disabled]="saving">Confirm Approval</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reject Modal -->
          <div *ngIf="showRejectModal && selectedReq" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-x-circle-fill me-2 text-danger"></i>Reject Procurement Request {{ selectedReq.requestId }}</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="showRejectModal = false"></button>
                </div>
                <div class="modal-body p-4">
                  <div class="mb-3">
                    <label class="form-label small fw-bold">Rejection Reason <span class="text-danger">*</span></label>
                    <textarea class="form-control" rows="3" [(ngModel)]="rejectionReason" required placeholder="Specify reason for rejection..."></textarea>
                  </div>
                  <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-outline-secondary" (click)="showRejectModal = false">Cancel</button>
                    <button type="button" class="btn btn-danger px-4" (click)="submitReject()" [disabled]="saving || !rejectionReason.trim()">Confirm Rejection</button>
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
export class ProcurementRequestListComponent implements OnInit {
  response: PaginatedProcurementRequestsResponse | null = null;
  projects: Project[] = [];
  masterMaterials: any[] = [];

  loading = true;
  saving = false;

  filterProjectId = '';
  filterCategoryName = '';
  filterStatus = '';
  filterPriority = '';
  currentPage = 1;
  pageSize = 10;

  message = '';
  error = '';

  showRaiseModal = false;
  showApproveModal = false;
  showRejectModal = false;

  selectedReq: ProcurementRequest | null = null;
  approvalRemarks = '';
  rejectionReason = '';

  newReq = {
    projectId: '',
    categoryName: 'Raw Materials',
    priority: 'Medium',
    purpose: '',
    remarks: ''
  };

  reqItems: Partial<ProcurementRequestItem>[] = [
    { materialId: '', itemDescription: '', requiredQuantity: 100, unit: 'Units', requiredDate: new Date().toISOString().split('T')[0] }
  ];

  stockCheckResult: InventoryCheckResponse | null = null;

  constructor(
    private procurementService: ProcurementService,
    private projectService: ProjectService,
    private materialService: MaterialService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(p => this.projects = p);
    this.materialService.getMaterials().subscribe(m => this.masterMaterials = m);

    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.procurementService.getProcurementRequests({
      projectId: this.filterProjectId,
      categoryName: this.filterCategoryName,
      requestStatus: this.filterStatus,
      priority: this.filterPriority,
      page: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (data) => {
        this.response = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  resetFilters(): void {
    this.filterProjectId = '';
    this.filterCategoryName = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.currentPage = 1;
    this.loadRequests();
  }

  changePage(newPage: number): void {
    if (this.response && newPage >= 1 && newPage <= this.response.totalPages) {
      this.currentPage = newPage;
      this.loadRequests();
    }
  }

  getPagesArray(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  openRaiseModal(): void {
    this.newReq = {
      projectId: this.projects.length ? this.projects[0].id : '',
      categoryName: 'Raw Materials',
      priority: 'Medium',
      purpose: '',
      remarks: ''
    };
    this.reqItems = [
      { materialId: '', itemDescription: '', requiredQuantity: 100, unit: 'Units', requiredDate: new Date().toISOString().split('T')[0] }
    ];
    this.stockCheckResult = null;
    this.showRaiseModal = true;
  }

  addItemRow(): void {
    this.reqItems.push({
      materialId: '',
      itemDescription: '',
      requiredQuantity: 100,
      unit: 'Units',
      requiredDate: new Date().toISOString().split('T')[0]
    });
  }

  removeItemRow(index: number): void {
    if (this.reqItems.length > 1) {
      this.reqItems.splice(index, 1);
      this.runStockCheck();
    }
  }

  onMaterialSelect(index: number): void {
    const item = this.reqItems[index];
    if (item.materialId) {
      const mat = this.masterMaterials.find(m => m.id === item.materialId);
      if (mat) {
        item.itemDescription = mat.name;
        item.unit = mat.unitOfMeasure || 'Units';
      }
    }
    this.runStockCheck();
  }

  runStockCheck(): void {
    const itemsToCheck = this.reqItems
      .filter(i => i.itemDescription && i.itemDescription.trim())
      .map(i => ({
        materialId: i.materialId || '',
        itemDescription: i.itemDescription || '',
        requiredQuantity: i.requiredQuantity || 0
      }));

    if (itemsToCheck.length > 0) {
      this.procurementService.checkInventory(itemsToCheck).subscribe(res => this.stockCheckResult = res);
    }
  }

  submitRequest(): void {
    if (!this.newReq.projectId || !this.reqItems.length) return;

    this.saving = true;
    this.message = '';
    this.error = '';

    const payload = {
      ...this.newReq,
      items: this.reqItems
    };

    this.procurementService.createProcurementRequest(payload).subscribe({
      next: (created) => {
        this.saving = false;
        this.showRaiseModal = false;
        this.message = `Procurement request ${created.requestId} raised successfully!`;
        this.loadRequests();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Failed to submit procurement request.';
      }
    });
  }

  openApproveModal(r: ProcurementRequest): void {
    this.selectedReq = r;
    this.approvalRemarks = '';
    this.showApproveModal = true;
  }

  submitApprove(): void {
    if (!this.selectedReq) return;
    this.saving = true;
    this.procurementService.approveRequest(this.selectedReq.id, this.approvalRemarks).subscribe({
      next: () => {
        this.saving = false;
        this.showApproveModal = false;
        this.message = `Request ${this.selectedReq?.requestId} approved!`;
        this.loadRequests();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Approval failed.';
      }
    });
  }

  openRejectModal(r: ProcurementRequest): void {
    this.selectedReq = r;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  submitReject(): void {
    if (!this.selectedReq || !this.rejectionReason.trim()) return;
    this.saving = true;
    this.procurementService.rejectRequest(this.selectedReq.id, this.rejectionReason).subscribe({
      next: () => {
        this.saving = false;
        this.showRejectModal = false;
        this.message = `Request ${this.selectedReq?.requestId} rejected.`;
        this.loadRequests();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Rejection failed.';
      }
    });
  }
}

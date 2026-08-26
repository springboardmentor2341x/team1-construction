import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { MaterialService, MaterialRequest, Material } from '../../../core/services/material.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-material-request',
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
                <li class="breadcrumb-item active">Material Requests</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-file-earmark-text-fill me-2 text-warning"></i>Material Requests & Approval Workflow</h2>
              <p class="text-muted small mb-0">Submit material requirements, review stock availability vs shortage, and approve/reject requests.</p>
            </div>
            <button class="btn btn-bt-primary btn-sm" (click)="openCreateModal()"><i class="bi bi-plus-lg me-1"></i>New Material Request</button>
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
                <select class="form-select form-select-sm" [(ngModel)]="selectedProjectFilter" (change)="loadRequests()">
                  <option value="">All Construction Projects</option>
                  <option *ngFor="let p of projects()" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select form-select-sm" [(ngModel)]="selectedStatusFilter" (change)="loadRequests()">
                  <option value="">All Request Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Fulfilled">Fulfilled</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Requests Table -->
          <div class="card card-custom border-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small text-uppercase">
                  <tr>
                    <th>Request Code</th>
                    <th>Project</th>
                    <th>Material</th>
                    <th>Required Qty</th>
                    <th>Stock Now</th>
                    <th>Shortage</th>
                    <th>Required Date</th>
                    <th>Requested By</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let req of requests()">
                    <td><span class="badge bg-dark-subtle text-dark font-monospace">{{ req.requestCode }}</span></td>
                    <td class="fw-bold text-dark">{{ req.projectName }}</td>
                    <td>
                      <div class="fw-bold">{{ req.materialName }}</div>
                      <span class="badge bg-light text-muted font-monospace">{{ req.categoryName }}</span>
                    </td>
                    <td class="fw-bold text-primary">{{ req.requiredQuantity | number:'1.0-2' }} {{ req.unit }}</td>
                    <td>{{ req.availableStockNow | number:'1.0-2' }}</td>
                    <td [ngClass]="req.shortageQuantity > 0 ? 'text-danger fw-bold' : 'text-muted'">
                      {{ req.shortageQuantity > 0 ? '+' + (req.shortageQuantity | number:'1.0-2') : '0' }}
                    </td>
                    <td>{{ req.requiredDate }}</td>
                    <td>{{ req.requestedByName }}</td>
                    <td><span class="badge rounded-pill" [ngClass]="getStatusBadge(req.status)">{{ req.status }}</span></td>
                    <td class="text-end">
                      <button *ngIf="req.status === 'Pending'" class="btn btn-sm btn-outline-success me-1" (click)="openReviewModal(req)"><i class="bi bi-check-circle me-1"></i>Review</button>
                    </td>
                  </tr>
                  <tr *ngIf="requests().length === 0">
                    <td colspan="10" class="text-center py-4 text-muted">
                      <i class="bi bi-file-earmark-text fs-2 d-block mb-1 opacity-50"></i>No material requests found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Create Request Modal -->
    <div class="modal fade" id="requestModal" tabindex="-1" [ngClass]="{'show d-block': showCreateModal}" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-file-earmark-plus me-2 text-warning"></i>New Material Request</h5>
            <button type="button" class="btn-close" (click)="closeCreateModal()"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="submitRequest()">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Target Project *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="requestForm.projectId" name="projectId" required>
                    <option value="">-- Select Active Project --</option>
                    <option *ngFor="let p of activeProjects()" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Required Material *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="requestForm.materialId" name="materialId" required>
                    <option value="">-- Select Material --</option>
                    <option *ngFor="let m of materials()" [value]="m.id">{{ m.materialCode }} - {{ m.name }} (Available: {{ m.availableStock }} {{ m.unitOfMeasure }})</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Required Quantity *</label>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="requestForm.requiredQuantity" name="requiredQuantity" min="0.1" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Required Date *</label>
                  <input type="date" class="form-control form-control-sm" [(ngModel)]="requestForm.requiredDate" name="requiredDate" required>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Work Activity / Purpose *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="requestForm.workActivity" name="workActivity" placeholder="e.g. Column formwork pours Block B" required>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Remarks</label>
                  <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="requestForm.remarks" name="remarks" placeholder="Additional requirements or urgency details..."></textarea>
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" class="btn btn-sm btn-secondary" (click)="closeCreateModal()">Cancel</button>
                <button type="submit" class="btn btn-sm btn-bt-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Request Modal -->
    <div class="modal fade" id="reviewModal" tabindex="-1" [ngClass]="{'show d-block': showReviewModal}" style="background:rgba(0,0,0,0.5)" *ngIf="selectedRequest">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-shield-check me-2 text-warning"></i>Review Material Request</h5>
            <button type="button" class="btn-close" (click)="closeReviewModal()"></button>
          </div>
          <div class="modal-body">
            <div class="card bg-light p-3 border-0 mb-3 small">
              <div class="fw-bold text-dark mb-1">{{ selectedRequest.requestCode }} - {{ selectedRequest.materialName }}</div>
              <div class="text-muted mb-2">Project: <strong>{{ selectedRequest.projectName }}</strong></div>
              <div class="row text-center g-2 pt-2 border-top">
                <div class="col-4">
                  <div class="text-muted extra-small">Required</div>
                  <div class="fw-bold text-primary">{{ selectedRequest.requiredQuantity }} {{ selectedRequest.unit }}</div>
                </div>
                <div class="col-4">
                  <div class="text-muted extra-small">Current Stock</div>
                  <div class="fw-bold text-success">{{ selectedRequest.availableStockNow }} {{ selectedRequest.unit }}</div>
                </div>
                <div class="col-4">
                  <div class="text-muted extra-small">Shortage</div>
                  <div class="fw-bold" [ngClass]="selectedRequest.shortageQuantity > 0 ? 'text-danger' : 'text-muted'">
                    {{ selectedRequest.shortageQuantity }} {{ selectedRequest.unit }}
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="selectedRequest.shortageQuantity > 0" class="alert alert-warning small p-2 mb-3">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>Stock is insufficient for full fulfillment. Shortage of {{ selectedRequest.shortageQuantity }} {{ selectedRequest.unit }} detected.
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold text-dark">Review Decision *</label>
              <select class="form-select form-select-sm" [(ngModel)]="reviewForm.status">
                <option value="Approved">Approve Request</option>
                <option value="Rejected">Reject Request</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold text-dark">Review Remarks / Procurement Note</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="reviewForm.reviewRemarks" placeholder="Approval or rejection reason..."></textarea>
            </div>
            <div class="d-flex justify-content-end gap-2 pt-2 border-top">
              <button type="button" class="btn btn-sm btn-secondary" (click)="closeReviewModal()">Cancel</button>
              <button type="button" class="btn btn-sm btn-bt-primary" (click)="submitReview()">Submit Decision</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MaterialRequestComponent implements OnInit {
  requests = signal<MaterialRequest[]>([]);
  materials = signal<Material[]>([]);
  projects = signal<Project[]>([]);
  activeProjects = signal<Project[]>([]);

  selectedProjectFilter = '';
  selectedStatusFilter = '';
  errorMessage = '';
  successMessage = '';

  showCreateModal = false;
  showReviewModal = false;

  selectedRequest: MaterialRequest | null = null;

  requestForm = {
    projectId: '',
    materialId: '',
    requiredQuantity: 100,
    requiredDate: '',
    workActivity: '',
    remarks: ''
  };

  reviewForm = {
    status: 'Approved',
    reviewRemarks: ''
  };

  constructor(
    private materialService: MaterialService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {
    const today = new Date();
    today.setDate(today.getDate() + 5);
    this.requestForm.requiredDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadMaterials();
    this.loadRequests();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projs) => {
        this.projects.set(projs);
        this.activeProjects.set(projs.filter(p => p.status !== 'Closed'));
      }
    });
  }

  loadMaterials(): void {
    this.materialService.getMaterials().subscribe({
      next: (mats) => this.materials.set(mats)
    });
  }

  loadRequests(): void {
    this.materialService.getMaterialRequests(this.selectedProjectFilter, this.selectedStatusFilter).subscribe({
      next: (reqs) => this.requests.set(reqs),
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to load requests.'
    });
  }

  openCreateModal(): void {
    this.requestForm = {
      projectId: this.activeProjects().length > 0 ? this.activeProjects()[0].id : '',
      materialId: '',
      requiredQuantity: 100,
      requiredDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      workActivity: '',
      remarks: ''
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  submitRequest(): void {
    if (!this.requestForm.projectId || !this.requestForm.materialId || !this.requestForm.workActivity || this.requestForm.requiredQuantity <= 0) {
      this.errorMessage = 'Please complete all required fields with valid quantities.';
      return;
    }

    this.materialService.createMaterialRequest(this.requestForm).subscribe({
      next: () => {
        this.successMessage = 'Material request created successfully!';
        this.loadRequests();
        this.closeCreateModal();
      },
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to create request.'
    });
  }

  openReviewModal(req: MaterialRequest): void {
    this.selectedRequest = req;
    this.reviewForm = { status: 'Approved', reviewRemarks: '' };
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedRequest = null;
  }

  submitReview(): void {
    if (!this.selectedRequest) return;

    this.materialService.reviewMaterialRequest(this.selectedRequest.id, this.reviewForm).subscribe({
      next: () => {
        this.successMessage = `Material request ${this.reviewForm.status.toLowerCase()} successfully!`;
        this.loadRequests();
        this.closeReviewModal();
      },
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to review request.'
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-success text-white';
      case 'Fulfilled': return 'bg-primary text-white';
      case 'Pending': return 'bg-warning text-dark';
      case 'Rejected': return 'bg-danger text-white';
      default: return 'bg-secondary';
    }
  }
}

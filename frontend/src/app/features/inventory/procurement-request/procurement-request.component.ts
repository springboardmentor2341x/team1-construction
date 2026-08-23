import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ProcurementService } from '../../../core/services/procurement.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { AuthService } from '../../../core/services/auth.service';

export interface LegacyProcurement {
  id: string;
  title: string;
  supplier?: string;
  material_name?: string;
  expected_delivery_date?: string;
  po_number?: string;
  amount: number;
  project_id?: string;
  material_id?: string;
  quantity: number;
  status: string;
  requested_by?: string;
}

@Component({
  selector: 'app-procurement-request',
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
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-cart me-2 text-warning"></i>Procurement Requests</h2>
              <p class="text-muted small mb-0">Manage material orders and financial approvals.</p>
            </div>
            <button class="btn btn-bt-accent" (click)="openForm()"><i class="bi bi-plus-lg me-1"></i>New Request</button>
          </div>

          <div *ngIf="showForm" class="card card-custom border-0 p-4 mb-4 bg-white shadow-sm">
            <h6 class="fw-bold mb-3">{{ editingId ? 'Edit Procurement Request' : 'New Procurement Request' }}</h6>
            <form (ngSubmit)="saveProcurement()" class="row g-3">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Order Title / Description *</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="currentReq.title" name="title" required placeholder="e.g. Concrete mix supply order">
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Supplier / Vendor *</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="currentReq.supplier" name="supplier" placeholder="e.g. National Cement Corp">
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Material Name *</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="currentReq.material_name" name="material_name" placeholder="e.g. Portland Cement 50kg">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Quantity *</label>
                <input type="number" min="1" class="form-control form-control-sm" [(ngModel)]="currentReq.quantity" name="quantity" required>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Total Cost / Amount (₹) *</label>
                <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="currentReq.amount" name="amount" required>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Expected Delivery Date</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="currentReq.expected_delivery_date" name="expected_delivery_date">
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Project *</label>
                <select class="form-select form-select-sm" [(ngModel)]="currentReq.project_id" name="project_id" required>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>
              <div class="col-md-3" *ngIf="editingId && canApprove()">
                <label class="form-label small fw-semibold">Status</label>
                <select class="form-select form-select-sm" [(ngModel)]="currentReq.status" name="status">
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="PO Issued">PO Issued</option>
                  <option value="Received">Received</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div class="col-12 text-end mt-3">
                <button type="button" class="btn btn-sm btn-outline-secondary me-2" (click)="showForm = false">Cancel</button>
                <button type="submit" class="btn btn-sm btn-bt-accent">Save Request</button>
              </div>
            </form>
          </div>

          <div class="card card-custom border-0 p-4">
            <div class="table-responsive" *ngIf="procurements.length; else emptyState">
              <table class="table table-hover align-middle">
                <thead>
                  <tr class="text-muted small">
                    <th>PO / ID</th>
                    <th>Title & Material</th>
                    <th>Supplier</th>
                    <th>Project</th>
                    <th>Amount & Qty</th>
                    <th>Delivery Date</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let req of procurements">
                    <td><span class="badge bg-light text-dark font-monospace">{{ req.po_number || 'Pending PO' }}</span></td>
                    <td>
                      <div class="fw-bold text-dark">{{ req.title }}</div>
                      <div class="text-muted extra-small">{{ req.material_name || 'Standard Material' }}</div>
                    </td>
                    <td><i class="bi bi-shop me-1 text-muted"></i>{{ req.supplier || 'N/A' }}</td>
                    <td>{{ getProjectName(req.project_id) }}</td>
                    <td>
                      <div class="fw-bold text-primary">₹{{ req.amount | number:'1.2-2' }}</div>
                      <div class="text-muted extra-small">Qty: {{ req.quantity }}</div>
                    </td>
                    <td>{{ req.expected_delivery_date || 'TBD' }}</td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-warning text-dark': req.status === 'Pending Approval',
                        'bg-info text-dark': req.status === 'Approved',
                        'bg-primary': req.status === 'PO Issued',
                        'bg-success': req.status === 'Received',
                        'bg-danger': req.status === 'Rejected'
                      }">
                        {{ req.status }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-secondary me-1" (click)="edit(req)"><i class="bi bi-pencil"></i></button>
                      <button *ngIf="canApprove() && req.status !== 'PO Issued' && req.status !== 'Received'" (click)="issuePO(req.id)" class="btn btn-sm btn-outline-primary me-1" title="Issue PO">
                        <i class="bi bi-receipt"></i> PO
                      </button>
                      <button *ngIf="req.status === 'PO Issued'" (click)="markReceived(req.id)" class="btn btn-sm btn-outline-success me-1" title="Mark Received">
                        <i class="bi bi-check2-circle"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="delete(req.id)"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ng-template #emptyState>
              <div class="text-center py-5 text-muted">
                <i class="bi bi-cart d-block fs-1 opacity-50 mb-2"></i>
                <p>No procurement requests found. Click "New Request" to create one.</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ['.extra-small { font-size: 0.78rem; }']
})
export class ProcurementRequestComponent implements OnInit {
  procurements: LegacyProcurement[] = [];
  projects: Project[] = [];
  showForm = false;
  editingId: string | null = null;
  currentReq: Partial<LegacyProcurement> = {};

  constructor(
    private procurementService: ProcurementService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.projectService.getProjects().subscribe((p: Project[]) => this.projects = p);
  }

  loadData(): void {
    this.procurementService.getProcurements().subscribe((data: LegacyProcurement[]) => this.procurements = data);
  }

  getProjectName(id?: string): string {
    if (!id) return 'N/A';
    return this.projects.find(p => p.id === id)?.projectName || 'Unknown';
  }

  canApprove(): boolean {
    const role = this.authService.getRole();
    return role === 'Administrator' || role === 'Project Manager';
  }

  openForm(): void {
    this.editingId = null;
    this.currentReq = {
      title: '',
      supplier: '',
      material_name: '',
      expected_delivery_date: new Date().toISOString().split('T')[0],
      amount: 0,
      quantity: 100,
      status: 'Pending Approval'
    };
    this.showForm = true;
  }

  edit(req: LegacyProcurement): void {
    this.editingId = req.id;
    this.currentReq = { ...req };
    this.showForm = true;
  }

  saveProcurement(): void {
    if (this.editingId) {
      this.procurementService.updateProcurement(this.editingId, this.currentReq).subscribe(() => {
        this.loadData();
        this.showForm = false;
      });
    } else {
      this.procurementService.createProcurement(this.currentReq).subscribe(() => {
        this.loadData();
        this.showForm = false;
      });
    }
  }

  issuePO(id: string): void {
    this.procurementService.issuePO(id).subscribe(() => this.loadData());
  }

  markReceived(id: string): void {
    this.procurementService.markReceived(id).subscribe(() => this.loadData());
  }

  delete(id: string): void {
    if (confirm('Delete this procurement request?')) {
      this.procurementService.deleteProcurement(id).subscribe(() => this.loadData());
    }
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { MaterialService, MaterialAllocation, Material, MaterialRequest } from '../../../core/services/material.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-material-allocation',
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
                <li class="breadcrumb-item active">Material Allocations</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-box-arrow-right me-2 text-warning"></i>Project Material Allocations & Consumption</h2>
              <p class="text-muted small mb-0">Commit available inventory to project work activities and track actual consumption in PostgreSQL.</p>
            </div>
            <button class="btn btn-bt-primary btn-sm" (click)="openAllocateModal()"><i class="bi bi-plus-lg me-1"></i>Allocate Material</button>
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
                <select class="form-select form-select-sm" [(ngModel)]="selectedProjectFilter" (change)="loadAllocations()">
                  <option value="">All Projects</option>
                  <option *ngFor="let p of projects()" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Allocations Table -->
          <div class="card card-custom border-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small text-uppercase">
                  <tr>
                    <th>Project Name</th>
                    <th>Material</th>
                    <th>Allocated Qty</th>
                    <th>Consumed Qty</th>
                    <th>Remaining Qty</th>
                    <th>Allocation Date</th>
                    <th>Work Activity</th>
                    <th>Responsible User</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let alloc of allocations()">
                    <td class="fw-bold text-dark"><i class="bi bi-building me-1 text-warning"></i>{{ alloc.projectName }}</td>
                    <td>
                      <div class="fw-bold">{{ alloc.materialName }}</div>
                      <span class="badge bg-light text-muted font-monospace">{{ alloc.categoryName }}</span>
                    </td>
                    <td class="fw-bold text-primary">{{ alloc.quantity | number:'1.0-2' }} {{ alloc.unit }}</td>
                    <td class="text-secondary">{{ alloc.consumedQuantity | number:'1.0-2' }}</td>
                    <td class="fw-bold fs-6" [ngClass]="alloc.remainingQuantity > 0 ? 'text-warning' : 'text-muted'">
                      {{ alloc.remainingQuantity | number:'1.0-2' }} {{ alloc.unit }}
                    </td>
                    <td>{{ alloc.allocationDate }}</td>
                    <td>{{ alloc.workActivity }}</td>
                    <td>{{ alloc.responsibleUserName }}</td>
                    <td><span class="badge rounded-pill" [ngClass]="getStatusBadge(alloc.status)">{{ alloc.status }}</span></td>
                    <td class="text-end">
                      <button *ngIf="alloc.status === 'Allocated' && alloc.remainingQuantity > 0" class="btn btn-sm btn-outline-warning me-1" (click)="openConsumeModal(alloc)">
                        <i class="bi bi-fire me-1"></i>Record Consumption
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="allocations().length === 0">
                    <td colspan="10" class="text-center py-4 text-muted">
                      <i class="bi bi-box-arrow-right fs-2 d-block mb-1 opacity-50"></i>No material allocations found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Allocate Material Modal -->
    <div class="modal fade" id="allocateModal" tabindex="-1" [ngClass]="{'show d-block': showAllocateModal}" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-box-arrow-right me-2 text-warning"></i>Allocate Material to Project</h5>
            <button type="button" class="btn-close" (click)="closeAllocateModal()"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="submitAllocation()">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Target Project *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="allocationForm.projectId" name="projectId" required>
                    <option value="">-- Select Active Project --</option>
                    <option *ngFor="let p of activeProjects()" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Material to Allocate *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="selectedMaterialObj" name="material" (change)="onMaterialChange()" required>
                    <option [ngValue]="null">-- Select Material --</option>
                    <option *ngFor="let m of materials()" [ngValue]="m">{{ m.materialCode }} - {{ m.name }} (Available: {{ m.availableStock }} {{ m.unitOfMeasure }})</option>
                  </select>
                </div>
                <div *ngIf="selectedMaterialObj" class="col-12">
                  <div class="card bg-light p-2 border-0 small d-flex flex-row justify-content-between">
                    <span class="text-muted">Available Stock in Inventory:</span>
                    <strong class="text-success">{{ selectedMaterialObj.availableStock }} {{ selectedMaterialObj.unitOfMeasure }}</strong>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Allocation Quantity *</label>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="allocationForm.quantity" name="quantity" min="0.1" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Allocation Date *</label>
                  <input type="date" class="form-control form-control-sm" [(ngModel)]="allocationForm.allocationDate" name="allocationDate" required>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Work Activity *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="allocationForm.workActivity" name="workActivity" placeholder="e.g. Substructure basement slab pouring" required>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Link Approved Request (Optional)</label>
                  <select class="form-select form-select-sm" [(ngModel)]="allocationForm.requestId" name="requestId">
                    <option value="">-- None / Direct Allocation --</option>
                    <option *ngFor="let r of approvedRequests()" [value]="r.id">{{ r.requestCode }} - {{ r.materialName }} (Required: {{ r.requiredQuantity }} {{ r.unit }})</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Remarks</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="allocationForm.remarks" name="remarks" placeholder="Allocation notes...">
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" class="btn btn-sm btn-secondary" (click)="closeAllocateModal()">Cancel</button>
                <button type="submit" class="btn btn-sm btn-bt-primary">Allocate Material</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Consume Allocation Modal -->
    <div class="modal fade" id="consumeModal" tabindex="-1" [ngClass]="{'show d-block': showConsumeModal}" style="background:rgba(0,0,0,0.5)" *ngIf="selectedAllocation">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-fire me-2 text-warning"></i>Record Material Consumption</h5>
            <button type="button" class="btn-close" (click)="closeConsumeModal()"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="submitConsumption()">
              <div class="card bg-light p-3 border-0 mb-3 small">
                <div class="fw-bold text-dark mb-1">{{ selectedAllocation.materialName }}</div>
                <div class="text-muted mb-2">Project: {{ selectedAllocation.projectName }} | Work: {{ selectedAllocation.workActivity }}</div>
                <div class="d-flex justify-content-between border-top pt-2">
                  <span>Allocated: <strong>{{ selectedAllocation.quantity }} {{ selectedAllocation.unit }}</strong></span>
                  <span>Already Consumed: <strong>{{ selectedAllocation.consumedQuantity }}</strong></span>
                  <span>Remaining: <strong class="text-warning">{{ selectedAllocation.remainingQuantity }} {{ selectedAllocation.unit }}</strong></span>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Quantity Consumed *</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="consumeForm.consumedQuantity" name="consumedQuantity" [max]="selectedAllocation.remainingQuantity" min="0.1" required>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Consumption Remarks</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="consumeForm.remarks" name="remarks" placeholder="Notes on site application...">
              </div>
              <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" class="btn btn-sm btn-secondary" (click)="closeConsumeModal()">Cancel</button>
                <button type="submit" class="btn btn-sm btn-bt-primary">Record Consumption</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MaterialAllocationComponent implements OnInit {
  allocations = signal<MaterialAllocation[]>([]);
  materials = signal<Material[]>([]);
  projects = signal<Project[]>([]);
  activeProjects = signal<Project[]>([]);
  approvedRequests = signal<MaterialRequest[]>([]);

  selectedProjectFilter = '';
  errorMessage = '';
  successMessage = '';

  showAllocateModal = false;
  showConsumeModal = false;

  selectedAllocation: MaterialAllocation | null = null;
  selectedMaterialObj: Material | null = null;

  allocationForm = {
    projectId: '',
    materialId: '',
    quantity: 50,
    allocationDate: new Date().toISOString().split('T')[0],
    workActivity: '',
    requestId: '',
    remarks: ''
  };

  consumeForm = {
    consumedQuantity: 10,
    remarks: ''
  };

  constructor(
    private materialService: MaterialService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadMaterials();
    this.loadApprovedRequests();
    this.loadAllocations();
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

  loadApprovedRequests(): void {
    this.materialService.getMaterialRequests(undefined, 'Approved').subscribe({
      next: (reqs) => this.approvedRequests.set(reqs)
    });
  }

  loadAllocations(): void {
    this.materialService.getMaterialAllocations(this.selectedProjectFilter).subscribe({
      next: (allocs) => this.allocations.set(allocs),
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to load allocations.'
    });
  }

  onMaterialChange(): void {
    if (this.selectedMaterialObj) {
      this.allocationForm.materialId = this.selectedMaterialObj.id;
    }
  }

  openAllocateModal(): void {
    this.selectedMaterialObj = null;
    this.allocationForm = {
      projectId: this.activeProjects().length > 0 ? this.activeProjects()[0].id : '',
      materialId: '',
      quantity: 50,
      allocationDate: new Date().toISOString().split('T')[0],
      workActivity: '',
      requestId: '',
      remarks: ''
    };
    this.showAllocateModal = true;
  }

  closeAllocateModal(): void {
    this.showAllocateModal = false;
  }

  submitAllocation(): void {
    if (!this.allocationForm.projectId || !this.allocationForm.materialId || !this.allocationForm.workActivity || this.allocationForm.quantity <= 0) {
      this.errorMessage = 'Please select project, material, work activity, and enter a valid quantity.';
      return;
    }

    if (this.selectedMaterialObj && this.allocationForm.quantity > this.selectedMaterialObj.availableStock) {
      this.errorMessage = `Cannot allocate ${this.allocationForm.quantity}. Only ${this.selectedMaterialObj.availableStock} available in stock.`;
      return;
    }

    this.materialService.createMaterialAllocation(this.allocationForm).subscribe({
      next: () => {
        this.successMessage = 'Material allocated to project successfully!';
        this.loadAllocations();
        this.loadMaterials();
        this.closeAllocateModal();
      },
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to allocate material.'
    });
  }

  openConsumeModal(alloc: MaterialAllocation): void {
    this.selectedAllocation = alloc;
    this.consumeForm = { consumedQuantity: alloc.remainingQuantity, remarks: '' };
    this.showConsumeModal = true;
  }

  closeConsumeModal(): void {
    this.showConsumeModal = false;
    this.selectedAllocation = null;
  }

  submitConsumption(): void {
    if (!this.selectedAllocation || this.consumeForm.consumedQuantity <= 0) return;

    this.materialService.consumeMaterialAllocation(this.selectedAllocation.id, this.consumeForm).subscribe({
      next: () => {
        this.successMessage = 'Material consumption recorded successfully!';
        this.loadAllocations();
        this.loadMaterials();
        this.closeConsumeModal();
      },
      error: (err) => this.errorMessage = err?.error?.detail || 'Failed to record consumption.'
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Allocated': return 'bg-primary text-white';
      case 'Consumed': return 'bg-success text-white';
      case 'Returned': return 'bg-secondary text-white';
      default: return 'bg-secondary';
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import {
  ResourceService,
  Resource,
  ResourceUtilization,
  ResourceDashboard,
} from '../../../core/services/resource.service';

@Component({
  selector: 'app-resource-utilization',
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
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-pie-chart me-2 text-info"></i>Resource Utilization Reporting</h2>
              <p class="text-muted small mb-0">Track equipment operating hours, idle hours, and compute actual efficiency metrics.</p>
            </div>
            <button class="btn btn-info btn-sm text-white fw-bold" (click)="showModal = true">
              <i class="bi bi-plus-lg me-1"></i>Record Daily Operating Hours
            </button>
          </div>

          <!-- Alert -->
          <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            <button type="button" class="btn-close" (click)="errorMessage = null"></button>
          </div>
          <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
            <button type="button" class="btn-close" (click)="successMessage = null"></button>
          </div>

          <!-- Real KPI Summary Cards -->
          <div class="row g-3 mb-4" *ngIf="dashboard">
            <div class="col-md-4">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm">
                <span class="text-muted small">Total Managed Equipment</span>
                <h3 class="fw-bold mb-0 text-dark">{{ dashboard.totalResources }}</h3>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm">
                <span class="text-muted small">Average System Utilization</span>
                <h3 class="fw-bold mb-0 text-success">{{ dashboard.avgUtilizationPercentage }}%</h3>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm">
                <span class="text-muted small">Available Equipment</span>
                <h3 class="fw-bold mb-0 text-primary">{{ dashboard.availableCount }}</h3>
              </div>
            </div>
          </div>

          <!-- Equipment Utilization Overview Table -->
          <div class="card card-custom border-0 p-4 mb-4 shadow-sm bg-white">
            <h6 class="fw-bold mb-3">Equipment Overall Efficiency Breakdown</h6>
            <div class="table-responsive">
              <table class="table table-hover align-middle small">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Equipment Code</th>
                    <th>Equipment Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Efficiency Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let res of resources">
                    <td class="fw-bold text-primary">{{ res.equipmentCode }}</td>
                    <td class="fw-semibold">{{ res.name }}</td>
                    <td><span class="badge bg-light text-dark border">{{ res.category }}</span></td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-success': res.status === 'Available',
                        'bg-primary': res.status === 'Allocated',
                        'bg-warning text-dark': res.status === 'Under Maintenance',
                        'bg-danger': res.status === 'Out of Service'
                      }">{{ res.status }}</span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 8px;">
                          <div class="progress-bar" [ngClass]="getUtilClass(res.utilizationPercentage)" [style.width.%]="res.utilizationPercentage"></div>
                        </div>
                        <span class="fw-bold">{{ res.utilizationPercentage }}%</span>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="!resources.length">
                    <td colspan="5" class="text-center py-3 text-muted">No equipment found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Detailed Utilization Log History -->
          <div class="card card-custom border-0 p-4 shadow-sm bg-white">
            <h6 class="fw-bold mb-3">Daily Operating & Idle Hours Logs</h6>
            <div class="table-responsive">
              <table class="table table-hover align-middle small">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Date</th>
                    <th>Equipment</th>
                    <th>Operating Hours</th>
                    <th>Idle Hours</th>
                    <th>Total Available</th>
                    <th>Daily Utilization %</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of utilizationLogs">
                    <td>{{ u.date }}</td>
                    <td>
                      <div class="fw-bold text-dark">{{ u.resourceName }}</div>
                      <span class="badge bg-light text-muted border">{{ u.resourceCode }}</span>
                    </td>
                    <td class="fw-bold text-success">{{ u.operatingHours }} hrs</td>
                    <td class="text-warning">{{ u.idleHours }} hrs</td>
                    <td>{{ u.totalAvailableHours }} hrs</td>
                    <td>
                      <span class="badge" [ngClass]="getUtilClass(u.utilizationPercentage)">
                        {{ u.utilizationPercentage }}%
                      </span>
                    </td>
                    <td class="text-muted">{{ u.notes || '-' }}</td>
                  </tr>
                  <tr *ngIf="!utilizationLogs.length">
                    <td colspan="7" class="text-center py-4 text-muted">No utilization logs recorded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- MODAL: RECORD UTILIZATION -->
    <div *ngIf="showModal" class="modal-backdrop fade show"></div>
    <div *ngIf="showModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-info text-white">
            <h6 class="modal-title fw-bold">Record Equipment Daily Hours</h6>
            <button type="button" class="btn-close btn-close-white" (click)="showModal = false"></button>
          </div>
          <form (ngSubmit)="saveUtilization()">
            <div class="modal-body row g-3">
              <div class="col-12">
                <label class="form-label small fw-bold">Select Equipment</label>
                <select class="form-select form-select-sm" [(ngModel)]="utilForm.resourceId" name="resourceId" required>
                  <option value="">-- Select Equipment --</option>
                  <option *ngFor="let r of resources" [value]="r.id">{{ r.equipmentCode }} - {{ r.name }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Log Date</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="utilForm.date" name="date" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Total Available Hours</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="utilForm.totalAvailableHours" name="totalAvailableHours" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Operating Hours</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="utilForm.operatingHours" name="operatingHours" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Idle Hours</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="utilForm.idleHours" name="idleHours" required>
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">Notes / Site Remarks</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="utilForm.notes" name="notes" placeholder="e.g. Earthmoving at North Excavation block">
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-outline-secondary btn-sm" (click)="showModal = false">Cancel</button>
              <button type="submit" class="btn btn-info btn-sm text-white fw-bold">Save Utilization Record</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ResourceUtilizationComponent implements OnInit {
  resources: Resource[] = [];
  utilizationLogs: ResourceUtilization[] = [];
  dashboard: ResourceDashboard | null = null;

  showModal = false;
  utilForm: Partial<ResourceUtilization> = {};

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private resourceService: ResourceService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.resourceService.getResources().subscribe(data => this.resources = data);
    this.resourceService.getDashboard().subscribe(d => this.dashboard = d);
    this.resourceService.getUtilizations().subscribe(u => this.utilizationLogs = u);

    const today = new Date().toISOString().split('T')[0];
    this.utilForm = {
      resourceId: '',
      date: today,
      operatingHours: 8,
      idleHours: 2,
      totalAvailableHours: 10,
      notes: ''
    };
  }

  saveUtilization(): void {
    this.errorMessage = null;
    this.resourceService.createUtilization(this.utilForm).subscribe({
      next: () => {
        this.successMessage = 'Utilization record saved successfully.';
        this.showModal = false;
        this.loadData();
      },
      error: err => this.errorMessage = err.error?.detail || 'Failed to save utilization record.'
    });
  }

  getUtilClass(pct: number): string {
    if (pct >= 75) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-danger';
  }
}

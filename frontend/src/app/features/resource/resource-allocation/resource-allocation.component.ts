import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import {
  ResourceService,
  Resource,
  ResourceAllocation,
  ResourceMaintenance,
  ResourceDashboard,
} from '../../../core/services/resource.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-resource-allocation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block"><app-sidebar></app-sidebar></div>
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          
          <!-- Header -->
          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-tools me-2 text-warning"></i>Resource Management System</h2>
              <p class="text-muted small mb-0">Lifecycle management, equipment allocation, machinery tracking, and maintenance scheduling.</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm" (click)="openMaintenanceModal()"><i class="bi bi-wrench me-1"></i>Schedule Maintenance</button>
              <button class="btn btn-outline-success btn-sm" (click)="openAllocationModal()"><i class="bi bi-box-arrow-up-right me-1"></i>Allocate Equipment</button>
              <button class="btn btn-warning btn-sm" (click)="openResourceModal()"><i class="bi bi-plus-lg me-1"></i>Add Equipment</button>
            </div>
          </div>

          <!-- Alert / Error message -->
          <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            <button type="button" class="btn-close" (click)="errorMessage = null"></button>
          </div>
          <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
            <button type="button" class="btn-close" (click)="successMessage = null"></button>
          </div>

          <!-- Real KPI Cards -->
          <div class="row g-3 mb-4" *ngIf="dashboard">
            <div class="col-md-2">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm text-center">
                <span class="text-muted small">Total Equipment</span>
                <h3 class="fw-bold mb-0 text-dark">{{ dashboard.totalResources }}</h3>
              </div>
            </div>
            <div class="col-md-2">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm text-center">
                <span class="text-muted small">Available</span>
                <h3 class="fw-bold mb-0 text-success">{{ dashboard.availableCount }}</h3>
              </div>
            </div>
            <div class="col-md-2">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm text-center">
                <span class="text-muted small">Allocated</span>
                <h3 class="fw-bold mb-0 text-primary">{{ dashboard.allocatedCount }}</h3>
              </div>
            </div>
            <div class="col-md-2">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm text-center">
                <span class="text-muted small">Maintenance</span>
                <h3 class="fw-bold mb-0 text-warning">{{ dashboard.underMaintenanceCount }}</h3>
              </div>
            </div>
            <div class="col-md-2">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm text-center">
                <span class="text-muted small">Out of Service</span>
                <h3 class="fw-bold mb-0 text-danger">{{ dashboard.outOfServiceCount }}</h3>
              </div>
            </div>
            <div class="col-md-2">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm text-center">
                <span class="text-muted small">Avg Utilization</span>
                <h3 class="fw-bold mb-0 text-info">{{ dashboard.avgUtilizationPercentage }}%</h3>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <ul class="nav nav-tabs custom-tabs mb-4">
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'directory'" (click)="activeTab = 'directory'">
                <i class="bi bi-grid-3x3-gap-fill me-1"></i>Equipment Directory
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'allocations'" (click)="activeTab = 'allocations'">
                <i class="bi bi-arrow-left-right me-1"></i>Active Allocations
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'tracking'" (click)="activeTab = 'tracking'">
                <i class="bi bi-geo-alt-fill me-1"></i>Machinery Tracking
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'maintenance'" (click)="activeTab = 'maintenance'">
                <i class="bi bi-wrench-adjustable me-1"></i>Maintenance History
              </button>
            </li>
          </ul>

          <!-- TAB 1: EQUIPMENT DIRECTORY -->
          <div *ngIf="activeTab === 'directory'">
            <!-- Filters -->
            <div class="card card-custom border-0 p-3 mb-4 bg-white shadow-sm">
              <div class="row g-2 align-items-center">
                <div class="col-md-3">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-light"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control" placeholder="Search Equipment Code or Name..." [(ngModel)]="searchQuery" (ngModelChange)="loadResources()">
                  </div>
                </div>
                <div class="col-md-3">
                  <select class="form-select form-select-sm" [(ngModel)]="categoryFilter" (change)="loadResources()">
                    <option value="">All Categories</option>
                    <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (change)="loadResources()">
                    <option value="">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Allocated">Allocated</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <select class="form-select form-select-sm" [(ngModel)]="projectFilter" (change)="loadResources()">
                    <option value="">All Projects</option>
                    <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</option>
                  </select>
                </div>
                <div class="col-md-2 text-end">
                  <button class="btn btn-outline-secondary btn-sm" (click)="resetFilters()"><i class="bi bi-arrow-counterclockwise me-1"></i>Reset</button>
                </div>
              </div>
            </div>

            <!-- Equipment Table -->
            <div class="card card-custom border-0 p-4 shadow-sm bg-white">
              <div class="table-responsive">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Equipment Code</th>
                      <th>Equipment Name</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Current Project</th>
                      <th>Status</th>
                      <th>Utilization %</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let res of resources">
                      <td class="fw-bold text-primary">{{ res.equipmentCode }}</td>
                      <td class="fw-semibold">{{ res.name }}</td>
                      <td><span class="badge bg-light text-dark border">{{ res.category }}</span></td>
                      <td><i class="bi bi-geo-alt me-1 text-secondary"></i>{{ res.location }}</td>
                      <td>{{ res.projectName || 'Unassigned (Yard)' }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-success': res.status === 'Available',
                          'bg-primary': res.status === 'Allocated',
                          'bg-warning text-dark': res.status === 'Under Maintenance',
                          'bg-danger': res.status === 'Out of Service'
                        }">
                          {{ res.status }}
                        </span>
                      </td>
                      <td>
                        <div class="d-flex align-items-center gap-2">
                          <div class="progress flex-grow-1" style="height: 6px;">
                            <div class="progress-bar bg-info" [style.width.%]="res.utilizationPercentage"></div>
                          </div>
                          <span>{{ res.utilizationPercentage }}%</span>
                        </div>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-secondary me-1" (click)="editResource(res)" title="Edit Equipment"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger" (click)="deleteResource(res.id)" title="Delete"><i class="bi bi-trash"></i></button>
                      </td>
                    </tr>
                    <tr *ngIf="!resources.length">
                      <td colspan="8" class="text-center py-4 text-muted">No equipment found matching filters.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TAB 2: ACTIVE ALLOCATIONS -->
          <div *ngIf="activeTab === 'allocations'">
            <div class="card card-custom border-0 p-4 shadow-sm bg-white">
              <h6 class="fw-bold mb-3">Equipment Allocation Records</h6>
              <div class="table-responsive">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Equipment</th>
                      <th>Project</th>
                      <th>Allocation Date</th>
                      <th>Expected Return</th>
                      <th>Responsible Person</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let alloc of allocations">
                      <td>
                        <div class="fw-bold text-dark">{{ alloc.resourceName }}</div>
                        <span class="badge bg-light text-muted border">{{ alloc.resourceCode }}</span>
                      </td>
                      <td class="fw-semibold text-primary">{{ alloc.projectName }}</td>
                      <td>{{ alloc.allocationDate }}</td>
                      <td>{{ alloc.expectedReturnDate }}</td>
                      <td>{{ alloc.responsiblePersonName || 'Unassigned' }}</td>
                      <td>{{ alloc.location }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-primary': alloc.status === 'Active',
                          'bg-success': alloc.status === 'Returned',
                          'bg-secondary': alloc.status === 'Cancelled'
                        }">
                          {{ alloc.status }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button *ngIf="alloc.status === 'Active'" class="btn btn-sm btn-outline-success" (click)="returnEquipment(alloc.id)">
                          <i class="bi bi-box-arrow-in-left me-1"></i>Return to Yard
                        </button>
                        <span *ngIf="alloc.status === 'Returned'" class="text-muted small">Returned on {{ alloc.actualReturnDate }}</span>
                      </td>
                    </tr>
                    <tr *ngIf="!allocations.length">
                      <td colspan="8" class="text-center py-4 text-muted">No equipment allocation records.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TAB 3: MACHINERY TRACKING -->
          <div *ngIf="activeTab === 'tracking'">
            <div class="card card-custom border-0 p-4 shadow-sm bg-white">
              <h6 class="fw-bold mb-3"><i class="bi bi-geo-alt-fill me-2 text-danger"></i>Real-Time Machinery Location & Status</h6>
              <div class="row g-3">
                <div class="col-md-4" *ngFor="let res of resources">
                  <div class="card border rounded p-3 h-100 shadow-sm" [ngClass]="{
                    'border-success': res.status === 'Available',
                    'border-primary': res.status === 'Allocated',
                    'border-warning': res.status === 'Under Maintenance',
                    'border-danger': res.status === 'Out of Service'
                  }">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <span class="fw-bold text-dark fs-6">{{ res.name }}</span>
                      <span class="badge bg-secondary">{{ res.equipmentCode }}</span>
                    </div>
                    <p class="small text-muted mb-2"><i class="bi bi-tag me-1"></i>{{ res.category }}</p>
                    <div class="small mb-1"><strong>Location:</strong> {{ res.location }}</div>
                    <div class="small mb-1"><strong>Current Project:</strong> {{ res.projectName || 'Unassigned Yard' }}</div>
                    <div class="small mb-2"><strong>Responsible Person:</strong> {{ res.responsiblePersonName || 'Unassigned' }}</div>
                    <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                      <span class="badge" [ngClass]="{
                        'bg-success': res.status === 'Available',
                        'bg-primary': res.status === 'Allocated',
                        'bg-warning text-dark': res.status === 'Under Maintenance',
                        'bg-danger': res.status === 'Out of Service'
                      }">{{ res.status }}</span>
                      <span class="small fw-bold text-info">Util: {{ res.utilizationPercentage }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 4: MAINTENANCE HISTORY -->
          <div *ngIf="activeTab === 'maintenance'">
            <div class="card card-custom border-0 p-4 shadow-sm bg-white">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h6 class="fw-bold mb-0">Maintenance & Inspection History</h6>
                <button class="btn btn-sm btn-outline-primary" (click)="openMaintenanceModal()"><i class="bi bi-plus-lg me-1"></i>New Maintenance Record</button>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle small">
                  <thead class="table-light text-muted">
                    <tr>
                      <th>Equipment Code</th>
                      <th>Equipment Name</th>
                      <th>Maintenance Type</th>
                      <th>Maintenance Date</th>
                      <th>Next Due Date</th>
                      <th>Engineer</th>
                      <th>Cost ($)</th>
                      <th>Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let maint of maintenances">
                      <td class="fw-bold text-primary">{{ maint.resourceCode }}</td>
                      <td class="fw-semibold">{{ maint.resourceName }}</td>
                      <td>{{ maint.maintenanceType }}</td>
                      <td>{{ maint.maintenanceDate }}</td>
                      <td>
                        <span [ngClass]="{'text-danger fw-bold': isOverdue(maint.nextMaintenanceDate, maint.status)}">
                          {{ maint.nextMaintenanceDate || 'N/A' }}
                        </span>
                      </td>
                      <td>{{ maint.serviceEngineer || 'Unassigned' }}</td>
                      <td class="fw-bold">{{ maint.maintenanceCost | currency:'USD':'symbol':'1.2-2' }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-warning text-dark': maint.status === 'Scheduled',
                          'bg-info text-dark': maint.status === 'In Progress',
                          'bg-success': maint.status === 'Completed',
                          'bg-secondary': maint.status === 'Cancelled'
                        }">
                          {{ maint.status }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button *ngIf="maint.status !== 'Completed'" class="btn btn-sm btn-success" (click)="completeMaintenance(maint.id)">
                          <i class="bi bi-check-lg me-1"></i>Complete
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="!maintenances.length">
                      <td colspan="9" class="text-center py-4 text-muted">No maintenance records found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- MODAL 1: ADD/EDIT RESOURCE -->
    <div *ngIf="showResourceModal" class="modal-backdrop fade show"></div>
    <div *ngIf="showResourceModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-warning text-dark">
            <h6 class="modal-title fw-bold">{{ editingResourceId ? 'Edit Equipment' : 'Add New Equipment' }}</h6>
            <button type="button" class="btn-close" (click)="showResourceModal = false"></button>
          </div>
          <form (ngSubmit)="saveResource()">
            <div class="modal-body row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Equipment Code (ID)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="resourceForm.equipmentCode" name="equipmentCode" placeholder="e.g. EXC-001" [disabled]="!!editingResourceId" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Equipment Name</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="resourceForm.name" name="name" placeholder="e.g. Excavator PC210" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Category</label>
                <select class="form-select form-select-sm" [(ngModel)]="resourceForm.category" name="category" required>
                  <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Status</label>
                <select class="form-select form-select-sm" [(ngModel)]="resourceForm.status" name="status" required>
                  <option value="Available">Available</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Location</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="resourceForm.location" name="location" placeholder="e.g. Salem Yard">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Purchase Cost ($)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="resourceForm.purchaseCost" name="purchaseCost">
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">Description / Notes</label>
                <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="resourceForm.description" name="description"></textarea>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-outline-secondary btn-sm" (click)="showResourceModal = false">Cancel</button>
              <button type="submit" class="btn btn-warning btn-sm fw-bold">Save Equipment</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL 2: ALLOCATE EQUIPMENT -->
    <div *ngIf="showAllocationModal" class="modal-backdrop fade show"></div>
    <div *ngIf="showAllocationModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-success text-white">
            <h6 class="modal-title fw-bold">Allocate Equipment to Project</h6>
            <button type="button" class="btn-close btn-close-white" (click)="showAllocationModal = false"></button>
          </div>
          <form (ngSubmit)="saveAllocation()">
            <div class="modal-body row g-3">
              <div class="col-12">
                <label class="form-label small fw-bold">Select Equipment</label>
                <select class="form-select form-select-sm" [(ngModel)]="allocationForm.resourceId" name="resourceId" required>
                  <option value="">-- Select Available Equipment --</option>
                  <option *ngFor="let r of availableEquipmentList" [value]="r.id">
                    {{ r.equipmentCode }} - {{ r.name }} ({{ r.category }})
                  </option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">Select Project</label>
                <select class="form-select form-select-sm" [(ngModel)]="allocationForm.projectId" name="projectId" required>
                  <option value="">-- Select Project --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Allocation Date</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="allocationForm.allocationDate" name="allocationDate" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Expected Return Date</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="allocationForm.expectedReturnDate" name="expectedReturnDate" required>
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">Responsible Person / Operator</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="allocationForm.responsiblePersonName" name="responsiblePersonName" placeholder="e.g. John Operator">
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">Notes</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="allocationForm.notes" name="notes" placeholder="Allocation purpose or site details">
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-outline-secondary btn-sm" (click)="showAllocationModal = false">Cancel</button>
              <button type="submit" class="btn btn-success btn-sm fw-bold">Allocate Equipment</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL 3: SCHEDULE MAINTENANCE -->
    <div *ngIf="showMaintenanceModal" class="modal-backdrop fade show"></div>
    <div *ngIf="showMaintenanceModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h6 class="modal-title fw-bold">Schedule Equipment Maintenance</h6>
            <button type="button" class="btn-close btn-close-white" (click)="showMaintenanceModal = false"></button>
          </div>
          <form (ngSubmit)="saveMaintenance()">
            <div class="modal-body row g-3">
              <div class="col-12">
                <label class="form-label small fw-bold">Select Equipment</label>
                <select class="form-select form-select-sm" [(ngModel)]="maintenanceForm.resourceId" name="resourceId" required>
                  <option value="">-- Select Equipment --</option>
                  <option *ngFor="let r of resources" [value]="r.id">{{ r.equipmentCode }} - {{ r.name }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Maintenance Type</label>
                <select class="form-select form-select-sm" [(ngModel)]="maintenanceForm.maintenanceType" name="maintenanceType" required>
                  <option value="Routine Inspection">Routine Inspection</option>
                  <option value="Preventative">Preventative</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Status</label>
                <select class="form-select form-select-sm" [(ngModel)]="maintenanceForm.status" name="status" required>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Maintenance Date</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="maintenanceForm.maintenanceDate" name="maintenanceDate" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Next Due Date</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="maintenanceForm.nextMaintenanceDate" name="nextMaintenanceDate">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Service Engineer</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="maintenanceForm.serviceEngineer" name="serviceEngineer" placeholder="e.g. Mike Technician">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Cost ($)</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="maintenanceForm.maintenanceCost" name="maintenanceCost">
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">Description / Work Order Details</label>
                <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="maintenanceForm.description" name="description"></textarea>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-outline-secondary btn-sm" (click)="showMaintenanceModal = false">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm fw-bold">Schedule Maintenance</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ResourceAllocationComponent implements OnInit {
  activeTab: 'directory' | 'allocations' | 'tracking' | 'maintenance' = 'directory';
  dashboard: ResourceDashboard | null = null;
  resources: Resource[] = [];
  categories: string[] = [];
  projects: Project[] = [];
  allocations: ResourceAllocation[] = [];
  maintenances: ResourceMaintenance[] = [];
  availableEquipmentList: Resource[] = [];

  // Filters
  searchQuery = '';
  categoryFilter = '';
  statusFilter = '';
  projectFilter = '';

  // Alerts
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Modals
  showResourceModal = false;
  editingResourceId: string | null = null;
  resourceForm: Partial<Resource> = {};

  showAllocationModal = false;
  allocationForm: Partial<ResourceAllocation> = {};

  showMaintenanceModal = false;
  maintenanceForm: Partial<ResourceMaintenance> = {};

  constructor(
    private resourceService: ResourceService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadDashboard();
    this.loadResources();
    this.loadProjects();
    this.loadAllocations();
    this.loadMaintenances();
  }

  loadCategories(): void {
    this.resourceService.getCategories().subscribe(c => this.categories = c);
  }

  loadDashboard(): void {
    this.resourceService.getDashboard().subscribe(d => this.dashboard = d);
  }

  loadResources(): void {
    this.resourceService.getResources({
      search: this.searchQuery,
      category: this.categoryFilter,
      status: this.statusFilter,
      projectId: this.projectFilter
    }).subscribe(data => this.resources = data);
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe(p => this.projects = p.filter(proj => proj.status !== 'Closed'));
  }

  loadAllocations(): void {
    this.resourceService.getAllocations().subscribe(a => this.allocations = a);
  }

  loadMaintenances(): void {
    this.resourceService.getMaintenances().subscribe(m => this.maintenances = m);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.categoryFilter = '';
    this.statusFilter = '';
    this.projectFilter = '';
    this.loadResources();
  }

  // Modals trigger
  openResourceModal(): void {
    this.editingResourceId = null;
    this.resourceForm = {
      category: 'Excavators',
      status: 'Available',
      location: 'Equipment Yard',
      purchaseCost: 0
    };
    this.showResourceModal = true;
  }

  editResource(res: Resource): void {
    this.editingResourceId = res.id;
    this.resourceForm = { ...res };
    this.showResourceModal = true;
  }

  saveResource(): void {
    this.errorMessage = null;
    if (this.editingResourceId) {
      this.resourceService.updateResource(this.editingResourceId, this.resourceForm).subscribe({
        next: () => {
          this.successMessage = 'Equipment updated successfully.';
          this.showResourceModal = false;
          this.loadResources();
          this.loadDashboard();
        },
        error: err => this.errorMessage = err.error?.detail || 'Failed to update equipment.'
      });
    } else {
      this.resourceService.createResource(this.resourceForm).subscribe({
        next: () => {
          this.successMessage = 'Equipment created successfully.';
          this.showResourceModal = false;
          this.loadResources();
          this.loadDashboard();
        },
        error: err => this.errorMessage = err.error?.detail || 'Failed to create equipment.'
      });
    }
  }

  deleteResource(id: string): void {
    if (confirm('Are you sure you want to delete this equipment?')) {
      this.resourceService.deleteResource(id).subscribe({
        next: () => {
          this.successMessage = 'Equipment deleted.';
          this.loadResources();
          this.loadDashboard();
        },
        error: err => this.errorMessage = err.error?.detail || 'Failed to delete equipment.'
      });
    }
  }

  openAllocationModal(): void {
    this.resourceService.checkAvailability().subscribe(avail => {
      this.availableEquipmentList = avail;
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      this.allocationForm = {
        resourceId: avail.length ? avail[0].id : '',
        projectId: this.projects.length ? this.projects[0].id : '',
        allocationDate: today,
        expectedReturnDate: nextWeek,
        notes: ''
      };
      this.showAllocationModal = true;
    });
  }

  saveAllocation(): void {
    this.errorMessage = null;
    this.resourceService.createAllocation(this.allocationForm).subscribe({
      next: () => {
        this.successMessage = 'Equipment allocated successfully.';
        this.showAllocationModal = false;
        this.loadAllocations();
        this.loadResources();
        this.loadDashboard();
      },
      error: err => this.errorMessage = err.error?.detail || 'Failed to allocate equipment.'
    });
  }

  returnEquipment(allocationId: string): void {
    if (confirm('Return this equipment to the equipment yard?')) {
      this.resourceService.returnAllocation(allocationId).subscribe({
        next: () => {
          this.successMessage = 'Equipment returned successfully.';
          this.loadAllocations();
          this.loadResources();
          this.loadDashboard();
        },
        error: err => this.errorMessage = err.error?.detail || 'Failed to return equipment.'
      });
    }
  }

  openMaintenanceModal(): void {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    this.maintenanceForm = {
      resourceId: this.resources.length ? this.resources[0].id : '',
      maintenanceType: 'Routine Inspection',
      status: 'Scheduled',
      maintenanceDate: today,
      nextMaintenanceDate: nextMonth,
      maintenanceCost: 0
    };
    this.showMaintenanceModal = true;
  }

  saveMaintenance(): void {
    this.errorMessage = null;
    this.resourceService.createMaintenance(this.maintenanceForm).subscribe({
      next: () => {
        this.successMessage = 'Maintenance scheduled successfully.';
        this.showMaintenanceModal = false;
        this.loadMaintenances();
        this.loadResources();
        this.loadDashboard();
      },
      error: err => this.errorMessage = err.error?.detail || 'Failed to schedule maintenance.'
    });
  }

  completeMaintenance(id: string): void {
    this.resourceService.updateMaintenance(id, { status: 'Completed' }).subscribe({
      next: () => {
        this.successMessage = 'Maintenance marked as Completed.';
        this.loadMaintenances();
        this.loadResources();
        this.loadDashboard();
      },
      error: err => this.errorMessage = err.error?.detail || 'Failed to complete maintenance.'
    });
  }

  isOverdue(dateStr?: string, statusStr?: string): boolean {
    if (!dateStr || statusStr === 'Completed') return false;
    return new Date(dateStr) < new Date();
  }
}

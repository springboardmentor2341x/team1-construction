import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { MaterialService, StockMovement } from '../../../core/services/material.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-stock-movements',
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
                <li class="breadcrumb-item active">Stock Movement Audit History</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-clock-history me-2 text-warning"></i>Stock Movement Audit Log</h2>
              <p class="text-muted small mb-0">Immutable transaction log tracking all material receipts, allocations, consumptions, and returns stored in PostgreSQL.</p>
            </div>
          </div>

          <!-- Filters -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-2 align-items-center">
              <div class="col-md-4">
                <select class="form-select form-select-sm" [(ngModel)]="selectedProjectFilter" (change)="loadMovements()">
                  <option value="">All Projects</option>
                  <option *ngFor="let p of projects()" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select form-select-sm" [(ngModel)]="selectedTypeFilter">
                  <option value="">All Movement Types</option>
                  <option value="Received">Received</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Consumed">Consumed</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Audit Table -->
          <div class="card card-custom border-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small text-uppercase">
                  <tr>
                    <th>Ref ID</th>
                    <th>Date</th>
                    <th>Material</th>
                    <th>Project</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Performed By</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let m of filteredMovements()">
                    <td><span class="badge bg-dark-subtle text-dark font-monospace">{{ m.referenceId || 'LOG-' + m.id.substring(0,6) }}</span></td>
                    <td>{{ m.movementDate }}</td>
                    <td class="fw-bold text-dark">
                      {{ m.materialName }}
                      <span class="badge bg-light text-muted font-monospace d-block text-start mt-1" style="width:fit-content">{{ m.categoryName }}</span>
                    </td>
                    <td>{{ m.projectName || 'N/A (Store/Warehouse)' }}</td>
                    <td>
                      <span class="badge rounded-pill" [ngClass]="getMovementBadgeClass(m.movementType)">{{ m.movementType }}</span>
                    </td>
                    <td class="fw-bold font-monospace" [ngClass]="getQuantityColor(m.movementType)">
                      {{ getQuantityPrefix(m.movementType) }}{{ m.quantity | number:'1.0-2' }} {{ m.unit }}
                    </td>
                    <td>{{ m.userName }}</td>
                    <td class="text-muted">{{ m.remarks || 'N/A' }}</td>
                  </tr>
                  <tr *ngIf="filteredMovements().length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">
                      <i class="bi bi-clock-history fs-2 d-block mb-1 opacity-50"></i>No stock movement audit records found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class StockMovementsComponent implements OnInit {
  movements = signal<StockMovement[]>([]);
  projects = signal<Project[]>([]);

  selectedProjectFilter = '';
  selectedTypeFilter = '';

  constructor(
    private materialService: MaterialService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadMovements();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projs) => this.projects.set(projs)
    });
  }

  loadMovements(): void {
    this.materialService.getStockMovements(undefined, this.selectedProjectFilter).subscribe({
      next: (movs) => this.movements.set(movs)
    });
  }

  filteredMovements(): StockMovement[] {
    return this.movements().filter(m => !this.selectedTypeFilter || m.movementType === this.selectedTypeFilter);
  }

  getMovementBadgeClass(type: string): string {
    switch (type) {
      case 'Received': return 'bg-success text-white';
      case 'Allocated': return 'bg-primary text-white';
      case 'Consumed': return 'bg-info text-dark';
      case 'Returned': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  getQuantityColor(type: string): string {
    switch (type) {
      case 'Received': return 'text-success';
      case 'Allocated': return 'text-primary';
      case 'Consumed': return 'text-info';
      default: return 'text-dark';
    }
  }

  getQuantityPrefix(type: string): string {
    switch (type) {
      case 'Received': return '+';
      case 'Allocated': return '-';
      default: return '';
    }
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { environment } from '../../../../environments/environment';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  serialNo: string;
  location: string;
  operator: string;
  status: 'Operational' | 'Under Maintenance' | 'Out of Service' | 'Idle';
  lastInspection: string;
  nextService: string;
  fuelLevel?: number;
}

@Component({
  selector: 'app-equipment-status',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block"><app-sidebar></app-sidebar></div>
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">

          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <nav aria-label="breadcrumb"><ol class="breadcrumb small mb-1">
                <li class="breadcrumb-item"><a routerLink="/dashboard/site-engineer" class="text-decoration-none text-warning">Engineering Hub</a></li>
                <li class="breadcrumb-item active">Equipment Status</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-truck-front-fill me-2 text-warning"></i>Equipment Status</h2>
              <p class="text-muted small mb-0">Monitor all on-site machinery fetched directly from PostgreSQL database.</p>
            </div>
            <button class="btn btn-bt-accent shadow-sm"><i class="bi bi-plus-lg me-1"></i>Log Equipment</button>
          </div>

          <!-- Stats -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3" *ngFor="let s of equipmentStats">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="stat-icon-wrapper mx-auto mb-2" [ngClass]="s.bgClass">
                  <i class="bi" [ngClass]="s.icon"></i>
                </div>
                <div class="fw-bold fs-5" [ngClass]="s.colorClass">{{ s.count }}</div>
                <div class="small text-muted">{{ s.label }}</div>
              </div>
            </div>
          </div>

          <!-- Filter -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="d-flex gap-2 align-items-center flex-wrap">
              <input type="text" class="form-control form-control-sm" style="max-width:220px" placeholder="Search equipment..." [(ngModel)]="searchTerm">
              <select class="form-select form-select-sm" style="max-width:160px" [(ngModel)]="statusFilter">
                <option value="">All Statuses</option>
                <option value="Operational">Operational</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Service">Out of Service</option>
                <option value="Idle">Idle</option>
              </select>
              <select class="form-select form-select-sm" style="max-width:160px" [(ngModel)]="typeFilter">
                <option value="">All Types</option>
                <option value="Heavy Machinery">Heavy Machinery</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Power Tool">Power Tool</option>
                <option value="Lifting Equipment">Lifting Equipment</option>
              </select>
            </div>
          </div>

          <!-- Equipment Cards -->
          <div class="row g-3">
            <div class="col-lg-6 col-xl-4" *ngFor="let eq of filteredEquipment()">
              <div class="card card-custom border-0 p-4 h-100">
                <div class="d-flex align-items-start justify-content-between mb-3">
                  <div>
                    <h6 class="fw-bold mb-1 text-dark">{{ eq.name }}</h6>
                    <span class="badge bg-light text-dark font-monospace small">{{ eq.serialNo }}</span>
                  </div>
                  <span class="badge rounded-pill" [ngClass]="getStatusBadge(eq.status)">{{ eq.status }}</span>
                </div>
                <div class="row g-2 small text-muted mb-3">
                  <div class="col-6"><i class="bi bi-tag me-1"></i> {{ eq.type }}</div>
                  <div class="col-6"><i class="bi bi-geo-alt me-1"></i> {{ eq.location }}</div>
                  <div class="col-6"><i class="bi bi-person me-1"></i> {{ eq.operator }}</div>
                  <div class="col-6"><i class="bi bi-calendar-check me-1"></i> {{ eq.lastInspection }}</div>
                </div>
                <div *ngIf="eq.fuelLevel !== undefined && eq.fuelLevel !== null" class="mb-3">
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-muted">Fuel Level</span>
                    <span class="fw-semibold" [ngClass]="eq.fuelLevel! < 25 ? 'text-danger' : 'text-success'">{{ eq.fuelLevel }}%</span>
                  </div>
                  <div class="progress" style="height:6px">
                    <div class="progress-bar" [ngClass]="eq.fuelLevel! < 25 ? 'bg-danger' : 'bg-success'" [style.width]="eq.fuelLevel + '%'"></div>
                  </div>
                </div>
                <div class="d-flex gap-2 mt-auto pt-2 border-top">
                  <button class="btn btn-sm btn-outline-secondary flex-fill">Inspect</button>
                  <button class="btn btn-sm btn-outline-warning flex-fill">Service</button>
                </div>
              </div>
            </div>
            <div class="col-12" *ngIf="filteredEquipment().length === 0">
              <div class="text-center py-5 text-muted">
                <i class="bi bi-truck fs-1 d-block mb-2 opacity-50"></i>No equipment matching filters in database.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class EquipmentStatusComponent implements OnInit {
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';

  equipment = signal<Equipment[]>([]);

  equipmentStats = [
    { label: 'Operational', count: 0, icon: 'bi-check-circle-fill', bgClass: 'bg-success-subtle text-success', colorClass: 'text-success' },
    { label: 'Maintenance', count: 0, icon: 'bi-wrench-adjustable', bgClass: 'bg-warning-subtle text-warning', colorClass: 'text-warning' },
    { label: 'Out of Service', count: 0, icon: 'bi-x-circle-fill', bgClass: 'bg-danger-subtle text-danger', colorClass: 'text-danger' },
    { label: 'Idle', count: 0, icon: 'bi-pause-circle-fill', bgClass: 'bg-secondary-subtle text-secondary', colorClass: 'text-secondary' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Equipment[]>(`${environment.apiUrl}/equipment`).subscribe({
      next: (data) => {
        this.equipment.set(data);
        this.computeStats();
      },
      error: () => {}
    });
  }

  computeStats(): void {
    const eq = this.equipment();
    this.equipmentStats[0].count = eq.filter(e => e.status === 'Operational').length;
    this.equipmentStats[1].count = eq.filter(e => e.status === 'Under Maintenance').length;
    this.equipmentStats[2].count = eq.filter(e => e.status === 'Out of Service').length;
    this.equipmentStats[3].count = eq.filter(e => e.status === 'Idle').length;
  }

  filteredEquipment() {
    return this.equipment().filter(e =>
      (!this.searchTerm || e.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || e.serialNo.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.statusFilter || e.status === this.statusFilter) &&
      (!this.typeFilter || e.type === this.typeFilter)
    );
  }

  getStatusBadge(status: string): string {
    return { 'Operational': 'bg-success', 'Under Maintenance': 'bg-warning text-dark', 'Out of Service': 'bg-danger', 'Idle': 'bg-secondary' }[status] || 'bg-secondary';
  }
}

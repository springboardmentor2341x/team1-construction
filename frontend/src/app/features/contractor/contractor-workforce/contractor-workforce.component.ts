import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';

export interface Worker {
  id: string;
  name: string;
  trade: string;
  employeeId: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  assignedProject: string;
  attendanceRate: number;
  tasksCompleted: number;
}

@Component({
  selector: 'app-contractor-workforce',
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
                <li class="breadcrumb-item"><a routerLink="/dashboard/contractor" class="text-decoration-none text-warning">Contractor Hub</a></li>
                <li class="breadcrumb-item active">Contractor Workforce</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-person-badge-fill me-2 text-warning"></i>Contractor Workforce</h2>
              <p class="text-muted small mb-0">Manage your crew members, assignments, and performance.</p>
            </div>
            <button class="btn btn-bt-accent shadow-sm"><i class="bi bi-person-plus me-1"></i>Add Worker</button>
          </div>

          <!-- Stats Row -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-dark">{{ workers().length }}</div>
                <div class="small text-muted">Total Workers</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-success">{{ activeCount() }}</div>
                <div class="small text-muted">Active</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-warning">{{ leaveCount() }}</div>
                <div class="small text-muted">On Leave</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-info">{{ avgAttendance() }}%</div>
                <div class="small text-muted">Avg. Attendance</div>
              </div>
            </div>
          </div>

          <!-- Filter Bar -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="d-flex gap-2 flex-wrap align-items-center">
              <input type="text" class="form-control form-control-sm" style="max-width:220px" placeholder="Search by name or trade..." [(ngModel)]="searchTerm">
              <select class="form-select form-select-sm" style="max-width:150px" [(ngModel)]="statusFilter">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
              <button class="btn btn-sm btn-outline-secondary" (click)="searchTerm=''; statusFilter=''">Reset</button>
            </div>
          </div>

          <!-- Workers Table -->
          <div class="card card-custom border-0 p-4">
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr>
                    <th>#</th>
                    <th>Worker</th>
                    <th>Trade</th>
                    <th>Employee ID</th>
                    <th>Assigned Project</th>
                    <th>Attendance</th>
                    <th>Tasks Done</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let w of filteredWorkers(); let i = index">
                    <td class="text-muted">{{ i + 1 }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="rounded-circle bg-warning text-white fw-bold d-flex align-items-center justify-content-center" style="width:32px;height:32px;font-size:0.72rem">{{ getInitials(w.name) }}</div>
                        <div>
                          <div class="fw-semibold">{{ w.name }}</div>
                          <div class="text-muted" style="font-size:0.72rem">{{ w.phone }}</div>
                        </div>
                      </div>
                    </td>
                    <td>{{ w.trade }}</td>
                    <td><span class="badge bg-light text-dark font-monospace">{{ w.employeeId }}</span></td>
                    <td class="small text-muted">{{ w.assignedProject }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress" style="width:60px;height:6px">
                          <div class="progress-bar" [ngClass]="w.attendanceRate >= 90 ? 'bg-success' : w.attendanceRate >= 75 ? 'bg-warning' : 'bg-danger'" [style.width]="w.attendanceRate + '%'"></div>
                        </div>
                        <span>{{ w.attendanceRate }}%</span>
                      </div>
                    </td>
                    <td class="text-center"><span class="badge bg-primary rounded-pill">{{ w.tasksCompleted }}</span></td>
                    <td>
                      <span class="badge" [ngClass]="w.status === 'Active' ? 'bg-success' : w.status === 'On Leave' ? 'bg-warning text-dark' : 'bg-secondary'">{{ w.status }}</span>
                    </td>
                    <td class="text-end">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" title="View Profile"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-outline-warning" title="Assign Task"><i class="bi bi-card-checklist"></i></button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredWorkers().length === 0">
                    <td colspan="9" class="text-center py-4 text-muted"><i class="bi bi-people d-block fs-2 mb-2 opacity-50"></i>No workers found.</td>
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
export class ContractorWorkforceComponent {
  searchTerm = '';
  statusFilter = '';

  workers = signal<Worker[]>([
    { id: 'w-1', name: 'Robert Thorne', trade: 'Masonry & Concrete', employeeId: 'WRK-5099', phone: '+1 555-0156', status: 'Active', assignedProject: 'Skyline Metropolis Tower', attendanceRate: 97, tasksCompleted: 14 },
    { id: 'w-2', name: 'Carlos Mendez', trade: 'Waterproofing & Sealing', employeeId: 'WRK-5100', phone: '+1 555-0212', status: 'Active', assignedProject: 'Skyline Metropolis Tower', attendanceRate: 91, tasksCompleted: 9 },
    { id: 'w-3', name: 'Ahmed Khan', trade: 'Steel & Rebar Fabrication', employeeId: 'WRK-5101', phone: '+1 555-0340', status: 'Active', assignedProject: 'Harbor Bridge Expansion', attendanceRate: 88, tasksCompleted: 11 },
    { id: 'w-4', name: 'Priya Nair', trade: 'Site Cleanup & Logistics', employeeId: 'WRK-5102', phone: '+1 555-0285', status: 'On Leave', assignedProject: 'Skyline Metropolis Tower', attendanceRate: 82, tasksCompleted: 7 },
    { id: 'w-5', name: 'Ivan Petrov', trade: 'Scaffolding & Formwork', employeeId: 'WRK-5103', phone: '+1 555-0317', status: 'Active', assignedProject: 'Harbor Bridge Expansion', attendanceRate: 95, tasksCompleted: 16 },
    { id: 'w-6', name: 'Amir Hassan', trade: 'Plumbing & MEP Support', employeeId: 'WRK-5104', phone: '+1 555-0456', status: 'Inactive', assignedProject: '—', attendanceRate: 65, tasksCompleted: 3 }
  ]);

  filteredWorkers() {
    return this.workers().filter(w =>
      (!this.searchTerm || w.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || w.trade.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.statusFilter || w.status === this.statusFilter)
    );
  }

  activeCount = () => this.workers().filter(w => w.status === 'Active').length;
  leaveCount = () => this.workers().filter(w => w.status === 'On Leave').length;
  avgAttendance = () => Math.round(this.workers().reduce((acc, w) => acc + w.attendanceRate, 0) / this.workers().length);
  getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

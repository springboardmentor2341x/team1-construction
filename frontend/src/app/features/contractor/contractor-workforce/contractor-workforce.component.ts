import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ContractorService, ContractorWorker } from '../../../core/services/contractor.service';
import { UserRead } from '../../../core/models/user.model';

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

          <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <nav aria-label="breadcrumb"><ol class="breadcrumb small mb-1">
                <li class="breadcrumb-item"><a routerLink="/dashboard/contractor" class="text-decoration-none text-warning">Contractor Hub</a></li>
                <li class="breadcrumb-item active">Contractor Workforce</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-person-badge-fill me-2 text-warning"></i>Contractor Workforce Management</h2>
              <p class="text-muted small mb-0">Assign, manage, and monitor field labor workers assigned to contractors.</p>
            </div>
          </div>

          <!-- Messages -->
          <div *ngIf="error" class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
            <button type="button" class="btn-close" (click)="error = ''"></button>
          </div>
          <div *ngIf="success" class="alert alert-success alert-dismissible fade show mb-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{{ success }}
            <button type="button" class="btn-close" (click)="success = ''"></button>
          </div>

          <!-- Contractor Selection (For Admin/PM) or Display -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-5">
                <label class="form-label small fw-bold text-muted mb-1">Active Contractor</label>
                <select class="form-select" [(ngModel)]="selectedContractorId" (change)="loadAssignedWorkers()" [disabled]="isContractorUser">
                  <option value="">-- Select Contractor --</option>
                  <option *ngFor="let c of contractors" [value]="c.id">{{ c.fullName }} ({{ c.email }})</option>
                </select>
              </div>
              <div class="col-md-7" *ngIf="selectedContractorId">
                <label class="form-label small fw-bold text-muted mb-1">Assign New Worker</label>
                <div class="input-group">
                  <select class="form-select" [(ngModel)]="selectedWorkerIdToAssign">
                    <option value="">-- Choose unassigned worker --</option>
                    <option *ngFor="let w of availableWorkers" [value]="w.id">{{ w.fullName }} ({{ w.department || 'General' }} - {{ w.employeeId || w.email }})</option>
                  </select>
                  <button class="btn btn-warning fw-semibold px-3" (click)="assignWorker()" [disabled]="!selectedWorkerIdToAssign">
                    <i class="bi bi-person-plus-fill me-1"></i>Assign Worker
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-4">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-dark">{{ assignedWorkers().length }}</div>
                <div class="small text-muted">Assigned Crew Members</div>
              </div>
            </div>
            <div class="col-6 col-md-4">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-success">{{ activeCount() }}</div>
                <div class="small text-muted">Active Field Workers</div>
              </div>
            </div>
            <div class="col-6 col-md-4">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4 text-info">{{ availableWorkers.length }}</div>
                <div class="small text-muted">Available Workers</div>
              </div>
            </div>
          </div>

          <!-- Search Filter Bar -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="d-flex gap-2 flex-wrap align-items-center">
              <div class="input-group input-group-sm" style="max-width:280px">
                <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Search worker by name or trade..." [(ngModel)]="searchTerm">
              </div>
              <button class="btn btn-sm btn-outline-secondary" (click)="searchTerm=''">Reset Filter</button>
            </div>
          </div>

          <!-- Workers Table -->
          <div class="card card-custom border-0 p-4">
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr>
                    <th>#</th>
                    <th>Worker Name</th>
                    <th>Trade / Specialization</th>
                    <th>Employee ID</th>
                    <th>Email</th>
                    <th>Assigned At</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let w of filteredWorkers(); let i = index">
                    <td class="text-muted">{{ i + 1 }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="rounded-circle bg-warning text-white fw-bold d-flex align-items-center justify-content-center" style="width:32px;height:32px;font-size:0.72rem">
                          {{ getInitials(w.workerName) }}
                        </div>
                        <div class="fw-semibold text-dark">{{ w.workerName }}</div>
                      </div>
                    </td>
                    <td><span class="badge bg-light text-dark border">{{ w.trade || 'General Labor' }}</span></td>
                    <td><span class="badge bg-secondary font-monospace">{{ w.employeeId || w.workerId.slice(0, 8) }}</span></td>
                    <td class="text-muted">{{ w.workerEmail }}</td>
                    <td class="small text-muted">{{ w.assignedAt | date:'mediumDate' }}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger" title="Remove Worker" (click)="removeWorker(w)">
                        <i class="bi bi-person-x-fill me-1"></i>Remove
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredWorkers().length === 0">
                    <td colspan="7" class="text-center py-4 text-muted">
                      <i class="bi bi-people d-block fs-2 mb-2 opacity-50"></i>
                      {{ selectedContractorId ? 'No workers assigned to this contractor.' : 'Select a contractor above to view assigned workforce.' }}
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
export class ContractorWorkforceComponent implements OnInit {
  searchTerm = '';
  selectedContractorId = '';
  selectedWorkerIdToAssign = '';
  isContractorUser = false;

  contractors: UserRead[] = [];
  allWorkers: UserRead[] = [];
  availableWorkers: UserRead[] = [];
  assignedWorkers = signal<ContractorWorker[]>([]);

  error = '';
  success = '';

  constructor(
    private userService: UserService,
    private contractorService: ContractorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userRole = this.authService.getRole();
    const currentUser = this.authService.currentUser();

    if (userRole === 'Contractor' && currentUser) {
      this.isContractorUser = true;
      this.selectedContractorId = currentUser.id;
    }

    // Load contractors & workers
    this.userService.getUsers('Contractor').subscribe({
      next: (list) => {
        this.contractors = list;
        if (!this.selectedContractorId && list.length > 0) {
          this.selectedContractorId = list[0].id;
        }
        if (this.selectedContractorId) {
          this.loadAssignedWorkers();
        }
      },
      error: () => this.error = 'Failed to load contractors list.'
    });

    this.userService.getUsers('Worker').subscribe({
      next: (list) => {
        this.allWorkers = list;
        this.updateAvailableWorkers();
      }
    });
  }

  loadAssignedWorkers(): void {
    if (!this.selectedContractorId) {
      this.assignedWorkers.set([]);
      this.updateAvailableWorkers();
      return;
    }

    this.contractorService.getAssignedWorkers(this.selectedContractorId).subscribe({
      next: (data) => {
        this.assignedWorkers.set(data);
        this.updateAvailableWorkers();
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to fetch assigned workers.';
        this.assignedWorkers.set([]);
      }
    });
  }

  updateAvailableWorkers(): void {
    const assignedIds = new Set(this.assignedWorkers().map(w => w.workerId));
    this.availableWorkers = this.allWorkers.filter(w => !assignedIds.has(w.id));
  }

  assignWorker(): void {
    if (!this.selectedContractorId || !this.selectedWorkerIdToAssign) return;

    this.error = '';
    this.success = '';
    this.contractorService.assignWorker(this.selectedContractorId, this.selectedWorkerIdToAssign).subscribe({
      next: (created) => {
        this.success = `Worker ${created.workerName} successfully assigned to contractor.`;
        this.selectedWorkerIdToAssign = '';
        this.loadAssignedWorkers();
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to assign worker.';
      }
    });
  }

  removeWorker(w: ContractorWorker): void {
    if (!confirm(`Are you sure you want to remove ${w.workerName} from this contractor?`)) return;

    this.error = '';
    this.success = '';
    this.contractorService.removeWorker(w.contractorId, w.workerId).subscribe({
      next: () => {
        this.success = `Worker ${w.workerName} removed successfully.`;
        this.loadAssignedWorkers();
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to remove worker.';
      }
    });
  }

  filteredWorkers(): ContractorWorker[] {
    return this.assignedWorkers().filter(w =>
      !this.searchTerm ||
      w.workerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (w.trade && w.trade.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  activeCount = () => this.assignedWorkers().length;
  getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'WK';
}

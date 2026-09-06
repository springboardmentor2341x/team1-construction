import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { UserService } from '../../../core/services/user.service';
import { UserRead } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
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
                  <li class="breadcrumb-item"><a routerLink="/dashboard/admin" class="text-decoration-none text-warning">Dashboard</a></li>
                  <li class="breadcrumb-item active">User Management</li>
                </ol>
              </nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-people-fill me-2 text-warning"></i>User Management</h2>
              <p class="text-muted small mb-0">Manage all system users, roles, and access levels.</p>
            </div>
            <button class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm" (click)="openInviteModal()">
              <i class="bi bi-person-plus-fill"></i> Invite User
            </button>
          </div>

          <!-- Filters -->
          <div class="card card-custom border-0 p-3 mb-4">
            <form [formGroup]="filterForm" class="row g-2 align-items-end">
              <div class="col-md-4">
                <label class="form-label small fw-semibold text-muted">Search User</label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" class="form-control" placeholder="Name, email or Employee ID..." formControlName="search">
                </div>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold text-muted">Filter by Role</label>
                <select class="form-select form-select-sm" formControlName="role" (change)="loadUsers()">
                  <option value="">All Roles</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Site Engineer">Site Engineer</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Worker">Worker</option>
                  <option value="Client">Client</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small fw-semibold text-muted">Status</label>
                <select class="form-select form-select-sm" formControlName="status">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div class="col-md-2">
                <button class="btn btn-sm btn-outline-secondary w-100" type="button" (click)="resetFilters()">Reset</button>
              </div>
            </form>
          </div>

          <!-- Stats Row -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-2" *ngFor="let stat of roleStats">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-5 text-dark">{{ stat.count }}</div>
                <div class="small text-muted">{{ stat.role }}</div>
              </div>
            </div>
          </div>

          <!-- Users Table -->
          <div class="card card-custom border-0 p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0"><i class="bi bi-table me-1 text-warning"></i> User Registry <span class="badge bg-secondary ms-1">{{ filteredUsers().length }}</span></h6>
              <button class="btn btn-sm btn-outline-success" (click)="exportCSV()"><i class="bi bi-download me-1"></i>Export CSV</button>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading()" class="text-center py-5">
              <div class="spinner-border text-warning" role="status"></div>
              <p class="mt-2 text-muted small">Loading users...</p>
            </div>

            <!-- Error State -->
            <div *ngIf="error() && !loading()" class="alert alert-warning d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>{{ error() }}</span>
              <button class="btn btn-sm btn-warning ms-auto" (click)="loadUsers()">Retry</button>
            </div>

            <!-- Table -->
            <div class="table-responsive" *ngIf="!loading() && !error()">
              <table class="table table-hover align-middle small">
                <thead class="table-light text-muted">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of filteredUsers(); let i = index">
                    <td class="text-muted">{{ i + 1 }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="avatar-sm rounded-circle bg-warning text-white fw-bold d-flex align-items-center justify-content-center" style="width:32px;height:32px;font-size:0.75rem;">
                          {{ getInitials(user.fullName) }}
                        </div>
                        <span class="fw-semibold">{{ user.fullName }}</span>
                      </div>
                    </td>
                    <td>{{ user.email }}</td>
                    <td><span class="badge bg-light text-dark font-monospace">{{ user.employeeId || '—' }}</span></td>
                    <td>{{ user.department || '—' }}</td>
                    <td>
                      <span class="badge rounded-pill" [ngClass]="getRoleBadgeClass(user.role)">{{ user.role }}</span>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="user.isActive ? 'bg-success' : 'bg-danger'">
                        {{ user.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-warning" title="Toggle Status" (click)="toggleUserStatus(user)">
                          <i class="bi" [ngClass]="user.isActive ? 'bi-lock' : 'bi-unlock'"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredUsers().length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">
                      <i class="bi bi-inbox fs-3 d-block mb-2"></i>No users found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Invite User Modal -->
          <div *ngIf="showInviteModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-dark text-white">
                  <h5 class="modal-title fw-bold"><i class="bi bi-person-plus-fill me-2 text-warning"></i>Invite New User</h5>
                  <button type="button" class="btn-close btn-close-white" (click)="closeInviteModal()"></button>
                </div>
                <div class="modal-body p-4">
                  <div *ngIf="inviteError" class="alert alert-danger d-flex align-items-center gap-2 mb-3">
                    <i class="bi bi-exclamation-octagon-fill"></i>
                    <span>{{ inviteError }}</span>
                  </div>
                  <div *ngIf="inviteSuccess" class="alert alert-success d-flex align-items-center gap-2 mb-3">
                    <i class="bi bi-check-circle-fill"></i>
                    <span>{{ inviteSuccess }}</span>
                  </div>

                  <form [formGroup]="inviteForm" (ngSubmit)="submitInvite()">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Full Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" formControlName="fullName" placeholder="e.g. Sarah Jenkins">
                        <div *ngIf="inviteForm.get('fullName')?.touched && inviteForm.get('fullName')?.invalid" class="text-danger extra-small mt-1">
                          Full name is required.
                        </div>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Email Address <span class="text-danger">*</span></label>
                        <input type="email" class="form-control" formControlName="email" placeholder="e.g. sarah.j@buildtrack.com">
                        <div *ngIf="inviteForm.get('email')?.touched && inviteForm.get('email')?.invalid" class="text-danger extra-small mt-1">
                          Valid email address is required.
                        </div>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Role <span class="text-danger">*</span></label>
                        <select class="form-select" formControlName="role">
                          <option value="Administrator">Administrator</option>
                          <option value="Project Manager">Project Manager</option>
                          <option value="Site Engineer">Site Engineer</option>
                          <option value="Contractor">Contractor</option>
                          <option value="Worker">Worker</option>
                          <option value="Client">Client</option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Temporary Password <span class="text-danger">*</span></label>
                        <input type="password" class="form-control" formControlName="password" placeholder="Min 8 characters">
                        <div *ngIf="inviteForm.get('password')?.touched && inviteForm.get('password')?.invalid" class="text-danger extra-small mt-1">
                          Password must be at least 8 characters.
                        </div>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Employee ID</label>
                        <input type="text" class="form-control" formControlName="employeeId" placeholder="e.g. EMP-2026-08">
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Department</label>
                        <select class="form-select" formControlName="department">
                          <option value="Project Management">Project Management</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Procurement">Procurement</option>
                          <option value="Workforce">Workforce</option>
                          <option value="Client Operations">Client Operations</option>
                          <option value="Executive Management">Executive Management</option>
                        </select>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label small fw-bold">Designation</label>
                        <input type="text" class="form-control" formControlName="designation" placeholder="e.g. Lead PM">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Mobile Number</label>
                        <input type="text" class="form-control" formControlName="mobileNumber" placeholder="e.g. +1 555-0199">
                      </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="closeInviteModal()">Cancel</button>
                      <button type="submit" class="btn btn-bt-accent px-4" [disabled]="inviteSubmitting">
                        <span *ngIf="inviteSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                        Send Invitation
                      </button>
                    </div>
                  </form>
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
export class UserManagementComponent implements OnInit {
  filterForm: FormGroup;
  inviteForm: FormGroup;
  users = signal<UserRead[]>([]);
  loading = signal(true);
  error = signal('');

  showInviteModal = false;
  inviteSubmitting = false;
  inviteError = '';
  inviteSuccess = '';

  roleStats = [
    { role: 'Admins', count: 0 },
    { role: 'PMs', count: 0 },
    { role: 'Engineers', count: 0 },
    { role: 'Contractors', count: 0 },
    { role: 'Workers', count: 0 },
    { role: 'Clients', count: 0 }
  ];

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.filterForm = this.fb.group({ search: [''], role: [''], status: [''] });
    this.inviteForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['BuildTrack@2026', [Validators.required, Validators.minLength(8)]],
      role: ['Project Manager', Validators.required],
      employeeId: [''],
      department: ['Project Management'],
      designation: [''],
      mobileNumber: ['']
    });
  }

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set('');
    const role = this.filterForm.get('role')?.value || undefined;
    this.userService.getUsers(role).subscribe({
      next: (data) => {
        this.users.set(data);
        this.updateStats(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load users. Backend may not be running.');
        this.loading.set(false);
      }
    });
  }

  filteredUsers() {
    const search = this.filterForm.get('search')?.value?.toLowerCase() || '';
    const status = this.filterForm.get('status')?.value;
    return this.users().filter(u => {
      const matchSearch = !search || u.fullName.toLowerCase().includes(search) || u.email.toLowerCase().includes(search) || (u.employeeId || '').toLowerCase().includes(search);
      const matchStatus = !status || (status === 'active' ? u.isActive : !u.isActive);
      return matchSearch && matchStatus;
    });
  }

  updateStats(users: UserRead[]): void {
    this.roleStats[0].count = users.filter(u => u.role === 'Administrator').length;
    this.roleStats[1].count = users.filter(u => u.role === 'Project Manager').length;
    this.roleStats[2].count = users.filter(u => u.role === 'Site Engineer').length;
    this.roleStats[3].count = users.filter(u => u.role === 'Contractor').length;
    this.roleStats[4].count = users.filter(u => u.role === 'Worker').length;
    this.roleStats[5].count = users.filter(u => u.role === 'Client').length;
  }

  toggleUserStatus(user: UserRead): void {
    this.userService.toggleUserStatus(user.id, !user.isActive).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Failed to toggle status', err)
    });
  }

  openInviteModal(): void {
    this.inviteError = '';
    this.inviteSuccess = '';
    this.showInviteModal = true;
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
    this.inviteError = '';
    this.inviteSuccess = '';
    this.inviteForm.reset({
      fullName: '',
      email: '',
      password: 'BuildTrack@2026',
      role: 'Project Manager',
      employeeId: '',
      department: 'Project Management',
      designation: '',
      mobileNumber: ''
    });
  }

  submitInvite(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    this.inviteSubmitting = true;
    this.inviteError = '';
    this.inviteSuccess = '';

    this.userService.createUser(this.inviteForm.value).subscribe({
      next: () => {
        this.inviteSubmitting = false;
        this.inviteSuccess = 'User account created and invited successfully!';
        this.loadUsers();
        setTimeout(() => {
          this.closeInviteModal();
        }, 1200);
      },
      error: (err) => {
        this.inviteSubmitting = false;
        const msg = err?.error?.detail || 'Failed to create user invitation.';
        this.inviteError = typeof msg === 'string' ? msg : JSON.stringify(msg);
      }
    });
  }

  exportCSV(): void {
    const list = this.filteredUsers();
    if (!list || list.length === 0) {
      alert('No user data available to export.');
      return;
    }

    const headers = ['Full Name', 'Email', 'Employee ID', 'Department', 'Designation', 'Role', 'Mobile', 'Status'];
    const rows = list.map(u => [
      `"${(u.fullName || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.employeeId || '').replace(/"/g, '""')}"`,
      `"${(u.department || '').replace(/"/g, '""')}"`,
      `"${(u.designation || '').replace(/"/g, '""')}"`,
      `"${(u.role || '').replace(/"/g, '""')}"`,
      `"${(u.mobileNumber || '').replace(/"/g, '""')}"`,
      `"${u.isActive ? 'Active' : 'Inactive'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `buildtrack_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  resetFilters(): void { this.filterForm.reset({ search: '', role: '', status: '' }); }

  getInitials(name: string): string {
    return (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      'Administrator': 'bg-danger', 'Project Manager': 'bg-primary',
      'Site Engineer': 'bg-info text-dark', 'Contractor': 'bg-warning text-dark',
      'Worker': 'bg-secondary', 'Client': 'bg-success'
    };
    return map[role] || 'bg-secondary';
  }
}


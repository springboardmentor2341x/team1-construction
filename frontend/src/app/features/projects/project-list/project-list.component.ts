import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models/project.model';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent, StatusBadgeComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <!-- Page Header -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-1">Project Directory</h2>
              <p class="text-muted small mb-0">Overview of all active, scheduled, and completed construction projects.</p>
            </div>
            <!-- Create Project Button (Only Administrator) -->
            <a *ngIf="authService.getRole() === UserRole.ADMINISTRATOR" routerLink="/projects/create" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-plus-circle-fill"></i> Create New Project
            </a>
          </div>

          <!-- Search & Filters Toolbar -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-3 align-items-center">
              <!-- Search -->
              <div class="col-md-4">
                <div class="input-group">
                  <span class="input-group-text bg-white text-muted border-end-0"><i class="bi bi-search"></i></span>
                  <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilter()" class="form-control border-start-0 ps-0" placeholder="Search by Project Name, Code, Client...">
                </div>
              </div>

              <!-- Category Filter -->
              <div class="col-md-3 col-6">
                <select [(ngModel)]="selectedCategory" (ngModelChange)="applyFilter()" class="form-select">
                  <option value="">All Categories</option>
                  <option value="Commercial High-Rise">Commercial High-Rise</option>
                  <option value="Infrastructure & Transit">Infrastructure & Transit</option>
                  <option value="Residential Complex">Residential Complex</option>
                  <option value="Healthcare Facility">Healthcare Facility</option>
                </select>
              </div>

              <!-- Priority Filter -->
              <div class="col-md-2 col-6">
                <select [(ngModel)]="selectedPriority" (ngModelChange)="applyFilter()" class="form-select">
                  <option value="">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <!-- Status Filter -->
              <div class="col-md-3 col-12">
                <select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilter()" class="form-select">
                  <option value="">All Statuses</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Projects Table View -->
          <div class="card card-custom border-0 p-4">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light small text-muted">
                  <tr>
                    <th>Project Name & Code</th>
                    <th>Category</th>
                    <th>Client</th>
                    <th>Project Manager</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Timeline</th>
                    <th>Est. Budget</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr *ngFor="let p of filteredProjects">
                    <td>
                      <div class="fw-bold text-dark">
                        <a [routerLink]="['/projects', p.id]" class="text-dark text-decoration-none hover-warning">
                          {{ p.projectName }}
                        </a>
                      </div>
                      <span class="badge bg-light text-dark font-monospace extra-small">{{ p.projectCode }}</span>
                    </td>
                    <td>{{ p.category }}</td>
                    <td>{{ p.clientName }}</td>
                    <td><i class="bi bi-person-circle me-1 text-secondary"></i> {{ p.projectManagerName }}</td>
                    <td>
                      <span [ngClass]="getPriorityBadgeClass(p.priority)" class="badge px-2 py-1">{{ p.priority }}</span>
                    </td>
                    <td><app-status-badge [status]="p.status"></app-status-badge></td>
                    <td class="extra-small">
                      <div><i class="bi bi-calendar-event text-success me-1"></i> Start: {{ p.startDate }}</div>
                      <div><i class="bi bi-calendar-check text-muted me-1"></i> Due: {{ p.expectedCompletionDate }}</div>
                    </td>
                    <td class="fw-bold text-dark">₹{{ p.estimatedBudget | number }}</td>
                    <td class="text-end">
                      <div class="btn-group">
                        <a [routerLink]="['/projects', p.id]" class="btn btn-sm btn-outline-secondary" title="View Details">
                          <i class="bi bi-eye"></i>
                        </a>
                        <a *ngIf="canEdit(p)" [routerLink]="['/projects/update', p.id]" class="btn btn-sm btn-outline-warning" title="Edit Project">
                          <i class="bi bi-pencil"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredProjects.length === 0 && !loadError">
                    <td colspan="9" class="text-center py-5 text-muted">
                      <i class="bi bi-search fs-1 d-block mb-2 text-secondary"></i>
                      No projects matched your search criteria.
                    </td>
                  </tr>
                  <tr *ngIf="loadError">
                    <td colspan="9" class="text-center py-5 text-danger">
                      <i class="bi bi-exclamation-circle fs-1 d-block mb-2"></i>
                      {{ loadError }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.76rem; }
    .badge-urgent { background-color: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; }
    .badge-high { background-color: #FFEDD5; color: #C2410C; border: 1px solid #FDBA74; }
    .badge-medium { background-color: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
    .badge-low { background-color: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; }
  `]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loadError = '';

  searchTerm = '';
  selectedCategory = '';
  selectedPriority = '';
  selectedStatus = '';

  UserRole = UserRole;

  constructor(
    private projectService: ProjectService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.filteredProjects = data;
      },
      error: () => {
        this.loadError = 'Unable to load projects. The backend server is not running or is unreachable.';
        this.projects = [];
        this.filteredProjects = [];
      }
    });
  }

  applyFilter(): void {
    this.filteredProjects = this.projects.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.projectName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.projectCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchCategory = !this.selectedCategory || p.category === this.selectedCategory;
      const matchPriority = !this.selectedPriority || p.priority === this.selectedPriority;
      const matchStatus = !this.selectedStatus || p.status === this.selectedStatus;

      return matchSearch && matchCategory && matchPriority && matchStatus;
    });
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'Urgent': return 'badge-urgent';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return 'bg-secondary text-white';
    }
  }

  canEdit(project: Project): boolean {
    const role = this.authService.getRole();
    return role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project, ProjectAssignment, ProjectPersonnel, AuditLog } from '../../../core/models/project.model';
import { UserRead } from '../../../core/models/user.model';
import { UserRole } from '../../../core/models/role.enum';

@Component({
  selector: 'app-project-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent, StatusBadgeComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-1"><i class="bi bi-people-fill me-2 text-warning"></i>Project Assignments</h2>
              <p class="text-muted small mb-0">Manage engineers, contractors and clients assigned to each project.</p>
            </div>
          </div>

          <!-- Project selection -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row g-2 align-items-center">
              <div class="col-md-4">
                <label class="form-label small fw-bold text-muted mb-1">Select Project</label>
                <select class="form-select" [(ngModel)]="selectedProjectId" (change)="onProjectSelect()">
                  <option value="">-- Choose a project --</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
              <div class="col-md-8">
                <div class="text-muted small mt-4">
                  <span class="me-3"><i class="bi bi-person-gear text-secondary"></i> Manage access for site engineers, contractors and client representatives.</span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
            {{ error }}
            <button type="button" class="btn-close" (click)="error = ''"></button>
          </div>
          <div *ngIf="success" class="alert alert-success alert-dismissible fade show" role="alert">
            {{ success }}
            <button type="button" class="btn-close" (click)="success = ''"></button>
          </div>

          <ng-container *ngIf="selectedProject">
            <div class="row g-4">
              <!-- Engineer assignment -->
              <div class="col-lg-4">
                <div class="card card-custom border-0 h-100">
                  <div class="card-header bg-transparent d-flex align-items-center justify-content-between">
                    <h6 class="fw-bold text-dark mb-0"><i class="bi bi-person-gear me-2 text-primary"></i>Site Engineers</h6>
                    <span class="badge bg-primary">{{ selectedProject.assignedEngineers?.length || 0 }}</span>
                  </div>
                  <div class="card-body">
                    <div class="space-y-2 mb-3">
                      <div *ngFor="let eng of selectedProject.assignedEngineers || []" class="d-flex align-items-center justify-content-between p-2 border rounded-3 bg-light">
                        <div class="d-flex align-items-center">
                          <img [src]="eng.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40'" class="rounded-circle me-2" width="32" height="32">
                          <div>
                            <div class="small fw-bold text-dark">{{ eng.name }}</div>
                            <div class="extra-small text-muted">{{ eng.role }}</div>
                          </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger py-0 px-2" (click)="unassign('engineer', eng)"><i class="bi bi-x-lg"></i></button>
                      </div>
                      <div *ngIf="!selectedProject.assignedEngineers?.length" class="text-muted extra-small text-center py-3">No engineers assigned</div>
                    </div>
                    <div class="input-group input-group-sm">
                      <select class="form-select" [(ngModel)]="selectedEngineerId">
                        <option value="">-- Select engineer --</option>
                        <option *ngFor="let u of engineers" [value]="u.id">{{ u.fullName }}</option>
                      </select>
                      <button class="btn btn-bt-primary" (click)="assign('engineer')" [disabled]="!selectedEngineerId"><i class="bi bi-plus-lg"></i></button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contractor assignment -->
              <div class="col-lg-4">
                <div class="card card-custom border-0 h-100">
                  <div class="card-header bg-transparent d-flex align-items-center justify-content-between">
                    <h6 class="fw-bold text-dark mb-0"><i class="bi bi-hammer me-2 text-success"></i>Contractors</h6>
                    <span class="badge bg-success">{{ selectedProject.assignedContractors?.length || 0 }}</span>
                  </div>
                  <div class="card-body">
                    <div class="space-y-2 mb-3">
                      <div *ngFor="let con of selectedProject.assignedContractors || []" class="d-flex align-items-center justify-content-between p-2 border rounded-3 bg-light">
                        <div class="d-flex align-items-center">
                          <img [src]="con.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40'" class="rounded-circle me-2" width="32" height="32">
                          <div>
                            <div class="small fw-bold text-dark">{{ con.name }}</div>
                            <div class="extra-small text-muted">{{ con.role }}</div>
                          </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger py-0 px-2" (click)="unassign('contractor', con)"><i class="bi bi-x-lg"></i></button>
                      </div>
                      <div *ngIf="!selectedProject.assignedContractors?.length" class="text-muted extra-small text-center py-3">No contractors assigned</div>
                    </div>
                    <div class="input-group input-group-sm">
                      <select class="form-select" [(ngModel)]="selectedContractorId">
                        <option value="">-- Select contractor --</option>
                        <option *ngFor="let u of contractors" [value]="u.id">{{ u.fullName }}</option>
                      </select>
                      <button class="btn btn-bt-primary" (click)="assign('contractor')" [disabled]="!selectedContractorId"><i class="bi bi-plus-lg"></i></button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Client assignment -->
              <div class="col-lg-4">
                <div class="card card-custom border-0 h-100">
                  <div class="card-header bg-transparent d-flex align-items-center justify-content-between">
                    <h6 class="fw-bold text-dark mb-0"><i class="bi bi-building me-2 text-info"></i>Client Reps</h6>
                    <span class="badge bg-info text-dark">{{ selectedProject.assignedClients?.length || 0 }}</span>
                  </div>
                  <div class="card-body">
                    <div class="space-y-2 mb-3">
                      <div *ngFor="let cli of selectedProject.assignedClients || []" class="d-flex align-items-center justify-content-between p-2 border rounded-3 bg-light">
                        <div class="d-flex align-items-center">
                          <img [src]="cli.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40'" class="rounded-circle me-2" width="32" height="32">
                          <div>
                            <div class="small fw-bold text-dark">{{ cli.name }}</div>
                            <div class="extra-small text-muted">{{ cli.role }}</div>
                          </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger py-0 px-2" (click)="unassign('client', cli)"><i class="bi bi-x-lg"></i></button>
                      </div>
                      <div *ngIf="!selectedProject.assignedClients?.length" class="text-muted extra-small text-center py-3">No clients assigned</div>
                    </div>
                    <div class="input-group input-group-sm">
                      <select class="form-select" [(ngModel)]="selectedClientId">
                        <option value="">-- Select client --</option>
                        <option *ngFor="let u of clients" [value]="u.id">{{ u.fullName }}</option>
                      </select>
                      <button class="btn btn-bt-primary" (click)="assign('client')" [disabled]="!selectedClientId"><i class="bi bi-plus-lg"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Closure + Audit -->
            <div class="row g-4 mt-2">
              <div class="col-lg-5">
                <div class="card card-custom border-0 h-100">
                  <div class="card-header bg-transparent">
                    <h6 class="fw-bold text-dark mb-0"><i class="bi bi-lock-fill me-2 text-danger"></i>Project Closure</h6>
                  </div>
                  <div class="card-body">
                    <div class="d-flex align-items-center gap-2 mb-3">
                      <span class="text-muted small fw-bold">Current status:</span>
                      <app-status-badge [status]="selectedProject.status"></app-status-badge>
                    </div>
                    <div *ngIf="selectedProject.status !== 'Closed'">
                      <div class="input-group input-group-sm mb-2">
                        <input type="text" class="form-control" placeholder="Closure reason (optional)" [(ngModel)]="closeReason">
                        <button class="btn btn-danger" (click)="closeProject()"><i class="bi bi-lock me-1"></i>Close Project</button>
                      </div>
                    </div>
                    <div *ngIf="selectedProject.status === 'Closed'" class="alert alert-dark mb-0 small">
                      <i class="bi bi-check-circle me-1"></i> This project is closed.
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-7">
                <div class="card card-custom border-0">
                  <div class="card-header bg-transparent d-flex align-items-center justify-content-between">
                    <h6 class="fw-bold text-dark mb-0"><i class="bi bi-clock-history me-2 text-warning"></i>Audit History</h6>
                    <button class="btn btn-sm btn-outline-secondary" (click)="loadAudit()"><i class="bi bi-arrow-clockwise"></i></button>
                  </div>
                  <div class="card-body">
                    <div class="space-y-2" *ngIf="auditLogs.length">
                      <div *ngFor="let log of auditLogs" class="d-flex gap-3 p-2 border-bottom align-items-start">
                        <span class="badge bg-light text-dark border mt-1" style="min-width:150px">{{ log.action }}</span>
                        <div class="flex-grow-1">
                          <div class="small text-dark">{{ log.description || '—' }}</div>
                          <div class="extra-small text-muted">by {{ log.performedByName || 'System' }} · {{ log.timestamp | date:'medium' }}</div>
                        </div>
                      </div>
                    </div>
                    <div *ngIf="!auditLogs.length" class="text-muted extra-small text-center py-4">No audit records found.</div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <div *ngIf="!selectedProject" class="card card-custom border-0 p-5 text-center">
            <i class="bi bi-people display-4 text-muted"></i>
            <p class="text-muted mt-3 mb-0">Select a project to manage its personnel assignments.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-small { font-size: 0.78rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
  `]
})
export class ProjectAssignmentsComponent implements OnInit {
  projects: Project[] = [];
  selectedProject?: Project;
  selectedProjectId = '';
  engineers: UserRead[] = [];
  contractors: UserRead[] = [];
  clients: UserRead[] = [];
  selectedEngineerId = '';
  selectedContractorId = '';
  selectedClientId = '';
  closeReason = '';
  auditLogs: AuditLog[] = [];
  error = '';
  success = '';

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe({
      next: (p) => this.projects = p,
      error: () => this.error = 'Unable to load projects from the backend.'
    });
    this.loadPersonnelPool();
    this.loadAssignments();
  }

loadPersonnelPool(): void {
    this.userService.getUsers('Site Engineer').subscribe(u => this.engineers = u);
    this.userService.getUsers('Contractor').subscribe(u => this.contractors = u);
    this.userService.getUsers('Client').subscribe(u => this.clients = u);
  }

  loadAssignments(): void {
    this.projectService.getProjectAssignments().subscribe(assignments => {
      const proj = this.selectedProject;
      if (proj) {
        const match = assignments.find(a => a.projectId === proj.id);
        if (match) {
          proj.assignedEngineers = match.engineers;
          proj.assignedContractors = match.contractors;
          proj.assignedClients = match.clients;
        }
      }
    });
  }

  onProjectSelect(): void {
    this.auditLogs = [];
    this.error = '';
    this.success = '';
    if (!this.selectedProjectId) {
      this.selectedProject = undefined;
      return;
    }
    this.selectedProject = this.projects.find(p => p.id === this.selectedProjectId);
    if (this.selectedProject) {
      this.loadAssignments();
      this.loadAudit();
    }
  }

  assign(kind: 'engineer' | 'contractor' | 'client'): void {
    if (!this.selectedProject) return;
    let userId = '';
    if (kind === 'engineer') userId = this.selectedEngineerId;
    else if (kind === 'contractor') userId = this.selectedContractorId;
    else userId = this.selectedClientId;
    if (!userId) return;

    const action = kind === 'engineer' ? this.projectService.assignEngineer(this.selectedProject.id, userId)
      : kind === 'contractor' ? this.projectService.assignContractor(this.selectedProject.id, userId)
      : this.projectService.assignClient(this.selectedProject.id, userId);

    action.subscribe({
      next: () => {
        this.success = `Assigned successfully.`;
        this.selectedEngineerId = '';
        this.selectedContractorId = '';
        this.selectedClientId = '';
        this.loadAssignments();
        this.loadAudit();
      },
      error: (e) => this.error = e.error?.detail || 'Assignment failed.'
    });
  }

  unassign(kind: 'engineer' | 'contractor' | 'client', personnel: ProjectPersonnel): void {
    if (!this.selectedProject) return;
    this.projectService.unassignPersonnel(this.selectedProject.id, personnel.id, kind).subscribe({
      next: () => {
        this.success = 'Removed successfully.';
        this.loadAssignments();
        this.loadAudit();
      },
      error: (e) => this.error = e.error?.detail || 'Unassignment failed.'
    });
  }

  closeProject(): void {
    if (!this.selectedProject) return;
    this.projectService.closeProject(this.selectedProject.id, this.closeReason || undefined).subscribe({
      next: (p) => {
        this.selectedProject = p;
        this.success = 'Project closed successfully.';
        this.loadAudit();
      },
      error: (e) => this.error = e.error?.detail || 'Closure failed.'
    });
  }

  loadAudit(): void {
    if (!this.selectedProject) return;
    this.projectService.getProjectAudit(this.selectedProject.id).subscribe({
      next: (logs) => this.auditLogs = logs,
      error: () => this.auditLogs = []
    });
  }

  canManage(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }
}

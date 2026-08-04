import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TaskService, TaskItem } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-success text-white px-2 py-1 uppercase">Worker Portal</span>
                <h2 class="fw-bold text-dark mb-0">Daily Worker Shift Portal</h2>
              </div>
              <p class="text-muted small mb-0">Check daily task assignments, site safety instructions, & attendance clock-in status.</p>
            </div>
          </div>

          <!-- Top Status Row -->
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Assigned Tasks</span>
                <h4 class="fw-bold text-dark mb-0 mt-1">{{ tasks.length }}</h4>
                <small class="text-muted">{{ inProgressCount }} in progress</small>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Completed Tasks</span>
                <h4 class="fw-bold text-success mb-0 mt-1">{{ completedCount }}</h4>
                <small class="text-muted">from backend</small>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Open Tasks</span>
                <h4 class="fw-bold text-primary mb-0 mt-1">{{ openCount }}</h4>
                <small class="text-muted">pending assignment</small>
              </div>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="row g-4">
            <!-- My Tasks -->
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-card-checklist me-2 text-warning"></i> My Assigned Tasks</h5>
                <div class="list-group list-group-flush space-y-2">
                  <div class="list-group-item p-3 border rounded-3 bg-light" *ngFor="let t of myTasks">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <strong class="text-dark">{{ t.title }}</strong>
                      <span class="badge" [ngClass]="getStatusBadge(t.status)">{{ t.status }}</span>
                    </div>
                    <p class="small text-muted mb-0">{{ t.description }}</p>
                    <div class="d-flex justify-content-between extra-small text-muted mt-2 border-top pt-2">
                      <span>Project: {{ t.project }}</span>
                      <span>Due: {{ t.dueDate }}</span>
                    </div>
                  </div>
                  <div *ngIf="myTasks.length === 0" class="text-center py-4 text-muted">
                    No tasks assigned yet. Connect the backend to load your tasks.
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Info Card -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4" *ngIf="authService.currentUser() as user">
                <div class="text-center mb-3">
                  <img [src]="user.profilePicture" class="rounded-circle mb-2 shadow" width="80" height="80">
                  <h6 class="fw-bold text-dark mb-0">{{ user.fullName }}</h6>
                  <span class="badge bg-light text-dark font-monospace">{{ user.employeeId }}</span>
                </div>
                <div class="extra-small space-y-2 border-top pt-2">
<div class="d-flex justify-content-between">
                    <span class="text-muted">Department:</span>
                    <strong>{{ user.department }}</strong>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Email:</span>
                    <strong>{{ user.email }}</strong>
                  </div>
                </div>
              </div>
            </div>
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
export class WorkerDashboardComponent implements OnInit {
  tasks: TaskItem[] = [];

  constructor(public authService: AuthService, private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(t => this.tasks = t);
  }

  get myTasks(): TaskItem[] {
    const user = this.authService.currentUser();
    const name = user?.fullName || '';
    return this.tasks.filter(t => t.assignedTo === name || t.assignedTo === user?.employeeId);
  }

  get inProgressCount(): number {
    return this.myTasks.filter(t => t.status === 'In Progress').length;
  }

  get completedCount(): number {
    return this.myTasks.filter(t => t.status === 'Completed').length;
  }

  get openCount(): number {
    return this.myTasks.filter(t => t.status === 'Open').length;
  }

  getStatusBadge(status: string): string {
    return { 'Open': 'bg-primary', 'In Progress': 'bg-warning text-dark', 'Completed': 'bg-success', 'On Hold': 'bg-secondary' }[status] || 'bg-secondary';
  }
}

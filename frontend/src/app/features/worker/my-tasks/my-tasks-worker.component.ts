import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-my-tasks-worker',
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
                <li class="breadcrumb-item"><a routerLink="/dashboard/worker" class="text-decoration-none text-warning">Worker Portal</a></li>
                <li class="breadcrumb-item active">My Assigned Tasks</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-list-task me-2 text-warning"></i>My Assigned Tasks</h2>
              <p class="text-muted small mb-0">All tasks assigned to you by your contractor supervisor.</p>
            </div>
          </div>
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3" *ngFor="let s of summary">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4" [ngClass]="s.colorClass">{{ s.count }}</div>
                <div class="small text-muted">{{ s.label }}</div>
              </div>
            </div>
          </div>
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="d-flex gap-2">
              <select class="form-select form-select-sm" style="max-width:160px" [(ngModel)]="statusFilter">
                <option value="">All Tasks</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-12" *ngFor="let task of filteredTasks()">
              <div class="card card-custom border-0 p-4">
                <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <span class="badge" [ngClass]="getPriorityBadge(task.priority)">{{ task.priority }}</span>
                      <h6 class="fw-bold mb-0 text-dark">{{ task.title }}</h6>
                    </div>
                    <p class="small text-muted mb-2">{{ task.description }}</p>
                    <div class="d-flex flex-wrap gap-3 small text-muted">
                      <span><i class="bi bi-building me-1"></i>{{ task.project }}</span>
                      <span><i class="bi bi-geo-alt me-1"></i>{{ task.location }}</span>
                      <span><i class="bi bi-calendar3 me-1"></i>Due: <strong>{{ task.dueDate }}</strong></span>
                    </div>
                  </div>
                  <div class="d-flex flex-column align-items-end gap-2">
                    <span class="badge rounded-pill" [ngClass]="getStatusBadge(task.status)">{{ task.status }}</span>
                    <div class="d-flex gap-1">
                      <button *ngIf="task.status === 'Open'" class="btn btn-sm btn-outline-primary" (click)="task.status = 'In Progress'">Start</button>
                      <button *ngIf="task.status === 'In Progress'" class="btn btn-sm btn-outline-success" (click)="task.status = 'Completed'; computeSummary()">Mark Done</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12" *ngIf="filteredTasks().length === 0">
              <div class="text-center py-5 text-muted"><i class="bi bi-check2-all fs-1 d-block mb-2 opacity-50"></i>No tasks found.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyTasksWorkerComponent implements OnInit {
  statusFilter = '';
  tasks = signal([
    { id: 't-1', title: 'Install rebar grid – Level 5 East Wing', description: 'Complete Grade 60 rebar installation on Level 5 east perimeter columns.', project: 'Skyline Tower', location: 'Block A – Level 5', dueDate: '2026-08-05', priority: 'High', status: 'In Progress' },
    { id: 't-2', title: 'Concrete curing check – Slab Zone B', description: 'Monitor curing compound application and moisture readings.', project: 'Skyline Tower', location: 'Block B – Level 3', dueDate: '2026-08-06', priority: 'Medium', status: 'Open' },
    { id: 't-3', title: 'Site cleanup – Perimeter fencing', description: 'Remove debris and reinforce western perimeter safety fencing.', project: 'Skyline Tower', location: 'Site Perimeter', dueDate: '2026-08-01', priority: 'Low', status: 'Completed' }
  ]);
  summary = [
    { label: 'Total', count: 0, colorClass: 'text-dark' },
    { label: 'Open', count: 0, colorClass: 'text-primary' },
    { label: 'In Progress', count: 0, colorClass: 'text-warning' },
    { label: 'Completed', count: 0, colorClass: 'text-success' }
  ];
  constructor() { this.computeSummary(); }
  ngOnInit(): void { this.computeSummary(); }
  computeSummary(): void {
    const t = this.tasks();
    this.summary[0].count = t.length;
    this.summary[1].count = t.filter(x => x.status === 'Open').length;
    this.summary[2].count = t.filter(x => x.status === 'In Progress').length;
    this.summary[3].count = t.filter(x => x.status === 'Completed').length;
  }
  filteredTasks() { return this.tasks().filter(t => !this.statusFilter || t.status === this.statusFilter); }
  getPriorityBadge = (p: string) => ({ 'High': 'bg-danger', 'Medium': 'bg-warning text-dark', 'Low': 'bg-success' }[p] || 'bg-secondary');
  getStatusBadge = (s: string) => ({ 'Open': 'bg-primary', 'In Progress': 'bg-warning text-dark', 'Completed': 'bg-success' }[s] || 'bg-secondary');
}

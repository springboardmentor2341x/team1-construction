import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { TaskService, TaskItem } from '../../../core/services/task.service';

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  assignedTo: string;
  assignedWorkers: string[];
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Completed' | 'On Hold';
  dueDate: string;
  location: string;
}

@Component({
  selector: 'app-assign-task',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
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
                <li class="breadcrumb-item active">Assign Task</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-card-checklist me-2 text-warning"></i>Task Assignment</h2>
              <p class="text-muted small mb-0">Create and assign tasks to your workforce team members.</p>
            </div>
            <button class="btn btn-bt-accent shadow-sm" (click)="showForm.set(!showForm())">
              <i class="bi" [ngClass]="showForm() ? 'bi-x' : 'bi-plus-lg'"></i>
              {{ showForm() ? 'Cancel' : 'Create Task' }}
            </button>
          </div>

          <!-- Create Task Form -->
          <div class="card card-custom border-0 p-4 mb-4" *ngIf="showForm()">
            <h6 class="fw-bold mb-3"><i class="bi bi-pencil me-2 text-warning"></i>New Task Assignment</h6>
            <form [formGroup]="taskForm" (ngSubmit)="createTask()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Task Title *</label>
                  <input class="form-control form-control-sm" formControlName="title" placeholder="e.g. Install rebar grid on Level 5" [class.is-invalid]="submitted && taskForm.get('title')?.invalid">
                  <div class="invalid-feedback small">Task title is required.</div>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Priority *</label>
                  <select class="form-select form-select-sm" formControlName="priority">
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Due Date *</label>
                  <input class="form-control form-control-sm" type="date" formControlName="dueDate" [class.is-invalid]="submitted && taskForm.get('dueDate')?.invalid">
                  <div class="invalid-feedback small">Due date is required.</div>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold">Task Description</label>
                  <textarea class="form-control form-control-sm" rows="2" formControlName="description" placeholder="Describe the work to be performed..."></textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Site Location</label>
                  <input class="form-control form-control-sm" formControlName="location" placeholder="e.g. Block A – Floor 12">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Project</label>
                  <select class="form-select form-select-sm" formControlName="project">
                    <option value="Nexus Tech Park Campus">Nexus Tech Park Campus</option>
                    <option value="Metro Rapid Transit Tunnel">Metro Rapid Transit Tunnel</option>
                    <option value="Apex Sky Towers & Residences">Apex Sky Towers & Residences</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Assign To (User / Worker)</label>
                  <select class="form-select form-select-sm" formControlName="assignedTo">
                    <option value="Jackson Reed">Jackson Reed (Site Engineer)</option>
                    <option value="Elena Rostova">Elena Rostova (Project Manager)</option>
                    <option value="Samuel Harris">Samuel Harris (Contractor)</option>
                    <option value="Luis Gomez">Luis Gomez (Worker)</option>
                    <option value="Robert Thorne">Robert Thorne</option>
                    <option value="Carlos Mendez">Carlos Mendez</option>
                  </select>
                </div>
                <div class="col-12 d-flex gap-2 justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary" (click)="showForm.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-bt-accent btn-sm">Assign Task</button>
                </div>
              </div>
            </form>
          </div>

          <!-- Tasks Board -->
          <div class="row g-3">
            <div class="col-md-6 col-xl-3" *ngFor="let status of ['Open', 'In Progress', 'Completed', 'On Hold']">
              <div class="card card-custom border-0">
                <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
                  <h6 class="fw-bold mb-0 small">{{ status }}</h6>
                  <span class="badge rounded-pill" [ngClass]="getColumnBadge(status)">{{ getTasksForStatus(status).length }}</span>
                </div>
                <div class="p-2" style="min-height:300px">
                  <div *ngFor="let task of getTasksForStatus(status)" class="card border-0 shadow-sm p-3 mb-2" style="cursor:pointer">
                    <div class="d-flex align-items-start justify-content-between mb-1">
                      <strong class="small text-dark">{{ task.title }}</strong>
                      <span class="badge" [ngClass]="getPriorityBadge(task.priority)" style="font-size:0.65rem">{{ task.priority }}</span>
                    </div>
                    <p class="small text-muted mb-2" style="font-size:0.75rem">{{ task.project }}</p>
                    <div class="d-flex align-items-center justify-content-between small">
                      <div class="d-flex align-items-center gap-1">
                        <div class="rounded-circle bg-warning text-white fw-bold d-flex align-items-center justify-content-center" style="width:22px;height:22px;font-size:0.6rem">
                          {{ getInitials(task.assignedTo) }}
                        </div>
                        <span class="text-muted" style="font-size:0.72rem">{{ task.assignedTo }}</span>
                      </div>
                      <span class="text-muted" style="font-size:0.7rem"><i class="bi bi-calendar3 me-1"></i>{{ task.dueDate }}</span>
                    </div>
                  </div>
                  <div *ngIf="getTasksForStatus(status).length === 0" class="text-center text-muted py-3 small opacity-50">
                    No tasks here
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class AssignTaskComponent implements OnInit {
  taskForm: FormGroup;
  showForm = signal(false);
  submitted = false;

  tasks = signal<Task[]>([
    { id: 't-1', title: 'Install rebar grid – Level 5 East Wing', description: 'Complete Grade 60 rebar installation on Level 5 east perimeter.', project: 'Nexus Tech Park Campus', assignedTo: 'Jackson Reed', assignedWorkers: ['Jackson Reed'], priority: 'High', status: 'In Progress', dueDate: '2026-10-15', location: 'Block A – Level 5' },
    { id: 't-2', title: 'Waterproofing Basement B2', description: 'Apply membrane waterproofing on all B2 walls and flooring.', project: 'Nexus Tech Park Campus', assignedTo: 'Jackson Reed', assignedWorkers: ['Jackson Reed'], priority: 'High', status: 'Open', dueDate: '2026-10-18', location: 'Basement B2' },
    { id: 't-3', title: 'Steel shuttering – Column Grid D', description: 'Shuttering panels for columns D7–D14.', project: 'Metro Rapid Transit Tunnel', assignedTo: 'Samuel Harris', assignedWorkers: ['Samuel Harris'], priority: 'Medium', status: 'Open', dueDate: '2026-10-20', location: 'Grid D Zone' }
  ]);

  constructor(private fb: FormBuilder, private taskService: TaskService) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['Medium'],
      dueDate: ['', Validators.required],
      location: [''],
      project: ['Nexus Tech Park Campus'],
      assignedTo: ['Jackson Reed']
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe(backendTasks => {
      if (backendTasks && backendTasks.length > 0) {
        const mapped: Task[] = backendTasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          project: t.project || 'Nexus Tech Park Campus',
          assignedTo: t.assignedTo || 'Jackson Reed',
          assignedWorkers: [t.assignedTo || 'Jackson Reed'],
          priority: (t.priority as any) || 'Medium',
          status: (t.status as any) || 'Open',
          dueDate: t.dueDate || '',
          location: t.location || ''
        }));
        this.tasks.set(mapped);
      }
    });
  }

  createTask(): void {
    this.submitted = true;
    if (this.taskForm.invalid) return;

    const val = this.taskForm.value;
    const newTask: Task = {
      id: `t-${Date.now()}`,
      ...val,
      assignedWorkers: [val.assignedTo],
      status: 'Open'
    };

    this.tasks.update(ts => [newTask, ...ts]);

    // Send API call to backend FastAPI to trigger database creation & notification dispatch
    this.taskService.createTask({
      title: val.title,
      description: val.description,
      project: val.project,
      assignedTo: val.assignedTo,
      dueDate: val.dueDate,
      priority: val.priority,
      location: val.location
    }).subscribe({
      next: () => this.loadTasks(),
      error: () => {}
    });

    this.taskForm.reset({ priority: 'Medium', project: 'Nexus Tech Park Campus', assignedTo: 'Jackson Reed' });
    this.showForm.set(false);
    this.submitted = false;
  }

  getTasksForStatus(status: string) { return this.tasks().filter(t => t.status === status); }
  getInitials(name: string): string { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'US'; }
  getPriorityBadge(p: string): string { return { 'High': 'bg-danger', 'Medium': 'bg-warning text-dark', 'Low': 'bg-success' }[p] || 'bg-secondary'; }
  getColumnBadge(s: string): string { return { 'Open': 'bg-primary', 'In Progress': 'bg-warning text-dark', 'Completed': 'bg-success', 'On Hold': 'bg-secondary' }[s] || 'bg-secondary'; }
}

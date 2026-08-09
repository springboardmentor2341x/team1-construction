import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ResourceService, Resource } from '../../../core/services/resource.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-resource-allocation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block"><app-sidebar></app-sidebar></div>
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-tools me-2 text-warning"></i>Resource Allocation</h2>
              <p class="text-muted small mb-0">Manage equipment and resources across projects.</p>
            </div>
            <button class="btn btn-bt-accent" (click)="openForm()"><i class="bi bi-plus-lg me-1"></i>Add Resource</button>
          </div>

          <div *ngIf="showForm" class="card card-custom border-0 p-4 mb-4 bg-white shadow-sm">
            <h6 class="fw-bold mb-3">{{ editingId ? 'Edit Resource' : 'New Resource' }}</h6>
            <form (ngSubmit)="saveResource()" class="row g-3">
              <div class="col-md-4">
                <label class="form-label small">Resource Name</label>
                <input type="text" class="form-control" [(ngModel)]="currentResource.name" name="name" required>
              </div>
              <div class="col-md-4">
                <label class="form-label small">Type/Category</label>
                <select class="form-select" [(ngModel)]="currentResource.resource_type" name="type">
                  <option value="Excavators">Excavators</option>
                  <option value="Concrete Mixers">Concrete Mixers</option>
                  <option value="Cranes">Cranes</option>
                  <option value="Dump Trucks">Dump Trucks</option>
                  <option value="Generators">Generators</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small">Allocate to Project</label>
                <select class="form-select" [(ngModel)]="currentResource.project_id" name="project_id">
                  <option [value]="null">Unassigned</option>
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small">Status</label>
                <select class="form-select" [(ngModel)]="currentResource.status" name="status">
                  <option value="Available">Available</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small">Utilization %</label>
                <input type="number" class="form-control" [(ngModel)]="currentResource.utilization_percentage" name="utilization">
              </div>
              <div class="col-12 text-end">
                <button type="button" class="btn btn-outline-secondary me-2" (click)="showForm = false">Cancel</button>
                <button type="submit" class="btn btn-warning">Save Resource</button>
              </div>
            </form>
          </div>

          <div class="card card-custom border-0 p-4 shadow-sm bg-white">
            <div class="table-responsive">
              <table class="table table-hover align-middle small">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Resource Name</th>
                    <th>Category</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Utilization</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let res of resources">
                    <td class="fw-semibold">{{ res.name }}</td>
                    <td>{{ res.resource_type }}</td>
                    <td>{{ getProjectName(res.project_id) }}</td>
                    <td>
                      <span class="badge" [ngClass]="{'bg-success': res.status === 'Available', 'bg-primary': res.status === 'Allocated', 'bg-warning': res.status === 'Maintenance'}">
                        {{ res.status }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 6px;">
                          <div class="progress-bar bg-info" [style.width.%]="res.utilization_percentage"></div>
                        </div>
                        <span>{{ res.utilization_percentage }}%</span>
                      </div>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-secondary me-1" (click)="edit(res)"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-sm btn-outline-danger" (click)="delete(res.id)"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                  <tr *ngIf="!resources.length"><td colspan="6" class="text-center py-3 text-muted">No resources found.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResourceAllocationComponent implements OnInit {
  resources: Resource[] = [];
  projects: Project[] = [];
  showForm = false;
  editingId: string | null = null;
  currentResource: Partial<Resource> = {};

  constructor(private resourceService: ResourceService, private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadData();
    this.projectService.getProjects().subscribe((p: Project[]) => this.projects = p);
  }

  loadData(): void {
    this.resourceService.getResources().subscribe((data: Resource[]) => this.resources = data);
  }

  getProjectName(id?: string): string {
    if (!id) return 'Unassigned';
    return this.projects.find(p => p.id === id)?.projectName || 'Unknown';
  }

  openForm(): void {
    this.editingId = null;
    this.currentResource = { resource_type: 'Excavators', status: 'Available', utilization_percentage: 0 };
    this.showForm = true;
  }

  edit(res: Resource): void {
    this.editingId = res.id;
    this.currentResource = { ...res };
    this.showForm = true;
  }

  saveResource(): void {
    if (this.editingId) {
      this.resourceService.updateResource(this.editingId, this.currentResource).subscribe(() => {
        this.loadData();
        this.showForm = false;
      });
    } else {
      this.resourceService.createResource(this.currentResource).subscribe(() => {
        this.loadData();
        this.showForm = false;
      });
    }
  }

  delete(id: string): void {
    if (confirm('Delete this resource?')) {
      this.resourceService.deleteResource(id).subscribe(() => this.loadData());
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ResourceService, Resource } from '../../../core/services/resource.service';

@Component({
  selector: 'app-resource-utilization',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container-fluid p-0">
      <div class="row g-0">
        <div class="col-lg-2 col-md-3 d-none d-md-block"><app-sidebar></app-sidebar></div>
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          <div class="mb-4">
            <h2 class="fw-bold text-dark mb-0"><i class="bi bi-pie-chart me-2 text-info"></i>Resource Utilization</h2>
            <p class="text-muted small">Analyze equipment and asset usage efficiency across all projects.</p>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm">
                <span class="text-muted small">Total Resources</span>
                <h4 class="fw-bold mb-0">{{ resources.length }}</h4>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm">
                <span class="text-muted small">Avg Utilization</span>
                <h4 class="fw-bold mb-0 text-success">{{ getAvgUtilization() }}%</h4>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card card-custom border-0 p-3 bg-white shadow-sm">
                <span class="text-muted small">Available Equipment</span>
                <h4 class="fw-bold mb-0 text-primary">{{ getAvailableCount() }}</h4>
              </div>
            </div>
          </div>

          <div class="card card-custom border-0 p-4 shadow-sm bg-white">
            <h6 class="fw-bold mb-3">Resource Usage Breakdown</h6>
            <div class="table-responsive">
              <table class="table table-hover align-middle small">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Resource Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Utilization Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let res of resources">
                    <td class="fw-semibold">{{ res.name }}</td>
                    <td>{{ res.resource_type }}</td>
                    <td>
                      <span class="badge bg-light text-dark border">{{ res.status }}</span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 8px;">
                          <div class="progress-bar" [ngClass]="getUtilClass(res.utilization_percentage)" [style.width.%]="res.utilization_percentage"></div>
                        </div>
                        <span class="fw-bold">{{ res.utilization_percentage }}%</span>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="!resources.length"><td colspan="4" class="text-center py-3 text-muted">No data available.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResourceUtilizationComponent implements OnInit {
  resources: Resource[] = [];

  constructor(private resourceService: ResourceService) {}

  ngOnInit(): void {
    this.resourceService.getResources().subscribe((data: Resource[]) => this.resources = data);
  }

  getAvgUtilization(): number {
    if (!this.resources.length) return 0;
    const total = this.resources.reduce((sum, r) => sum + (r.utilization_percentage || 0), 0);
    return Math.round(total / this.resources.length);
  }

  getAvailableCount(): number {
    return this.resources.filter(r => r.status === 'Available').length;
  }

  getUtilClass(pct: number): string {
    if (pct > 80) return 'bg-success';
    if (pct > 40) return 'bg-warning';
    return 'bg-danger';
  }
}

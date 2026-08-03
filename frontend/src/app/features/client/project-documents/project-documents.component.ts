import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  project: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  category: string;
}

@Component({
  selector: 'app-project-documents',
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
                <li class="breadcrumb-item"><a routerLink="/dashboard/client" class="text-decoration-none text-warning">Client Overview</a></li>
                <li class="breadcrumb-item active">Project Documents</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-folder2-open me-2 text-warning"></i>Project Documents</h2>
              <p class="text-muted small mb-0">Access all project drawings, reports, approvals, and technical documents.</p>
            </div>
            <div class="d-flex gap-2 align-items-center">
              <span class="badge bg-info text-dark px-3 py-2"><i class="bi bi-eye me-1"></i>Read Only Access</span>
            </div>
          </div>

          <!-- Filter Bar -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="d-flex gap-2 flex-wrap align-items-center">
              <div class="input-group input-group-sm" style="max-width:240px">
                <span class="input-group-text"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control" placeholder="Search documents..." [(ngModel)]="searchTerm">
              </div>
              <select class="form-select form-select-sm" style="max-width:160px" [(ngModel)]="categoryFilter">
                <option value="">All Categories</option>
                <option value="Engineering Drawing">Engineering Drawings</option>
                <option value="Progress Report">Progress Reports</option>
                <option value="Contract">Contracts</option>
                <option value="Permit">Permits & Approvals</option>
                <option value="Safety">Safety Documents</option>
              </select>
              <select class="form-select form-select-sm" style="max-width:160px" [(ngModel)]="projectFilter">
                <option value="">All Projects</option>
                <option value="Skyline Tower">Skyline Metropolis Tower</option>
                <option value="Harbor Bridge">Harbor Bridge Expansion</option>
              </select>
              <button class="btn btn-sm btn-outline-secondary" (click)="searchTerm=''; categoryFilter=''; projectFilter=''">Reset</button>
            </div>
          </div>

          <!-- Category Tabs -->
          <div class="d-flex gap-2 mb-4 flex-wrap">
            <button *ngFor="let cat of categories"
                    class="btn btn-sm"
                    [ngClass]="selectedCategory === cat.value ? 'btn-warning' : 'btn-outline-secondary'"
                    (click)="selectedCategory = cat.value">
              <i class="bi me-1" [ngClass]="cat.icon"></i>{{ cat.label }}
              <span class="badge bg-secondary ms-1">{{ getDocCountForCategory(cat.value) }}</span>
            </button>
          </div>

          <!-- Documents Grid -->
          <div class="row g-3">
            <div class="col-lg-4 col-md-6" *ngFor="let doc of filteredDocuments()">
              <div class="card card-custom border-0 p-4 h-100">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="doc-icon rounded-2 d-flex align-items-center justify-content-center flex-shrink-0" [ngClass]="getDocIconBg(doc.type)" style="width:44px;height:44px">
                    <i class="bi fs-5" [ngClass]="getDocIcon(doc.type)"></i>
                  </div>
                  <div>
                    <h6 class="fw-semibold mb-0 small text-dark">{{ doc.name }}</h6>
                    <span class="badge bg-light text-muted" style="font-size:0.68rem">{{ doc.category }}</span>
                  </div>
                </div>
                <div class="small text-muted mb-3">
                  <div class="mb-1"><i class="bi bi-building me-1"></i>{{ doc.project }}</div>
                  <div class="mb-1"><i class="bi bi-person me-1"></i>{{ doc.uploadedBy }}</div>
                  <div class="d-flex justify-content-between">
                    <span><i class="bi bi-calendar3 me-1"></i>{{ doc.uploadDate }}</span>
                    <span><i class="bi bi-file-earmark me-1"></i>{{ doc.size }}</span>
                  </div>
                </div>
                <div class="d-flex gap-2 mt-auto pt-2 border-top">
                  <button class="btn btn-sm btn-outline-secondary flex-fill"><i class="bi bi-eye me-1"></i>View</button>
                  <button class="btn btn-sm btn-outline-primary flex-fill"><i class="bi bi-download me-1"></i>Download</button>
                </div>
              </div>
            </div>
            <div class="col-12" *ngIf="filteredDocuments().length === 0">
              <div class="text-center py-5 text-muted">
                <i class="bi bi-folder-x fs-1 d-block mb-2 opacity-50"></i>No documents found matching your filters.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ProjectDocumentsComponent {
  searchTerm = '';
  categoryFilter = '';
  projectFilter = '';
  selectedCategory = 'all';

  categories = [
    { label: 'All', value: 'all', icon: 'bi-folder' },
    { label: 'Drawings', value: 'Engineering Drawing', icon: 'bi-file-earmark-ruled' },
    { label: 'Reports', value: 'Progress Report', icon: 'bi-file-earmark-bar-graph' },
    { label: 'Contracts', value: 'Contract', icon: 'bi-file-earmark-text' },
    { label: 'Permits', value: 'Permit', icon: 'bi-file-earmark-check' }
  ];

  documents = signal<ProjectDocument[]>([
    { id: 'd-1', name: 'Structural Foundation Drawings – Rev C', type: 'PDF', category: 'Engineering Drawing', project: 'Skyline Tower', uploadedBy: 'David Miller', uploadDate: '2026-07-20', size: '18.4 MB' },
    { id: 'd-2', name: 'Q2 2026 Construction Progress Report', type: 'PDF', category: 'Progress Report', project: 'Skyline Tower', uploadedBy: 'Sarah Jenkins', uploadDate: '2026-07-31', size: '4.2 MB' },
    { id: 'd-3', name: 'Main Contractor Agreement – Marcus Brody', type: 'DOCX', category: 'Contract', project: 'Skyline Tower', uploadedBy: 'Alex Vance', uploadDate: '2026-01-10', size: '1.1 MB' },
    { id: 'd-4', name: 'Building Construction Permit – BMP/2026/042', type: 'PDF', category: 'Permit', project: 'Skyline Tower', uploadedBy: 'Alex Vance', uploadDate: '2026-01-05', size: '0.8 MB' },
    { id: 'd-5', name: 'Site Safety & Emergency Plan', type: 'PDF', category: 'Safety', project: 'Skyline Tower', uploadedBy: 'David Miller', uploadDate: '2026-02-14', size: '2.6 MB' },
    { id: 'd-6', name: 'Harbor Bridge Piling Inspection Report', type: 'PDF', category: 'Progress Report', project: 'Harbor Bridge', uploadedBy: 'David Miller', uploadDate: '2026-07-25', size: '3.1 MB' },
    { id: 'd-7', name: 'Harbor Bridge Structural Drawings – Rev A', type: 'DWG', category: 'Engineering Drawing', project: 'Harbor Bridge', uploadedBy: 'Sarah Jenkins', uploadDate: '2026-03-12', size: '42.0 MB' },
    { id: 'd-8', name: 'Environmental Impact Assessment', type: 'PDF', category: 'Permit', project: 'Harbor Bridge', uploadedBy: 'Alex Vance', uploadDate: '2026-02-20', size: '6.4 MB' }
  ]);

  filteredDocuments() {
    return this.documents().filter(d =>
      (this.selectedCategory === 'all' || d.category === this.selectedCategory) &&
      (!this.searchTerm || d.name.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.categoryFilter || d.category === this.categoryFilter) &&
      (!this.projectFilter || d.project.includes(this.projectFilter))
    );
  }

  getDocCountForCategory(cat: string): number {
    if (cat === 'all') return this.documents().length;
    return this.documents().filter(d => d.category === cat).length;
  }

  getDocIcon = (type: string) => ({ 'PDF': 'bi-file-earmark-pdf-fill', 'DOCX': 'bi-file-earmark-word-fill', 'DWG': 'bi-file-earmark-ruled-fill', 'XLSX': 'bi-file-earmark-excel-fill' }[type] || 'bi-file-earmark-fill');
  getDocIconBg = (type: string) => ({ 'PDF': 'bg-danger-subtle text-danger', 'DOCX': 'bg-primary-subtle text-primary', 'DWG': 'bg-info-subtle text-info', 'XLSX': 'bg-success-subtle text-success' }[type] || 'bg-secondary-subtle text-secondary');
}

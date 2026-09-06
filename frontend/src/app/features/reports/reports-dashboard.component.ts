import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../shared/components/role-simulator/role-simulator.component';
import { ProjectService } from '../../core/services/project.service';
import { ReportService, ProjectProgressReport, ResourceUtilizationReport, WorkforceReport, ProcurementReport, BudgetReport } from '../../core/services/report.service';
import { Project } from '../../core/models/project.model';

type ReportCategory = 'progress' | 'resources' | 'workforce' | 'procurement' | 'budget';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
    <app-navbar></app-navbar>

    <div class="container-fluid p-0">
      <div class="row g-0">
        <!-- Sidebar Navigation -->
        <div class="col-lg-2 col-md-3 d-none d-md-block">
          <app-sidebar></app-sidebar>
        </div>

        <!-- Main Workspace Area -->
        <div class="col-lg-10 col-md-9 p-4 bg-light-subtle min-vh-100 animate-fade-in">
          
          <!-- Top Title & Navigation Header -->
          <div class="card card-custom mb-4 border-0 shadow-sm bg-dark text-white">
            <div class="card-body p-4 d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3">
              <div class="d-flex align-items-center gap-3">
                <div class="stat-icon-wrapper bg-warning text-dark rounded-3 flex-shrink-0">
                  <i class="bi bi-file-earmark-bar-graph-fill fs-3"></i>
                </div>
                <div>
                  <h2 class="mb-1 text-white fw-bold fs-3">Reports & Documentation System</h2>
                  <p class="text-secondary mb-0 small">Real-Time Database Driven Project Analytics & Compliance Documentation</p>
                </div>
              </div>

              <!-- Export Action Buttons -->
              <div class="d-flex flex-wrap align-items-center gap-2 flex-shrink-0" *ngIf="selectedProjectId">
                <button 
                  (click)="downloadPdf()" 
                  [disabled]="isDownloadingPdf || isLoading"
                  class="btn btn-warning fw-bold d-flex align-items-center gap-2 px-3 py-2 shadow-sm text-nowrap">
                  <span *ngIf="isDownloadingPdf" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <i *ngIf="!isDownloadingPdf" class="bi bi-file-earmark-pdf-fill fs-5"></i>
                  <span>{{ isDownloadingPdf ? 'Generating PDF...' : 'Download PDF' }}</span>
                </button>

                <button 
                  (click)="downloadExcel()" 
                  [disabled]="isDownloadingExcel || isLoading"
                  class="btn btn-outline-light fw-bold d-flex align-items-center gap-2 px-3 py-2 shadow-sm text-nowrap">
                  <span *ngIf="isDownloadingExcel" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <i *ngIf="!isDownloadingExcel" class="bi bi-file-earmark-excel-fill text-success fs-5"></i>
                  <span>{{ isDownloadingExcel ? 'Exporting...' : 'Export Excel' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Controls & Filters Bar -->
          <div class="card card-custom mb-4 p-3 border border-secondary border-opacity-25 shadow-sm">
            <div class="row g-3">
              <!-- Project Selector -->
              <div class="col-12 col-md-5 col-xl-4">
                <label class="form-label text-muted small fw-bold text-uppercase mb-1">Select Target Project</label>
                <select 
                  [(ngModel)]="selectedProjectId" 
                  (change)="loadActiveReport()"
                  class="form-select font-medium shadow-sm text-truncate">
                  <option value="" disabled>-- Select Authorized Project --</option>
                  <option *ngFor="let p of projects" [value]="p.id">
                    {{ p.projectCode || 'PRJ' }} — {{ p.projectName }}
                  </option>
                </select>
              </div>

              <!-- Search Input -->
              <div class="col-md-4">
                <label class="form-label text-muted small fw-bold text-uppercase mb-1">Search Records</label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-secondary"><i class="bi bi-search"></i></span>
                  <input 
                    type="text" 
                    [(ngModel)]="searchQuery" 
                    (input)="onFilterChange()"
                    placeholder="Search by name, ID, or category..."
                    class="form-control" />
                </div>
              </div>

              <!-- Status Filter Dropdown -->
              <div class="col-md-4">
                <label class="form-label text-muted small fw-bold text-uppercase mb-1">Status Filter</label>
                <select 
                  [(ngModel)]="selectedStatusFilter" 
                  (change)="onFilterChange()"
                  class="form-select">
                  <option value="All">All Statuses</option>
                  <option value="Active">Active / In Progress</option>
                  <option value="Completed">Completed / Approved</option>
                  <option value="Pending">Pending / Submitted</option>
                  <option value="Delayed">Delayed / Warning</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Report Category Navigation Tabs -->
          <ul class="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-3 border shadow-sm">
            <li class="nav-item">
              <button 
                (click)="setCategory('progress')" 
                [class]="activeCategory === 'progress' ? 'nav-link active bg-warning text-dark fw-bold shadow-sm' : 'nav-link text-secondary fw-semibold'"
                class="px-3 py-2 rounded-2 border-0">
                <i class="bi bi-speedometer2 me-1"></i> Project Progress Report
              </button>
            </li>
            <li class="nav-item">
              <button 
                (click)="setCategory('resources')" 
                [class]="activeCategory === 'resources' ? 'nav-link active bg-warning text-dark fw-bold shadow-sm' : 'nav-link text-secondary fw-semibold'"
                class="px-3 py-2 rounded-2 border-0">
                <i class="bi bi-tools me-1"></i> Resource Utilization Report
              </button>
            </li>
            <li class="nav-item">
              <button 
                (click)="setCategory('workforce')" 
                [class]="activeCategory === 'workforce' ? 'nav-link active bg-warning text-dark fw-bold shadow-sm' : 'nav-link text-secondary fw-semibold'"
                class="px-3 py-2 rounded-2 border-0">
                <i class="bi bi-people-fill me-1"></i> Workforce & Attendance
              </button>
            </li>
            <li class="nav-item">
              <button 
                (click)="setCategory('procurement')" 
                [class]="activeCategory === 'procurement' ? 'nav-link active bg-warning text-dark fw-bold shadow-sm' : 'nav-link text-secondary fw-semibold'"
                class="px-3 py-2 rounded-2 border-0">
                <i class="bi bi-cart-fill me-1"></i> Procurement & POs
              </button>
            </li>
            <li class="nav-item">
              <button 
                (click)="setCategory('budget')" 
                [class]="activeCategory === 'budget' ? 'nav-link active bg-warning text-dark fw-bold shadow-sm' : 'nav-link text-secondary fw-semibold'"
                class="px-3 py-2 rounded-2 border-0">
                <i class="bi bi-cash-stack me-1"></i> Budget & Cost Summary
              </button>
            </li>
          </ul>

          <!-- Error Notification Banner -->
          <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 mb-4 shadow-sm" role="alert">
            <i class="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{{ errorMessage }}</div>
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="text-muted mt-3 font-medium">Querying live PostgreSQL database records...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && !selectedProjectId" class="card card-custom p-5 text-center my-4 shadow-sm">
            <div class="stat-icon-wrapper bg-light text-warning mx-auto mb-3" style="width: 60px; height: 60px;">
              <i class="bi bi-building-gear fs-2"></i>
            </div>
            <h4 class="fw-bold">Select a Project to View Live Report Preview</h4>
            <p class="text-muted max-w-md mx-auto mb-0">Select any authorized project from the dropdown above to load live progress, workforce, procurement, or budget analytics.</p>
          </div>

          <!-- Live Report Content Preview -->
          <div *ngIf="!isLoading && selectedProjectId">

            <!-- 1. PROJECT PROGRESS REPORT VIEW -->
            <div *ngIf="activeCategory === 'progress' && progressReport" class="d-flex flex-column gap-4">
              <!-- Summary Cards Grid -->
              <div class="row g-3">
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Overall Progress</span>
                    <div class="fs-3 fw-bold text-warning mt-1">{{ progressReport.overall_progress }}%</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Completed Milestones</span>
                    <div class="fs-3 fw-bold text-success mt-1">{{ progressReport.completed_milestones }} / {{ progressReport.total_milestones }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Milestone Velocity</span>
                    <div class="fs-3 fw-bold text-primary mt-1">{{ progressReport.milestone_velocity }}%</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Delayed Milestones</span>
                    <div class="fs-3 fw-bold text-danger mt-1">{{ progressReport.delayed_milestones }}</div>
                  </div>
                </div>
              </div>

              <!-- Milestones Data Table -->
              <div class="card card-custom overflow-hidden shadow-sm">
                <div class="card-header bg-light d-flex align-items-center justify-content-between py-3">
                  <h5 class="mb-0 fw-bold">Project Milestones</h5>
                  <span class="badge bg-secondary">{{ progressReport.milestones.length }} Total</span>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th>Milestone Name</th>
                        <th>Planned Date</th>
                        <th>Completion %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let m of progressReport.milestones">
                        <td class="fw-bold">{{ m.name }}</td>
                        <td>{{ m.plannedDate }}</td>
                        <td style="min-width: 150px;">
                          <div class="d-flex align-items-center gap-2">
                            <div class="progress flex-grow-1" style="height: 8px;">
                              <div class="progress-bar bg-warning" [style.width.%]="m.completionPercentage"></div>
                            </div>
                            <span class="small fw-bold">{{ m.completionPercentage }}%</span>
                          </div>
                        </td>
                        <td>
                          <span [class]="m.status === 'Completed' ? 'badge bg-success' : 'badge bg-warning text-dark'">
                            {{ m.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 2. RESOURCE UTILIZATION REPORT VIEW -->
            <div *ngIf="activeCategory === 'resources' && resourceReport" class="d-flex flex-column gap-4">
              <div class="row g-3">
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Fleet Operational Rate</span>
                    <div class="fs-3 fw-bold text-warning mt-1">{{ resourceReport.utilization_rate_percentage }}%</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Allocated Equipment</span>
                    <div class="fs-3 fw-bold text-success mt-1">{{ resourceReport.total_allocated_equipment }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Active Units</span>
                    <div class="fs-3 fw-bold text-primary mt-1">{{ resourceReport.active_equipment_count }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Under Maintenance</span>
                    <div class="fs-3 fw-bold text-danger mt-1">{{ resourceReport.maintenance_count }}</div>
                  </div>
                </div>
              </div>

              <div class="card card-custom overflow-hidden shadow-sm">
                <div class="card-header bg-light py-3">
                  <h5 class="mb-0 fw-bold">Equipment Fleet Inventory</h5>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th>Equipment Name</th>
                        <th>Type</th>
                        <th>Serial No</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let e of resourceReport.equipment_fleet">
                        <td class="fw-bold">{{ e.name }}</td>
                        <td>{{ e.type }}</td>
                        <td class="font-monospace small">{{ e.serialNo }}</td>
                        <td>{{ e.location }}</td>
                        <td>
                          <span [class]="e.status === 'Operational' ? 'badge bg-success' : 'badge bg-danger'">
                            {{ e.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 3. WORKFORCE REPORT VIEW -->
            <div *ngIf="activeCategory === 'workforce' && workforceReport" class="d-flex flex-column gap-4">
              <div class="row g-3">
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Assigned Workers</span>
                    <div class="fs-3 fw-bold text-warning mt-1">{{ workforceReport.total_assigned_workers }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Present Today</span>
                    <div class="fs-3 fw-bold text-success mt-1">{{ workforceReport.present_today_count }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Attendance Rate</span>
                    <div class="fs-3 fw-bold text-primary mt-1">{{ workforceReport.attendance_rate_percentage }}%</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Attendance Health</span>
                    <div class="fs-4 fw-bold text-dark mt-1">{{ workforceReport.attendance_status }}</div>
                  </div>
                </div>
              </div>

              <div class="card card-custom overflow-hidden shadow-sm">
                <div class="card-header bg-light py-3">
                  <h5 class="mb-0 fw-bold">Assigned Workers Roster</h5>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th>Worker ID</th>
                        <th>Name</th>
                        <th>Trade / Skill</th>
                        <th>Pay Rate</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let w of workforceReport.assigned_workers">
                        <td class="font-monospace fw-bold text-warning">{{ w.workerId }}</td>
                        <td class="fw-bold">{{ w.name }}</td>
                        <td>{{ w.skill }}</td>
                        <td class="font-monospace text-success">₹{{ w.payRate }}</td>
                        <td>
                          <span class="badge bg-success">{{ w.status }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 4. PROCUREMENT REPORT VIEW -->
            <div *ngIf="activeCategory === 'procurement' && procurementReport" class="d-flex flex-column gap-4">
              <div class="row g-3">
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Total Requisitions</span>
                    <div class="fs-3 fw-bold text-warning mt-1">{{ procurementReport.total_requests }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Pending Approvals</span>
                    <div class="fs-3 fw-bold text-danger mt-1">{{ procurementReport.pending_approval_count }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Purchase Orders</span>
                    <div class="fs-3 fw-bold text-primary mt-1">{{ procurementReport.purchase_orders_count }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Total PO Spent</span>
                    <div class="fs-4 fw-bold text-success mt-1">₹{{ procurementReport.purchase_orders_total_amount | number:'1.2-2' }}</div>
                  </div>
                </div>
              </div>

              <div class="card card-custom overflow-hidden shadow-sm">
                <div class="card-header bg-light py-3">
                  <h5 class="mb-0 fw-bold">Purchase Orders Ledger</h5>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th>PO Number</th>
                        <th>Vendor Name</th>
                        <th>PO Date</th>
                        <th>Amount (₹)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let po of procurementReport.purchase_orders">
                        <td class="font-monospace fw-bold text-warning">{{ po.poNumber }}</td>
                        <td class="fw-bold">{{ po.vendor }}</td>
                        <td>{{ po.poDate }}</td>
                        <td class="font-monospace fw-bold text-success">₹{{ po.amount | number:'1.2-2' }}</td>
                        <td>
                          <span class="badge bg-warning text-dark">{{ po.status }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 5. BUDGET REPORT VIEW -->
            <div *ngIf="activeCategory === 'budget' && budgetReport" class="d-flex flex-column gap-4">

              <!-- Notice Banner regarding Module 11 Integration -->
              <div class="alert alert-warning d-flex align-items-start gap-3 shadow-sm mb-0" role="alert">
                <i class="bi bi-info-circle-fill fs-4 mt-1"></i>
                <div>
                  <h6 class="fw-bold mb-1">Budget & Costing Integration Notice</h6>
                  <p class="mb-0 small">{{ budgetReport.module_11_notice }}</p>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Planned Budget</span>
                    <div class="fs-4 fw-bold text-warning mt-1">₹{{ budgetReport.estimated_budget | number:'1.2-2' }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">PO Expenses Spent</span>
                    <div class="fs-4 fw-bold text-danger mt-1">₹{{ budgetReport.total_purchase_orders_spent | number:'1.2-2' }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Remaining Reserve</span>
                    <div class="fs-4 fw-bold text-success mt-1">₹{{ budgetReport.remaining_budget | number:'1.2-2' }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card card-custom p-3 border-0 bg-white shadow-sm">
                    <span class="text-muted small fw-bold text-uppercase">Budget Health</span>
                    <div class="fs-4 fw-bold text-dark mt-1">{{ budgetReport.budget_status }}</div>
                  </div>
                </div>
              </div>

              <div class="card card-custom overflow-hidden shadow-sm">
                <div class="card-header bg-light py-3">
                  <h5 class="mb-0 fw-bold">Verified Procurement PO Expenses</h5>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th>PO Number</th>
                        <th>Vendor / Supplier</th>
                        <th>Date</th>
                        <th>Amount Spent (₹)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let e of budgetReport.purchase_order_expenses">
                        <td class="font-monospace fw-bold text-warning">{{ e.poNumber || e.po_number || e.code || e.expense_code || 'PO-2026-001' }}</td>
                        <td class="fw-bold">{{ e.vendor || e.vendor_name || e.description || e.category || 'General Ledger' }}</td>
                        <td>{{ e.date || e.expense_date }}</td>
                        <td class="font-monospace fw-bold text-danger">₹{{ e.amount | number:'1.2-2' }}</td>
                        <td>
                          <span class="badge bg-success">{{ e.status || 'Verified & Paid' }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  `
})
export class ReportsDashboardComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId: string = '';
  activeCategory: ReportCategory = 'progress';
  searchQuery: string = '';
  selectedStatusFilter: string = 'All';

  isLoading: boolean = false;
  isDownloadingPdf: boolean = false;
  isDownloadingExcel: boolean = false;
  errorMessage: string = '';

  progressReport: ProjectProgressReport | null = null;
  resourceReport: ResourceUtilizationReport | null = null;
  workforceReport: WorkforceReport | null = null;
  procurementReport: ProcurementReport | null = null;
  budgetReport: BudgetReport | null = null;

  constructor(
    private projectService: ProjectService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projs) => {
        this.projects = projs || [];
        if (this.projects.length > 0) {
          this.selectedProjectId = this.projects[0].id;
          this.loadActiveReport();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load user projects. ' + (err?.error?.detail || err?.message || '');
      }
    });
  }

  setCategory(cat: ReportCategory): void {
    this.activeCategory = cat;
    this.loadActiveReport();
  }

  onFilterChange(): void {
    this.loadActiveReport();
  }

  loadActiveReport(): void {
    if (!this.selectedProjectId) return;
    this.isLoading = true;
    this.errorMessage = '';

    if (this.activeCategory === 'progress') {
      this.reportService.getProjectProgressReport(this.selectedProjectId, this.selectedStatusFilter, this.searchQuery).subscribe({
        next: (res) => { this.progressReport = res; this.isLoading = false; },
        error: (err) => { this.handleError(err); }
      });
    } else if (this.activeCategory === 'resources') {
      this.reportService.getResourceUtilizationReport(this.selectedProjectId, this.selectedStatusFilter, this.searchQuery).subscribe({
        next: (res) => { this.resourceReport = res; this.isLoading = false; },
        error: (err) => { this.handleError(err); }
      });
    } else if (this.activeCategory === 'workforce') {
      this.reportService.getWorkforceReport(this.selectedProjectId, this.selectedStatusFilter, this.searchQuery).subscribe({
        next: (res) => { this.workforceReport = res; this.isLoading = false; },
        error: (err) => { this.handleError(err); }
      });
    } else if (this.activeCategory === 'procurement') {
      this.reportService.getProcurementReport(this.selectedProjectId, this.selectedStatusFilter, this.searchQuery).subscribe({
        next: (res) => { this.procurementReport = res; this.isLoading = false; },
        error: (err) => { this.handleError(err); }
      });
    } else if (this.activeCategory === 'budget') {
      this.reportService.getBudgetReport(this.selectedProjectId, this.selectedStatusFilter, this.searchQuery).subscribe({
        next: (res) => { this.budgetReport = res; this.isLoading = false; },
        error: (err) => { this.handleError(err); }
      });
    }
  }

  downloadPdf(): void {
    if (!this.selectedProjectId) return;
    this.isDownloadingPdf = true;
    this.reportService.downloadPdfReport(this.selectedProjectId, this.activeCategory).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `buildtrack_${this.activeCategory}_report.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloadingPdf = false;
      },
      error: (err) => {
        this.isDownloadingPdf = false;
        this.handleError(err);
      }
    });
  }

  downloadExcel(): void {
    if (!this.selectedProjectId) return;
    this.isDownloadingExcel = true;
    this.reportService.downloadExcelReport(this.selectedProjectId, this.activeCategory).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `buildtrack_${this.activeCategory}_report.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloadingExcel = false;
      },
      error: (err) => {
        this.isDownloadingExcel = false;
        this.handleError(err);
      }
    });
  }

  private handleError(err: any): void {
    this.isLoading = false;
    if (err?.status === 403) {
      this.errorMessage = 'HTTP 403 Forbidden: You do not have authorization to access reports for this project.';
    } else {
      this.errorMessage = err?.error?.detail || err?.message || 'Error fetching database report data.';
    }
  }
}

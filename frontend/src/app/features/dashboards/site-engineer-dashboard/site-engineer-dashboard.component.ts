import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-site-engineer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
  template: `
    <app-role-simulator></app-role-simulator>
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
                <span class="badge bg-info text-dark px-2 py-1 uppercase">Site Engineering</span>
                <h2 class="fw-bold text-dark mb-0">Site Engineer Operations Hub</h2>
              </div>
              <p class="text-muted small mb-0">Daily progress logging, machinery status, site quality, and field engineering logs.</p>
            </div>
            <button class="btn btn-bt-accent btn-sm d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-journal-plus"></i> Log Today's Site Progress
            </button>
          </div>

          <!-- Top Metric Cards -->
          <div class="row g-3 mb-4">
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Assigned Projects</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1">2 Sites</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-info-subtle text-info"><i class="bi bi-building"></i></div>
                </div>
                <div class="mt-2 small text-muted">Skyline & Harbor Flyover</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Today's Progress</span>
                    <h3 class="fw-bold text-success mb-0 mt-1">85%</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-success-subtle text-success"><i class="bi bi-check2-circle"></i></div>
                </div>
                <div class="mt-2 small text-muted">Daily pour target achieved</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Weekly Target</span>
                    <h3 class="fw-bold text-warning mb-0 mt-1">92%</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-warning-subtle text-warning"><i class="bi bi-graph-up text-warning"></i></div>
                </div>
                <div class="mt-2 small text-muted">450m³ concrete poured</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Machinery Active</span>
                    <h3 class="fw-bold text-primary mb-0 mt-1">6 Cranes</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-primary-subtle text-primary"><i class="bi bi-truck"></i></div>
                </div>
                <div class="mt-2 small text-muted">1 in maintenance</div>
              </div>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="row g-4">
            <!-- Left Column: Site Activity Logs -->
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-journal-text text-warning me-2"></i> Today's Site Activity Logs</h5>
                
                <div class="timeline space-y-3">
                  <div class="p-3 bg-light rounded-3 border-start border-4 border-success">
                    <div class="d-flex justify-content-between extra-small text-muted mb-1">
                      <span><i class="bi bi-clock me-1"></i> 08:30 AM - Concrete Pouring</span>
                      <span class="badge bg-success">Completed</span>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">Basement B3 Slab Pour Batch #4</h6>
                    <p class="small text-muted mb-0">Inspected 120m³ of M40 Grade concrete mix. Slump test and cylinder cubes sampled for 7-day lab curing.</p>
                  </div>

                  <div class="p-3 bg-light rounded-3 border-start border-4 border-warning">
                    <div class="d-flex justify-content-between extra-small text-muted mb-1">
                      <span><i class="bi bi-clock me-1"></i> 11:15 AM - Rebar Inspection</span>
                      <span class="badge bg-warning text-dark">In Progress</span>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">Column Rebar Cage Alignment Check</h6>
                    <p class="small text-muted mb-0">Verifying lap length and stirrup spacing on structural grid C-4 before formwork closing.</p>
                  </div>
                </div>
              </div>

              <!-- Weekly Progress Chart / Breakdown -->
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-calendar-week text-warning me-2"></i> Weekly Progress Breakdown</h5>
                <div class="row text-center g-2">
                  <div class="col"><div class="p-2 bg-light rounded"><small class="text-muted">Mon</small><div class="fw-bold text-success">100%</div></div></div>
                  <div class="col"><div class="p-2 bg-light rounded"><small class="text-muted">Tue</small><div class="fw-bold text-success">95%</div></div></div>
                  <div class="col"><div class="p-2 bg-light rounded"><small class="text-muted">Wed</small><div class="fw-bold text-success">90%</div></div></div>
                  <div class="col"><div class="p-2 bg-light rounded"><small class="text-muted">Thu</small><div class="fw-bold text-warning">85%</div></div></div>
                  <div class="col"><div class="p-2 bg-light rounded"><small class="text-muted">Fri</small><div class="fw-bold text-muted">Pending</div></div></div>
                </div>
              </div>
            </div>

            <!-- Right Column: Equipment Status & Resource Availability -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-gear-wide-connected text-primary me-2"></i> Equipment Status</h5>
                <div class="extra-small space-y-2">
                  <div class="d-flex justify-content-between py-2 border-bottom">
                    <span>Tower Crane TC-01:</span>
                    <span class="badge bg-success">Operational</span>
                  </div>
                  <div class="d-flex justify-content-between py-2 border-bottom">
                    <span>Concrete Pump Boom P-04:</span>
                    <span class="badge bg-success">Operational</span>
                  </div>
                  <div class="d-flex justify-content-between py-2 border-bottom">
                    <span>Hydraulic Excavator EX-02:</span>
                    <span class="badge bg-warning text-dark">Under Maintenance</span>
                  </div>
                  <div class="d-flex justify-content-between py-2">
                    <span>Soil Compactor C-01:</span>
                    <span class="badge bg-success">Operational</span>
                  </div>
                </div>
              </div>

              <!-- Resource Availability -->
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-truck me-2 text-info"></i> Resource Availability</h5>
                <div class="extra-small space-y-2">
                  <div class="d-flex justify-content-between py-1 border-bottom">
                    <span class="text-muted">Steel Reinforcement Bars:</span>
                    <strong class="text-dark">45 Tons in Stock</strong>
                  </div>
                  <div class="d-flex justify-content-between py-1 border-bottom">
                    <span class="text-muted">Ready-Mix Concrete:</span>
                    <strong class="text-dark">8 Transit Mixers Arrived</strong>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <span class="text-muted">Diesel Fuel Reserves:</span>
                    <strong class="text-success">2,400 Liters</strong>
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
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
  `]
})
export class SiteEngineerDashboardComponent implements OnInit {
  ngOnInit(): void {}
}

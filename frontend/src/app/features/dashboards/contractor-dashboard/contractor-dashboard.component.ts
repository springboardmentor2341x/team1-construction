import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';

@Component({
  selector: 'app-contractor-dashboard',
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
                <span class="badge bg-purple text-white px-2 py-1 uppercase" style="background-color: #8B5CF6;">Contractor Hub</span>
                <h2 class="fw-bold text-dark mb-0">Subcontractor & Crew Operations</h2>
              </div>
              <p class="text-muted small mb-0">Manage crew shifts, attendance roster, work completion targets, and trade tasks.</p>
            </div>
            <button class="btn btn-bt-accent btn-sm d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-clock-history"></i> Log Shift Attendance
            </button>
          </div>

          <!-- Top Stats -->
          <div class="row g-3 mb-4">
            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Assigned Tasks</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1">8 Active</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-purple-subtle text-purple" style="background-color: #F3E8FF; color: #7C3AED;"><i class="bi bi-card-checklist"></i></div>
                </div>
                <div class="mt-2 small text-muted">2 due by end of week</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Worker Roster</span>
                    <h3 class="fw-bold text-dark mb-0 mt-1">24 Masons</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-info-subtle text-info"><i class="bi bi-people-fill"></i></div>
                </div>
                <div class="mt-2 small text-muted">22 Present Today</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Attendance Rate</span>
                    <h3 class="fw-bold text-success mb-0 mt-1">91.6%</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-success-subtle text-success"><i class="bi bi-person-check"></i></div>
                </div>
                <div class="mt-2 small text-muted">Shift A & Shift B</div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6">
              <div class="card card-custom p-3 border-0">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-muted small fw-semibold">Work Completion</span>
                    <h3 class="fw-bold text-warning mb-0 mt-1">82%</h3>
                  </div>
                  <div class="stat-icon-wrapper bg-warning-subtle text-warning"><i class="bi bi-pie-chart-fill"></i></div>
                </div>
                <div class="mt-2 small text-muted">Steel rebar binding target</div>
              </div>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="row g-4">
            <!-- Left: Assigned Trade Tasks -->
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-list-task me-2 text-warning"></i> Assigned Trade Tasks</h5>
                <div class="space-y-3">
                  <div class="p-3 border rounded-3 bg-white d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="fw-bold text-dark mb-1">Structural Steel Rebar Binding Grid C-4</h6>
                      <p class="small text-muted mb-0">Project: Skyline Metropolis Tower | Location: Floor 12</p>
                    </div>
                    <span class="badge bg-warning text-dark">In Progress (82%)</span>
                  </div>

                  <div class="p-3 border rounded-3 bg-white d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="fw-bold text-dark mb-1">Formwork Shoring & Falsework Erection</h6>
                      <p class="small text-muted mb-0">Project: Harbor Gateway Bridge | Pier 4 Expansion</p>
                    </div>
                    <span class="badge bg-success">Completed (100%)</span>
                  </div>
                </div>
              </div>

              <!-- Worker Shift Schedule -->
              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-clock-history me-2 text-warning"></i> Active Shift Schedule</h5>
                <div class="table-responsive">
                  <table class="table table-hover align-middle extra-small">
                    <thead class="table-light">
                      <tr>
                        <th>Shift Name</th>
                        <th>Timing</th>
                        <th>Trade Specialty</th>
                        <th>Assigned Crew</th>
                        <th>Supervisor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="fw-bold">Day Shift A</td>
                        <td>07:00 AM - 03:30 PM</td>
                        <td>Steel Fixers & Welders</td>
                        <td>14 Workers</td>
                        <td>Marcus Brody</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Evening Shift B</td>
                        <td>03:30 PM - 11:30 PM</td>
                        <td>Concrete Shuttering</td>
                        <td>10 Workers</td>
                        <td>Robert Thorne</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Right Sidebar: Crew Summary & Attendance -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-person-badge text-warning me-2"></i> Trade Worker Roster</h5>
                <div class="space-y-2 extra-small">
                  <div class="d-flex align-items-center justify-content-between p-2 bg-light rounded">
                    <div class="d-flex align-items-center gap-2">
                      <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80" class="rounded-circle" width="32" height="32">
                      <div>
                        <div class="fw-bold text-dark">Robert Thorne</div>
                        <div class="text-muted">Master Steel Mason</div>
                      </div>
                    </div>
                    <span class="badge bg-success">On Duty</span>
                  </div>
                </div>
              </div>

              <div class="card card-custom border-0 p-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-bell text-warning me-2"></i> Contractor Alerts</h5>
                <div class="alert alert-info py-2 extra-small mb-0">
                  <i class="bi bi-info-circle me-1"></i> Site Engineer inspection scheduled for 02:00 PM today. Ensure safety harnesses are strapped.
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
export class ContractorDashboardComponent {}

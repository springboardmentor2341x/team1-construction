import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-worker-dashboard',
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
                <span class="badge bg-success text-white px-2 py-1 uppercase">Worker Portal</span>
                <h2 class="fw-bold text-dark mb-0">Daily Worker Shift Portal</h2>
              </div>
              <p class="text-muted small mb-0">Check daily task assignments, site safety instructions, & attendance clock-in status.</p>
            </div>
            <button class="btn btn-success btn-sm d-flex align-items-center gap-2 shadow-sm" (click)="clockIn()">
              <i class="bi bi-clock-fill"></i> {{ clockedIn ? 'Clocked In (07:05 AM)' : 'Clock-In Shift' }}
            </button>
          </div>

          <!-- Top Status Row -->
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Shift Timing Today</span>
                <h4 class="fw-bold text-dark mb-0 mt-1">07:00 AM - 03:30 PM</h4>
                <small class="text-success"><i class="bi bi-geo-alt-fill me-1"></i> Zone 3 - Floor 12 Tower</small>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Attendance Status</span>
                <h4 class="fw-bold text-success mb-0 mt-1">Present (Clocked-In)</h4>
                <small class="text-muted">On time attendance record</small>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card card-custom p-3 border-0">
                <span class="text-muted small fw-semibold">Safety Clearance</span>
                <h4 class="fw-bold text-primary mb-0 mt-1">PPE Verified</h4>
                <small class="text-muted">Hard hat, steel boots & vest</small>
              </div>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="row g-4">
            <!-- Today's Tasks -->
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3"><i class="bi bi-card-checklist me-2 text-warning"></i> Today's Assigned Tasks</h5>
                <div class="list-group list-group-flush space-y-2">
                  <div class="list-group-item p-3 border rounded-3 bg-light">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <strong class="text-dark">Rebar Lapping & Tie Wire Binding - Grid 12C</strong>
                      <span class="badge bg-warning text-dark">In Progress</span>
                    </div>
                    <p class="small text-muted mb-0">Bind #8 deformed rebar cages as per site engineer structural drawing specifications.</p>
                  </div>

                  <div class="list-group-item p-3 border rounded-3 bg-light">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <strong class="text-dark">Safety Scaffold Tie Inspection</strong>
                      <span class="badge bg-success">Completed</span>
                    </div>
                    <p class="small text-muted mb-0">Check safety catch nets on outer edge perimeter wall before crane load hoisting.</p>
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
                    <span class="text-muted">Specialty:</span>
                    <strong>Masonry & Steel</strong>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Contractor Supervisor:</span>
                    <strong>Marcus Brody</strong>
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
export class WorkerDashboardComponent {
  clockedIn = true;

  constructor(public authService: AuthService) {}

  clockIn(): void {
    this.clockedIn = !this.clockedIn;
  }
}

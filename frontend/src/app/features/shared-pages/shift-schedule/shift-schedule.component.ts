import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { AuthService } from '../../../core/services/auth.service';

export interface ShiftEntry {
  id: string;
  workerName: string;
  date: string;
  shiftType: 'Morning' | 'Afternoon' | 'Night';
  shiftStart: string;
  shiftEnd: string;
  location: string;
  project: string;
  status: 'Scheduled' | 'Completed' | 'Absent' | 'On Leave';
}

@Component({
  selector: 'app-shift-schedule',
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
                <li class="breadcrumb-item"><a [routerLink]="dashboardRoute" class="text-decoration-none text-warning">{{ dashboardLabel }}</a></li>
                <li class="breadcrumb-item active">Shift Schedule</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-clock-history me-2 text-warning"></i>Shift Schedule</h2>
              <p class="text-muted small mb-0">View and manage daily shift allocations for all crew members.</p>
            </div>
            <button class="btn btn-bt-accent shadow-sm"><i class="bi bi-plus-lg me-1"></i>Add Shift</button>
          </div>

          <!-- Calendar Week View -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0">Week of {{ weekLabel }}</h6>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" (click)="prevWeek()"><i class="bi bi-chevron-left"></i></button>
                <button class="btn btn-sm btn-outline-secondary" (click)="nextWeek()"><i class="bi bi-chevron-right"></i></button>
                <button class="btn btn-sm btn-warning" (click)="currentWeek()">Today</button>
              </div>
            </div>
            <!-- Day tabs -->
            <div class="d-flex gap-2 overflow-auto pb-2">
              <div *ngFor="let day of weekDays" class="text-center p-2 rounded" style="min-width:100px; cursor:pointer"
                   [ngClass]="selectedDay === day.date ? 'bg-warning' : 'bg-light border'"
                   (click)="selectedDay = day.date">
                <div class="small fw-semibold" [ngClass]="selectedDay === day.date ? 'text-dark' : 'text-muted'">{{ day.dayName }}</div>
                <div class="fw-bold" [ngClass]="selectedDay === day.date ? 'text-dark' : ''">{{ day.dayNum }}</div>
              </div>
            </div>
          </div>

          <!-- Shift Filter -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="d-flex gap-2 align-items-center flex-wrap">
              <select class="form-select form-select-sm" style="max-width:150px" [(ngModel)]="shiftFilter">
                <option value="">All Shifts</option>
                <option value="Morning">Morning (6 AM – 2 PM)</option>
                <option value="Afternoon">Afternoon (2 PM – 10 PM)</option>
                <option value="Night">Night (10 PM – 6 AM)</option>
              </select>
              <select class="form-select form-select-sm" style="max-width:150px" [(ngModel)]="statusFilter">
                <option value="">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
              <button class="btn btn-sm btn-outline-secondary" (click)="shiftFilter=''; statusFilter=''">Reset</button>
            </div>
          </div>

          <!-- Shifts for selected day -->
          <div class="card card-custom border-0 p-4">
            <h6 class="fw-bold mb-3">Shifts for {{ selectedDay }}</h6>
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr><th>Worker</th><th>Shift</th><th>Time</th><th>Location</th><th>Project</th><th>Status</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let shift of filteredShifts()">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="rounded-circle bg-warning text-white fw-bold d-flex align-items-center justify-content-center" style="width:28px;height:28px;font-size:0.65rem">{{ getInitials(shift.workerName) }}</div>
                        <span class="fw-semibold">{{ shift.workerName }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getShiftBadge(shift.shiftType)">{{ shift.shiftType }}</span>
                    </td>
                    <td class="text-muted">{{ shift.shiftStart }} – {{ shift.shiftEnd }}</td>
                    <td class="text-muted">{{ shift.location }}</td>
                    <td class="text-muted small">{{ shift.project }}</td>
                    <td><span class="badge rounded-pill" [ngClass]="getStatusBadge(shift.status)">{{ shift.status }}</span></td>
                  </tr>
                  <tr *ngIf="filteredShifts().length === 0">
                    <td colspan="6" class="text-center py-4 text-muted"><i class="bi bi-calendar-x d-block fs-2 mb-2 opacity-50"></i>No shifts scheduled for this day.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ShiftScheduleComponent {
  shiftFilter = '';
  statusFilter = '';
  selectedDay = '';
  weekLabel = '';
  dashboardRoute = '/dashboard/contractor';
  dashboardLabel = 'Contractor Hub';

  weekDays: { dayName: string; dayNum: string; date: string }[] = [];

  shifts = signal<ShiftEntry[]>([]);

  constructor(private authService: AuthService) {
    const role = authService.getRole();
    if (role === 'Worker') {
      this.dashboardRoute = '/dashboard/worker';
      this.dashboardLabel = 'Worker Portal';
    }
    this.initWeek();
    this.selectedDay = this.getTodayStr(0);
  }

  getTodayStr(offset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  }

  initWeek(): void {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        dayName: days[i],
        dayNum: d.getDate().toString(),
        date: d.toISOString().split('T')[0]
      };
    });
    this.weekLabel = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${this.weekDays[6].dayNum} ${monday.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  }

  prevWeek(): void { const d = new Date(this.weekDays[0].date); d.setDate(d.getDate() - 7); this.initWeek(); }
  nextWeek(): void { const d = new Date(this.weekDays[0].date); d.setDate(d.getDate() + 7); this.initWeek(); }
  currentWeek(): void { this.initWeek(); this.selectedDay = this.getTodayStr(0); }

  filteredShifts() {
    return this.shifts().filter(s =>
      s.date === this.selectedDay &&
      (!this.shiftFilter || s.shiftType === this.shiftFilter) &&
      (!this.statusFilter || s.status === this.statusFilter)
    );
  }

  getInitials = (n: string) => n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
  getShiftBadge = (t: string) => ({ 'Morning': 'bg-warning text-dark', 'Afternoon': 'bg-primary', 'Night': 'bg-dark' }[t] || 'bg-secondary');
  getStatusBadge = (s: string) => ({ 'Scheduled': 'bg-primary', 'Completed': 'bg-success', 'Absent': 'bg-danger', 'On Leave': 'bg-warning text-dark' }[s] || 'bg-secondary');
}

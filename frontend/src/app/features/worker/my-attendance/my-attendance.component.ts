import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';

export interface AttendanceRecord {
  date: string;
  dayName: string;
  shiftType: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  hoursWorked: number;
  location: string;
}

@Component({
  selector: 'app-my-attendance',
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
                <li class="breadcrumb-item active">My Attendance</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-calendar-check me-2 text-warning"></i>My Attendance</h2>
              <p class="text-muted small mb-0">Track your daily check-in/check-out and attendance history.</p>
            </div>
            <div class="card card-custom border-0 p-3 text-center" style="min-width:140px">
              <div class="fw-bold fs-4 text-success">{{ attendanceRate() }}%</div>
              <div class="small text-muted">This Month</div>
              <div class="progress mt-1" style="height:4px"><div class="progress-bar bg-success" [style.width]="attendanceRate() + '%'"></div></div>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3" *ngFor="let s of summary">
              <div class="card card-custom border-0 p-3 text-center">
                <div class="fw-bold fs-4" [ngClass]="s.colorClass">{{ s.count }}</div>
                <div class="small text-muted">{{ s.label }}</div>
              </div>
            </div>
          </div>

          <!-- Month Filter -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="d-flex gap-2 align-items-center flex-wrap">
              <input type="month" class="form-control form-control-sm" style="max-width:180px" [(ngModel)]="monthFilter">
              <select class="form-select form-select-sm" style="max-width:160px" [(ngModel)]="statusFilter">
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="On Leave">On Leave</option>
              </select>
              <button class="btn btn-sm btn-outline-secondary" (click)="statusFilter=''">Reset</button>
            </div>
          </div>

          <!-- Attendance Table -->
          <div class="card card-custom border-0 p-4">
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr><th>Date</th><th>Day</th><th>Shift</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Location</th><th>Status</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of filteredRecords()">
                    <td class="fw-semibold">{{ r.date }}</td>
                    <td class="text-muted">{{ r.dayName }}</td>
                    <td>{{ r.shiftType }}</td>
                    <td class="text-success fw-semibold">{{ r.checkIn || '—' }}</td>
                    <td class="text-danger fw-semibold">{{ r.checkOut || '—' }}</td>
                    <td>
                      <span *ngIf="r.hoursWorked > 0" class="badge bg-light text-dark">{{ r.hoursWorked }}h</span>
                      <span *ngIf="r.hoursWorked === 0" class="text-muted">—</span>
                    </td>
                    <td class="text-muted small">{{ r.location }}</td>
                    <td><span class="badge rounded-pill" [ngClass]="getStatusBadge(r.status)">{{ r.status }}</span></td>
                  </tr>
                  <tr *ngIf="filteredRecords().length === 0">
                    <td colspan="8" class="text-center py-4 text-muted"><i class="bi bi-calendar-x d-block fs-2 mb-2 opacity-50"></i>No records found.</td>
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
export class MyAttendanceComponent {
  monthFilter = new Date().toISOString().slice(0, 7);
  statusFilter = '';

records = signal<AttendanceRecord[]>([]);

  summary = [
    { label: 'Present', count: 0, colorClass: 'text-success' },
    { label: 'Absent', count: 0, colorClass: 'text-danger' },
    { label: 'Late', count: 0, colorClass: 'text-warning' },
    { label: 'On Leave', count: 0, colorClass: 'text-info' }
  ];

  constructor() { this.computeSummary(); }

  computeSummary(): void {
    const r = this.records();
    this.summary[0].count = r.filter(x => x.status === 'Present').length;
    this.summary[1].count = r.filter(x => x.status === 'Absent').length;
    this.summary[2].count = r.filter(x => x.status === 'Late').length;
    this.summary[3].count = r.filter(x => x.status === 'On Leave').length;
  }

  attendanceRate(): number {
    const r = this.records();
    const workDays = r.filter(x => x.status !== 'On Leave');
    const present = workDays.filter(x => x.status === 'Present' || x.status === 'Late').length;
    return workDays.length ? Math.round((present / workDays.length) * 100) : 0;
  }

  filteredRecords() {
    return this.records().filter(r =>
      (!this.statusFilter || r.status === this.statusFilter)
    );
  }

  getStatusBadge = (s: string) => ({ 'Present': 'bg-success', 'Absent': 'bg-danger', 'Late': 'bg-warning text-dark', 'Half Day': 'bg-info text-dark', 'On Leave': 'bg-primary' }[s] || 'bg-secondary');
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';

@Component({
  selector: 'app-system-settings',
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
                <li class="breadcrumb-item"><a routerLink="/dashboard/admin" class="text-decoration-none text-warning">Dashboard</a></li>
                <li class="breadcrumb-item active">System Settings</li>
              </ol></nav>
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-gear-wide-connected me-2 text-warning"></i>System Settings</h2>
              <p class="text-muted small mb-0">Configure system-wide settings, integrations, and security policies.</p>
            </div>
            <button class="btn btn-bt-accent shadow-sm" (click)="saveSettings()"><i class="bi bi-save me-1"></i>Save Changes</button>
          </div>

          <div class="row g-4">
            <!-- General Settings -->
            <div class="col-lg-8">
              <div class="card card-custom border-0 p-4 mb-4">
                <h6 class="fw-bold mb-3"><i class="bi bi-sliders me-2 text-warning"></i>General Configuration</h6>
                <form [formGroup]="generalForm">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Platform Name</label>
                      <input class="form-control form-control-sm" formControlName="platformName">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Support Email</label>
                      <input class="form-control form-control-sm" formControlName="supportEmail" type="email">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Default Timezone</label>
                      <select class="form-select form-select-sm" formControlName="timezone">
                        <option value="UTC">UTC</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Date Format</label>
                      <select class="form-select form-select-sm" formControlName="dateFormat">
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Currency</label>
                      <select class="form-select form-select-sm" formControlName="currency">
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Language</label>
                      <select class="form-select form-select-sm" formControlName="language">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              <!-- Security Settings -->
              <div class="card card-custom border-0 p-4 mb-4">
                <h6 class="fw-bold mb-3"><i class="bi bi-shield-lock me-2 text-warning"></i>Security Policies</h6>
                <form [formGroup]="securityForm">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">Session Timeout (minutes)</label>
                      <input class="form-control form-control-sm" type="number" formControlName="sessionTimeout">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-semibold">JWT Token Expiry (hours)</label>
                      <input class="form-control form-control-sm" type="number" formControlName="tokenExpiry">
                    </div>
                    <div class="col-12">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="mfaSwitch" formControlName="mfaEnabled">
                        <label class="form-check-label small fw-semibold" for="mfaSwitch">Enable Multi-Factor Authentication (MFA)</label>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="auditSwitch" formControlName="auditLogging">
                        <label class="form-check-label small fw-semibold" for="auditSwitch">Enable Audit Logging</label>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="ipSwitch" formControlName="ipWhitelisting">
                        <label class="form-check-label small fw-semibold" for="ipSwitch">Enable IP Whitelisting</label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <!-- Notification Settings -->
              <div class="card card-custom border-0 p-4">
                <h6 class="fw-bold mb-3"><i class="bi bi-bell me-2 text-warning"></i>Notification Preferences</h6>
                <div class="row g-2">
                  <div class="col-12" *ngFor="let pref of notificationPrefs">
                    <div class="d-flex align-items-center justify-content-between p-2 border rounded">
                      <span class="small fw-semibold">{{ pref.label }}</span>
                      <div class="form-check form-switch mb-0">
                        <input class="form-check-input" type="checkbox" [(ngModel)]="pref.enabled" [ngModelOptions]="{standalone: true}">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Panel: Info Cards -->
            <div class="col-lg-4">
              <div class="card card-custom border-0 p-4 mb-3">
                <h6 class="fw-bold mb-3"><i class="bi bi-info-circle me-2 text-info"></i>System Information</h6>
                <ul class="list-group list-group-flush small">
                  <li class="list-group-item d-flex justify-content-between px-0"><span class="text-muted">Platform Version</span><strong>v1.0.0</strong></li>
                  <li class="list-group-item d-flex justify-content-between px-0"><span class="text-muted">Angular Version</span><strong>19.x</strong></li>
                  <li class="list-group-item d-flex justify-content-between px-0"><span class="text-muted">Backend</span><strong>FastAPI + PostgreSQL</strong></li>
                  <li class="list-group-item d-flex justify-content-between px-0"><span class="text-muted">Deployment</span><strong>localhost:8000</strong></li>
                  <li class="list-group-item d-flex justify-content-between px-0"><span class="text-muted">Database</span><strong>construction_db</strong></li>
                </ul>
              </div>

              <div class="card card-custom border-0 p-4">
                <h6 class="fw-bold mb-3"><i class="bi bi-activity me-2 text-success"></i>System Health</h6>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="small">API Server</span>
                  <span class="badge bg-success"><i class="bi bi-circle-fill me-1" style="font-size:8px"></i>Online</span>
                </div>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="small">Database</span>
                  <span class="badge bg-success"><i class="bi bi-circle-fill me-1" style="font-size:8px"></i>Connected</span>
                </div>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="small">Auth Service</span>
                  <span class="badge bg-success"><i class="bi bi-circle-fill me-1" style="font-size:8px"></i>Running</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SystemSettingsComponent {
  generalForm: FormGroup;
  securityForm: FormGroup;

  notificationPrefs = [
    { label: 'Email: New project assignments', enabled: true },
    { label: 'Email: Milestone overdue alerts', enabled: true },
    { label: 'Email: User registration approvals', enabled: false },
    { label: 'System: Budget threshold warnings', enabled: true },
    { label: 'System: Daily activity log digest', enabled: false }
  ];

  constructor(private fb: FormBuilder) {
    this.generalForm = this.fb.group({
      platformName: ['BuildTrack Construction Platform'],
      supportEmail: ['support@buildtrack.com'],
      timezone: ['Asia/Kolkata'],
      dateFormat: ['DD/MM/YYYY'],
      currency: ['INR'],
      language: ['en']
    });
    this.securityForm = this.fb.group({
      sessionTimeout: [30],
      tokenExpiry: [24],
      mfaEnabled: [false],
      auditLogging: [true],
      ipWhitelisting: [false]
    });
  }

  saveSettings(): void {
    console.log('General settings:', this.generalForm.value);
    console.log('Security settings:', this.securityForm.value);
    alert('Settings saved successfully! (API integration pending)');
  }
}

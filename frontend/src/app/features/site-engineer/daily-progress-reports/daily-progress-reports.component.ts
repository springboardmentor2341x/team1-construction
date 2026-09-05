import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RoleSimulatorComponent } from '../../../shared/components/role-simulator/role-simulator.component';
import { SiteProgressService } from '../../../core/services/site-progress.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.enum';
import { Project } from '../../../core/models/project.model';
import { DailyProgressReport, ProgressPhotograph } from '../../../core/models/site-progress.model';

@Component({
  selector: 'app-daily-progress-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, RoleSimulatorComponent],
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
              <h2 class="fw-bold text-dark mb-0"><i class="bi bi-journal-plus me-2 text-warning"></i>Daily Progress Reports</h2>
              <p class="text-muted small mb-0">Record daily site execution, worker attendance, machinery, materials, weather, safety & photographs.</p>
            </div>
            <button *ngIf="canManage()" (click)="openCreateForm()" class="btn btn-bt-accent d-flex align-items-center gap-2 shadow-sm">
              <i class="bi bi-plus-lg"></i> New Daily Report
            </button>
          </div>

          <!-- Project Filter -->
          <div class="card card-custom border-0 p-3 mb-4">
            <div class="row align-items-center">
              <div class="col-md-6">
                <label class="form-label fw-semibold small mb-1">Select Project</label>
                <select (change)="onProjectSelect($event)" class="form-select">
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Create / Edit Report Form -->
          <div class="card card-custom border-0 p-4 mb-4" *ngIf="showForm()">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0">
                <i class="bi bi-pencil-square me-2 text-warning"></i>
                {{ editingReportId() ? 'Edit Daily Progress Report' : 'New Daily Progress Report' }}
              </h6>
              <button class="btn-close" (click)="cancelForm()"></button>
            </div>
            <form [formGroup]="reportForm" (ngSubmit)="submitReport()">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Report Date *</label>
                  <input type="date" class="form-control form-control-sm" formControlName="reportDate">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Progress Category *</label>
                  <select class="form-select form-select-sm" formControlName="progressCategory">
                    <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Progress Percentage *</label>
                  <input type="number" min="0" max="100" class="form-control form-control-sm" formControlName="progressPercentage">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Weather Conditions</label>
                  <select class="form-select form-select-sm" formControlName="weatherConditions">
                    <option value="Sunny">☀️ Sunny</option>
                    <option value="Cloudy">⛅ Cloudy</option>
                    <option value="Rainy">🌧️ Rainy</option>
                    <option value="Windy">💨 Windy</option>
                    <option value="Storm">⛈️ Storm</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Work Completed / Activity Performed *</label>
                  <textarea class="form-control form-control-sm" rows="2" formControlName="workCompleted" placeholder="Describe work executed..."></textarea>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Contractor</label>
                  <input type="text" class="form-control form-control-sm" formControlName="contractor" placeholder="e.g. Marcus Brody">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Worker Attendance Shift</label>
                  <input type="text" class="form-control form-control-sm" formControlName="workerAttendance" placeholder="e.g. Morning Shift">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Workers Present</label>
                  <input type="number" min="0" class="form-control form-control-sm" formControlName="workerCount" placeholder="e.g. 42">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Workers Absent</label>
                  <input type="number" min="0" class="form-control form-control-sm" formControlName="workerAbsent" placeholder="e.g. 3">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Worker Hours Utilized</label>
                  <input type="number" step="0.5" min="0" class="form-control form-control-sm" formControlName="workerHours" placeholder="e.g. 336">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Cost Incurred (₹)</label>
                  <input type="number" min="0" class="form-control form-control-sm" formControlName="costIncurred" placeholder="e.g. 1500">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Machinery Used</label>
                  <input type="text" class="form-control form-control-sm" formControlName="machineryUsed" placeholder="e.g. Tower Crane TC-480, Concrete Pump">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Materials Consumed</label>
                  <input type="text" class="form-control form-control-sm" formControlName="materialsConsumed" placeholder="e.g. Rebar 12T, Concrete 64 m3">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Safety Observations</label>
                  <input type="text" class="form-control form-control-sm" formControlName="safetyObservations">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Quality Inspection Remarks</label>
                  <input type="text" class="form-control form-control-sm" formControlName="qualityInspectionRemarks">
                </div>
                <div class="col-md-4" *ngIf="!editingReportId()">
                  <label class="form-label small fw-semibold">Photo URL</label>
                  <input type="text" class="form-control form-control-sm" formControlName="photoUrl" placeholder="https://... (optional)">
                </div>
                <div class="col-md-4">
                  <div class="form-check form-switch mt-4">
                    <input class="form-check-input" type="checkbox" id="delaysSwitch" formControlName="delays">
                    <label class="form-check-label small fw-semibold" for="delaysSwitch">Delays Occurred</label>
                  </div>
                </div>
                <div class="col-md-8">
                  <label class="form-label small fw-semibold">Delay Reasons</label>
                  <input type="text" class="form-control form-control-sm" formControlName="delayReasons">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold">Additional Comments</label>
                  <textarea class="form-control form-control-sm" rows="2" formControlName="comments"></textarea>
                </div>
                <div class="col-12 d-flex gap-2 justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary" (click)="cancelForm()">Cancel</button>
                  <button type="submit" class="btn btn-bt-accent btn-sm" [disabled]="reportForm.invalid || submitting()">
                    <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-1"></span>
                    {{ editingReportId() ? 'Update Report' : 'Save Report' }}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Reports Table -->
          <div class="card card-custom border-0 p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0">
                <i class="bi bi-database-check me-2 text-success"></i>Submitted Daily Reports 
                <span class="badge bg-secondary ms-1">{{ reports().length }}</span>
              </h6>
            </div>
            <div class="table-responsive">
              <table class="table table-hover small align-middle">
                <thead class="table-light text-muted">
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Work Completed</th>
                    <th>Workers (P/A)</th>
                    <th>Progress %</th>
                    <th>Weather</th>
                    <th>Delays</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of reports()">
                    <td class="fw-semibold">{{ r.reportDate }}</td>
                    <td><span class="badge bg-light text-dark border">{{ r.progressCategory }}</span></td>
                    <td class="text-muted" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ r.workCompleted }}</td>
                    <td>
                      <span class="badge bg-success-subtle text-success me-1">{{ r.workerCount || 0 }} P</span>
                      <span class="badge bg-danger-subtle text-danger">{{ r.workerAbsent || 0 }} A</span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center gap-1">
                        <div class="progress flex-grow-1" style="height:6px;width:50px">
                          <div class="progress-bar bg-warning" [style.width.%]="r.progressPercentage"></div>
                        </div>
                        <span class="fw-bold">{{ r.progressPercentage }}%</span>
                      </div>
                    </td>
                    <td>{{ r.weatherConditions }}</td>
                    <td>
                      <span *ngIf="r.delays" class="badge bg-danger-subtle text-danger"><i class="bi bi-exclamation-triangle me-1"></i>Yes</span>
                      <span *ngIf="!r.delays" class="badge bg-success-subtle text-success">No</span>
                    </td>
                    <td><span class="badge rounded-pill" [ngClass]="getStatusClass(r.status)">{{ r.status }}</span></td>
                    <td class="text-end">
                      <button (click)="openViewModal(r)" class="btn btn-sm btn-outline-secondary me-1" title="View Full Details"><i class="bi bi-eye"></i></button>
                      <button (click)="openPhotoModal(r)" class="btn btn-sm btn-outline-info me-1" title="Photographs Gallery"><i class="bi bi-images"></i> {{ r.photographs?.length || 0 }}</button>
                      <button *ngIf="canManage()" (click)="openEditForm(r)" class="btn btn-sm btn-outline-warning me-1" title="Edit Report"><i class="bi bi-pencil"></i></button>
                      <button *ngIf="canDelete()" (click)="deleteReport(r.id)" class="btn btn-sm btn-outline-danger" title="Delete"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                  <tr *ngIf="reports().length === 0">
                    <td colspan="9" class="text-center py-4 text-muted"><i class="bi bi-journal-x d-block fs-3 mb-2"></i>No daily progress reports recorded.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed View Modal -->
    <div class="modal fade show d-block bg-dark bg-opacity-50" tabindex="-1" *ngIf="selectedReportForView">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-journal-text me-2 text-warning"></i>Daily Report Details ({{ selectedReportForView.reportDate }})</h5>
            <button type="button" class="btn-close" (click)="selectedReportForView = null"></button>
          </div>
          <div class="modal-body p-4 small">
            <div class="row g-3">
              <div class="col-md-4"><strong>Progress Category:</strong> <span class="badge bg-light text-dark border ms-1">{{ selectedReportForView.progressCategory }}</span></div>
              <div class="col-md-4"><strong>Completion %:</strong> <span class="fw-bold text-warning">{{ selectedReportForView.progressPercentage }}%</span></div>
              <div class="col-md-4"><strong>Weather:</strong> {{ selectedReportForView.weatherConditions }}</div>

              <div class="col-12"><hr class="my-1"></div>
              <div class="col-12"><strong>Work Completed / Activity Performed:</strong><p class="text-muted mb-0 mt-1 bg-light p-2 rounded">{{ selectedReportForView.workCompleted }}</p></div>

              <div class="col-md-6"><strong>Contractor:</strong> {{ selectedReportForView.contractor || 'N/A' }}</div>
              <div class="col-md-6"><strong>Worker Attendance Shift:</strong> {{ selectedReportForView.workerAttendance || 'N/A' }}</div>
              <div class="col-md-4"><strong>Workers Present:</strong> <span class="badge bg-success-subtle text-success">{{ selectedReportForView.workerCount || 0 }}</span></div>
              <div class="col-md-4"><strong>Workers Absent:</strong> <span class="badge bg-danger-subtle text-danger">{{ selectedReportForView.workerAbsent || 0 }}</span></div>
              <div class="col-md-4"><strong>Worker Hours:</strong> {{ selectedReportForView.workerHours || 0 }} hrs</div>

              <div class="col-12"><hr class="my-1"></div>
              <div class="col-md-6"><strong>Machinery Used:</strong> {{ selectedReportForView.machineryUsed || 'None' }}</div>
              <div class="col-md-6"><strong>Materials Consumed:</strong> {{ selectedReportForView.materialsConsumed || 'None' }}</div>

              <div class="col-md-6"><strong>Safety Observations:</strong> {{ selectedReportForView.safetyObservations || 'None' }}</div>
              <div class="col-md-6"><strong>Quality Remarks:</strong> {{ selectedReportForView.qualityInspectionRemarks || 'None' }}</div>

              <div class="col-md-4"><strong>Delays Flagged:</strong> <span [ngClass]="selectedReportForView.delays ? 'text-danger fw-bold' : 'text-success'">{{ selectedReportForView.delays ? 'Yes' : 'No' }}</span></div>
              <div class="col-md-8"><strong>Delay Reasons:</strong> {{ selectedReportForView.delayReasons || 'N/A' }}</div>

              <div class="col-12"><strong>Additional Comments:</strong><p class="text-muted mb-0 mt-1 bg-light p-2 rounded">{{ selectedReportForView.comments || 'None' }}</p></div>
              <div class="col-12 text-muted extra-small">Reported by: <strong>{{ selectedReportForView.reportedBy }}</strong> | Status: <strong>{{ selectedReportForView.status }}</strong></div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary btn-sm" (click)="selectedReportForView = null">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Gallery / Attachment Modal -->
    <div class="modal fade show d-block bg-dark bg-opacity-50" tabindex="-1" *ngIf="selectedReportForPhotos">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-images me-2 text-info"></i>Progress Photographs ({{ selectedReportForPhotos.reportDate }})</h5>
            <button type="button" class="btn-close" (click)="selectedReportForPhotos = null"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Upload / Add Photo Section -->
            <div class="card p-3 mb-4 bg-light border-0" *ngIf="canManage()">
              <h6 class="fw-bold mb-2 small"><i class="bi bi-cloud-upload me-1 text-primary"></i>Attach Progress Photo</h6>
              <div class="row g-2">
                <div class="col-md-8">
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="newPhotoUrl" placeholder="Image URL (e.g. https://images.unsplash.com/photo-...)">
                </div>
                <div class="col-md-4">
                  <button (click)="addPhotoToReport()" class="btn btn-sm btn-bt-accent w-100" [disabled]="!newPhotoUrl || submittingPhoto()">
                    <span *ngIf="submittingPhoto()" class="spinner-border spinner-border-sm me-1"></span>
                    Attach Photo
                  </button>
                </div>
              </div>
            </div>

            <!-- Photos Grid -->
            <div class="row g-3">
              <div class="col-md-6" *ngFor="let photo of reportPhotos()">
                <div class="card h-100 border rounded-3 overflow-hidden shadow-sm">
                  <img [src]="photo.photoUrl" class="card-img-top" style="height:200px;object-fit:cover" alt="Progress Photograph">
                  <div class="card-body p-2 d-flex justify-content-between align-items-center">
                    <span class="small text-muted">{{ photo.caption || 'Site Photograph' }}</span>
                    <button *ngIf="canManage()" (click)="deletePhoto(photo.id)" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
              <div class="col-12 text-center text-muted py-4" *ngIf="reportPhotos().length === 0">
                <i class="bi bi-image d-block fs-2 mb-2"></i>No progress photographs attached to this report yet.
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary btn-sm" (click)="selectedReportForPhotos = null">Close Gallery</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ['.extra-small { font-size: 0.78rem; }']
})
export class DailyProgressReportsComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId = '';
  categories: string[] = [];
  reportForm: FormGroup;
  showForm = signal(false);
  editingReportId = signal<string | null>(null);
  submitting = signal(false);
  reports = signal<DailyProgressReport[]>([]);

  selectedReportForView: DailyProgressReport | null = null;
  selectedReportForPhotos: DailyProgressReport | null = null;
  reportPhotos = signal<ProgressPhotograph[]>([]);
  newPhotoUrl = '';
  submittingPhoto = signal(false);

  constructor(
    private fb: FormBuilder,
    private siteProgressService: SiteProgressService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {
    this.reportForm = this.fb.group({
      reportDate: [new Date().toISOString().split('T')[0], Validators.required],
      progressCategory: ['Foundation', Validators.required],
      workCompleted: ['', Validators.required],
      progressPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      contractor: [''],
      workerAttendance: [''],
      workerCount: [0, [Validators.min(0)]],
      workerAbsent: [0, [Validators.min(0)]],
      workerHours: [0, [Validators.min(0)]],
      costIncurred: [0, [Validators.min(0)]],
      machineryUsed: [''],
      materialsConsumed: [''],
      weatherConditions: ['Sunny'],
      safetyObservations: [''],
      qualityInspectionRemarks: [''],
      delays: [false],
      delayReasons: [''],
      comments: [''],
      photoUrl: ['']
    });
  }

  ngOnInit(): void {
    this.siteProgressService.getProgressCategories().subscribe(c => {
      this.categories = c.length ? c : ['Civil Work', 'Foundation', 'Structural Work', 'Electrical Work', 'Plumbing Work', 'Finishing Work', 'Inspection Work'];
    });
    this.projectService.getProjects().subscribe(projs => {
      this.projects = projs;
      if (projs.length) {
        this.selectedProjectId = projs[0].id;
        this.loadReports();
      }
    });
  }

  onProjectSelect(event: any): void {
    this.selectedProjectId = event.target.value;
    this.loadReports();
  }

  loadReports(): void {
    this.siteProgressService.getDailyReports(this.selectedProjectId).subscribe(r => this.reports.set(r));
  }

  openCreateForm(): void {
    this.editingReportId.set(null);
    this.showForm.set(true);
    this.reportForm.reset({
      reportDate: new Date().toISOString().split('T')[0],
      progressCategory: 'Foundation',
      workCompleted: '',
      progressPercentage: 0,
      workerCount: 0,
      workerAbsent: 0,
      workerHours: 0,
      costIncurred: 0,
      weatherConditions: 'Sunny',
      delays: false
    });
  }

  openEditForm(report: DailyProgressReport): void {
    this.editingReportId.set(report.id);
    this.showForm.set(true);
    this.reportForm.patchValue({
      reportDate: report.reportDate,
      progressCategory: report.progressCategory,
      workCompleted: report.workCompleted,
      progressPercentage: report.progressPercentage,
      contractor: report.contractor || '',
      workerAttendance: report.workerAttendance || '',
      workerCount: report.workerCount || 0,
      workerAbsent: report.workerAbsent || 0,
      workerHours: report.workerHours || 0,
      machineryUsed: report.machineryUsed || '',
      materialsConsumed: report.materialsConsumed || '',
      weatherConditions: report.weatherConditions || 'Sunny',
      safetyObservations: report.safetyObservations || '',
      qualityInspectionRemarks: report.qualityInspectionRemarks || '',
      delays: !!report.delays,
      delayReasons: report.delayReasons || '',
      comments: report.comments || ''
    });
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingReportId.set(null);
  }

  submitReport(): void {
    if (this.reportForm.invalid || !this.selectedProjectId) return;
    this.submitting.set(true);
    const value = this.reportForm.value;

    const payload: any = {
      projectId: this.selectedProjectId,
      reportDate: value.reportDate,
      progressCategory: value.progressCategory,
      workCompleted: value.workCompleted,
      progressPercentage: Number(value.progressPercentage) || 0,
      contractor: value.contractor,
      workerAttendance: value.workerAttendance,
      workerCount: Number(value.workerCount) || 0,
      workerAbsent: Number(value.workerAbsent) || 0,
      workerHours: Number(value.workerHours) || 0,
      costIncurred: Number(value.costIncurred) || 0,
      machineryUsed: value.machineryUsed,
      materialsConsumed: value.materialsConsumed,
      weatherConditions: value.weatherConditions,
      safetyObservations: value.safetyObservations,
      qualityInspectionRemarks: value.qualityInspectionRemarks,
      delays: !!value.delays,
      delayReasons: value.delayReasons,
      comments: value.comments
    };

    if (this.editingReportId()) {
      this.siteProgressService.updateDailyReport(this.editingReportId()!, payload).subscribe({
        next: () => {
          this.loadReports();
          this.cancelForm();
          this.submitting.set(false);
        },
        error: () => this.submitting.set(false)
      });
    } else {
      if (value.photoUrl) payload.photographUrls = [value.photoUrl];
      this.siteProgressService.createDailyReport(payload).subscribe({
        next: () => {
          this.loadReports();
          this.cancelForm();
          this.submitting.set(false);
        },
        error: () => this.submitting.set(false)
      });
    }
  }

  deleteReport(id: string): void {
    if (confirm('Delete this daily progress report?')) {
      this.siteProgressService.deleteDailyReport(id).subscribe(() => this.loadReports());
    }
  }

  openViewModal(report: DailyProgressReport): void {
    this.selectedReportForView = report;
  }

  openPhotoModal(report: DailyProgressReport): void {
    this.selectedReportForPhotos = report;
    this.newPhotoUrl = '';
    this.loadPhotosForReport(report.id);
  }

  loadPhotosForReport(reportId: string): void {
    this.siteProgressService.getPhotographs(reportId).subscribe(photos => this.reportPhotos.set(photos));
  }

  addPhotoToReport(): void {
    if (!this.newPhotoUrl || !this.selectedReportForPhotos) return;
    this.submittingPhoto.set(true);
    this.siteProgressService.addPhotograph({
      reportId: this.selectedReportForPhotos.id,
      photoUrl: this.newPhotoUrl
    }).subscribe({
      next: () => {
        this.newPhotoUrl = '';
        this.loadPhotosForReport(this.selectedReportForPhotos!.id);
        this.loadReports();
        this.submittingPhoto.set(false);
      },
      error: () => this.submittingPhoto.set(false)
    });
  }

  deletePhoto(photoId: string): void {
    if (confirm('Delete this photograph?')) {
      this.siteProgressService.deletePhotograph(photoId).subscribe(() => {
        if (this.selectedReportForPhotos) {
          this.loadPhotosForReport(this.selectedReportForPhotos.id);
          this.loadReports();
        }
      });
    }
  }

  canManage(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.SITE_ENGINEER || role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  canDelete(): boolean {
    const role = this.authService.getRole();
    return role === UserRole.ADMINISTRATOR || role === UserRole.PROJECT_MANAGER;
  }

  getStatusClass(status: string): string {
    return { Approved: 'bg-success', Pending: 'bg-warning text-dark', Rejected: 'bg-danger' }[status] || 'bg-secondary';
  }
}

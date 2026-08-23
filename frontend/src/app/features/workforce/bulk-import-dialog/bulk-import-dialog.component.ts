import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkforceService } from '../../../core/services/workforce.service';
import { WorkerBulkImportItem, WorkerBulkImportResult } from '../../../core/models/workforce.model';

@Component({
  selector: 'app-bulk-import-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-file-earmark-spreadsheet-fill me-2 text-warning"></i>
              Bulk Worker Registration (CSV / JSON Import)
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="close.emit()"></button>
          </div>

          <div class="modal-body p-4">
            <p class="text-muted small mb-3">
              Upload a structured <strong>CSV file</strong> or paste CSV lines to register multiple workers simultaneously with validation.
            </p>

            <!-- File Upload -->
            <div class="mb-3">
              <label class="form-label small fw-bold">Select CSV File</label>
              <input type="file" class="form-control" (change)="onFileSelected($event)" accept=".csv,.txt">
            </div>

            <!-- CSV Template Download / Info -->
            <div class="p-3 bg-light rounded border mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-semibold text-dark small"><i class="bi bi-info-circle-fill text-warning me-1"></i> Expected CSV Format Columns:</span>
                <button type="button" class="btn btn-sm btn-link text-decoration-none p-0 text-warning" (click)="loadSampleCsv()">Load Sample Data</button>
              </div>
              <code class="d-block small text-dark p-2 bg-white rounded border">
                workerId,workerName,contactInformation,categoryName,skillOrWorkType,contractorEmailOrId,projectCodeOrId,joiningDate,payRate
              </code>
            </div>

            <!-- CSV Raw Textarea -->
            <div class="mb-3">
              <label class="form-label small fw-bold">CSV Raw Data / Paste Area</label>
              <textarea class="form-control font-monospace small" rows="6" [(ngModel)]="csvText" placeholder="Paste CSV rows here..."></textarea>
            </div>

            <!-- Result Report Banner -->
            <div *ngIf="importResult" class="mt-3">
              <div class="alert" [ngClass]="importResult.failureCount > 0 ? 'alert-warning' : 'alert-success'">
                <div class="fw-bold fs-6">
                  Import Summary: {{ importResult.successCount }} Succeeded, {{ importResult.failureCount }} Failed (Total {{ importResult.totalProcessed }})
                </div>
                <div *ngIf="importResult.errors.length" class="mt-2 text-danger small">
                  <div class="fw-bold">Validation Errors:</div>
                  <ul class="mb-0 ps-3">
                    <li *ngFor="let err of importResult.errors">{{ err }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="mt-4 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-outline-secondary" (click)="close.emit()">Close</button>
              <button type="button" class="btn btn-bt-accent px-4" (click)="processImport()" [disabled]="importing || !csvText.trim()">
                <span *ngIf="importing" class="spinner-border spinner-border-sm me-1"></span>
                Process Bulk Registration
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class BulkImportDialogComponent {
  @Output() close = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

  csvText = '';
  importing = false;
  importResult: WorkerBulkImportResult | null = null;

  constructor(private workforceService: WorkforceService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.csvText = e.target.result;
    };
    reader.readAsText(file);
  }

  loadSampleCsv(): void {
    this.csvText = `workerId,workerName,contactInformation,categoryName,skillOrWorkType,contractorEmailOrId,projectCodeOrId,joiningDate,payRate
WRK-2026-101,John Anderson,+1 555-0201,Skilled Workers,Steel Fabrication,contractor@buildtrack.com,BT-PRJ-2026-01,2026-08-01,650
WRK-2026-102,David Miller,+1 555-0202,Engineers,Civil Engineering,,BT-PRJ-2026-01,2026-08-01,1200
WRK-2026-103,Sarah Connor,+1 555-0203,Supervisors,Site Safety Inspection,contractor@buildtrack.com,BT-PRJ-2026-01,2026-08-02,800
WRK-2026-104,Mike Ross,+1 555-0204,Unskilled Workers,General Excavation Labor,contractor@buildtrack.com,BT-PRJ-2026-02,2026-08-02,400`;
  }

  processImport(): void {
    if (!this.csvText.trim()) return;

    this.importing = true;
    this.importResult = null;

    const items: WorkerBulkImportItem[] = [];
    const lines = this.csvText.trim().split('\n');

    let startIndex = 0;
    if (lines[0].toLowerCase().includes('workerid')) {
      startIndex = 1; // Skip header
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 3) {
        items.push({
          workerId: cols[0],
          workerName: cols[1],
          contactInformation: cols[2] || '',
          categoryName: cols[3] || 'Skilled Workers',
          skillOrWorkType: cols[4] || 'General Construction',
          contractorEmailOrId: cols[5] || '',
          projectCodeOrId: cols[6] || '',
          joiningDate: cols[7] || new Date().toISOString().split('T')[0],
          payRate: parseFloat(cols[8]) || 500
        });
      }
    }

    if (items.length === 0) {
      this.importing = false;
      alert('No valid worker rows were parsed from the input CSV.');
      return;
    }

    this.workforceService.bulkImportWorkers(items).subscribe({
      next: (res) => {
        this.importing = false;
        this.importResult = res;
        if (res.successCount > 0) {
          this.completed.emit();
        }
      },
      error: (err) => {
        this.importing = false;
        alert(err?.error?.detail || 'Bulk import request failed.');
      }
    });
  }
}

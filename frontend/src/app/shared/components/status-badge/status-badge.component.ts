import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="getBadgeClass()" class="badge-status shadow-sm d-inline-flex align-items-center gap-1">
      <i [ngClass]="getIconClass()"></i>
      {{ status }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status: string = 'Planning';

  getBadgeClass(): string {
    switch (this.status) {
      case 'Planning': return 'status-planning';
      case 'In Progress': return 'status-in-progress';
      case 'On Hold': return 'status-on-hold';
      case 'Completed': return 'status-completed';
      case 'Closed': return 'status-closed';
      case 'Pending': return 'status-pending';
      case 'Delayed': return 'status-delayed';
      default: return 'bg-secondary text-white';
    }
  }

  getIconClass(): string {
    switch (this.status) {
      case 'Planning': return 'bi bi-compass';
      case 'In Progress': return 'bi bi-play-circle-fill';
      case 'On Hold': return 'bi bi-pause-circle-fill';
      case 'Completed': return 'bi bi-check-circle-fill';
      case 'Closed': return 'bi bi-lock-fill';
      case 'Pending': return 'bi bi-clock';
      case 'Delayed': return 'bi bi-exclamation-triangle-fill';
      default: return 'bi bi-circle';
    }
  }
}

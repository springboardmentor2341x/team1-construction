import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Role Simulator is intentionally disabled to prevent mock login bypass.
 * Authentication/role switching is only possible through the real backend.
 */
@Component({
  selector: 'app-role-simulator',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  styles: [``]
})
export class RoleSimulatorComponent {}

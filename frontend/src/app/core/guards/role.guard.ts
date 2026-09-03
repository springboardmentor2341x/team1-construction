import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { UserRole } from '../models/role.enum';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const roleService = inject(RoleService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as UserRole[] | undefined;
  const currentRole = authService.getRole();

  if (!allowedRoles || (currentRole && allowedRoles.includes(currentRole))) {
    return true;
  }

  // Redirect to role-appropriate dashboard if access is denied
  const redirectUrl = roleService.getDashboardRouteForRole(currentRole);
  router.navigate([redirectUrl]);
  return false;
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentRole = authService.getCurrentUserRole();

  if (currentRole === 'SUPER_ADMIN') {
    return true;
  }

  const allowedRoles: Role[] = route.data['roles'] ?? [];

  if (currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

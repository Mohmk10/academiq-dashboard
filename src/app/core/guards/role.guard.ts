import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: Role[] = route.data['roles'] ?? [];

  if (authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

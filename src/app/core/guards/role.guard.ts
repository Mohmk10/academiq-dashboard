import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole: string = payload.role;
    const allowedRoles: string[] = route.data['roles'] ?? [];

    if (!allowedRoles.includes(userRole)) {
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  } catch {
    router.navigate(['/login']);
    return false;
  }
};

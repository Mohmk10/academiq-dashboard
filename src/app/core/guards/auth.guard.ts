import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  if (authService.getRefreshToken()) {
    return authService.refreshToken().pipe(
      map(response => response.success),
      catchError(() => {
        authService.handleSessionExpired();
        return of(false);
      })
    );
  }

  router.navigate(['/login']);
  return false;
};

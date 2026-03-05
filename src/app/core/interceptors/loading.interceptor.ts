import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { HttpLoadingService } from '../services/http-loading.service';

const SILENT_PATTERNS = [
  '/auth/me',
  '/auth/refresh',
  '/alertes/statistiques',
  '/analytics/system-stats',
  '/analytics/audit-logs/recent'
];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const isSilent = SILENT_PATTERNS.some(p => req.url.includes(p));
  if (isSilent) {
    return next(req);
  }

  const loadingService = inject(HttpLoadingService);
  loadingService.show();
  return next(req).pipe(finalize(() => loadingService.hide()));
};

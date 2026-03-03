import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { HttpLoadingService } from '../services/http-loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(HttpLoadingService);
  loadingService.show();
  return next(req).pipe(finalize(() => loadingService.hide()));
};

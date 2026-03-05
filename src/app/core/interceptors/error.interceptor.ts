import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError(error => {
      if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh') || req.url.includes('/auth/me')) {
        return throwError(() => error);
      }


      const message = getErrorMessage(error);
      notification.error(message);

      return throwError(() => error);
    })
  );
};

function getErrorMessage(error: any): string {
  if (error.status === 0 || !error.status) {
    return 'Impossible de contacter le serveur';
  }

  const backendMessage = error.error?.message;

  switch (error.status) {
    case 400:
      return backendMessage || 'Requête invalide';
    case 403:
      return 'Accès non autorisé';
    case 404:
      return 'Ressource non trouvée';
    case 409:
      return backendMessage || 'Conflit : cette ressource existe déjà';
    case 500:
      return 'Une erreur interne est survenue';
    default:
      return backendMessage || 'Une erreur est survenue';
  }
}

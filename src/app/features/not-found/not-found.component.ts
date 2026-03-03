import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div class="text-center fade-in-up">
        <p class="text-7xl font-bold text-gray-200 mb-6">404</p>
        <h1 class="text-lg font-semibold text-gray-600 mb-2">Page non trouvée</h1>
        <p class="text-sm text-gray-400 mb-8">La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <a routerLink="/dashboard" class="btn-primary">
          <i class="fas fa-home mr-2"></i> Retour au tableau de bord
        </a>
      </div>
    </div>
  `
})
export default class NotFoundComponent {}

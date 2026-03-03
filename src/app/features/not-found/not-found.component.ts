import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div class="text-center max-w-md">
        <div class="relative mb-8">
          <div class="text-[160px] font-black text-primary/5 leading-none select-none">404</div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center">
              <i class="fas fa-graduation-cap text-4xl text-secondary"></i>
            </div>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-primary mb-2">Page non trouvée</h1>
        <p class="text-gray-500 mb-8">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <a mat-raised-button routerLink="/dashboard" class="!bg-secondary !text-white">
          <i class="fas fa-home mr-2"></i> Retour au tableau de bord
        </a>
      </div>
    </div>
  `
})
export default class NotFoundComponent {}

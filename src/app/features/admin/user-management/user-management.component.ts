import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Gestion des utilisateurs</h1>
        <p class="text-sm text-gray-500 mt-1">Gerez les comptes et les roles des utilisateurs de la plateforme</p>
      </div>
      <div class="card p-12 text-center text-gray-400">
        <i class="fas fa-users-gear text-4xl mb-3"></i>
        <p>Module en cours de developpement</p>
      </div>
    </div>
  `
})
export default class UserManagementComponent {}

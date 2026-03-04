import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EnseignantDashboardComponent } from './enseignant-dashboard/enseignant-dashboard.component';
import { EtudiantDashboardComponent } from './etudiant-dashboard/etudiant-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, EnseignantDashboardComponent, EtudiantDashboardComponent],
  template: `
    @if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'RESPONSABLE_PEDAGOGIQUE') {
      <app-admin-dashboard />
    } @else if (role === 'ENSEIGNANT') {
      <app-enseignant-dashboard />
    } @else if (role === 'ETUDIANT') {
      <app-etudiant-dashboard />
    } @else {
      <div class="p-6 text-center text-gray-500">
        <i class="fas fa-spinner fa-spin text-2xl"></i>
        <p class="mt-2">Chargement du tableau de bord...</p>
      </div>
    }
  `
})
export default class DashboardComponent {
  role: string | null;

  constructor(private authService: AuthService) {
    this.role = this.authService.getCurrentUserRole();
  }
}

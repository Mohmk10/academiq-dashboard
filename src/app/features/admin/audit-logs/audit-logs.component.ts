import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Logs d'audit</h1>
        <p class="text-sm text-gray-500 mt-1">Consultez l'historique des actions effectuees sur la plateforme</p>
      </div>
      <div class="card p-12 text-center text-gray-400">
        <i class="fas fa-clipboard-list text-4xl mb-3"></i>
        <p>Module en cours de developpement</p>
      </div>
    </div>
  `
})
export default class AuditLogsComponent {}

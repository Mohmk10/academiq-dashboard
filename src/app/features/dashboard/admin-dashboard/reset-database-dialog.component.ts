import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-reset-database-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title class="!text-red-600 !font-bold">
      <i class="fas fa-triangle-exclamation mr-2"></i>Reinitialiser la base de donnees
    </h2>

    <mat-dialog-content>
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-sm font-semibold text-red-800 mb-2">Cette action est irreversible et entrainera :</p>
        <ul class="text-sm text-red-700 space-y-1 list-disc list-inside">
          <li>La suppression de toutes les donnees (utilisateurs, notes, alertes...)</li>
          <li>L'invalidation de toutes les sessions actives</li>
          <li>La deconnexion de tous les utilisateurs</li>
        </ul>
      </div>

      <p class="text-sm text-gray-700 mb-2">
        Pour confirmer, tapez <strong class="text-red-600">RESET</strong> dans le champ ci-dessous :
      </p>
      <input
        type="text"
        [(ngModel)]="confirmText"
        placeholder="Tapez RESET"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        autocomplete="off"
      />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-dialog-close
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
        Annuler
      </button>
      <button (click)="confirm()"
              [disabled]="confirmText !== 'RESET'"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2">
        Reinitialiser
      </button>
    </mat-dialog-actions>
  `
})
export class ResetDatabaseDialogComponent {
  confirmText = '';

  constructor(private dialogRef: MatDialogRef<ResetDatabaseDialogComponent>) {}

  confirm(): void {
    if (this.confirmText === 'RESET') {
      this.dialogRef.close(true);
    }
  }
}

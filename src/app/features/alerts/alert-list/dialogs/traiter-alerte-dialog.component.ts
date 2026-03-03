import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AlerteResponse } from '../../../../core/models/alerte.model';

@Component({
  selector: 'app-traiter-alerte-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="!text-lg !font-semibold">Traiter l'alerte</h2>
    <mat-dialog-content>
      <div class="space-y-4 pt-2">
        <div class="bg-gray-50 rounded-lg p-4 space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getTypeBadgeClass()">{{ getTypeLabel() }}</span>
          </div>
          <p class="text-sm font-medium">{{ data.alerte.etudiantNom }}</p>
          <p class="text-xs text-gray-500 font-mono">{{ data.alerte.etudiantMatricule }}</p>
          <p class="text-sm text-gray-600 mt-1">{{ data.alerte.message }}</p>
          @if (data.alerte.valeurNote !== undefined && data.alerte.seuil !== undefined) {
            <div class="flex gap-4 text-sm mt-2">
              <span class="text-danger">Valeur : {{ data.alerte.valeurNote }}/20</span>
              <span class="text-gray-400">Seuil : {{ data.alerte.seuil }}/20</span>
            </div>
          }
        </div>
        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
          <mat-label>Commentaire de traitement</mat-label>
          <textarea matInput [formControl]="commentaire" rows="3" placeholder="Décrivez les actions entreprises..."></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!pt-4">
      <button mat-stroked-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" [disabled]="commentaire.invalid" (click)="onSubmit()">Traiter</button>
    </mat-dialog-actions>
  `
})
export class TraiterAlerteDialogComponent {
  commentaire = new FormControl('', Validators.required);

  constructor(
    public dialogRef: MatDialogRef<TraiterAlerteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { alerte: AlerteResponse; action: 'traiter' | 'ignorer' }
  ) {}

  getTypeLabel(): string {
    const labels: Record<string, string> = { NOTE_BASSE: 'Note basse', ABSENCE_NOTE: 'Absence', MOYENNE_FAIBLE: 'Moyenne faible', RISQUE_ECHEC: 'Risque échec', CUSTOM: 'Personnalisée' };
    return labels[this.data.alerte.type] || this.data.alerte.type;
  }

  getTypeBadgeClass(): string {
    const classes: Record<string, string> = { NOTE_BASSE: 'bg-red-100 text-danger', ABSENCE_NOTE: 'bg-orange-100 text-warning', MOYENNE_FAIBLE: 'bg-amber-100 text-amber-700', RISQUE_ECHEC: 'bg-red-100 text-danger', CUSTOM: 'bg-gray-100 text-gray-600' };
    return classes[this.data.alerte.type] || 'bg-gray-100 text-gray-600';
  }

  onCancel(): void { this.dialogRef.close(); }
  onSubmit(): void { this.dialogRef.close({ commentaire: this.commentaire.value }); }
}

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AlerteResponse } from '../../../../core/models/alerte.model';

@Component({
  selector: 'app-traiter-alerte-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">Traiter l'alerte</h2>
        <p class="dialog-subtitle">Renseignez les actions entreprises</p>
      </div>

      <div class="dialog-content">
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
        <div class="field">
          <label class="field-label">Commentaire de traitement <span class="required">*</span></label>
          <textarea class="field-input" [formControl]="commentaire" rows="3" placeholder="Décrivez les actions entreprises..."></textarea>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="onCancel()">Annuler</button>
        <button class="btn-primary" [disabled]="commentaire.invalid" (click)="onSubmit()">Traiter</button>
      </div>
    </div>
  `
})
export class TraiterAlerteDialogComponent {
  commentaire = new FormControl('', Validators.required);

  constructor(
    public dialogRef: MatDialogRef<TraiterAlerteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { alerte: AlerteResponse; action: 'traiter' | 'ignorer' }
  ) {}

  getTypeLabel(): string {
    const labels: Record<string, string> = { NOTE_ELIMINATOIRE: 'Note éliminatoire', ABSENCES_REPETEES: 'Absences répétées', MOYENNE_FAIBLE: 'Moyenne faible', RISQUE_EXCLUSION: 'Risque exclusion', CHUTE_PERFORMANCE: 'Chute performance', NON_ASSIDUITE: 'Non-assiduité' };
    return labels[this.data.alerte.type] || this.data.alerte.type;
  }

  getTypeBadgeClass(): string {
    const classes: Record<string, string> = { NOTE_ELIMINATOIRE: 'bg-red-100 text-danger', ABSENCES_REPETEES: 'bg-orange-100 text-warning', MOYENNE_FAIBLE: 'bg-amber-100 text-amber-700', RISQUE_EXCLUSION: 'bg-red-100 text-danger', CHUTE_PERFORMANCE: 'bg-red-100 text-danger', NON_ASSIDUITE: 'bg-orange-100 text-warning' };
    return classes[this.data.alerte.type] || 'bg-gray-100 text-gray-600';
  }

  onCancel(): void { this.dialogRef.close(); }
  onSubmit(): void { this.dialogRef.close({ commentaire: this.commentaire.value }); }
}

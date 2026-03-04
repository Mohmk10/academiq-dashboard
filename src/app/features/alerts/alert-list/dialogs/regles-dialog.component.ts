import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlerteService } from '../../../../core/services/alerte.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RegleAlerteResponse, TypeAlerte } from '../../../../core/models/alerte.model';

@Component({
  selector: 'app-regles-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatSlideToggleModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">Gérer les règles d'alerte</h2>
        <p class="dialog-subtitle">Configurez les seuils de déclenchement</p>
      </div>

      <div class="dialog-content !max-h-[70vh]">
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">{{ editingId ? 'Modifier la règle' : 'Nouvelle règle' }}</h4>
          <form [formGroup]="form" (ngSubmit)="onSubmitRule()" class="form-grid-3 items-end">
            <div class="field !mb-0">
              <label class="field-label">Type</label>
              <select class="field-input" formControlName="type">
                @for (t of types; track t.value) {
                  <option [value]="t.value">{{ t.label }}</option>
                }
              </select>
            </div>
            <div class="field !mb-0">
              <label class="field-label">Seuil</label>
              <input class="field-input" type="number" formControlName="seuil" placeholder="Ex: 10">
            </div>
            <div class="flex gap-2">
              <button class="btn-primary flex-1" type="submit" [disabled]="form.invalid">
                {{ editingId ? 'Modifier' : 'Ajouter' }}
              </button>
              @if (editingId) {
                <button class="btn-secondary" type="button" (click)="cancelEdit()">Annuler</button>
              }
            </div>
          </form>
          <div class="field !mb-0 mt-3">
            <label class="field-label">Description</label>
            <input class="field-input" [formControl]="$any(form.get('description'))" placeholder="Ex: Alerte si moyenne < 10">
          </div>
        </div>

        @if (isLoading) {
          <div class="flex justify-center py-8"><mat-spinner diameter="32"></mat-spinner></div>
        } @else if (regles.length === 0) {
          <p class="text-center text-gray-400 py-8">Aucune règle configurée</p>
        } @else {
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Seuil</th>
                  <th>Description</th>
                  <th>Actif</th>
                  <th class="!w-20"></th>
                </tr>
              </thead>
              <tbody>
                @for (row of regles; track row.id) {
                  <tr>
                    <td>{{ getTypeLabel(row.type) }}</td>
                    <td class="cell-primary">{{ row.seuil }}</td>
                    <td class="cell-secondary">{{ row.description || '—' }}</td>
                    <td><mat-slide-toggle [checked]="row.actif" (change)="toggleRegle(row)" color="primary"></mat-slide-toggle></td>
                    <td class="cell-actions">
                      <div class="flex gap-1">
                        <button class="action-menu-btn" (click)="startEdit(row)"><i class="fas fa-pen text-gray-400"></i></button>
                        <button class="action-menu-btn" style="color: #DC2626;" (click)="deleteRegle(row)"><i class="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="dialogRef.close()">Fermer</button>
      </div>
    </div>
  `
})
export class ReglesDialogComponent implements OnInit {
  regles: RegleAlerteResponse[] = [];
  isLoading = true;
  editingId: number | null = null;
  form: FormGroup;

  types: { value: TypeAlerte; label: string }[] = [
    { value: 'NOTE_BASSE', label: 'Note basse' },
    { value: 'MOYENNE_FAIBLE', label: 'Moyenne faible' },
    { value: 'ABSENCE_NOTE', label: 'Absence de note' },
    { value: 'RISQUE_ECHEC', label: 'Risque d\'échec' },
    { value: 'CUSTOM', label: 'Personnalisée' }
  ];

  constructor(
    private fb: FormBuilder,
    private alerteService: AlerteService,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<ReglesDialogComponent>
  ) {
    this.form = this.fb.group({
      type: ['MOYENNE_FAIBLE', Validators.required],
      seuil: [10, [Validators.required, Validators.min(0)]],
      actif: [true],
      description: ['']
    });
  }

  ngOnInit(): void { this.loadRegles(); }

  loadRegles(): void {
    this.isLoading = true;
    this.alerteService.getRegles().subscribe({
      next: (res) => { this.regles = res.data; this.isLoading = false; },
      error: () => {
        this.isLoading = false;
        this.regles = [
          { id: 1, type: 'MOYENNE_FAIBLE', seuil: 10, actif: true, description: 'Alerte si moyenne < 10', createdAt: '2024-10-01' },
          { id: 2, type: 'NOTE_BASSE', seuil: 5, actif: true, description: 'Alerte si note < 5', createdAt: '2024-10-01' },
          { id: 3, type: 'RISQUE_ECHEC', seuil: 8, actif: false, description: 'Risque si moyenne < 8', createdAt: '2024-10-01' },
        ];
      }
    });
  }

  getTypeLabel(type: string): string {
    return this.types.find(t => t.value === type)?.label || type;
  }

  onSubmitRule(): void {
    if (this.form.invalid) return;
    const value = this.form.value;
    if (this.editingId) {
      this.alerteService.updateRegle(this.editingId, value).subscribe({
        next: () => { this.notification.success('Règle modifiée'); this.cancelEdit(); this.loadRegles(); },
        error: () => {}
      });
    } else {
      this.alerteService.createRegle(value).subscribe({
        next: () => { this.notification.success('Règle créée'); this.form.reset({ type: 'MOYENNE_FAIBLE', seuil: 10, actif: true, description: '' }); this.loadRegles(); },
        error: () => {}
      });
    }
  }

  startEdit(regle: RegleAlerteResponse): void {
    this.editingId = regle.id;
    this.form.patchValue({ type: regle.type, seuil: regle.seuil, actif: regle.actif, description: regle.description || '' });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.reset({ type: 'MOYENNE_FAIBLE', seuil: 10, actif: true, description: '' });
  }

  toggleRegle(regle: RegleAlerteResponse): void {
    this.alerteService.toggleRegle(regle.id).subscribe({
      next: () => { regle.actif = !regle.actif; },
      error: () => {}
    });
  }

  deleteRegle(regle: RegleAlerteResponse): void {
    this.alerteService.deleteRegle(regle.id).subscribe({
      next: () => { this.notification.success('Règle supprimée'); this.loadRegles(); },
      error: () => {}
    });
  }
}

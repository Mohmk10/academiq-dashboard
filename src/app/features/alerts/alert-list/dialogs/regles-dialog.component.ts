import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlerteService } from '../../../../core/services/alerte.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NiveauAlerte, RegleAlerteResponse, TypeAlerte } from '../../../../core/models/alerte.model';

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
          <form [formGroup]="form" (ngSubmit)="onSubmitRule()">
            <div class="form-grid-2">
              <div class="field !mb-0">
                <label class="field-label">Nom <span class="required">*</span></label>
                <input class="field-input" formControlName="nom" placeholder="Ex: Moyenne faible L1">
              </div>
              <div class="field !mb-0">
                <label class="field-label">Niveau <span class="required">*</span></label>
                <select class="field-input" formControlName="niveauAlerte">
                  @for (n of niveaux; track n.value) {
                    <option [value]="n.value">{{ n.label }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="form-grid-3 items-end mt-3">
              <div class="field !mb-0">
                <label class="field-label">Type <span class="required">*</span></label>
                <select class="field-input" formControlName="type">
                  @for (t of types; track t.value) {
                    <option [value]="t.value">{{ t.label }}</option>
                  }
                </select>
              </div>
              <div class="field !mb-0">
                <label class="field-label">Seuil <span class="required">*</span></label>
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
            </div>
            <div class="field !mb-0 mt-3">
              <label class="field-label">Description</label>
              <input class="field-input" formControlName="description" placeholder="Ex: Alerte si moyenne < 10">
            </div>
          </form>
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
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Niveau</th>
                  <th>Seuil</th>
                  <th>Actif</th>
                  <th class="!w-20"></th>
                </tr>
              </thead>
              <tbody>
                @for (row of regles; track row.id) {
                  <tr>
                    <td class="cell-primary">{{ row.nom }}</td>
                    <td>{{ getTypeLabel(row.type) }}</td>
                    <td>
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium" [class]="getNiveauClass(row.niveauAlerte)">
                        {{ getNiveauLabel(row.niveauAlerte) }}
                      </span>
                    </td>
                    <td class="font-mono">{{ row.seuil }}</td>
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
    { value: 'MOYENNE_FAIBLE', label: 'Moyenne faible' },
    { value: 'NOTE_ELIMINATOIRE', label: 'Note éliminatoire' },
    { value: 'ABSENCES_REPETEES', label: 'Absences répétées' },
    { value: 'RISQUE_EXCLUSION', label: 'Risque d\'exclusion' },
    { value: 'CHUTE_PERFORMANCE', label: 'Chute de performance' },
    { value: 'NON_ASSIDUITE', label: 'Non-assiduité' }
  ];

  niveaux: { value: NiveauAlerte; label: string }[] = [
    { value: 'INFO', label: 'Info' },
    { value: 'ATTENTION', label: 'Attention' },
    { value: 'CRITIQUE', label: 'Critique' }
  ];

  constructor(
    private fb: FormBuilder,
    private alerteService: AlerteService,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<ReglesDialogComponent>
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      type: ['MOYENNE_FAIBLE', Validators.required],
      niveauAlerte: ['ATTENTION', Validators.required],
      seuil: [10, [Validators.required, Validators.min(0)]],
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
          { id: 1, nom: 'Moyenne faible L1', type: 'MOYENNE_FAIBLE', niveauAlerte: 'ATTENTION', seuil: 10, actif: true, description: 'Alerte si moyenne < 10' },
          { id: 2, nom: 'Note éliminatoire', type: 'NOTE_ELIMINATOIRE', niveauAlerte: 'CRITIQUE', seuil: 5, actif: true, description: 'Alerte si note < 5' },
          { id: 3, nom: 'Risque exclusion', type: 'RISQUE_EXCLUSION', niveauAlerte: 'CRITIQUE', seuil: 8, actif: false, description: 'Risque si moyenne < 8' },
        ];
      }
    });
  }

  getTypeLabel(type: string): string {
    return this.types.find(t => t.value === type)?.label || type;
  }

  onSubmitRule(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const payload: any = { nom: v.nom, type: v.type, niveauAlerte: v.niveauAlerte, seuil: v.seuil };
    if (v.description) payload.description = v.description;
    if (this.editingId) {
      this.alerteService.updateRegle(this.editingId, payload).subscribe({
        next: () => { this.notification.success('Règle modifiée'); this.cancelEdit(); this.loadRegles(); },
        error: () => {}
      });
    } else {
      this.alerteService.createRegle(payload).subscribe({
        next: () => { this.notification.success('Règle créée'); this.resetForm(); this.loadRegles(); },
        error: () => {}
      });
    }
  }

  startEdit(regle: RegleAlerteResponse): void {
    this.editingId = regle.id;
    this.form.patchValue({ nom: regle.nom, type: regle.type, niveauAlerte: regle.niveauAlerte, seuil: regle.seuil, description: regle.description || '' });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({ nom: '', type: 'MOYENNE_FAIBLE', niveauAlerte: 'ATTENTION', seuil: 10, description: '' });
  }

  getNiveauLabel(niveau: string): string {
    return this.niveaux.find(n => n.value === niveau)?.label || niveau;
  }

  getNiveauClass(niveau: string): string {
    switch (niveau) {
      case 'CRITIQUE': return 'bg-red-50 text-danger';
      case 'ATTENTION': return 'bg-amber-50 text-warning';
      default: return 'bg-blue-50 text-info';
    }
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

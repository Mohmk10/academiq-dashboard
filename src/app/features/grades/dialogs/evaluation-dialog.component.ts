import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StructureService } from '../../../core/services/structure.service';
import { ModuleResponse, PromotionResponse } from '../../../core/models/structure.model';
import { EvaluationResponse, TypeEvaluation } from '../../../core/models/note.model';

@Component({
  selector: 'app-evaluation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">Renseignez les informations de l'évaluation</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="field">
          <label class="field-label">Nom de l'évaluation <span class="required">*</span></label>
          <input class="field-input" formControlName="nom" placeholder="Ex: Examen final">
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Module <span class="required">*</span></label>
            <select class="field-input" formControlName="moduleId">
              <option [ngValue]="null" disabled>Sélectionner...</option>
              @for (m of modules; track m.id) {
                <option [ngValue]="m.id">{{ m.code }} — {{ m.nom }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label class="field-label">Promotion <span class="required">*</span></label>
            <select class="field-input" formControlName="promotionId">
              <option [ngValue]="null" disabled>Sélectionner...</option>
              @for (p of promotions; track p.id) {
                <option [ngValue]="p.id">{{ p.filiereNom }} — {{ p.niveauNom }} ({{ p.anneeUniversitaire }})</option>
              }
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Type <span class="required">*</span></label>
            <select class="field-input" formControlName="type">
              @for (t of types; track t.value) {
                <option [value]="t.value">{{ t.label }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label class="field-label">Coefficient <span class="required">*</span></label>
            <input class="field-input" type="number" formControlName="coefficient" placeholder="Ex: 2">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Note maximale <span class="required">*</span></label>
            <input class="field-input" type="number" formControlName="noteMax" placeholder="Ex: 20">
          </div>
          <div class="field">
            <label class="field-label">Date</label>
            <input class="field-input" type="date" formControlName="date">
          </div>
        </div>
      </form>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="onCancel()">Annuler</button>
        <button class="btn-primary" [disabled]="form.invalid" (click)="onSubmit()">
          {{ data.mode === 'create' ? 'Créer' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  `
})
export class EvaluationDialogComponent implements OnInit {
  form: FormGroup;
  modules: ModuleResponse[] = [];
  promotions: PromotionResponse[] = [];
  types: { value: TypeEvaluation; label: string }[] = [
    { value: 'CC', label: 'Contrôle continu' },
    { value: 'TP', label: 'TP' },
    { value: 'PARTIEL', label: 'Partiel' },
    { value: 'EXAMEN', label: 'Examen' },
    { value: 'RATTRAPAGE', label: 'Rattrapage' },
    { value: 'PROJET', label: 'Projet' },
    { value: 'ORAL', label: 'Oral' }
  ];

  get dialogTitle(): string {
    return this.data.mode === 'create' ? 'Nouvelle évaluation' : 'Modifier l\'évaluation';
  }

  constructor(
    private fb: FormBuilder,
    private structureService: StructureService,
    public dialogRef: MatDialogRef<EvaluationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; evaluation?: EvaluationResponse }
  ) {
    const e = data.evaluation;
    this.form = this.fb.group({
      nom: [e?.nom || '', Validators.required],
      moduleId: [e?.moduleId || null, Validators.required],
      promotionId: [e?.promotionId || null, Validators.required],
      type: [e?.type || 'EXAMEN', Validators.required],
      coefficient: [e?.coefficient || 1, [Validators.required, Validators.min(1)]],
      noteMax: [e?.noteMax || 20, [Validators.required, Validators.min(1)]],
      date: [e?.date || '']
    });
  }

  ngOnInit(): void {
    this.structureService.getModules().subscribe({
      next: (res) => this.modules = res.data,
      error: () => {
        this.modules = [
          { id: 1, nom: 'Algorithmique', code: 'INFO-101', coefficient: 3, credits: 3, ueId: 1 },
          { id: 2, nom: 'Programmation C', code: 'INFO-102', coefficient: 3, credits: 3, ueId: 1 }
        ];
      }
    });
    this.structureService.getPromotions().subscribe({
      next: (res) => this.promotions = res.data,
      error: () => {
        this.promotions = [
          { id: 1, anneeUniversitaire: '2024-2025', niveauId: 1, niveauNom: 'L1', filiereNom: 'Informatique', actif: true },
          { id: 2, anneeUniversitaire: '2024-2025', niveauId: 2, niveauNom: 'L2', filiereNom: 'Informatique', actif: true }
        ];
      }
    });
  }

  onCancel(): void { this.dialogRef.close(); }
  onSubmit(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
}

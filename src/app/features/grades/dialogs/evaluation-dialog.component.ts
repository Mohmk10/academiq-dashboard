import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { StructureService } from '../../../core/services/structure.service';
import { ModuleResponse, PromotionResponse } from '../../../core/models/structure.model';
import { EvaluationResponse, TypeEvaluation } from '../../../core/models/note.model';

@Component({
  selector: 'app-evaluation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">Renseignez les informations de l'évaluation</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <mat-form-field appearance="outline">
          <mat-label>Nom de l'évaluation</mat-label>
          <input matInput formControlName="nom" placeholder="Ex: Examen final">
        </mat-form-field>

        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Module</mat-label>
            <mat-select formControlName="moduleId">
              @for (m of modules; track m.id) {
                <mat-option [value]="m.id">{{ m.code }} — {{ m.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Promotion</mat-label>
            <mat-select formControlName="promotionId">
              @for (p of promotions; track p.id) {
                <mat-option [value]="p.id">{{ p.filiereNom }} — {{ p.niveauNom }} ({{ p.anneeUniversitaire }})</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type">
              @for (t of types; track t.value) {
                <mat-option [value]="t.value">{{ t.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Coefficient</mat-label>
            <input matInput type="number" formControlName="coefficient" placeholder="Ex: 2">
          </mat-form-field>
        </div>

        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Note maximale</mat-label>
            <input matInput type="number" formControlName="noteMax" placeholder="Ex: 20">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput type="date" formControlName="date">
          </mat-form-field>
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
    { value: 'EXAMEN', label: 'Examen' },
    { value: 'CONTROLE_CONTINU', label: 'Contrôle continu' },
    { value: 'TP', label: 'TP' },
    { value: 'PROJET', label: 'Projet' },
    { value: 'RATTRAPAGE', label: 'Rattrapage' }
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
          { id: 1, nom: 'Algorithmique', code: 'INFO-101', coefficient: 3, ueId: 1 },
          { id: 2, nom: 'Programmation C', code: 'INFO-102', coefficient: 3, ueId: 1 }
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

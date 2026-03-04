import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StructureService } from '../../../../core/services/structure.service';
import { FiliereResponse, NiveauResponse, PromotionResponse } from '../../../../core/models/structure.model';

@Component({
  selector: 'app-promotion-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">Renseignez les informations de la promotion</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Filière <span class="required">*</span></label>
            <select class="field-input" formControlName="filiereId" (change)="onFiliereChange(form.get('filiereId')!.value)">
              <option [ngValue]="null" disabled>Sélectionner...</option>
              @for (f of filieres; track f.id) {
                <option [ngValue]="f.id">{{ f.nom }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label class="field-label">Niveau <span class="required">*</span></label>
            <select class="field-input" formControlName="niveauId">
              <option [ngValue]="null" disabled>Sélectionner...</option>
              @for (n of niveaux; track n.id) {
                <option [ngValue]="n.id">{{ n.nom }}</option>
              }
            </select>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Année universitaire <span class="required">*</span></label>
          <input class="field-input" formControlName="anneeUniversitaire" placeholder="Ex: 2024-2025">
        </div>
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Date début</label>
            <input class="field-input" type="date" formControlName="dateDebut">
          </div>
          <div class="field">
            <label class="field-label">Date fin</label>
            <input class="field-input" type="date" formControlName="dateFin">
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
export class PromotionDialogComponent implements OnInit {
  form: FormGroup;
  filieres: FiliereResponse[] = [];
  niveaux: NiveauResponse[] = [];

  get dialogTitle(): string {
    return this.data.mode === 'create' ? 'Nouvelle promotion' : 'Modifier la promotion';
  }

  constructor(
    private fb: FormBuilder,
    private structureService: StructureService,
    public dialogRef: MatDialogRef<PromotionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; promotion?: PromotionResponse; filieres?: FiliereResponse[] }
  ) {
    this.form = this.fb.group({
      filiereId: [null, Validators.required],
      niveauId: [data.promotion?.niveauId || null, Validators.required],
      anneeUniversitaire: [data.promotion?.anneeUniversitaire || '', Validators.required],
      dateDebut: [data.promotion?.dateDebut || ''],
      dateFin: [data.promotion?.dateFin || '']
    });
  }

  ngOnInit(): void {
    if (this.data.filieres) {
      this.filieres = this.data.filieres;
    } else {
      this.structureService.getFilieres().subscribe(res => this.filieres = res.data);
    }
    if (this.data.promotion?.niveauId) {
      this.structureService.getNiveaux().subscribe(res => {
        this.niveaux = res.data;
        const niveau = this.niveaux.find(n => n.id === this.data.promotion!.niveauId);
        if (niveau) this.form.patchValue({ filiereId: niveau.filiereId });
      });
    }
  }

  onFiliereChange(filiereId: number): void {
    this.structureService.getNiveaux(filiereId).subscribe(res => {
      this.niveaux = res.data;
      this.form.patchValue({ niveauId: null });
    });
  }

  onCancel(): void { this.dialogRef.close(); }

  onSubmit(): void {
    if (this.form.valid) {
      const { filiereId, ...value } = this.form.value;
      this.dialogRef.close(value);
    }
  }
}

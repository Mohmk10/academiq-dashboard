import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { StructureService } from '../../../../core/services/structure.service';
import { FiliereResponse, NiveauResponse, PromotionResponse } from '../../../../core/models/structure.model';

@Component({
  selector: 'app-promotion-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">Renseignez les informations de la promotion</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Filière</mat-label>
            <mat-select formControlName="filiereId" (selectionChange)="onFiliereChange($event.value)">
              @for (f of filieres; track f.id) {
                <mat-option [value]="f.id">{{ f.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Niveau</mat-label>
            <mat-select formControlName="niveauId">
              @for (n of niveaux; track n.id) {
                <mat-option [value]="n.id">{{ n.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Année universitaire</mat-label>
          <input matInput formControlName="anneeUniversitaire" placeholder="Ex: 2024-2025">
        </mat-form-field>
        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Date début</mat-label>
            <input matInput type="date" formControlName="dateDebut">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date fin</mat-label>
            <input matInput type="date" formControlName="dateFin">
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

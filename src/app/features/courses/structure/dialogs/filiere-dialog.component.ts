import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FiliereResponse } from '../../../../core/models/structure.model';

@Component({
  selector: 'app-filiere-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">Renseignez les informations de la filière</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" placeholder="Ex: Informatique">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" placeholder="Ex: INFO">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Département</mat-label>
          <input matInput formControlName="departement" placeholder="Ex: Sciences et Technologies">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Description de la filière"></textarea>
        </mat-form-field>
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
export class FiliereDialogComponent {
  form: FormGroup;

  get dialogTitle(): string {
    return this.data.mode === 'create' ? 'Nouvelle filière' : 'Modifier la filière';
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FiliereDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; filiere?: FiliereResponse }
  ) {
    this.form = this.fb.group({
      nom: [data.filiere?.nom || '', Validators.required],
      code: [data.filiere?.code || '', Validators.required],
      departement: [data.filiere?.departement || ''],
      description: [data.filiere?.description || '']
    });
  }

  onCancel(): void { this.dialogRef.close(); }
  onSubmit(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
}

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
    <h2 mat-dialog-title class="!text-lg !font-semibold">{{ data.mode === 'create' ? 'Nouvelle filière' : 'Modifier la filière' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 pt-2">
        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Département</mat-label>
          <input matInput formControlName="departement">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!pt-4">
      <button mat-stroked-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">
        {{ data.mode === 'create' ? 'Créer' : 'Enregistrer' }}
      </button>
    </mat-dialog-actions>
  `
})
export class FiliereDialogComponent {
  form: FormGroup;

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

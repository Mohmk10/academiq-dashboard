import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UtilisateurDetail } from '../../../core/models/user.model';

export interface TeacherDialogData {
  mode: 'create' | 'edit';
  teacher?: UtilisateurDetail;
}

@Component({
  selector: 'app-teacher-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="!text-lg !font-semibold">{{ data.mode === 'create' ? 'Ajouter un enseignant' : 'Modifier l\\'enseignant' }}</h2>
    <mat-dialog-content class="!pt-2">
      <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Nom</mat-label><input matInput formControlName="nom"><mat-error>Requis</mat-error></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Prénom</mat-label><input matInput formControlName="prenom"><mat-error>Requis</mat-error></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Email</mat-label><input matInput type="email" formControlName="email"><mat-error>Email invalide</mat-error></mat-form-field>
        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Mot de passe</mat-label><input matInput type="password" formControlName="motDePasse"><mat-error>Min 8 caractères</mat-error></mat-form-field>
        }
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Téléphone</mat-label><input matInput formControlName="telephone"></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Spécialité</mat-label><input matInput formControlName="specialite"><mat-error>Requis</mat-error></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Grade</mat-label>
          <mat-select formControlName="grade">
            <mat-option value="Professeur">Professeur</mat-option>
            <mat-option value="Maître de conférences">Maître de conférences</mat-option>
            <mat-option value="Docteur">Docteur</mat-option>
            <mat-option value="Assistant">Assistant</mat-option>
            <mat-option value="Vacataire">Vacataire</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Département</mat-label><input matInput formControlName="departement"></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Bureau</mat-label><input matInput formControlName="bureau"></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!pt-4">
      <button mat-stroked-button (click)="dialogRef.close()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid">Enregistrer</button>
    </mat-dialog-actions>
  `
})
export class TeacherDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TeacherDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TeacherDialogData
  ) {}

  ngOnInit(): void {
    const t = this.data.teacher;
    this.form = this.fb.group({
      nom: [t?.nom ?? '', Validators.required],
      prenom: [t?.prenom ?? '', Validators.required],
      email: [t?.email ?? '', [Validators.required, Validators.email]],
      motDePasse: ['', this.data.mode === 'create' ? [Validators.required, Validators.minLength(8)] : []],
      telephone: [t?.telephone ?? ''],
      specialite: [t?.enseignant?.specialite ?? '', Validators.required],
      grade: [t?.enseignant?.grade ?? ''],
      departement: [t?.enseignant?.departement ?? ''],
      bureau: [t?.enseignant?.bureau ?? '']
    });
  }

  onSubmit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UtilisateurDetail } from '../../../core/models/user.model';

export interface StudentDialogData {
  mode: 'create' | 'edit';
  student?: UtilisateurDetail;
}

@Component({
  selector: 'app-student-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title class="!text-lg !font-semibold">{{ data.mode === 'create' ? 'Ajouter un étudiant' : 'Modifier l\\'étudiant' }}</h2>
    <mat-dialog-content class="!pt-2">
      <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Nom</mat-label>
          <input matInput formControlName="nom">
          <mat-error>Requis</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Prénom</mat-label>
          <input matInput formControlName="prenom">
          <mat-error>Requis</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email">
          <mat-error>Email invalide</mat-error>
        </mat-form-field>
        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Mot de passe</mat-label>
            <input matInput type="password" formControlName="motDePasse">
            <mat-error>Minimum 8 caractères</mat-error>
          </mat-form-field>
        }
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Téléphone</mat-label>
          <input matInput formControlName="telephone">
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Date de naissance</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dateNaissance">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Nom du tuteur</mat-label>
          <input matInput formControlName="nomTuteur">
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Numéro du tuteur</mat-label>
          <input matInput formControlName="numeroTuteur">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!pt-4">
      <button mat-stroked-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid">Enregistrer</button>
    </mat-dialog-actions>
  `
})
export class StudentDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<StudentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudentDialogData
  ) {}

  ngOnInit(): void {
    const s = this.data.student;
    this.form = this.fb.group({
      nom: [s?.nom ?? '', Validators.required],
      prenom: [s?.prenom ?? '', Validators.required],
      email: [s?.email ?? '', [Validators.required, Validators.email]],
      motDePasse: ['', this.data.mode === 'create' ? [Validators.required, Validators.minLength(8)] : []],
      telephone: [s?.telephone ?? ''],
      dateNaissance: [s?.dateNaissance ?? ''],
      nomTuteur: [s?.etudiant?.nomTuteur ?? ''],
      numeroTuteur: [s?.etudiant?.numeroTuteur ?? '']
    });
  }

  onCancel(): void { this.dialogRef.close(); }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

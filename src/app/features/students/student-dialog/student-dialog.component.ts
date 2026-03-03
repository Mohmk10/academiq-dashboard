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
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">{{ data.mode === 'create' ? 'Renseignez les informations du nouvel étudiant' : 'Modifiez les informations de l\\'étudiant' }}</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" placeholder="Ex: Kouyaté">
            <mat-error>Requis</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="prenom" placeholder="Ex: Makan">
            <mat-error>Requis</mat-error>
          </mat-form-field>
        </div>

        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Ex: etudiant@academiq.sn">
            <mat-error>Email invalide</mat-error>
          </mat-form-field>
          @if (data.mode === 'create') {
            <mat-form-field appearance="outline">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="motDePasse" placeholder="Minimum 8 caractères">
              <mat-error>Minimum 8 caractères</mat-error>
            </mat-form-field>
          }
        </div>

        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="telephone" placeholder="Ex: +221 77 000 00 00">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date de naissance</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dateNaissance">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Nom du tuteur</mat-label>
            <input matInput formControlName="nomTuteur" placeholder="Ex: Diallo">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Numéro du tuteur</mat-label>
            <input matInput formControlName="numeroTuteur" placeholder="Ex: +221 70 000 00 00">
          </mat-form-field>
        </div>
      </form>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="onCancel()">Annuler</button>
        <button class="btn-primary" (click)="onSubmit()" [disabled]="form.invalid">Enregistrer</button>
      </div>
    </div>
  `
})
export class StudentDialogComponent implements OnInit {
  form!: FormGroup;

  get dialogTitle(): string {
    return this.data.mode === 'create' ? 'Ajouter un étudiant' : 'Modifier l\'étudiant';
  }

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

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
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">{{ data.mode === 'create' ? 'Renseignez les informations du nouvel enseignant' : 'Modifiez les informations de l\\'enseignant' }}</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" placeholder="Ex: Traoré">
            <mat-error>Requis</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="prenom" placeholder="Ex: Ousmane">
            <mat-error>Requis</mat-error>
          </mat-form-field>
        </div>

        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Ex: enseignant@academiq.sn">
            <mat-error>Email invalide</mat-error>
          </mat-form-field>
          @if (data.mode === 'create') {
            <mat-form-field appearance="outline">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="motDePasse" placeholder="Minimum 8 caractères">
              <mat-error>Min 8 caractères</mat-error>
            </mat-form-field>
          }
        </div>

        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Spécialité</mat-label>
            <input matInput formControlName="specialite" placeholder="Ex: Informatique">
            <mat-error>Requis</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Grade</mat-label>
            <mat-select formControlName="grade">
              <mat-option value="Professeur">Professeur</mat-option>
              <mat-option value="Maître de conférences">Maître de conférences</mat-option>
              <mat-option value="Docteur">Docteur</mat-option>
              <mat-option value="Assistant">Assistant</mat-option>
              <mat-option value="Vacataire">Vacataire</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Département</mat-label>
            <input matInput formControlName="departement" placeholder="Ex: Sciences et Technologies">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Bureau</mat-label>
            <input matInput formControlName="bureau" placeholder="Ex: B-204">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Téléphone</mat-label>
          <input matInput formControlName="telephone" placeholder="Ex: +221 77 000 00 00">
        </mat-form-field>
      </form>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="dialogRef.close()">Annuler</button>
        <button class="btn-primary" (click)="onSubmit()" [disabled]="form.invalid">Enregistrer</button>
      </div>
    </div>
  `
})
export class TeacherDialogComponent implements OnInit {
  form!: FormGroup;

  get dialogTitle(): string {
    return this.data.mode === 'create' ? 'Ajouter un enseignant' : 'Modifier l\'enseignant';
  }

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

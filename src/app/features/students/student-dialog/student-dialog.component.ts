import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UtilisateurDetail } from '../../../core/models/user.model';

export interface StudentDialogData {
  mode: 'create' | 'edit';
  student?: UtilisateurDetail;
}

@Component({
  selector: 'app-student-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">{{ data.mode === 'create' ? 'Renseignez les informations du nouvel étudiant' : 'Modifiez les informations de l\\'étudiant' }}</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Nom <span class="required">*</span></label>
            <input class="field-input" formControlName="nom" placeholder="Ex: Kouyaté">
          </div>
          <div class="field">
            <label class="field-label">Prénom <span class="required">*</span></label>
            <input class="field-input" formControlName="prenom" placeholder="Ex: Makan">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Email <span class="required">*</span></label>
            <input class="field-input" type="email" formControlName="email" placeholder="Ex: etudiant@academiq.sn">
          </div>
          @if (data.mode === 'create') {
            <div class="field">
              <label class="field-label">Mot de passe <span class="required">*</span></label>
              <input class="field-input" type="password" formControlName="motDePasse" placeholder="Minimum 8 caractères">
            </div>
          }
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Téléphone</label>
            <input class="field-input" formControlName="telephone" placeholder="Ex: +221 77 000 00 00">
          </div>
          <div class="field">
            <label class="field-label">Date de naissance</label>
            <input class="field-input" type="date" formControlName="dateNaissance">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Nom du tuteur</label>
            <input class="field-input" formControlName="nomTuteur" placeholder="Ex: Diallo">
          </div>
          <div class="field">
            <label class="field-label">Numéro du tuteur</label>
            <input class="field-input" formControlName="numeroTuteur" placeholder="Ex: +221 70 000 00 00">
          </div>
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

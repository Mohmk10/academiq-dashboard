import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UtilisateurDetail } from '../../../core/models/user.model';
import { PhoneSnDirective } from '../../../shared/directives/phone-sn.directive';

export interface TeacherDialogData {
  mode: 'create' | 'edit';
  teacher?: UtilisateurDetail;
}

@Component({
  selector: 'app-teacher-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, PhoneSnDirective],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">{{ data.mode === 'create' ? 'Renseignez les informations du nouvel enseignant' : 'Modifiez les informations de l\\'enseignant' }}</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Nom <span class="required">*</span></label>
            <input class="field-input" formControlName="nom" placeholder="Ex: Traoré">
          </div>
          <div class="field">
            <label class="field-label">Prénom <span class="required">*</span></label>
            <input class="field-input" formControlName="prenom" placeholder="Ex: Ousmane">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Email <span class="required">*</span></label>
            <input class="field-input" type="email" formControlName="email" placeholder="Ex: enseignant@academiq.sn">
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
            <label class="field-label">Spécialité <span class="required">*</span></label>
            <input class="field-input" formControlName="specialite" placeholder="Ex: Informatique">
          </div>
          <div class="field">
            <label class="field-label">Grade</label>
            <select class="field-input" formControlName="grade">
              <option value="">Sélectionner...</option>
              <option value="Professeur">Professeur</option>
              <option value="Maître de conférences">Maître de conférences</option>
              <option value="Docteur">Docteur</option>
              <option value="Assistant">Assistant</option>
              <option value="Vacataire">Vacataire</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Département</label>
            <input class="field-input" formControlName="departement" placeholder="Ex: Sciences et Technologies">
          </div>
          <div class="field">
            <label class="field-label">Bureau</label>
            <input class="field-input" formControlName="bureau" placeholder="Ex: B-204">
          </div>
        </div>

        <div class="field">
          <label class="field-label">Téléphone <span class="required">*</span></label>
          <input class="field-input" type="tel" formControlName="telephone" appPhoneSn placeholder="+221 XX XXX XX XX">
        </div>
      </form>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="dialogRef.close()">Annuler</button>
        <button class="btn-primary" (click)="onSubmit()" [disabled]="form.invalid || (isEditMode && !hasChanges)">
          {{ isEditMode && !hasChanges ? 'Aucune modification' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  `
})
export class TeacherDialogComponent implements OnInit {
  form!: FormGroup;
  private initialValues: any;

  get isEditMode(): boolean { return this.data.mode === 'edit'; }

  get dialogTitle(): string {
    return this.data.mode === 'create' ? 'Ajouter un enseignant' : 'Modifier l\'enseignant';
  }

  get hasChanges(): boolean {
    return JSON.stringify(this.form.value) !== JSON.stringify(this.initialValues);
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
      telephone: [t?.telephone ?? '', Validators.required],
      specialite: [t?.enseignant?.specialite ?? '', Validators.required],
      grade: [t?.enseignant?.grade ?? ''],
      departement: [t?.enseignant?.departement ?? ''],
      bureau: [t?.enseignant?.bureau ?? '']
    });
    this.initialValues = { ...this.form.value };
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    if (this.isEditMode && !this.hasChanges) return;

    const v = this.form.value;

    if (this.isEditMode) {
      // PUT /utilisateurs/{id} — UtilisateurUpdateRequest
      const result: any = { nom: v.nom, prenom: v.prenom, telephone: v.telephone };
      if (v.email && v.email !== this.data.teacher?.email) result.email = v.email;
      if (v.specialite) result.specialite = v.specialite;
      if (v.grade) result.grade = v.grade;
      if (v.departement) result.departement = v.departement;
      if (v.bureau) result.bureau = v.bureau;
      this.dialogRef.close(result);
    } else {
      // POST /utilisateurs — UtilisateurCreateRequest
      const result: any = {
        nom: v.nom, prenom: v.prenom, email: v.email,
        motDePasse: v.motDePasse, role: 'ENSEIGNANT', telephone: v.telephone,
        specialite: v.specialite
      };
      if (v.grade) result.grade = v.grade;
      if (v.departement) result.departement = v.departement;
      if (v.bureau) result.bureau = v.bureau;
      this.dialogRef.close(result);
    }
  }
}

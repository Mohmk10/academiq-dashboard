import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UtilisateurDetail } from '../../../core/models/user.model';
import { PhoneSnDirective } from '../../../shared/directives/phone-sn.directive';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, PhoneSnDirective],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">Modifier l'utilisateur</h2>
        <p class="dialog-subtitle">{{ user.prenom }} {{ user.nom }} — {{ getRoleLabel() }}</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Nom <span class="required">*</span></label>
            <input class="field-input" formControlName="nom">
          </div>
          <div class="field">
            <label class="field-label">Prenom <span class="required">*</span></label>
            <input class="field-input" formControlName="prenom">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Email</label>
            <input class="field-input" type="email" formControlName="email">
          </div>
          <div class="field">
            <label class="field-label">Telephone</label>
            <input class="field-input" type="tel" formControlName="telephone" appPhoneSn placeholder="+221 XX XXX XX XX">
          </div>
        </div>

        @if (user.role === 'ETUDIANT') {
          <div class="form-grid-2">
            <div class="field">
              <label class="field-label">Nom du tuteur</label>
              <input class="field-input" formControlName="nomTuteur">
            </div>
            <div class="field">
              <label class="field-label">Numero du tuteur</label>
              <input class="field-input" type="tel" formControlName="numeroTuteur" appPhoneSn placeholder="+221 XX XXX XX XX">
            </div>
          </div>
        }

        @if (user.role === 'ENSEIGNANT') {
          <div class="form-grid-2">
            <div class="field">
              <label class="field-label">Specialite</label>
              <input class="field-input" formControlName="specialite">
            </div>
            <div class="field">
              <label class="field-label">Grade</label>
              <select class="field-input" formControlName="grade">
                <option value="">Selectionner...</option>
                <option value="Professeur">Professeur</option>
                <option value="Maitre de conferences">Maitre de conferences</option>
                <option value="Docteur">Docteur</option>
                <option value="Assistant">Assistant</option>
                <option value="Vacataire">Vacataire</option>
              </select>
            </div>
          </div>
          <div class="form-grid-2">
            <div class="field">
              <label class="field-label">Departement</label>
              <input class="field-input" formControlName="departement">
            </div>
            <div class="field">
              <label class="field-label">Bureau</label>
              <input class="field-input" formControlName="bureau">
            </div>
          </div>
        }

        @if (user.role === 'ADMIN') {
          <div class="form-grid-2">
            <div class="field">
              <label class="field-label">Fonction</label>
              <input class="field-input" formControlName="fonction">
            </div>
            <div class="field">
              <label class="field-label">Departement</label>
              <input class="field-input" formControlName="departementAdmin">
            </div>
          </div>
        }
      </form>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="dialogRef.close()">Annuler</button>
        <button class="btn-primary" (click)="onSubmit()" [disabled]="form.invalid || !hasChanges">
          {{ !hasChanges ? 'Aucune modification' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  `
})
export class EditUserDialogComponent implements OnInit {
  form!: FormGroup;
  user: UtilisateurDetail;
  private initialValues: any;

  get hasChanges(): boolean {
    return JSON.stringify(this.form.value) !== JSON.stringify(this.initialValues);
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: UtilisateurDetail }
  ) {
    this.user = data.user;
  }

  ngOnInit(): void {
    const u = this.user;
    // Only fields accepted by PUT /utilisateurs/{id} — UtilisateurUpdateRequest
    const fields: any = {
      nom: [u.nom, Validators.required],
      prenom: [u.prenom, Validators.required],
      email: [u.email, [Validators.required, Validators.email]],
      telephone: [u.telephone ?? '']
    };

    if (u.role === 'ETUDIANT') {
      fields.nomTuteur = [u.etudiant?.nomTuteur ?? ''];
      fields.numeroTuteur = [u.etudiant?.numeroTuteur ?? ''];
    } else if (u.role === 'ENSEIGNANT') {
      fields.specialite = [u.enseignant?.specialite ?? ''];
      fields.grade = [u.enseignant?.grade ?? ''];
      fields.departement = [u.enseignant?.departement ?? ''];
      fields.bureau = [u.enseignant?.bureau ?? ''];
    } else if (u.role === 'ADMIN') {
      fields.fonction = [u.admin?.fonction ?? ''];
      fields.departementAdmin = [u.admin?.departement ?? ''];
    }

    this.form = this.fb.group(fields);
    this.initialValues = { ...this.form.value };
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin', ADMIN: 'Administrateur',
      ENSEIGNANT: 'Enseignant', ETUDIANT: 'Etudiant',
      RESPONSABLE_PEDAGOGIQUE: 'Resp. Pedagogique'
    };
    return labels[this.user.role] ?? this.user.role;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.hasChanges) return;
    // Send only non-empty values matching UtilisateurUpdateRequest
    const v = this.form.value;
    const result: any = { nom: v.nom, prenom: v.prenom };
    if (v.email && v.email !== this.user.email) result.email = v.email;
    if (v.telephone) result.telephone = v.telephone;

    if (this.user.role === 'ETUDIANT') {
      if (v.nomTuteur) result.nomTuteur = v.nomTuteur;
      if (v.numeroTuteur) result.numeroTuteur = v.numeroTuteur;
    } else if (this.user.role === 'ENSEIGNANT') {
      if (v.specialite) result.specialite = v.specialite;
      if (v.grade) result.grade = v.grade;
      if (v.departement) result.departement = v.departement;
      if (v.bureau) result.bureau = v.bureau;
    } else if (this.user.role === 'ADMIN') {
      if (v.fonction) result.fonction = v.fonction;
      if (v.departementAdmin) result.departementAdmin = v.departementAdmin;
    }

    this.dialogRef.close(result);
  }
}

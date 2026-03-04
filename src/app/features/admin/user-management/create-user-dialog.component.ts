import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">Creer un utilisateur</h2>
        <p class="dialog-subtitle">Renseignez les informations du nouvel utilisateur</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Nom <span class="required">*</span></label>
            <input class="field-input" formControlName="nom" placeholder="Ex: Diallo">
          </div>
          <div class="field">
            <label class="field-label">Prenom <span class="required">*</span></label>
            <input class="field-input" formControlName="prenom" placeholder="Ex: Aminata">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Email <span class="required">*</span></label>
            <input class="field-input" type="email" formControlName="email" placeholder="Ex: utilisateur@academiq.sn">
          </div>
          <div class="field">
            <label class="field-label">Mot de passe <span class="required">*</span></label>
            <input class="field-input" type="password" formControlName="motDePasse" placeholder="Minimum 8 caracteres">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Role <span class="required">*</span></label>
            <select class="field-input" formControlName="role">
              @for (r of roles; track r.value) {
                <option [value]="r.value">{{ r.label }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label class="field-label">Telephone</label>
            <input class="field-input" formControlName="telephone" placeholder="Ex: +221 77 000 00 00">
          </div>
        </div>

        @if (form.get('role')?.value === 'ETUDIANT') {
          <div class="form-grid-2">
            <div class="field">
              <label class="field-label">Matricule</label>
              <input class="field-input" formControlName="matricule" placeholder="Ex: ETU-2025-016">
            </div>
            <div class="field">
              <label class="field-label">Niveau</label>
              <select class="field-input" formControlName="niveau">
                <option value="">Selectionner un niveau</option>
                @for (n of niveaux; track n) {
                  <option [value]="n">{{ n }}</option>
                }
              </select>
            </div>
          </div>
        }

        @if (form.get('role')?.value === 'ENSEIGNANT') {
          <div class="form-grid-2">
            <div class="field">
              <label class="field-label">Specialite</label>
              <input class="field-input" formControlName="specialite" placeholder="Ex: Genie Logiciel">
            </div>
            <div class="field">
              <label class="field-label">Grade</label>
              <select class="field-input" formControlName="grade">
                <option value="">Selectionner un grade</option>
                @for (g of grades; track g) {
                  <option [value]="g">{{ g }}</option>
                }
              </select>
            </div>
          </div>
        }

        @if (form.get('role')?.value === 'ADMIN') {
          <div class="form-grid-2">
            <div class="field">
              <label class="field-label">Fonction</label>
              <input class="field-input" formControlName="fonction" placeholder="Ex: Administrateur systeme">
            </div>
            <div class="field">
              <label class="field-label">Departement</label>
              <input class="field-input" formControlName="departement" placeholder="Ex: Direction des SI">
            </div>
          </div>
        }
      </form>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="onCancel()">Annuler</button>
        <button class="btn-primary" (click)="onSubmit()" [disabled]="form.invalid">Creer l'utilisateur</button>
      </div>
    </div>
  `
})
export class CreateUserDialogComponent implements OnInit {
  form!: FormGroup;

  roles: { value: Role; label: string }[] = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'RESPONSABLE_PEDAGOGIQUE', label: 'Responsable pedagogique' },
    { value: 'ENSEIGNANT', label: 'Enseignant' },
    { value: 'ETUDIANT', label: 'Etudiant' }
  ];

  niveaux = ['L1', 'L2', 'L3', 'M1', 'M2'];
  grades = ['Professeur', 'Maitre de conferences', 'Charge de cours', 'Assistant'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateUserDialogComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      role: ['ETUDIANT', Validators.required],
      telephone: [''],
      matricule: [''],
      niveau: [''],
      specialite: [''],
      grade: [''],
      fonction: [''],
      departement: ['']
    });
  }

  onCancel(): void { this.dialogRef.close(); }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

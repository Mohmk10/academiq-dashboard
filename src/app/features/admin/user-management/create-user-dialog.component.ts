import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Role } from '../../../core/models/user.model';
import { PhoneSnDirective } from '../../../shared/directives/phone-sn.directive';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, PhoneSnDirective],
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

        <div class="field">
          <label class="field-label">Email <span class="required">*</span></label>
          <input class="field-input" type="email" formControlName="email" placeholder="Ex: utilisateur@academiq.sn">
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Mot de passe <span class="required">*</span></label>
            <div style="position: relative;">
              <input class="field-input" [type]="showPassword ? 'text' : 'password'" formControlName="motDePasse" placeholder="Minimum 8 caracteres" style="padding-right: 2.5rem;">
              <button type="button" (click)="showPassword = !showPassword" style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b7280; padding: 0.25rem;">
                <i class="fas" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword"></i>
              </button>
            </div>
          </div>
          <div class="field">
            <label class="field-label">Confirmer le mot de passe <span class="required">*</span></label>
            <div style="position: relative;">
              <input class="field-input" [type]="showConfirmPassword ? 'text' : 'password'" formControlName="confirmMotDePasse" placeholder="Retapez le mot de passe" style="padding-right: 2.5rem;">
              <button type="button" (click)="showConfirmPassword = !showConfirmPassword" style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b7280; padding: 0.25rem;">
                <i class="fas" [class.fa-eye]="!showConfirmPassword" [class.fa-eye-slash]="showConfirmPassword"></i>
              </button>
            </div>
            @if (form.get('confirmMotDePasse')?.touched && form.hasError('motDePasseMismatch')) {
              <p style="color: #DC2626; font-size: 0.75rem; margin-top: 0.25rem;">Les mots de passe ne correspondent pas</p>
            }
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
            <label class="field-label">Telephone <span class="required">*</span></label>
            <input class="field-input" type="tel" formControlName="telephone" appPhoneSn placeholder="+221 XX XXX XX XX">
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
          <div class="form-grid-2">
            <div class="field">
              <label class="field-label">Nom du Tuteur(trice)</label>
              <input class="field-input" formControlName="nomTuteur" placeholder="Ex: Diallo Senior">
            </div>
            <div class="field">
              <label class="field-label">Numero du Tuteur(trice) <span class="required">*</span></label>
              <input class="field-input" type="tel" formControlName="numeroTuteur" appPhoneSn placeholder="+221 XX XXX XX XX">
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
  showPassword = false;
  showConfirmPassword = false;

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
      confirmMotDePasse: ['', Validators.required],
      role: ['ETUDIANT', Validators.required],
      telephone: ['', Validators.required],
      matricule: [''],
      niveau: [''],
      nomTuteur: [''],
      numeroTuteur: ['', Validators.required],
      specialite: [''],
      grade: [''],
      fonction: [''],
      departement: ['']
    }, { validators: this.passwordMatchValidator });

    this.form.get('role')!.valueChanges.subscribe(role => {
      const ctrl = this.form.get('numeroTuteur')!;
      if (role === 'ETUDIANT') {
        ctrl.setValidators(Validators.required);
      } else {
        ctrl.clearValidators();
        ctrl.setValue('');
      }
      ctrl.updateValueAndValidity();
    });
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const mdp = group.get('motDePasse')?.value;
    const confirm = group.get('confirmMotDePasse')?.value;
    return mdp === confirm ? null : { motDePasseMismatch: true };
  }

  onCancel(): void { this.dialogRef.close(); }

  onSubmit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      const result: any = {
        nom: v.nom,
        prenom: v.prenom,
        email: v.email,
        motDePasse: v.motDePasse,
        role: v.role,
        telephone: v.telephone
      };

      if (v.role === 'ETUDIANT') {
        if (v.matricule) result.matriculeEtudiant = v.matricule;
        if (v.niveau) result.niveauActuel = v.niveau;
        if (v.nomTuteur) result.nomTuteur = v.nomTuteur;
        if (v.numeroTuteur) result.numeroTuteur = v.numeroTuteur;
      } else if (v.role === 'ENSEIGNANT') {
        if (v.specialite) result.specialite = v.specialite;
        if (v.grade) result.grade = v.grade;
      } else if (v.role === 'ADMIN') {
        if (v.fonction) result.fonction = v.fonction;
        if (v.departement) result.departementAdmin = v.departement;
      }

      this.dialogRef.close(result);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UtilisateurDetail, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="space-y-6 max-w-3xl mx-auto">
      @if (isLoading) {
        <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <!-- Profil -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-5 mb-6">
            <div class="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" [class]="avatarClass">
              {{ initials }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-primary">{{ user?.prenom }} {{ user?.nom }}</h2>
              <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">{{ roleLabel }}</span>
              @if (user?.createdAt) {
                <p class="text-xs text-gray-400 mt-1">Membre depuis {{ formatDate(user!.createdAt!) }}</p>
              }
            </div>
          </div>

          <h3 class="text-lg font-semibold text-primary mb-4">Informations personnelles</h3>
          <form [formGroup]="profileForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" [readonly]="true" class="!text-gray-400">
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Téléphone</mat-label>
                <input matInput formControlName="telephone" [readonly]="!editMode">
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="nom" [readonly]="!editMode">
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="prenom" [readonly]="!editMode">
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Date de naissance</mat-label>
                <input matInput type="date" formControlName="dateNaissance" [readonly]="!editMode">
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Adresse</mat-label>
                <input matInput formControlName="adresse" [readonly]="!editMode">
              </mat-form-field>
            </div>
          </form>
          <div class="flex justify-end gap-3 mt-4">
            @if (!editMode) {
              <button mat-raised-button color="primary" (click)="editMode = true"><i class="fas fa-pen mr-2"></i> Modifier</button>
            } @else {
              <button mat-stroked-button (click)="cancelEdit()">Annuler</button>
              <button mat-raised-button color="primary" [disabled]="profileForm.invalid || isSaving" (click)="saveProfile()">
                @if (isSaving) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                Enregistrer
              </button>
            }
          </div>
        </div>

        <!-- Sécurité -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-primary mb-4"><i class="fas fa-shield-halved mr-2"></i> Sécurité</h3>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4 max-w-md">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Ancien mot de passe</mat-label>
              <input matInput [type]="showOld ? 'text' : 'password'" formControlName="ancienMotDePasse">
              <button mat-icon-button matSuffix type="button" (click)="showOld = !showOld"><mat-icon>{{ showOld ? 'visibility_off' : 'visibility' }}</mat-icon></button>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Nouveau mot de passe</mat-label>
              <input matInput [type]="showNew ? 'text' : 'password'" formControlName="nouveauMotDePasse">
              <button mat-icon-button matSuffix type="button" (click)="showNew = !showNew"><mat-icon>{{ showNew ? 'visibility_off' : 'visibility' }}</mat-icon></button>
            </mat-form-field>
            @if (passwordForm.get('nouveauMotDePasse')?.value) {
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 rounded-full bg-gray-200">
                  <div class="h-2 rounded-full transition-all" [style.width.%]="passwordStrength.percent" [class]="passwordStrength.class"></div>
                </div>
                <span class="text-xs font-medium" [class]="passwordStrength.textClass">{{ passwordStrength.label }}</span>
              </div>
            }
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Confirmer le mot de passe</mat-label>
              <input matInput [type]="showConfirm ? 'text' : 'password'" formControlName="confirmationMotDePasse">
              <button mat-icon-button matSuffix type="button" (click)="showConfirm = !showConfirm"><mat-icon>{{ showConfirm ? 'visibility_off' : 'visibility' }}</mat-icon></button>
              @if (passwordForm.hasError('mismatch')) {
                <mat-error>Les mots de passe ne correspondent pas</mat-error>
              }
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="passwordForm.invalid || isChangingPassword">
              @if (isChangingPassword) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
              Changer le mot de passe
            </button>
          </form>
        </div>

        <!-- Informations spécifiques -->
        @if (user?.etudiant || user?.enseignant || user?.admin) {
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-primary mb-4"><i class="fas fa-id-card mr-2"></i> Informations spécifiques</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              @if (user?.etudiant; as etu) {
                <div><span class="text-xs text-gray-400 uppercase">Matricule</span><p class="font-medium">{{ etu.matricule }}</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Niveau</span><p class="text-sm">{{ etu.niveauActuel || '—' }}</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Filière</span><p class="text-sm">{{ etu.filiereActuelle || '—' }}</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Tuteur</span><p class="text-sm">{{ etu.nomTuteur || '—' }}</p></div>
              }
              @if (user?.enseignant; as ens) {
                <div><span class="text-xs text-gray-400 uppercase">Matricule</span><p class="font-medium">{{ ens.matricule }}</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Spécialité</span><p class="text-sm">{{ ens.specialite }}</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Grade</span><p class="text-sm">{{ ens.grade || '—' }}</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Département</span><p class="text-sm">{{ ens.departement || '—' }}</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Bureau</span><p class="text-sm">{{ ens.bureau || '—' }}</p></div>
              }
              @if (user?.admin; as adm) {
                <div><span class="text-xs text-gray-400 uppercase">Fonction</span><p class="font-medium">{{ adm.fonction }}</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Département</span><p class="text-sm">{{ adm.departement || '—' }}</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Niveau</span><p class="text-sm">{{ adm.niveau }}</p></div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export default class ProfileComponent implements OnInit {
  user: UtilisateurDetail | null = null;
  role: Role | null;
  isLoading = true;
  editMode = false;
  isSaving = false;
  isChangingPassword = false;
  showOld = false;
  showNew = false;
  showConfirm = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  initials = '';
  roleLabel = '';
  avatarClass = 'bg-secondary';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private notification: NotificationService
  ) {
    this.role = this.authService.getCurrentUserRole();
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: [''],
      dateNaissance: [''],
      adresse: ['']
    });
    this.passwordForm = this.fb.group({
      ancienMotDePasse: ['', Validators.required],
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmationMotDePasse: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res) => {
        const profile = res.data;
        this.utilisateurService.getById(profile.id).subscribe({
          next: (detailRes) => { this.setUser(detailRes.data); this.isLoading = false; },
          error: () => { this.setUserFromProfile(profile); this.isLoading = false; }
        });
      },
      error: () => { this.isLoading = false; this.loadMockData(); }
    });
  }

  private setUser(user: UtilisateurDetail): void {
    this.user = user;
    this.profileForm.patchValue({
      email: user.email, nom: user.nom, prenom: user.prenom,
      telephone: user.telephone || '', dateNaissance: user.dateNaissance || '', adresse: user.adresse || ''
    });
    this.initials = `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
    this.setRoleDisplay();
  }

  private setUserFromProfile(profile: any): void {
    this.user = { id: profile.id, nom: profile.nom, prenom: profile.prenom, email: profile.email, role: profile.role, actif: profile.actif, createdAt: profile.createdAt };
    this.profileForm.patchValue({ email: profile.email, nom: profile.nom, prenom: profile.prenom });
    this.initials = `${profile.prenom.charAt(0)}${profile.nom.charAt(0)}`.toUpperCase();
    this.setRoleDisplay();
  }

  private setRoleDisplay(): void {
    const labels: Record<string, string> = { ADMIN: 'Administrateur', ENSEIGNANT: 'Enseignant', ETUDIANT: 'Étudiant', RESPONSABLE_PEDAGOGIQUE: 'Responsable pédagogique' };
    this.roleLabel = labels[this.user?.role ?? ''] || '';
    const colors: Record<string, string> = { ADMIN: 'bg-primary', ENSEIGNANT: 'bg-secondary', ETUDIANT: 'bg-accent', RESPONSABLE_PEDAGOGIQUE: 'bg-success' };
    this.avatarClass = colors[this.user?.role ?? ''] || 'bg-secondary';
  }

  cancelEdit(): void {
    this.editMode = false;
    if (this.user) {
      this.profileForm.patchValue({ nom: this.user.nom, prenom: this.user.prenom, telephone: this.user.telephone || '', dateNaissance: this.user.dateNaissance || '', adresse: this.user.adresse || '' });
    }
  }

  saveProfile(): void {
    if (!this.user || this.profileForm.invalid) return;
    this.isSaving = true;
    const data = this.profileForm.getRawValue();
    this.utilisateurService.update(this.user.id, data).subscribe({
      next: () => {
        this.notification.success('Profil mis à jour');
        this.editMode = false;
        this.isSaving = false;
        if (this.user) {
          this.user.nom = data.nom;
          this.user.prenom = data.prenom;
          this.user.telephone = data.telephone;
          this.initials = `${data.prenom.charAt(0)}${data.nom.charAt(0)}`.toUpperCase();
        }
      },
      error: () => { this.isSaving = false; }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.isChangingPassword = true;
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.notification.success('Mot de passe modifié avec succès');
        this.passwordForm.reset();
        this.isChangingPassword = false;
      },
      error: () => { this.isChangingPassword = false; }
    });
  }

  get passwordStrength(): { percent: number; label: string; class: string; textClass: string } {
    const pwd = this.passwordForm.get('nouveauMotDePasse')?.value || '';
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    if (score <= 2) return { percent: 33, label: 'Faible', class: 'bg-danger', textClass: 'text-danger' };
    if (score <= 3) return { percent: 66, label: 'Moyen', class: 'bg-warning', textClass: 'text-warning' };
    return { percent: 100, label: 'Fort', class: 'bg-success', textClass: 'text-success' };
  }

  formatDate(date: string): string { return new Date(date).toLocaleDateString('fr-FR'); }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pwd = control.get('nouveauMotDePasse')?.value;
    const confirm = control.get('confirmationMotDePasse')?.value;
    return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
  }

  private loadMockData(): void {
    this.setUser({
      id: 1, nom: 'Kouyaté', prenom: 'Makan', email: 'makan@univ.ml', role: 'ADMIN',
      telephone: '+223 76 00 00 00', actif: true, createdAt: '2024-01-15',
      admin: { id: 1, fonction: 'Administrateur système', departement: 'Direction des Systèmes d\'Information', niveau: 'Super Admin' }
    });
  }
}

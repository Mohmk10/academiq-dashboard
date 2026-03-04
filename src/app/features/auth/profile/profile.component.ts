import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="space-y-6 max-w-3xl mx-auto fade-in-up">
      @if (isLoading) {
        <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <!-- Profil -->
        <div class="card">
          <div class="flex items-center gap-5 mb-6">
            <div class="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" [class]="avatarClass">
              {{ initials }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ user?.prenom }} {{ user?.nom }}</h2>
              <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{{ roleLabel }}</span>
              @if (user?.createdAt) {
                <p class="text-xs text-gray-400 mt-1">Membre depuis {{ formatDate(user!.createdAt!) }}</p>
              }
            </div>
          </div>

          <h3 class="section-title">Informations personnelles</h3>
          @if (!editMode) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div><span class="text-xs text-gray-400 uppercase">Email</span><p class="font-medium text-gray-400">{{ user?.email }}</p></div>
              <div><span class="text-xs text-gray-400 uppercase">Téléphone</span><p class="text-sm">{{ user?.telephone || '—' }}</p></div>
              <div><span class="text-xs text-gray-400 uppercase">Nom</span><p class="text-sm">{{ user?.nom }}</p></div>
              <div><span class="text-xs text-gray-400 uppercase">Prénom</span><p class="text-sm">{{ user?.prenom }}</p></div>
              <div><span class="text-xs text-gray-400 uppercase">Date de naissance</span><p class="text-sm">{{ user?.dateNaissance ? formatDate(user!.dateNaissance!) : '—' }}</p></div>
              <div><span class="text-xs text-gray-400 uppercase">Adresse</span><p class="text-sm">{{ user?.adresse || '—' }}</p></div>
            </div>
            <div class="flex justify-end gap-3 mt-4">
              <button mat-raised-button color="primary" (click)="editMode = true"><i class="fas fa-pen mr-2"></i> Modifier</button>
            </div>
          } @else {
            <form [formGroup]="profileForm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <div class="field">
                  <label class="field-label">Email</label>
                  <input class="field-input !text-gray-400" formControlName="email" readonly>
                </div>
                <div class="field">
                  <label class="field-label">Téléphone</label>
                  <input class="field-input" formControlName="telephone">
                </div>
                <div class="field">
                  <label class="field-label">Nom <span class="required">*</span></label>
                  <input class="field-input" formControlName="nom">
                </div>
                <div class="field">
                  <label class="field-label">Prénom <span class="required">*</span></label>
                  <input class="field-input" formControlName="prenom">
                </div>
                <div class="field">
                  <label class="field-label">Date de naissance</label>
                  <input class="field-input" type="date" formControlName="dateNaissance">
                </div>
                <div class="field">
                  <label class="field-label">Adresse</label>
                  <input class="field-input" formControlName="adresse">
                </div>
              </div>
            </form>
            <div class="flex justify-end gap-3 mt-4">
              <button mat-stroked-button (click)="cancelEdit()">Annuler</button>
              <button mat-raised-button color="primary" [disabled]="profileForm.invalid || isSaving" (click)="saveProfile()">
                @if (isSaving) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                Enregistrer
              </button>
            </div>
          }
        </div>

        <!-- Sécurité -->
        <div class="card">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <i class="fas fa-shield-halved text-primary"></i>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">Sécurité</h3>
              <p class="text-xs text-gray-400">Modifier votre mot de passe</p>
            </div>
          </div>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-5 max-w-md">
            <div class="field">
              <label class="field-label">Ancien mot de passe <span class="required">*</span></label>
              <div class="field-with-icon">
                <i class="fas fa-lock field-icon-left"></i>
                <input class="field-input" [type]="showOld ? 'text' : 'password'" formControlName="ancienMotDePasse" placeholder="Entrez votre mot de passe actuel">
                <button type="button" class="field-icon-right" (click)="showOld = !showOld">
                  <i class="fas" [class.fa-eye]="!showOld" [class.fa-eye-slash]="showOld"></i>
                </button>
              </div>
            </div>
            <div class="field">
              <label class="field-label">Nouveau mot de passe <span class="required">*</span></label>
              <div class="field-with-icon">
                <i class="fas fa-lock field-icon-left"></i>
                <input class="field-input" [type]="showNew ? 'text' : 'password'" formControlName="nouveauMotDePasse" placeholder="Minimum 8 caractères">
                <button type="button" class="field-icon-right" (click)="showNew = !showNew">
                  <i class="fas" [class.fa-eye]="!showNew" [class.fa-eye-slash]="showNew"></i>
                </button>
              </div>
            </div>
            @if (passwordForm.get('nouveauMotDePasse')?.value) {
              <div class="space-y-2">
                <div class="flex gap-1.5">
                  <div class="flex-1 h-1.5 rounded-full transition-all duration-300"
                    [class]="passwordStrength.percent >= 33 ? passwordStrength.barClass : 'bg-gray-200'"></div>
                  <div class="flex-1 h-1.5 rounded-full transition-all duration-300"
                    [class]="passwordStrength.percent >= 66 ? passwordStrength.barClass : 'bg-gray-200'"></div>
                  <div class="flex-1 h-1.5 rounded-full transition-all duration-300"
                    [class]="passwordStrength.percent >= 100 ? passwordStrength.barClass : 'bg-gray-200'"></div>
                </div>
                <p class="text-xs font-medium" [class]="passwordStrength.textClass">
                  <i class="fas" [class]="passwordStrength.icon"></i>
                  {{ passwordStrength.label }}
                </p>
              </div>
            }
            <div class="field">
              <label class="field-label">Confirmer le mot de passe <span class="required">*</span></label>
              <div class="field-with-icon">
                <i class="fas fa-lock field-icon-left"></i>
                <input class="field-input" [type]="showConfirm ? 'text' : 'password'" formControlName="confirmationMotDePasse" placeholder="Retapez le nouveau mot de passe">
                <button type="button" class="field-icon-right" (click)="showConfirm = !showConfirm">
                  <i class="fas" [class.fa-eye]="!showConfirm" [class.fa-eye-slash]="showConfirm"></i>
                </button>
              </div>
              @if (passwordForm.hasError('mismatch')) {
                <div class="field-error"><i class="fas fa-circle-exclamation"></i> Les mots de passe ne correspondent pas</div>
              }
            </div>
            <button type="submit" class="btn-primary w-full justify-center !py-3" [disabled]="passwordForm.invalid || isChangingPassword">
              @if (isChangingPassword) {
                <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner>
              }
              <i class="fas fa-key mr-2"></i> Mettre à jour le mot de passe
            </button>
          </form>
        </div>

        <!-- Informations spécifiques -->
        @if (user?.etudiant || user?.enseignant || user?.admin) {
          <div class="card">
            <h3 class="section-title"><i class="fas fa-id-card mr-2"></i> Informations spécifiques</h3>
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
  avatarClass = 'bg-primary';

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
    const colors: Record<string, string> = { ADMIN: 'bg-primary', ENSEIGNANT: 'bg-emerald-600', ETUDIANT: 'bg-accent', RESPONSABLE_PEDAGOGIQUE: 'bg-success' };
    this.avatarClass = colors[this.user?.role ?? ''] || 'bg-primary';
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

  get passwordStrength(): { percent: number; label: string; barClass: string; textClass: string; icon: string } {
    const pwd = this.passwordForm.get('nouveauMotDePasse')?.value || '';
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    if (score <= 2) return { percent: 33, label: 'Faible', barClass: 'bg-red-400', textClass: 'text-red-500', icon: 'fa-circle-xmark' };
    if (score <= 3) return { percent: 66, label: 'Moyen', barClass: 'bg-amber-400', textClass: 'text-amber-600', icon: 'fa-circle-minus' };
    return { percent: 100, label: 'Fort', barClass: 'bg-emerald-400', textClass: 'text-emerald-600', icon: 'fa-circle-check' };
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

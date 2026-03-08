import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { AlerteService } from '../../core/services/alerte.service';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UtilisateurSummary } from '../../core/models/user.model';
import { RegleAlerteResponse, TypeAlerte } from '../../core/models/alerte.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTabsModule,
    MatCheckboxModule, MatSlideToggleModule,
    MatMenuModule, MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="space-y-6 fade-in-up">
      <div>
        <h1 class="page-title">Paramètres</h1>
        <p class="text-sm text-gray-500 mt-1">Configuration et administration du système</p>
      </div>

      <mat-tab-group animationDuration="200ms">
        <!-- Onglet Utilisateurs -->
        <mat-tab>
          <ng-template mat-tab-label><i class="fas fa-users mr-2"></i> Utilisateurs</ng-template>
          <div class="pt-6 space-y-4">
            <!-- Stats rapides -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              @for (stat of userStats; track stat.role) {
                <div class="card text-center">
                  <p class="text-2xl font-bold text-gray-900">{{ stat.count }}</p>
                  <p class="text-xs text-gray-500">{{ stat.label }}</p>
                </div>
              }
            </div>

            <!-- Recherche + actions -->
            <div class="flex flex-col sm:flex-row gap-4 items-end">
              <div class="field !mb-0 flex-1">
                <div class="field-with-icon">
                  <i class="fas fa-search field-icon-left"></i>
                  <input class="field-input" [formControl]="userSearch" placeholder="Rechercher...">
                </div>
              </div>
              <div class="field !mb-0 w-40">
                <select class="field-input" [formControl]="roleFilter">
                  <option value="">Tous les rôles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="ENSEIGNANT">Enseignant</option>
                  <option value="ETUDIANT">Étudiant</option>
                </select>
              </div>
            </div>

            <!-- Table utilisateurs -->
            @if (usersLoading) {
              <div class="flex justify-center py-8"><mat-spinner diameter="40"></mat-spinner></div>
            } @else {
              <div class="data-table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of users; track row.id) {
                      <tr>
                        <td class="cell-primary">{{ row.prenom }} {{ row.nom }}</td>
                        <td class="cell-secondary">{{ row.email }}</td>
                        <td><span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getRoleBadge(row.role)">{{ getRoleLabel(row.role) }}</span></td>
                        <td><span class="px-2.5 py-1 rounded-full text-xs font-medium" [class]="row.actif ? 'bg-green-50 text-success' : 'bg-gray-100 text-gray-500'">{{ row.actif ? 'Actif' : 'Inactif' }}</span></td>
                        <td class="cell-actions">
                          @if (row.role !== 'SUPER_ADMIN' && row.role !== 'ADMIN' && row.email !== currentUserEmail) {
                            <button class="action-menu-btn" [matMenuTriggerFor]="menu"><i class="fas fa-ellipsis-vertical"></i></button>
                            <mat-menu #menu="matMenu">
                              <button mat-menu-item (click)="toggleUser(row)">
                                <i class="fas mr-3" [class]="row.actif ? 'fa-lock text-warning' : 'fa-lock-open text-success'"></i>
                                {{ row.actif ? 'Désactiver' : 'Activer' }}
                              </button>
                              <button mat-menu-item (click)="deleteUser(row)" class="!text-danger"><i class="fas fa-trash mr-3"></i> Supprimer</button>
                            </mat-menu>
                          } @else {
                            <span class="text-gray-300 text-xs">—</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
                <div class="table-pagination">
                  <div class="pagination-info">
                    <span>{{ userPageIndex * userPageSize + 1 }}</span>–<span>{{ min((userPageIndex + 1) * userPageSize, totalUsers) }}</span> sur <span>{{ totalUsers }}</span>
                  </div>
                  <div class="pagination-controls">
                    <button class="pagination-btn" [disabled]="userPageIndex === 0" (click)="goToUserPage(0)"><i class="fas fa-angles-left"></i></button>
                    <button class="pagination-btn" [disabled]="userPageIndex === 0" (click)="goToUserPage(userPageIndex - 1)"><i class="fas fa-chevron-left"></i></button>
                    @for (p of userVisiblePages; track p) {
                      <button class="pagination-btn" [class.active]="p === userPageIndex" (click)="goToUserPage(p)">{{ p + 1 }}</button>
                    }
                    <button class="pagination-btn" [disabled]="userPageIndex >= userTotalPages - 1" (click)="goToUserPage(userPageIndex + 1)"><i class="fas fa-chevron-right"></i></button>
                    <button class="pagination-btn" [disabled]="userPageIndex >= userTotalPages - 1" (click)="goToUserPage(userTotalPages - 1)"><i class="fas fa-angles-right"></i></button>
                  </div>
                  <div class="pagination-size">
                    <span>Lignes</span>
                    <select [value]="userPageSize" (change)="changeUserPageSize(+$any($event.target).value)">
                      <option [value]="10">10</option>
                      <option [value]="25">25</option>
                      <option [value]="50">50</option>
                    </select>
                  </div>
                </div>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Onglet Règles d'alerte -->
        <mat-tab>
          <ng-template mat-tab-label><i class="fas fa-bell mr-2"></i> Règles d'alerte</ng-template>
          <div class="pt-6 space-y-4">
            @if (reglesLoading) {
              <div class="flex justify-center py-8"><mat-spinner diameter="40"></mat-spinner></div>
            } @else if (regles.length === 0) {
              <div class="flex flex-col items-center justify-center py-16 text-gray-400">
                <i class="fas fa-bell-slash text-5xl mb-4"></i>
                <p class="font-medium">Aucune règle configurée</p>
              </div>
            } @else {
              <div class="data-table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Seuil</th>
                      <th>Description</th>
                      <th>Actif</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of regles; track row.id) {
                      <tr>
                        <td class="cell-primary">{{ getTypeLabel(row.type) }}</td>
                        <td>{{ row.seuil }}</td>
                        <td class="cell-secondary">{{ row.description || '—' }}</td>
                        <td><mat-slide-toggle [checked]="row.actif" (change)="toggleRegle(row)" color="primary"></mat-slide-toggle></td>
                        <td class="cell-actions">
                          <button class="action-menu-btn" style="color: #DC2626;" (click)="deleteRegle(row)"><i class="fas fa-trash"></i></button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Onglet Système -->
        <mat-tab>
          <ng-template mat-tab-label><i class="fas fa-server mr-2"></i> Système</ng-template>
          <div class="pt-6 space-y-6">
            <div class="card">
              <h3 class="section-title">Informations système</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div><span class="text-xs text-gray-400 uppercase">Version</span><p class="font-medium">1.0.0</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Base de données</span><p class="font-medium">PostgreSQL (Neon)</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Backend</span><p class="font-medium">Spring Boot 3.4</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Frontend</span><p class="font-medium">Angular 18</p></div>
                <div><span class="text-xs text-gray-400 uppercase">Dernière mise à jour</span><p class="font-medium">{{ todayDate }}</p></div>
              </div>
            </div>

            <div class="card">
              <h3 class="section-title">Maintenance</h3>
              <div class="flex flex-wrap gap-3">
                <button class="btn-primary" [disabled]="isAnalyzing" (click)="analyserPromotions()">
                  @if (isAnalyzing) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                  <i class="fas fa-magnifying-glass-chart mr-2"></i> Analyser toutes les promotions
                </button>
                <button class="btn-secondary" [disabled]="isExporting" (click)="exporterDonnees()">
                  @if (isExporting) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                  <i class="fas fa-database mr-2"></i> Exporter toutes les données
                </button>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export default class SettingsComponent implements OnInit, OnDestroy {
  users: UtilisateurSummary[] = [];
  totalUsers = 0;
  userPageSize = 10;
  userPageIndex = 0;
  usersLoading = true;
  userSearch = new FormControl('');
  roleFilter = new FormControl('');

  regles: RegleAlerteResponse[] = [];
  reglesLoading = true;

  userStats: { role: string; label: string; count: number }[] = [];
  todayDate = new Date().toLocaleDateString('fr-FR');
  isAnalyzing = false;
  isExporting = false;
  currentUserEmail = '';

  private destroy$ = new Subject<void>();

  constructor(
    private utilisateurService: UtilisateurService,
    private alerteService: AlerteService,
    private adminService: AdminService,
    private authService: AuthService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {
    this.authService.currentUser$.subscribe(u => {
      this.currentUserEmail = u?.email ?? '';
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRegles();
    this.loadUserStats();

    this.userSearch.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => { this.userPageIndex = 0; this.loadUsers(); });
    this.roleFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => { this.userPageIndex = 0; this.loadUsers(); });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadUsers(): void {
    this.usersLoading = true;
    const keyword = this.userSearch.value?.trim();
    const role = this.roleFilter.value;
    const obs = keyword
      ? this.utilisateurService.rechercher(keyword, this.userPageIndex, this.userPageSize)
      : this.utilisateurService.getAll(this.userPageIndex, this.userPageSize, role as any || undefined);

    obs.subscribe({
      next: (res) => { this.users = res.data.content; this.totalUsers = res.data.totalElements; this.usersLoading = false; },
      error: () => { this.usersLoading = false; this.users = []; this.totalUsers = 0; }
    });
  }

  loadRegles(): void {
    this.reglesLoading = true;
    this.alerteService.getRegles().subscribe({
      next: (res) => { this.regles = res.data; this.reglesLoading = false; },
      error: () => { this.reglesLoading = false; this.regles = []; }
    });
  }

  loadUserStats(): void {
    this.utilisateurService.getStats().subscribe({
      next: (res) => {
        const data = res.data;
        this.userStats = [
          { role: 'ADMIN', label: 'Administrateurs', count: data.admins || 0 },
          { role: 'ENSEIGNANT', label: 'Enseignants', count: data.enseignants || 0 },
          { role: 'ETUDIANT', label: 'Étudiants', count: data.etudiants || 0 },
          { role: 'TOTAL', label: 'Total', count: data.total || 0 },
        ];
      },
      error: () => { this.userStats = []; }
    });
  }

  get userTotalPages(): number { return Math.ceil(this.totalUsers / this.userPageSize); }
  get userVisiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.userPageIndex - 2);
    const end = Math.min(this.userTotalPages, start + 5);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }
  goToUserPage(page: number): void { this.userPageIndex = page; this.loadUsers(); }
  changeUserPageSize(size: number): void { this.userPageSize = size; this.userPageIndex = 0; this.loadUsers(); }
  min(a: number, b: number): number { return Math.min(a, b); }

  toggleUser(user: UtilisateurSummary): void {
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return;
    if (user.email === this.currentUserEmail) {
      this.notification.error('Vous ne pouvez pas désactiver votre propre compte');
      return;
    }
    this.utilisateurService.toggleActivation(user.id).subscribe({
      next: () => { this.notification.success(`Utilisateur ${user.actif ? 'désactivé' : 'activé'}`); this.loadUsers(); },
      error: () => this.notification.error('Erreur lors de l\'operation')
    });
  }

  deleteUser(user: UtilisateurSummary): void {
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return;
    if (user.email === this.currentUserEmail) {
      this.notification.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw', data: { title: 'Supprimer l\'utilisateur', message: `Supprimer ${user.prenom} ${user.nom} ?`, confirmText: 'Supprimer' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.utilisateurService.delete(user.id).subscribe({
        next: () => { this.notification.success('Utilisateur supprimé'); this.loadUsers(); },
        error: () => {}
      });
    });
  }

  toggleRegle(regle: RegleAlerteResponse): void {
    this.alerteService.toggleRegle(regle.id).subscribe({
      next: () => { regle.actif = !regle.actif; },
      error: () => {}
    });
  }

  deleteRegle(regle: RegleAlerteResponse): void {
    this.alerteService.deleteRegle(regle.id).subscribe({
      next: () => { this.notification.success('Règle supprimée'); this.loadRegles(); },
      error: () => {}
    });
  }

  analyserPromotions(): void {
    this.isAnalyzing = true;
    this.alerteService.analyserToutes().subscribe({
      next: () => {
        this.isAnalyzing = false;
        this.notification.success('Analyse de toutes les promotions terminée');
      },
      error: () => {
        this.isAnalyzing = false;
        this.notification.error('Erreur lors de l\'analyse des promotions');
      }
    });
  }

  exporterDonnees(): void {
    this.isExporting = true;
    this.adminService.exporterDonnees().subscribe({
      next: (blob) => {
        this.isExporting = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export-donnees.zip';
        a.click();
        window.URL.revokeObjectURL(url);
        this.notification.success('Export téléchargé avec succès');
      },
      error: () => {
        this.isExporting = false;
        this.notification.error('Erreur lors de l\'export des données');
      }
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = { ADMIN: 'Admin', ENSEIGNANT: 'Enseignant', ETUDIANT: 'Étudiant', RESPONSABLE_PEDAGOGIQUE: 'Resp. péda.' };
    return labels[role] || role;
  }

  getRoleBadge(role: string): string {
    const classes: Record<string, string> = { ADMIN: 'bg-primary/10 text-primary', ENSEIGNANT: 'bg-emerald-50 text-emerald-700', ETUDIANT: 'bg-accent/10 text-amber-700', RESPONSABLE_PEDAGOGIQUE: 'bg-green-50 text-success' };
    return classes[role] || 'bg-gray-100 text-gray-600';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { NOTE_ELIMINATOIRE: 'Note éliminatoire', ABSENCES_REPETEES: 'Absences répétées', MOYENNE_FAIBLE: 'Moyenne faible', RISQUE_EXCLUSION: 'Risque exclusion', CHUTE_PERFORMANCE: 'Chute performance', NON_ASSIDUITE: 'Non-assiduité' };
    return labels[type] || type;
  }

}

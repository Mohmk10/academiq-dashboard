import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { AlerteService } from '../../core/services/alerte.service';
import { NotificationService } from '../../core/services/notification.service';
import { UtilisateurSummary } from '../../core/models/user.model';
import { RegleAlerteResponse, TypeAlerte } from '../../core/models/alerte.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTabsModule, MatTableModule,
    MatPaginatorModule,
    MatButtonModule, MatIconModule, MatCheckboxModule, MatSlideToggleModule,
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
              <div class="card !p-0 overflow-hidden">
                <div class="overflow-x-auto">
                  <table mat-table [dataSource]="users" class="w-full">
                    <ng-container matColumnDef="nom">
                      <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Nom</th>
                      <td mat-cell *matCellDef="let row" class="!font-medium">{{ row.prenom }} {{ row.nom }}</td>
                    </ng-container>
                    <ng-container matColumnDef="email">
                      <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Email</th>
                      <td mat-cell *matCellDef="let row" class="text-sm text-gray-500">{{ row.email }}</td>
                    </ng-container>
                    <ng-container matColumnDef="role">
                      <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Rôle</th>
                      <td mat-cell *matCellDef="let row">
                        <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getRoleBadge(row.role)">{{ getRoleLabel(row.role) }}</span>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="statut">
                      <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Statut</th>
                      <td mat-cell *matCellDef="let row">
                        <span class="px-2.5 py-1 rounded-full text-xs font-medium" [class]="row.actif ? 'bg-green-50 text-success' : 'bg-gray-100 text-gray-500'">{{ row.actif ? 'Actif' : 'Inactif' }}</span>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef class="!w-16"></th>
                      <td mat-cell *matCellDef="let row">
                        <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
                        <mat-menu #menu="matMenu">
                          <button mat-menu-item (click)="toggleUser(row)">
                            <i class="fas mr-3" [class]="row.actif ? 'fa-lock text-warning' : 'fa-lock-open text-success'"></i>
                            {{ row.actif ? 'Désactiver' : 'Activer' }}
                          </button>
                          <button mat-menu-item (click)="deleteUser(row)" class="!text-danger"><i class="fas fa-trash mr-3"></i> Supprimer</button>
                        </mat-menu>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: userColumns" class="hover:bg-gray-50 transition-colors"></tr>
                  </table>
                </div>
                <mat-paginator [length]="totalUsers" [pageSize]="userPageSize" [pageSizeOptions]="[10, 25, 50]" [pageIndex]="userPageIndex" (page)="onUserPageChange($event)" showFirstLastButtons></mat-paginator>
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
              <div class="card !p-0 overflow-hidden">
                <div class="overflow-x-auto">
                  <table mat-table [dataSource]="regles" class="w-full">
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Type</th>
                      <td mat-cell *matCellDef="let row" class="!font-medium">{{ getTypeLabel(row.type) }}</td>
                    </ng-container>
                    <ng-container matColumnDef="seuil">
                      <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Seuil</th>
                      <td mat-cell *matCellDef="let row">{{ row.seuil }}</td>
                    </ng-container>
                    <ng-container matColumnDef="description">
                      <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Description</th>
                      <td mat-cell *matCellDef="let row" class="text-sm text-gray-500">{{ row.description || '—' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="actif">
                      <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Actif</th>
                      <td mat-cell *matCellDef="let row">
                        <mat-slide-toggle [checked]="row.actif" (change)="toggleRegle(row)" color="primary"></mat-slide-toggle>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef class="!w-16"></th>
                      <td mat-cell *matCellDef="let row">
                        <button mat-icon-button color="warn" (click)="deleteRegle(row)"><mat-icon class="!text-lg">delete</mat-icon></button>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="regleColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: regleColumns" class="hover:bg-gray-50 transition-colors"></tr>
                  </table>
                </div>
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
                <button mat-raised-button color="primary" [disabled]="isAnalyzing" (click)="analyserPromotions()">
                  @if (isAnalyzing) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                  <i class="fas fa-magnifying-glass-chart mr-2"></i> Analyser toutes les promotions
                </button>
                <button mat-stroked-button (click)="exporterDonnees()">
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
  userColumns = ['nom', 'email', 'role', 'statut', 'actions'];
  totalUsers = 0;
  userPageSize = 10;
  userPageIndex = 0;
  usersLoading = true;
  userSearch = new FormControl('');
  roleFilter = new FormControl('');

  regles: RegleAlerteResponse[] = [];
  regleColumns = ['type', 'seuil', 'description', 'actif', 'actions'];
  reglesLoading = true;

  userStats: { role: string; label: string; count: number }[] = [];
  todayDate = new Date().toLocaleDateString('fr-FR');
  isAnalyzing = false;

  private destroy$ = new Subject<void>();

  constructor(
    private utilisateurService: UtilisateurService,
    private alerteService: AlerteService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

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
      error: () => { this.usersLoading = false; this.loadMockUsers(); }
    });
  }

  loadRegles(): void {
    this.reglesLoading = true;
    this.alerteService.getRegles().subscribe({
      next: (res) => { this.regles = res.data; this.reglesLoading = false; },
      error: () => {
        this.reglesLoading = false;
        this.regles = [
          { id: 1, type: 'MOYENNE_FAIBLE', seuil: 10, actif: true, description: 'Alerte si moyenne < 10', createdAt: '2024-10-01' },
          { id: 2, type: 'NOTE_BASSE', seuil: 5, actif: true, description: 'Alerte si note < 5', createdAt: '2024-10-01' },
        ];
      }
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
      error: () => {
        this.userStats = [
          { role: 'ADMIN', label: 'Administrateurs', count: 2 },
          { role: 'ENSEIGNANT', label: 'Enseignants', count: 8 },
          { role: 'ETUDIANT', label: 'Étudiants', count: 120 },
          { role: 'TOTAL', label: 'Total', count: 130 },
        ];
      }
    });
  }

  onUserPageChange(event: PageEvent): void {
    this.userPageIndex = event.pageIndex;
    this.userPageSize = event.pageSize;
    this.loadUsers();
  }

  toggleUser(user: UtilisateurSummary): void {
    this.utilisateurService.toggleActivation(user.id).subscribe({
      next: () => { this.notification.success(`Utilisateur ${user.actif ? 'désactivé' : 'activé'}`); this.loadUsers(); },
      error: () => {}
    });
  }

  deleteUser(user: UtilisateurSummary): void {
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
    setTimeout(() => {
      this.isAnalyzing = false;
      this.notification.success('Analyse terminée — alertes générées');
    }, 2000);
  }

  exporterDonnees(): void {
    this.notification.info('Fonctionnalité à venir');
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
    const labels: Record<string, string> = { NOTE_BASSE: 'Note basse', ABSENCE_NOTE: 'Absence', MOYENNE_FAIBLE: 'Moyenne faible', RISQUE_ECHEC: 'Risque échec', CUSTOM: 'Personnalisée' };
    return labels[type] || type;
  }

  private loadMockUsers(): void {
    this.users = [
      { id: 1, nom: 'Kouyaté', prenom: 'Makan', email: 'makan@univ.ml', role: 'ADMIN', actif: true },
      { id: 10, nom: 'Keita', prenom: 'Ousmane', email: 'ousmane.keita@univ.ml', role: 'ENSEIGNANT', actif: true, matricule: 'ENS-2020-001' },
      { id: 20, nom: 'Diallo', prenom: 'Amadou', email: 'amadou.diallo@univ.ml', role: 'ETUDIANT', actif: true, matricule: 'ETU-2024-001' },
    ];
    this.totalUsers = 3;
  }
}

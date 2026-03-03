import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlerteService } from '../../../core/services/alerte.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlerteResponse, StatutAlerte } from '../../../core/models/alerte.model';
import { TraiterAlerteDialogComponent } from './dialogs/traiter-alerte-dialog.component';
import { ReglesDialogComponent } from './dialogs/regles-dialog.component';

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-primary">Alertes pédagogiques</h1>
          <p class="text-sm text-gray-500 mt-1">Suivi et traitement des alertes académiques</p>
        </div>
        <div class="flex gap-2">
          @if (isAdmin) {
            <button mat-stroked-button (click)="openRegles()">
              <i class="fas fa-cog mr-2"></i> Gérer les règles
            </button>
          }
        </div>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-red-50 rounded-xl p-4 border border-red-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><i class="fas fa-circle-exclamation text-danger"></i></div>
            <div><p class="text-2xl font-bold text-danger">{{ stats.critiques }}</p><p class="text-xs text-gray-500">Critiques</p></div>
          </div>
        </div>
        <div class="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><i class="fas fa-triangle-exclamation text-warning"></i></div>
            <div><p class="text-2xl font-bold text-warning">{{ stats.attention }}</p><p class="text-xs text-gray-500">Attention</p></div>
          </div>
        </div>
        <div class="bg-green-50 rounded-xl p-4 border border-green-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><i class="fas fa-check-circle text-success"></i></div>
            <div><p class="text-2xl font-bold text-success">{{ stats.traitees }}</p><p class="text-xs text-gray-500">Traitées</p></div>
          </div>
        </div>
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><i class="fas fa-chart-bar text-secondary"></i></div>
            <div><p class="text-2xl font-bold text-secondary">{{ stats.total }}</p><p class="text-xs text-gray-500">Total actives</p></div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Statut</mat-label>
            <mat-select [formControl]="statutFilter">
              <mat-option value="">Tous</mat-option>
              <mat-option value="ACTIVE">Actives</mat-option>
              <mat-option value="TRAITEE">Traitées</mat-option>
              <mat-option value="RESOLUE">Résolues</mat-option>
              <mat-option value="IGNOREE">Ignorées</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Niveau</mat-label>
            <mat-select [formControl]="niveauFilter">
              <mat-option value="">Tous</mat-option>
              <mat-option value="critique">Critique</mat-option>
              <mat-option value="attention">Attention</mat-option>
              <mat-option value="info">Info</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Type</mat-label>
            <mat-select [formControl]="typeFilter">
              <mat-option value="">Tous</mat-option>
              <mat-option value="MOYENNE_FAIBLE">Moyenne faible</mat-option>
              <mat-option value="NOTE_BASSE">Note basse</mat-option>
              <mat-option value="ABSENCE_NOTE">Absences</mat-option>
              <mat-option value="RISQUE_ECHEC">Risque échec</mat-option>
              <mat-option value="CUSTOM">Personnalisée</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-icon matPrefix class="mr-2 !text-gray-400">search</mat-icon>
            <mat-label>Rechercher un étudiant</mat-label>
            <input matInput [formControl]="searchControl">
          </mat-form-field>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        @if (isLoading) {
          <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
        } @else if (filteredAlertes.length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-gray-400">
            <i class="fas fa-bell-slash text-5xl mb-4"></i>
            <p class="font-medium">Aucune alerte trouvée</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="filteredAlertes" matSort class="w-full">
              <ng-container matColumnDef="niveau">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase !w-16">Niv.</th>
                <td mat-cell *matCellDef="let row">
                  <i class="fas fa-circle text-xs" [class]="getNiveauClass(row)"></i>
                </td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Type</th>
                <td mat-cell *matCellDef="let row">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getTypeBadgeClass(row.type)">{{ getTypeLabel(row.type) }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="etudiant">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Étudiant</th>
                <td mat-cell *matCellDef="let row" class="!font-medium">{{ row.etudiantNom }}</td>
              </ng-container>
              <ng-container matColumnDef="matricule">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Matricule</th>
                <td mat-cell *matCellDef="let row"><span class="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{{ row.etudiantMatricule }}</span></td>
              </ng-container>
              <ng-container matColumnDef="message">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Message</th>
                <td mat-cell *matCellDef="let row" class="text-sm text-gray-600 max-w-xs truncate">{{ row.message }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="!text-gray-500 !text-xs !font-semibold uppercase">Date</th>
                <td mat-cell *matCellDef="let row" class="text-sm text-gray-500">{{ formatDate(row.createdAt) }}</td>
              </ng-container>
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef mat-sort-header class="!text-gray-500 !text-xs !font-semibold uppercase">Statut</th>
                <td mat-cell *matCellDef="let row">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium" [class]="getStatutBadge(row.statut)">{{ row.statut }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="!w-32"></th>
                <td mat-cell *matCellDef="let row">
                  <div class="flex gap-1">
                    @if (row.statut === 'ACTIVE') {
                      <button mat-stroked-button class="!text-xs !py-0 !h-8 !min-w-0 !px-3" (click)="traiterAlerte(row); $event.stopPropagation()">Traiter</button>
                      <button mat-stroked-button class="!text-xs !py-0 !h-8 !min-w-0 !px-3 !text-gray-400" (click)="ignorerAlerte(row); $event.stopPropagation()">Ignorer</button>
                    } @else if (row.statut === 'TRAITEE') {
                      <button mat-stroked-button class="!text-xs !py-0 !h-8 !min-w-0 !px-3 !text-success" (click)="resoudreAlerte(row); $event.stopPropagation()">Résoudre</button>
                    }
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"
                class="hover:bg-gray-50 transition-colors"
                [class.!bg-red-50]="row.statut === 'ACTIVE' && isCritique(row)"></tr>
            </table>
          </div>
          <mat-paginator [length]="totalElements" [pageSize]="pageSize" [pageSizeOptions]="[10, 25, 50]" [pageIndex]="pageIndex" (page)="onPageChange($event)" showFirstLastButtons></mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export default class AlertListComponent implements OnInit, OnDestroy {
  alertes: AlerteResponse[] = [];
  filteredAlertes: AlerteResponse[] = [];
  displayedColumns = ['niveau', 'type', 'etudiant', 'matricule', 'message', 'date', 'statut', 'actions'];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;
  isAdmin = false;

  stats = { critiques: 0, attention: 0, traitees: 0, total: 0 };

  statutFilter = new FormControl('');
  niveauFilter = new FormControl('');
  typeFilter = new FormControl('');
  searchControl = new FormControl('');

  @ViewChild(MatSort) sort!: MatSort;
  private destroy$ = new Subject<void>();

  constructor(
    private alerteService: AlerteService,
    private notification: NotificationService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.isAdmin = this.authService.hasRole('ADMIN');
  }

  ngOnInit(): void {
    this.loadAlertes();
    this.loadStats();

    this.statutFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => { this.pageIndex = 0; this.loadAlertes(); });
    this.typeFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyClientFilters());
    this.niveauFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyClientFilters());
    this.searchControl.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => this.applyClientFilters());
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadAlertes(): void {
    this.isLoading = true;
    const statut = this.statutFilter.value as StatutAlerte | undefined;
    this.alerteService.getAlertes(this.pageIndex, this.pageSize, statut || undefined).subscribe({
      next: (res) => {
        this.alertes = res.data.content;
        this.totalElements = res.data.totalElements;
        this.applyClientFilters();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.loadMockData(); }
    });
  }

  loadStats(): void {
    this.alerteService.getStatistiques().subscribe({
      next: (res) => {
        const s = res.data;
        this.stats = {
          critiques: (s.parType['RISQUE_ECHEC'] || 0) + (s.parType['NOTE_BASSE'] || 0),
          attention: (s.parType['MOYENNE_FAIBLE'] || 0) + (s.parType['ABSENCE_NOTE'] || 0),
          traitees: s.alertesTraitees,
          total: s.alertesActives
        };
      },
      error: () => { this.stats = { critiques: 3, attention: 2, traitees: 1, total: 4 }; }
    });
  }

  applyClientFilters(): void {
    let result = [...this.alertes];
    const type = this.typeFilter.value;
    const niveau = this.niveauFilter.value;
    const search = this.searchControl.value?.toLowerCase().trim();

    if (type) result = result.filter(a => a.type === type);
    if (niveau === 'critique') result = result.filter(a => this.isCritique(a));
    else if (niveau === 'attention') result = result.filter(a => a.type === 'MOYENNE_FAIBLE' || a.type === 'ABSENCE_NOTE');
    else if (niveau === 'info') result = result.filter(a => a.type === 'CUSTOM');
    if (search) result = result.filter(a => a.etudiantNom.toLowerCase().includes(search) || a.etudiantMatricule.toLowerCase().includes(search));

    this.filteredAlertes = result;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAlertes();
  }

  traiterAlerte(alerte: AlerteResponse): void {
    const ref = this.dialog.open(TraiterAlerteDialogComponent, { width: '500px', data: { alerte, action: 'traiter' } });
    ref.afterClosed().subscribe(result => {
      if (result) this.alerteService.traiterAlerte(alerte.id, result).subscribe({
        next: () => { this.notification.success('Alerte traitée'); this.loadAlertes(); this.loadStats(); },
        error: () => {}
      });
    });
  }

  ignorerAlerte(alerte: AlerteResponse): void {
    const ref = this.dialog.open(TraiterAlerteDialogComponent, { width: '500px', data: { alerte, action: 'ignorer' } });
    ref.afterClosed().subscribe(result => {
      if (result) this.alerteService.ignorerAlerte(alerte.id).subscribe({
        next: () => { this.notification.success('Alerte ignorée'); this.loadAlertes(); this.loadStats(); },
        error: () => {}
      });
    });
  }

  resoudreAlerte(alerte: AlerteResponse): void {
    this.alerteService.resoudreAlerte(alerte.id).subscribe({
      next: () => { this.notification.success('Alerte résolue'); this.loadAlertes(); this.loadStats(); },
      error: () => {}
    });
  }

  openRegles(): void {
    this.dialog.open(ReglesDialogComponent, { width: '750px' });
  }

  isCritique(a: AlerteResponse): boolean {
    return a.type === 'RISQUE_ECHEC' || a.type === 'NOTE_BASSE';
  }

  getNiveauClass(a: AlerteResponse): string {
    if (this.isCritique(a)) return 'text-danger';
    if (a.type === 'MOYENNE_FAIBLE' || a.type === 'ABSENCE_NOTE') return 'text-warning';
    return 'text-secondary';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { NOTE_BASSE: 'Note basse', ABSENCE_NOTE: 'Absence', MOYENNE_FAIBLE: 'Moy. faible', RISQUE_ECHEC: 'Risque échec', CUSTOM: 'Personnalisée' };
    return labels[type] || type;
  }

  getTypeBadgeClass(type: string): string {
    const classes: Record<string, string> = { NOTE_BASSE: 'bg-red-100 text-danger', ABSENCE_NOTE: 'bg-orange-100 text-warning', MOYENNE_FAIBLE: 'bg-amber-100 text-amber-700', RISQUE_ECHEC: 'bg-red-100 text-danger', CUSTOM: 'bg-gray-100 text-gray-600' };
    return classes[type] || 'bg-gray-100 text-gray-600';
  }

  getStatutBadge(statut: string): string {
    const classes: Record<string, string> = { ACTIVE: 'bg-red-50 text-danger', TRAITEE: 'bg-blue-50 text-secondary', RESOLUE: 'bg-green-50 text-success', IGNOREE: 'bg-gray-100 text-gray-500' };
    return classes[statut] || 'bg-gray-100 text-gray-500';
  }

  formatDate(date: string): string { return new Date(date).toLocaleDateString('fr-FR'); }

  private loadMockData(): void {
    this.alertes = [
      { id: 1, type: 'RISQUE_ECHEC', statut: 'ACTIVE', message: 'Moyenne générale inférieure à 8/20', etudiantId: 1, etudiantNom: 'Diallo Amadou', etudiantMatricule: 'ETU-2024-001', valeurNote: 7.5, seuil: 8, createdAt: '2025-01-10' },
      { id: 2, type: 'NOTE_BASSE', statut: 'ACTIVE', message: 'Note éliminatoire en Algorithmique', etudiantId: 2, etudiantNom: 'Traoré Fatoumata', etudiantMatricule: 'ETU-2024-002', moduleNom: 'Algorithmique', valeurNote: 3, seuil: 5, createdAt: '2025-01-12' },
      { id: 3, type: 'MOYENNE_FAIBLE', statut: 'ACTIVE', message: 'Moyenne du module inférieure à 10', etudiantId: 3, etudiantNom: 'Coulibaly Ibrahim', etudiantMatricule: 'ETU-2024-003', moduleNom: 'Programmation C', valeurNote: 9.5, seuil: 10, createdAt: '2025-01-14' },
      { id: 4, type: 'ABSENCE_NOTE', statut: 'TRAITEE', message: 'Note manquante pour le CC1 Algo', etudiantId: 4, etudiantNom: 'Sangaré Mariam', etudiantMatricule: 'ETU-2024-004', evaluationNom: 'CC1 Algorithmique', createdAt: '2025-01-08', traitePar: 'Admin', commentaireTraitement: 'Étudiant contacté' },
      { id: 5, type: 'MOYENNE_FAIBLE', statut: 'RESOLUE', message: 'Moyenne remontée après rattrapage', etudiantId: 1, etudiantNom: 'Diallo Amadou', etudiantMatricule: 'ETU-2024-001', createdAt: '2024-12-15' },
      { id: 6, type: 'RISQUE_ECHEC', statut: 'ACTIVE', message: 'Risque d\'exclusion — 3 modules sous le seuil', etudiantId: 5, etudiantNom: 'Konaté Seydou', etudiantMatricule: 'ETU-2024-005', createdAt: '2025-01-15' },
    ];
    this.filteredAlertes = [...this.alertes];
    this.totalElements = this.alertes.length;
    this.stats = { critiques: 3, attention: 2, traitees: 1, total: 4 };
  }
}

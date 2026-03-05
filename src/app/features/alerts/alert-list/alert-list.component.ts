import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
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
    CommonModule, ReactiveFormsModule,
    MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="space-y-6 fade-in-up">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="page-title">Alertes pédagogiques</h1>
          <p class="text-sm text-gray-500 mt-1">Suivi et traitement des alertes académiques</p>
        </div>
        <div class="flex gap-2">
          @if (isAdmin) {
            <button class="btn-secondary" (click)="openRegles()">
              <i class="fas fa-cog mr-2"></i> Gérer les règles
            </button>
          }
        </div>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="stat-icon bg-red-50 text-red-600"><i class="fas fa-circle-exclamation"></i></div>
          <div><p class="stat-value text-red-600">{{ stats.critiques }}</p><p class="stat-label">Critiques</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-amber-50 text-amber-600"><i class="fas fa-triangle-exclamation"></i></div>
          <div><p class="stat-value text-amber-600">{{ stats.attention }}</p><p class="stat-label">Attention</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-emerald-50 text-emerald-600"><i class="fas fa-check-circle"></i></div>
          <div><p class="stat-value text-emerald-600">{{ stats.traitees }}</p><p class="stat-label">Traitées</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-blue-50 text-blue-600"><i class="fas fa-chart-bar"></i></div>
          <div><p class="stat-value text-primary">{{ stats.total }}</p><p class="stat-label">Total actives</p></div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div class="field !mb-0">
            <select class="field-input" [formControl]="statutFilter">
              <option value="">Tous les statuts</option>
              <option value="ACTIVE">Actives</option>
              <option value="TRAITEE">Traitées</option>
              <option value="RESOLUE">Résolues</option>
              <option value="IGNOREE">Ignorées</option>
            </select>
          </div>
          <div class="field !mb-0">
            <select class="field-input" [formControl]="niveauFilter">
              <option value="">Tous les niveaux</option>
              <option value="critique">Critique</option>
              <option value="attention">Attention</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div class="field !mb-0">
            <select class="field-input" [formControl]="typeFilter">
              <option value="">Tous les types</option>
              <option value="MOYENNE_FAIBLE">Moyenne faible</option>
              <option value="NOTE_BASSE">Note basse</option>
              <option value="ABSENCE_NOTE">Absences</option>
              <option value="RISQUE_ECHEC">Risque échec</option>
              <option value="CUSTOM">Personnalisée</option>
            </select>
          </div>
          <div class="field !mb-0">
            <div class="field-with-icon">
              <i class="fas fa-search field-icon-left"></i>
              <input class="field-input" [formControl]="searchControl" placeholder="Rechercher un étudiant">
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="data-table-wrapper">
        @if (isLoading) {
          <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
        } @else if (filteredAlertes.length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-gray-400">
            <i class="fas fa-bell-slash text-5xl mb-4"></i>
            <p class="font-medium">Aucune alerte trouvée</p>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th class="!w-16">Niv.</th>
                <th>Type</th>
                <th>Étudiant</th>
                <th>Matricule</th>
                <th>Message</th>
                <th>Date</th>
                <th>Statut</th>
                <th class="!w-32"></th>
              </tr>
            </thead>
            <tbody>
              @for (row of filteredAlertes; track row.id) {
                <tr [class.row-danger]="row.statut === 'ACTIVE' && isCritique(row)">
                  <td><i class="fas fa-circle text-xs" [class]="getNiveauClass(row)"></i></td>
                  <td><span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getTypeBadgeClass(row.type)">{{ getTypeLabel(row.type) }}</span></td>
                  <td class="cell-primary">{{ row.etudiantNom }}</td>
                  <td><span class="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{{ row.etudiantMatricule }}</span></td>
                  <td class="cell-secondary max-w-xs truncate">{{ row.message }}</td>
                  <td class="cell-secondary">{{ formatDate(row.createdAt) }}</td>
                  <td><span class="px-2.5 py-1 rounded-full text-xs font-medium" [class]="getStatutBadge(row.statut)">{{ row.statut }}</span></td>
                  <td class="cell-actions">
                    @if (canTraiterAlerte) {
                      <div class="flex gap-1">
                        @if (row.statut === 'ACTIVE') {
                          <button class="btn-secondary !py-1 !px-3 !text-xs" (click)="traiterAlerte(row); $event.stopPropagation()">Traiter</button>
                          <button class="btn-secondary !py-1 !px-3 !text-xs !text-gray-400 !border-gray-200" (click)="ignorerAlerte(row); $event.stopPropagation()">Ignorer</button>
                        } @else if (row.statut === 'TRAITEE') {
                          <button class="btn-secondary !py-1 !px-3 !text-xs !text-emerald-600 !border-emerald-200" (click)="resoudreAlerte(row); $event.stopPropagation()">Résoudre</button>
                        }
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <div class="table-pagination">
            <div class="pagination-info">
              <span>{{ pageIndex * pageSize + 1 }}</span>–<span>{{ min((pageIndex + 1) * pageSize, totalElements) }}</span> sur <span>{{ totalElements }}</span>
            </div>
            <div class="pagination-controls">
              <button class="pagination-btn" [disabled]="pageIndex === 0" (click)="goToPage(0)"><i class="fas fa-angles-left"></i></button>
              <button class="pagination-btn" [disabled]="pageIndex === 0" (click)="goToPage(pageIndex - 1)"><i class="fas fa-chevron-left"></i></button>
              @for (p of visiblePages; track p) {
                <button class="pagination-btn" [class.active]="p === pageIndex" (click)="goToPage(p)">{{ p + 1 }}</button>
              }
              <button class="pagination-btn" [disabled]="pageIndex >= totalPages - 1" (click)="goToPage(pageIndex + 1)"><i class="fas fa-chevron-right"></i></button>
              <button class="pagination-btn" [disabled]="pageIndex >= totalPages - 1" (click)="goToPage(totalPages - 1)"><i class="fas fa-angles-right"></i></button>
            </div>
            <div class="pagination-size">
              <span>Lignes</span>
              <select [value]="pageSize" (change)="changePageSize(+$any($event.target).value)">
                <option [value]="10">10</option>
                <option [value]="25">25</option>
                <option [value]="50">50</option>
              </select>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export default class AlertListComponent implements OnInit, OnDestroy {
  alertes: AlerteResponse[] = [];
  filteredAlertes: AlerteResponse[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;
  isAdmin = false;
  canTraiterAlerte = false;

  stats = { critiques: 0, attention: 0, traitees: 0, total: 0 };

  statutFilter = new FormControl('');
  niveauFilter = new FormControl('');
  typeFilter = new FormControl('');
  searchControl = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    private alerteService: AlerteService,
    private notification: NotificationService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.canTraiterAlerte = this.authService.hasAnyRole(['ADMIN', 'RESPONSABLE_PEDAGOGIQUE']);
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
      error: () => { this.isLoading = false; this.alertes = []; this.filteredAlertes = []; this.totalElements = 0; }
    });
  }

  loadStats(): void {
    this.alerteService.getStatistiques().subscribe({
      next: (res) => {
        const s = res.data;
        const parType = s.parType ?? {};
        this.stats = {
          critiques: (parType['RISQUE_ECHEC'] || 0) + (parType['NOTE_BASSE'] || 0),
          attention: (parType['MOYENNE_FAIBLE'] || 0) + (parType['ABSENCE_NOTE'] || 0),
          traitees: s.alertesTraitees ?? 0,
          total: s.alertesActives ?? 0
        };
      },
      error: () => { this.stats = { critiques: 0, attention: 0, traitees: 0, total: 0 }; }
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

  get totalPages(): number { return Math.ceil(this.totalElements / this.pageSize); }
  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.pageIndex - 2);
    const end = Math.min(this.totalPages, start + 5);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }
  goToPage(page: number): void { this.pageIndex = page; this.loadAlertes(); }
  changePageSize(size: number): void { this.pageSize = size; this.pageIndex = 0; this.loadAlertes(); }
  min(a: number, b: number): number { return Math.min(a, b); }

  traiterAlerte(alerte: AlerteResponse): void {
    const ref = this.dialog.open(TraiterAlerteDialogComponent, { width: '500px', maxWidth: '95vw', data: { alerte, action: 'traiter' } });
    ref.afterClosed().subscribe(result => {
      if (result) this.alerteService.traiterAlerte(alerte.id, result).subscribe({
        next: () => { this.notification.success('Alerte traitée'); this.loadAlertes(); this.loadStats(); },
        error: () => {}
      });
    });
  }

  ignorerAlerte(alerte: AlerteResponse): void {
    const ref = this.dialog.open(TraiterAlerteDialogComponent, { width: '500px', maxWidth: '95vw', data: { alerte, action: 'ignorer' } });
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
    this.dialog.open(ReglesDialogComponent, { width: '750px', maxWidth: '95vw' });
  }

  isCritique(a: AlerteResponse): boolean {
    return a.type === 'RISQUE_ECHEC' || a.type === 'NOTE_BASSE';
  }

  getNiveauClass(a: AlerteResponse): string {
    if (this.isCritique(a)) return 'text-danger';
    if (a.type === 'MOYENNE_FAIBLE' || a.type === 'ABSENCE_NOTE') return 'text-warning';
    return 'text-blue-500';
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
    const classes: Record<string, string> = { ACTIVE: 'bg-red-50 text-danger', TRAITEE: 'bg-blue-50 text-blue-600', RESOLUE: 'bg-green-50 text-success', IGNOREE: 'bg-gray-100 text-gray-500' };
    return classes[statut] || 'bg-gray-100 text-gray-500';
  }

  formatDate(date: string): string { return new Date(date).toLocaleDateString('fr-FR'); }

}

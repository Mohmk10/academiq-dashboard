import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StructureService } from '../../../../core/services/structure.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FiliereResponse, PromotionResponse } from '../../../../core/models/structure.model';
import { PromotionDialogComponent } from '../dialogs/promotion-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-promotion-tab',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="field !mb-0 w-full sm:w-64">
          <label class="field-label">Filtrer par filière</label>
          <select class="field-input" [formControl]="filiereFilter">
            <option [ngValue]="null">Toutes</option>
            @for (f of filieres; track f.id) {
              <option [ngValue]="f.id">{{ f.nom }}</option>
            }
          </select>
        </div>
        <button class="btn-primary" (click)="openCreate()">
          <i class="fas fa-plus mr-2"></i> Nouvelle promotion
        </button>
      </div>

      @if (isLoading) {
        <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (filteredPromotions.length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-gray-400">
          <i class="fas fa-calendar-alt text-5xl mb-4"></i>
          <p class="font-medium">Aucune promotion trouvée</p>
        </div>
      } @else {
        <div class="card !p-0 overflow-hidden">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="filteredPromotions" class="w-full">
              <ng-container matColumnDef="annee">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Année</th>
                <td mat-cell *matCellDef="let row" class="!font-medium">{{ row.anneeUniversitaire }}</td>
              </ng-container>
              <ng-container matColumnDef="filiere">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Filière</th>
                <td mat-cell *matCellDef="let row">{{ row.filiereNom || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="niveau">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Niveau</th>
                <td mat-cell *matCellDef="let row"><span class="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">{{ row.niveauNom || '—' }}</span></td>
              </ng-container>
              <ng-container matColumnDef="etudiants">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Étudiants</th>
                <td mat-cell *matCellDef="let row">{{ row.nombreEtudiants ?? 0 }}</td>
              </ng-container>
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Statut</th>
                <td mat-cell *matCellDef="let row">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium" [class]="row.actif ? 'bg-green-50 text-success' : 'bg-gray-100 text-gray-500'">
                    {{ row.actif ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="!w-16"></th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()"><mat-icon>more_vert</mat-icon></button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="openEdit(row)"><i class="fas fa-pen mr-3 text-gray-400"></i> Modifier</button>
                    <button mat-menu-item (click)="deletePromotion(row)" class="!text-danger"><i class="fas fa-trash mr-3"></i> Supprimer</button>
                  </mat-menu>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns" class="hover:bg-gray-50 transition-colors"></tr>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class PromotionTabComponent implements OnInit {
  promotions: PromotionResponse[] = [];
  filteredPromotions: PromotionResponse[] = [];
  filieres: FiliereResponse[] = [];
  displayedColumns = ['annee', 'filiere', 'niveau', 'etudiants', 'statut', 'actions'];
  isLoading = true;
  filiereFilter = new FormControl<number | null>(null);

  constructor(
    private structureService: StructureService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.filiereFilter.valueChanges.subscribe(() => this.applyFilter());
  }

  loadData(): void {
    this.isLoading = true;
    this.structureService.getFilieres().subscribe({
      next: (res) => this.filieres = res.data,
      error: () => {}
    });
    this.structureService.getPromotions().subscribe({
      next: (res) => { this.promotions = res.data; this.applyFilter(); this.isLoading = false; },
      error: () => { this.isLoading = false; this.loadMockData(); }
    });
  }

  applyFilter(): void {
    const fId = this.filiereFilter.value;
    this.filteredPromotions = fId
      ? this.promotions.filter(p => p.filiereNom === this.filieres.find(f => f.id === fId)?.nom)
      : [...this.promotions];
  }

  openCreate(): void {
    const ref = this.dialog.open(PromotionDialogComponent, { width: '550px', maxWidth: '95vw', data: { mode: 'create', filieres: this.filieres } });
    ref.afterClosed().subscribe(result => {
      if (result) this.structureService.createPromotion(result).subscribe({
        next: () => { this.notification.success('Promotion créée'); this.loadData(); },
        error: () => {}
      });
    });
  }

  openEdit(promotion: PromotionResponse): void {
    const ref = this.dialog.open(PromotionDialogComponent, { width: '550px', maxWidth: '95vw', data: { mode: 'edit', promotion, filieres: this.filieres } });
    ref.afterClosed().subscribe(result => {
      if (result) this.structureService.updatePromotion(promotion.id, result).subscribe({
        next: () => { this.notification.success('Promotion modifiée'); this.loadData(); },
        error: () => {}
      });
    });
  }

  deletePromotion(p: PromotionResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw', data: { title: 'Supprimer la promotion', message: `Supprimer la promotion ${p.anneeUniversitaire} — ${p.niveauNom} ?`, confirmText: 'Supprimer' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.structureService.deletePromotion(p.id).subscribe({
        next: () => { this.notification.success('Promotion supprimée'); this.loadData(); },
        error: () => {}
      });
    });
  }

  private loadMockData(): void {
    this.filieres = [
      { id: 1, nom: 'Informatique', code: 'INFO', actif: true },
      { id: 2, nom: 'Mathématiques', code: 'MATH', actif: true }
    ];
    this.promotions = [
      { id: 1, anneeUniversitaire: '2024-2025', niveauId: 1, niveauNom: 'L1', filiereNom: 'Informatique', nombreEtudiants: 45, actif: true },
      { id: 2, anneeUniversitaire: '2024-2025', niveauId: 2, niveauNom: 'L2', filiereNom: 'Informatique', nombreEtudiants: 38, actif: true },
      { id: 3, anneeUniversitaire: '2024-2025', niveauId: 3, niveauNom: 'L3', filiereNom: 'Informatique', nombreEtudiants: 30, actif: true },
      { id: 4, anneeUniversitaire: '2023-2024', niveauId: 1, niveauNom: 'L1', filiereNom: 'Mathématiques', nombreEtudiants: 25, actif: false },
    ];
    this.applyFilter();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StructureService } from '../../../../core/services/structure.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FiliereResponse, NiveauResponse, SemestreResponse, UeResponse, ModuleResponse } from '../../../../core/models/structure.model';
import { ModuleDialogComponent } from '../dialogs/module-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-module-tab',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatFormFieldModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-end gap-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Filière</mat-label>
            <mat-select [formControl]="filiereFilter" (selectionChange)="onFiliereChange($event.value)">
              <mat-option [value]="null">Toutes</mat-option>
              @for (f of filieres; track f.id) {
                <mat-option [value]="f.id">{{ f.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Niveau</mat-label>
            <mat-select [formControl]="niveauFilter" (selectionChange)="onNiveauChange($event.value)">
              <mat-option [value]="null">Tous</mat-option>
              @for (n of niveaux; track n.id) {
                <mat-option [value]="n.id">{{ n.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>UE</mat-label>
            <mat-select [formControl]="ueFilter" (selectionChange)="onUeChange()">
              <mat-option [value]="null">Toutes</mat-option>
              @for (ue of ues; track ue.id) {
                <mat-option [value]="ue.id">{{ ue.code }} — {{ ue.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <button class="btn-primary sm:self-center" (click)="openCreate()">
          <i class="fas fa-plus mr-2"></i> Nouveau module
        </button>
      </div>

      @if (isLoading) {
        <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (modules.length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-gray-400">
          <i class="fas fa-book text-5xl mb-4"></i>
          <p class="font-medium">Aucun module trouvé</p>
        </div>
      } @else {
        <div class="card !p-0 overflow-hidden">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="modules" class="w-full">
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Code</th>
                <td mat-cell *matCellDef="let row"><span class="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{{ row.code }}</span></td>
              </ng-container>
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Module</th>
                <td mat-cell *matCellDef="let row" class="!font-medium">{{ row.nom }}</td>
              </ng-container>
              <ng-container matColumnDef="ue">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">UE</th>
                <td mat-cell *matCellDef="let row" class="text-sm text-gray-500">{{ row.ueNom || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="coefficient">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Coeff.</th>
                <td mat-cell *matCellDef="let row">{{ row.coefficient }}</td>
              </ng-container>
              <ng-container matColumnDef="enseignant">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Enseignant</th>
                <td mat-cell *matCellDef="let row" class="text-sm">{{ row.enseignantNom || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="volume">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Vol. H</th>
                <td mat-cell *matCellDef="let row">{{ row.volumeHoraire ? row.volumeHoraire + 'h' : '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="!w-16"></th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()"><mat-icon>more_vert</mat-icon></button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="openEdit(row)"><i class="fas fa-pen mr-3 text-gray-400"></i> Modifier</button>
                    <button mat-menu-item (click)="deleteModule(row)" class="!text-danger"><i class="fas fa-trash mr-3"></i> Supprimer</button>
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
export class ModuleTabComponent implements OnInit {
  filieres: FiliereResponse[] = [];
  niveaux: NiveauResponse[] = [];
  ues: UeResponse[] = [];
  modules: ModuleResponse[] = [];
  displayedColumns = ['code', 'nom', 'ue', 'coefficient', 'enseignant', 'volume', 'actions'];
  isLoading = true;

  filiereFilter = new FormControl<number | null>(null);
  niveauFilter = new FormControl<number | null>(null);
  ueFilter = new FormControl<number | null>(null);

  constructor(
    private structureService: StructureService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.structureService.getFilieres().subscribe({
      next: (res) => this.filieres = res.data,
      error: () => { this.filieres = [{ id: 1, nom: 'Informatique', code: 'INFO', actif: true }]; }
    });
    this.loadModules();
  }

  onFiliereChange(filiereId: number | null): void {
    this.niveaux = [];
    this.ues = [];
    this.niveauFilter.setValue(null);
    this.ueFilter.setValue(null);
    if (filiereId) {
      this.structureService.getNiveaux(filiereId).subscribe({ next: (res) => this.niveaux = res.data, error: () => {} });
    }
    this.loadModules();
  }

  onNiveauChange(niveauId: number | null): void {
    this.ues = [];
    this.ueFilter.setValue(null);
    if (niveauId) {
      this.structureService.getUes().subscribe({
        next: (res) => this.ues = res.data,
        error: () => {}
      });
    }
    this.loadModules();
  }

  onUeChange(): void { this.loadModules(); }

  loadModules(): void {
    this.isLoading = true;
    const ueId = this.ueFilter.value;
    this.structureService.getModules(ueId ?? undefined).subscribe({
      next: (res) => { this.modules = res.data; this.isLoading = false; },
      error: () => { this.isLoading = false; this.loadMockData(); }
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(ModuleDialogComponent, { width: '550px', data: { mode: 'create', ues: this.ues } });
    ref.afterClosed().subscribe(result => {
      if (result) this.structureService.createModule(result).subscribe({
        next: () => { this.notification.success('Module créé'); this.loadModules(); },
        error: () => {}
      });
    });
  }

  openEdit(mod: ModuleResponse): void {
    const ref = this.dialog.open(ModuleDialogComponent, { width: '550px', data: { mode: 'edit', module: mod, ues: this.ues } });
    ref.afterClosed().subscribe(result => {
      if (result) this.structureService.updateModule(mod.id, result).subscribe({
        next: () => { this.notification.success('Module modifié'); this.loadModules(); },
        error: () => {}
      });
    });
  }

  deleteModule(mod: ModuleResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', data: { title: 'Supprimer le module', message: `Supprimer « ${mod.nom} » ?`, confirmText: 'Supprimer' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.structureService.deleteModule(mod.id).subscribe({
        next: () => { this.notification.success('Module supprimé'); this.loadModules(); },
        error: () => {}
      });
    });
  }

  private loadMockData(): void {
    this.modules = [
      { id: 1, nom: 'Algorithmique', code: 'INFO-101', coefficient: 3, ueId: 1, ueNom: 'UE Fondamentale', enseignantNom: 'Keita Ousmane', volumeHoraire: 60 },
      { id: 2, nom: 'Programmation C', code: 'INFO-102', coefficient: 3, ueId: 1, ueNom: 'UE Fondamentale', enseignantNom: 'Cissé Aissata', volumeHoraire: 45 },
      { id: 3, nom: 'Bases de données', code: 'INFO-201', coefficient: 4, ueId: 2, ueNom: 'UE Informatique', enseignantNom: 'Touré Mohamed', volumeHoraire: 50 },
      { id: 4, nom: 'Réseaux', code: 'INFO-202', coefficient: 2, ueId: 2, ueNom: 'UE Informatique', volumeHoraire: 30 },
    ];
  }
}

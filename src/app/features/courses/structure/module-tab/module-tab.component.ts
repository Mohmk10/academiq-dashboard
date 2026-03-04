import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
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
    CommonModule, ReactiveFormsModule,
    MatMenuModule, MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-end gap-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <div class="field !mb-0">
            <label class="field-label">Filière</label>
            <select class="field-input" [formControl]="filiereFilter" (change)="onFiliereChange(filiereFilter.value)">
              <option [ngValue]="null">Toutes</option>
              @for (f of filieres; track f.id) {
                <option [ngValue]="f.id">{{ f.nom }}</option>
              }
            </select>
          </div>
          <div class="field !mb-0">
            <label class="field-label">Niveau</label>
            <select class="field-input" [formControl]="niveauFilter" (change)="onNiveauChange(niveauFilter.value)">
              <option [ngValue]="null">Tous</option>
              @for (n of niveaux; track n.id) {
                <option [ngValue]="n.id">{{ n.nom }}</option>
              }
            </select>
          </div>
          <div class="field !mb-0">
            <label class="field-label">UE</label>
            <select class="field-input" [formControl]="ueFilter" (change)="onUeChange()">
              <option [ngValue]="null">Toutes</option>
              @for (ue of ues; track ue.id) {
                <option [ngValue]="ue.id">{{ ue.code }} — {{ ue.nom }}</option>
              }
            </select>
          </div>
        </div>
        @if (canCreate) {
          <button class="btn-primary sm:self-center" (click)="openCreate()">
            <i class="fas fa-plus mr-2"></i> Nouveau module
          </button>
        }
      </div>

      @if (isLoading) {
        <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (modules.length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-gray-400">
          <i class="fas fa-book text-5xl mb-4"></i>
          <p class="font-medium">Aucun module trouvé</p>
        </div>
      } @else {
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Module</th>
                <th>UE</th>
                <th>Coeff.</th>
                <th>Enseignant</th>
                <th>Vol. H</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (row of modules; track row.id) {
                <tr>
                  <td><span class="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{{ row.code }}</span></td>
                  <td class="cell-primary">{{ row.nom }}</td>
                  <td class="cell-secondary">{{ row.ueNom || '—' }}</td>
                  <td>{{ row.coefficient }}</td>
                  <td class="text-sm">{{ row.enseignantNom || '—' }}</td>
                  <td>{{ row.volumeHoraire ? row.volumeHoraire + 'h' : '—' }}</td>
                  @if (canEdit || canDelete) {
                    <td class="cell-actions">
                      <button class="action-menu-btn" [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()"><i class="fas fa-ellipsis-vertical"></i></button>
                      <mat-menu #menu="matMenu">
                        @if (canEdit) {
                          <button mat-menu-item (click)="openEdit(row)"><i class="fas fa-pen mr-3 text-gray-400"></i> Modifier</button>
                        }
                        @if (canDelete) {
                          <button mat-menu-item (click)="deleteModule(row)" class="!text-danger"><i class="fas fa-trash mr-3"></i> Supprimer</button>
                        }
                      </mat-menu>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class ModuleTabComponent implements OnInit {
  @Input() canCreate = false;
  @Input() canEdit = false;
  @Input() canDelete = false;

  filieres: FiliereResponse[] = [];
  niveaux: NiveauResponse[] = [];
  ues: UeResponse[] = [];
  modules: ModuleResponse[] = [];
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
      error: () => { this.filieres = []; }
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
      error: () => { this.isLoading = false; this.modules = []; }
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(ModuleDialogComponent, { width: '550px', maxWidth: '95vw', data: { mode: 'create', ues: this.ues } });
    ref.afterClosed().subscribe(result => {
      if (result) this.structureService.createModule(result).subscribe({
        next: () => { this.notification.success('Module créé'); this.loadModules(); },
        error: () => {}
      });
    });
  }

  openEdit(mod: ModuleResponse): void {
    const ref = this.dialog.open(ModuleDialogComponent, { width: '550px', maxWidth: '95vw', data: { mode: 'edit', module: mod, ues: this.ues } });
    ref.afterClosed().subscribe(result => {
      if (result) this.structureService.updateModule(mod.id, result).subscribe({
        next: () => { this.notification.success('Module modifié'); this.loadModules(); },
        error: () => {}
      });
    });
  }

  deleteModule(mod: ModuleResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw', data: { title: 'Supprimer le module', message: `Supprimer « ${mod.nom} » ?`, confirmText: 'Supprimer' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.structureService.deleteModule(mod.id).subscribe({
        next: () => { this.notification.success('Module supprimé'); this.loadModules(); },
        error: () => {}
      });
    });
  }
}

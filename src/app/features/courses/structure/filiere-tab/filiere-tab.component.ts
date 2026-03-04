import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StructureService } from '../../../../core/services/structure.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FiliereResponse } from '../../../../core/models/structure.model';
import { FiliereDialogComponent } from '../dialogs/filiere-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-filiere-tab',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatProgressSpinnerModule, MatDialogModule],
  template: `
    <div class="space-y-4">
      @if (canCreate) {
        <div class="flex justify-end">
          <button class="btn-primary" (click)="openCreate()">
            <i class="fas fa-plus mr-2"></i> Nouvelle filière
          </button>
        </div>
      }

      @if (isLoading) {
        <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (filieres.length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-gray-400">
          <i class="fas fa-sitemap text-5xl mb-4"></i>
          <p class="font-medium">Aucune filière enregistrée</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (filiere of filieres; track filiere.id) {
            <div class="card hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{{ filiere.code }}</span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" [class]="filiere.actif ? 'bg-green-50 text-success' : 'bg-gray-100 text-gray-500'">
                      {{ filiere.actif ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <h3 class="font-semibold text-gray-900 mt-2">{{ filiere.nom }}</h3>
                </div>
                @if (canEdit || canDelete) {
                  <button class="action-menu-btn !-mt-1 !-mr-2" [matMenuTriggerFor]="menu">
                    <i class="fas fa-ellipsis-vertical"></i>
                  </button>
                  <mat-menu #menu="matMenu">
                    @if (canEdit) {
                      <button mat-menu-item (click)="openEdit(filiere)"><i class="fas fa-pen mr-3 text-gray-400"></i> Modifier</button>
                    }
                    @if (canDelete) {
                      <button mat-menu-item (click)="deleteFiliere(filiere)" class="!text-danger"><i class="fas fa-trash mr-3"></i> Supprimer</button>
                    }
                  </mat-menu>
                }
              </div>
              @if (filiere.departement) {
                <p class="text-sm text-gray-500 mt-2"><i class="fas fa-building mr-1"></i> {{ filiere.departement }}</p>
              }
              @if (filiere.responsable) {
                <p class="text-sm text-gray-500 mt-1"><i class="fas fa-user mr-1"></i> {{ filiere.responsable }}</p>
              }
              @if (filiere.description) {
                <p class="text-sm text-gray-400 mt-2 line-clamp-2">{{ filiere.description }}</p>
              }
              @if (filiere.niveaux && filiere.niveaux.length > 0) {
                <div class="mt-3 pt-3 border-t border-gray-100">
                  <p class="text-xs text-gray-400 uppercase mb-1">Niveaux</p>
                  <div class="flex flex-wrap gap-1">
                    @for (n of filiere.niveaux; track n.id) {
                      <span class="text-xs bg-gray-100 px-2 py-0.5 rounded">{{ n.nom }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class FiliereTabComponent implements OnInit {
  @Input() canCreate = false;
  @Input() canEdit = false;
  @Input() canDelete = false;

  filieres: FiliereResponse[] = [];
  isLoading = true;

  constructor(
    private structureService: StructureService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.loadFilieres(); }

  loadFilieres(): void {
    this.isLoading = true;
    this.structureService.getFilieres().subscribe({
      next: (res) => { this.filieres = res.data; this.isLoading = false; },
      error: () => { this.isLoading = false; this.loadMockData(); }
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(FiliereDialogComponent, { width: '550px', maxWidth: '95vw', data: { mode: 'create' } });
    ref.afterClosed().subscribe(result => {
      if (result) this.structureService.createFiliere(result).subscribe({
        next: () => { this.notification.success('Filière créée'); this.loadFilieres(); },
        error: () => {}
      });
    });
  }

  openEdit(filiere: FiliereResponse): void {
    const ref = this.dialog.open(FiliereDialogComponent, { width: '550px', maxWidth: '95vw', data: { mode: 'edit', filiere } });
    ref.afterClosed().subscribe(result => {
      if (result) this.structureService.updateFiliere(filiere.id, result).subscribe({
        next: () => { this.notification.success('Filière modifiée'); this.loadFilieres(); },
        error: () => {}
      });
    });
  }

  deleteFiliere(filiere: FiliereResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw', data: { title: 'Supprimer la filière', message: `Êtes-vous sûr de vouloir supprimer « ${filiere.nom} » ?`, confirmText: 'Supprimer' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.structureService.deleteFiliere(filiere.id).subscribe({
        next: () => { this.notification.success('Filière supprimée'); this.loadFilieres(); },
        error: () => {}
      });
    });
  }

  private loadMockData(): void {
    this.filieres = [
      { id: 1, nom: 'Informatique', code: 'INFO', departement: 'Sciences & Technologies', actif: true, description: 'Formation en informatique et génie logiciel', niveaux: [{ id: 1, nom: 'L1', code: 'L1', ordre: 1, filiereId: 1 }, { id: 2, nom: 'L2', code: 'L2', ordre: 2, filiereId: 1 }, { id: 3, nom: 'L3', code: 'L3', ordre: 3, filiereId: 1 }] },
      { id: 2, nom: 'Mathématiques', code: 'MATH', departement: 'Sciences & Technologies', actif: true, niveaux: [{ id: 4, nom: 'L1', code: 'L1', ordre: 1, filiereId: 2 }] },
      { id: 3, nom: 'Droit', code: 'DRT', departement: 'Sciences Juridiques', actif: false },
    ];
  }
}

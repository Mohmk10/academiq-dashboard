import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { NoteService } from '../../core/services/note.service';
import { NotificationService } from '../../core/services/notification.service';
import { EvaluationResponse } from '../../core/models/note.model';
import { Role } from '../../core/models/user.model';
import { EvaluationDialogComponent } from './dialogs/evaluation-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [
    CommonModule, MatMenuModule,
    MatProgressSpinnerModule, MatExpansionModule, MatChipsModule, MatDialogModule
  ],
  template: `
    <div class="space-y-6 fade-in-up">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="page-title">{{ role === 'ETUDIANT' ? 'Mes notes' : 'Gestion des notes' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ role === 'ETUDIANT' ? 'Consultez vos résultats par module' : 'Gérez les évaluations et saisissez les notes' }}</p>
        </div>
        @if (role !== 'ETUDIANT') {
          <button class="btn-primary" (click)="openCreateEvaluation()">
            <i class="fas fa-plus mr-2"></i> Nouvelle évaluation
          </button>
        }
      </div>

      @if (isLoading) {
        <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (role === 'ETUDIANT') {
        <!-- Vue étudiant : accordéon par module -->
        @if (studentModules.length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-gray-400">
            <i class="fas fa-graduation-cap text-5xl mb-4"></i>
            <p class="font-medium">Aucune note disponible</p>
          </div>
        } @else {
          <mat-accordion multi>
            @for (mod of studentModules; track mod.moduleCode) {
              <mat-expansion-panel class="!rounded-xl !shadow-sm !mb-3">
                <mat-expansion-panel-header>
                  <mat-panel-title class="!font-semibold">
                    <span class="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mr-3">{{ mod.moduleCode }}</span>
                    {{ mod.moduleNom }}
                  </mat-panel-title>
                  <mat-panel-description class="!text-right">
                    <span class="font-semibold" [class]="mod.moyenne >= 10 ? 'text-success' : 'text-danger'">
                      {{ mod.moyenne.toFixed(2) }}/20
                    </span>
                  </mat-panel-description>
                </mat-expansion-panel-header>
                <div class="data-table-wrapper">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Évaluation</th>
                        <th>Type</th>
                        <th>Note</th>
                        <th>Coeff.</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (n of mod.notes; track n.evaluationNom) {
                        <tr>
                          <td>{{ n.evaluationNom }}</td>
                          <td><span class="text-xs px-2 py-0.5 rounded-full bg-gray-100">{{ getTypeLabel(n.type) }}</span></td>
                          <td class="cell-primary" [class]="n.valeur >= (n.noteMax / 2) ? 'text-success' : 'text-danger'">{{ n.valeur }}/{{ n.noteMax }}</td>
                          <td>{{ n.coefficient }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </mat-expansion-panel>
            }
          </mat-accordion>
        }
      } @else {
        <!-- Vue enseignant/admin : table des évaluations -->
        @if (evaluations.length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-gray-400">
            <i class="fas fa-clipboard-list text-5xl mb-4"></i>
            <p class="font-medium">Aucune évaluation trouvée</p>
          </div>
        } @else {
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Évaluation</th>
                  <th>Module</th>
                  <th>Type</th>
                  <th>Saisie</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (row of evaluations; track row.id) {
                  <tr class="row-clickable" (click)="goToSaisie(row)">
                    <td class="cell-primary">{{ row.nom }}</td>
                    <td>
                      <span class="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{{ row.moduleCode }}</span>
                      <span class="ml-2 text-sm">{{ row.moduleNom }}</span>
                    </td>
                    <td><span class="text-xs px-2 py-0.5 rounded-full bg-gray-100">{{ getTypeLabel(row.type) }}</span></td>
                    <td>
                      <div class="flex items-center gap-2">
                        <div class="w-20 bg-gray-200 rounded-full h-2">
                          <div class="h-2 rounded-full" [class]="getProgressionClass(row)" [style.width.%]="getProgressionPercent(row)"></div>
                        </div>
                        <span class="text-xs text-gray-500">{{ row.nombreNotesSaisies }}/{{ row.nombreEtudiantsInscrits }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="px-2.5 py-1 rounded-full text-xs font-medium" [class]="row.publiee ? 'bg-green-50 text-success' : 'bg-amber-50 text-warning'">
                        {{ row.publiee ? 'Publiée' : 'Brouillon' }}
                      </span>
                    </td>
                    <td class="cell-actions">
                      <button class="action-menu-btn" [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                        <i class="fas fa-ellipsis-vertical"></i>
                      </button>
                      <mat-menu #menu="matMenu">
                        <button mat-menu-item (click)="goToSaisie(row)"><i class="fas fa-pen mr-3 text-gray-400"></i> Saisir les notes</button>
                        <button mat-menu-item (click)="openEditEvaluation(row)"><i class="fas fa-edit mr-3 text-gray-400"></i> Modifier</button>
                        @if (!row.publiee) {
                          <button mat-menu-item (click)="publierEvaluation(row)"><i class="fas fa-check-circle mr-3 text-success"></i> Publier</button>
                        }
                        <button mat-menu-item (click)="deleteEvaluation(row)" class="!text-danger"><i class="fas fa-trash mr-3"></i> Supprimer</button>
                      </mat-menu>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export default class GradesComponent implements OnInit {
  role: Role | null;
  evaluations: EvaluationResponse[] = [];
  studentModules: StudentModuleGroup[] = [];
  isLoading = true;


  constructor(
    private authService: AuthService,
    private noteService: NoteService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.role = this.authService.getCurrentUserRole();
  }

  ngOnInit(): void {
    if (this.role === 'ETUDIANT') {
      this.loadStudentNotes();
    } else {
      this.loadEvaluations();
    }
  }

  loadEvaluations(): void {
    this.isLoading = true;
    this.noteService.getEvaluations().subscribe({
      next: (res) => { this.evaluations = res.data; this.isLoading = false; },
      error: () => { this.isLoading = false; this.loadMockEvaluations(); }
    });
  }

  loadStudentNotes(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.noteService.getNotesEtudiant(res.data.id).subscribe({
          next: (notesRes) => { this.studentModules = this.groupNotesByModule(notesRes.data); this.isLoading = false; },
          error: () => { this.isLoading = false; this.loadMockStudentNotes(); }
        });
      },
      error: () => { this.isLoading = false; this.loadMockStudentNotes(); }
    });
  }

  openCreateEvaluation(): void {
    const ref = this.dialog.open(EvaluationDialogComponent, { width: '600px', maxWidth: '95vw', data: { mode: 'create' } });
    ref.afterClosed().subscribe(result => {
      if (result) this.noteService.createEvaluation(result).subscribe({
        next: () => { this.notification.success('Évaluation créée'); this.loadEvaluations(); },
        error: () => {}
      });
    });
  }

  openEditEvaluation(evaluation: EvaluationResponse): void {
    const ref = this.dialog.open(EvaluationDialogComponent, { width: '600px', maxWidth: '95vw', data: { mode: 'edit', evaluation } });
    ref.afterClosed().subscribe(result => {
      if (result) this.noteService.updateEvaluation(evaluation.id, result).subscribe({
        next: () => { this.notification.success('Évaluation modifiée'); this.loadEvaluations(); },
        error: () => {}
      });
    });
  }

  publierEvaluation(evaluation: EvaluationResponse): void {
    this.noteService.publierEvaluation(evaluation.id).subscribe({
      next: () => { this.notification.success('Évaluation publiée'); this.loadEvaluations(); },
      error: () => {}
    });
  }

  deleteEvaluation(evaluation: EvaluationResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw', data: { title: 'Supprimer l\'évaluation', message: `Supprimer « ${evaluation.nom} » ?`, confirmText: 'Supprimer' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.noteService.deleteEvaluation(evaluation.id).subscribe({
        next: () => { this.notification.success('Évaluation supprimée'); this.loadEvaluations(); },
        error: () => {}
      });
    });
  }

  goToSaisie(evaluation: EvaluationResponse): void {
    this.router.navigate(['/notes/saisie', evaluation.id]);
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { EXAMEN: 'Examen', CONTROLE_CONTINU: 'CC', TP: 'TP', PROJET: 'Projet', RATTRAPAGE: 'Rattrapage' };
    return labels[type] || type;
  }

  getProgressionPercent(row: EvaluationResponse): number {
    return row.nombreEtudiantsInscrits ? (row.nombreNotesSaisies / row.nombreEtudiantsInscrits) * 100 : 0;
  }

  getProgressionClass(row: EvaluationResponse): string {
    const p = this.getProgressionPercent(row);
    if (p >= 100) return 'bg-success';
    if (p >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  private groupNotesByModule(notes: any[]): StudentModuleGroup[] {
    const map = new Map<string, StudentModuleGroup>();
    for (const note of notes) {
      const key = note.evaluationNom?.split(' - ')[0] || 'Module';
      if (!map.has(key)) {
        map.set(key, { moduleNom: key, moduleCode: '', moyenne: 0, notes: [] });
      }
      map.get(key)!.notes.push(note);
    }
    for (const group of map.values()) {
      const total = group.notes.reduce((s, n) => s + n.valeur, 0);
      group.moyenne = group.notes.length ? total / group.notes.length : 0;
    }
    return Array.from(map.values());
  }

  private loadMockEvaluations(): void {
    this.evaluations = [
      { id: 1, moduleId: 1, moduleNom: 'Algorithmique', moduleCode: 'INFO-101', promotionId: 1, promotionNom: 'L1 Info 2024', type: 'EXAMEN', nom: 'Examen final Algo', coefficient: 2, noteMax: 20, nombreNotesSaisies: 42, nombreEtudiantsInscrits: 45, publiee: true, date: '2025-01-15' },
      { id: 2, moduleId: 1, moduleNom: 'Algorithmique', moduleCode: 'INFO-101', promotionId: 1, promotionNom: 'L1 Info 2024', type: 'CONTROLE_CONTINU', nom: 'CC1 Algo', coefficient: 1, noteMax: 20, nombreNotesSaisies: 45, nombreEtudiantsInscrits: 45, publiee: true },
      { id: 3, moduleId: 2, moduleNom: 'Programmation C', moduleCode: 'INFO-102', promotionId: 1, promotionNom: 'L1 Info 2024', type: 'PROJET', nom: 'Projet C', coefficient: 1, noteMax: 20, nombreNotesSaisies: 30, nombreEtudiantsInscrits: 45, publiee: false },
      { id: 4, moduleId: 3, moduleNom: 'Bases de données', moduleCode: 'INFO-201', promotionId: 2, promotionNom: 'L2 Info 2024', type: 'EXAMEN', nom: 'Examen BDD', coefficient: 2, noteMax: 20, nombreNotesSaisies: 0, nombreEtudiantsInscrits: 38, publiee: false },
    ];
  }

  private loadMockStudentNotes(): void {
    this.studentModules = [
      {
        moduleNom: 'Algorithmique', moduleCode: 'INFO-101', moyenne: 14.5,
        notes: [
          { evaluationNom: 'Examen final', type: 'EXAMEN', valeur: 15, noteMax: 20, coefficient: 2 },
          { evaluationNom: 'CC1', type: 'CONTROLE_CONTINU', valeur: 13, noteMax: 20, coefficient: 1 },
          { evaluationNom: 'TP noté', type: 'TP', valeur: 16, noteMax: 20, coefficient: 1 }
        ]
      },
      {
        moduleNom: 'Programmation C', moduleCode: 'INFO-102', moyenne: 11.33,
        notes: [
          { evaluationNom: 'Examen final', type: 'EXAMEN', valeur: 12, noteMax: 20, coefficient: 2 },
          { evaluationNom: 'Projet', type: 'PROJET', valeur: 14, noteMax: 20, coefficient: 1 },
          { evaluationNom: 'CC1', type: 'CONTROLE_CONTINU', valeur: 8, noteMax: 20, coefficient: 1 }
        ]
      },
      {
        moduleNom: 'Mathématiques', moduleCode: 'MATH-101', moyenne: 9.0,
        notes: [
          { evaluationNom: 'Examen final', type: 'EXAMEN', valeur: 8, noteMax: 20, coefficient: 2 },
          { evaluationNom: 'CC1', type: 'CONTROLE_CONTINU', valeur: 10, noteMax: 20, coefficient: 1 }
        ]
      }
    ];
  }
}

interface StudentModuleGroup {
  moduleNom: string;
  moduleCode: string;
  moyenne: number;
  notes: any[];
}

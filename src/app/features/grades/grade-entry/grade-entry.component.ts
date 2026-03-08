import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoteService } from '../../../core/services/note.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EvaluationResponse, NotePrepopuleeDTO, NoteSaisieUnitaire } from '../../../core/models/note.model';

interface GradeRow extends NotePrepopuleeDTO {
  valeur: number | null;
  absent: boolean;
  commentaire: string;
}

@Component({
  selector: 'app-grade-entry',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCheckboxModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="space-y-6 fade-in-up">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <a routerLink="/notes" class="text-gray-400 hover:text-gray-900 transition-colors"><i class="fas fa-arrow-left text-lg"></i></a>
          <div>
            @if (evaluation) {
              <h1 class="page-title !mb-0">{{ evaluation.nom }}</h1>
              <p class="text-sm text-gray-500 mt-0.5">
                <span class="font-mono bg-gray-100 px-2 py-0.5 rounded">{{ evaluation.moduleCode }}</span>
                <span class="ml-2">{{ evaluation.moduleNom }}</span>
                <span class="mx-2">·</span>
                <span>{{ evaluation.promotionNom }}</span>
              </p>
            } @else {
              <h1 class="page-title !mb-0">Saisie des notes</h1>
            }
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary" (click)="downloadTemplate()" [disabled]="!evaluation">
            <i class="fas fa-download mr-2"></i> Template
          </button>
          <button class="btn-primary" (click)="saveAll()" [disabled]="isSaving || rows.length === 0">
            @if (isSaving) {
              <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
            }
            <i class="fas fa-save mr-2"></i> Enregistrer tout
          </button>
        </div>
      </div>

      @if (evaluation) {
        <!-- Info bar -->
        <div class="card flex flex-wrap gap-6">
          <div>
            <span class="text-xs text-gray-400 uppercase">Type</span>
            <p class="font-medium text-sm">{{ getTypeLabel(evaluation.type) }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-400 uppercase">Coefficient</span>
            <p class="font-medium text-sm">{{ evaluation.coefficient }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-400 uppercase">Note max</span>
            <p class="font-medium text-sm">{{ evaluation.noteMax }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-400 uppercase">Progression</span>
            <p class="font-medium text-sm">{{ countFilled() }}/{{ rows.length }} saisies</p>
          </div>
        </div>
      }

      @if (isLoading) {
        <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (rows.length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-gray-400">
          <i class="fas fa-users text-5xl mb-4"></i>
          <p class="font-medium">Aucun étudiant inscrit</p>
        </div>
      } @else {
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="!w-12">#</th>
                <th>Matricule</th>
                <th>Nom & Prénom</th>
                <th class="!w-28">Note /{{ evaluation?.noteMax || 20 }}</th>
                <th class="!w-20">Absent</th>
                <th>Commentaire</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows; track row.etudiantId; let i = $index) {
                <tr>
                  <td class="text-gray-400 text-sm">{{ i + 1 }}</td>
                  <td><span class="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{{ row.matricule }}</span></td>
                  <td class="cell-primary">{{ row.etudiantNom }} {{ row.etudiantPrenom }}</td>
                  <td>
                    <input type="number" class="inline-input input-note"
                      [class.bg-gray-100]="row.absent"
                      [disabled]="row.absent"
                      [(ngModel)]="row.valeur"
                      [min]="0" [max]="evaluation?.noteMax || 20"
                      [placeholder]="row.absent ? 'ABS' : '—'">
                  </td>
                  <td>
                    <mat-checkbox [(ngModel)]="row.absent" (change)="onAbsentChange(row)" color="warn"></mat-checkbox>
                  </td>
                  <td>
                    <input type="text" class="inline-input"
                      [(ngModel)]="row.commentaire" placeholder="Optionnel">
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .data-table tbody tr { height: 56px; }
    .data-table input[type="number"]::-webkit-inner-spin-button { opacity: 1; }
  `]
})
export default class GradeEntryComponent implements OnInit {
  evaluation: EvaluationResponse | null = null;
  rows: GradeRow[] = [];
  isLoading = true;
  isSaving = false;

  private evaluationId = 0;

  constructor(
    private route: ActivatedRoute,
    private noteService: NoteService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.evaluationId = Number(this.route.snapshot.paramMap.get('evaluationId'));
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.noteService.getEvaluation(this.evaluationId).subscribe({
      next: (res) => {
        this.evaluation = res.data;
        this.loadStudents();
      },
      error: () => {
        this.evaluation = { id: this.evaluationId, moduleId: 1, moduleNom: 'Algorithmique', moduleCode: 'INFO-101', promotionId: 1, promotionNom: 'L1 Info 2024-2025', type: 'EXAMEN', nom: 'Examen final Algo', coefficient: 2, noteMax: 20, nombreNotesSaisies: 2, nombreEtudiantsInscrits: 5, publiee: false };
        this.loadStudents();
      }
    });
  }

  loadStudents(): void {
    this.noteService.getNotesPrepopulees(this.evaluationId).subscribe({
      next: (res) => {
        this.rows = res.data.map(s => ({
          ...s,
          valeur: s.noteExistante ?? null,
          absent: false,
          commentaire: s.commentaire || ''
        }));
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.rows = []; }
    });
  }

  onAbsentChange(row: GradeRow): void {
    if (row.absent) row.valeur = null;
  }

  countFilled(): number {
    return this.rows.filter(r => r.valeur !== null || r.absent).length;
  }

  saveAll(): void {
    const notes: NoteSaisieUnitaire[] = this.rows
      .filter(r => r.valeur !== null && !r.absent)
      .map(r => ({
        etudiantId: r.etudiantId,
        valeur: r.valeur!,
        commentaire: r.commentaire || undefined
      }));

    if (notes.length === 0) {
      this.notification.warning('Aucune note à enregistrer');
      return;
    }

    this.isSaving = true;
    this.noteService.saisirEnMasse({ evaluationId: this.evaluationId, notes }).subscribe({
      next: (res) => {
        const result = res.data;
        this.notification.success(`${result.totalSucces}/${result.totalTraitees} notes enregistrées`);
        if (result.erreurs.length > 0) {
          this.notification.warning(`${result.totalEchecs} erreur(s) détectée(s)`);
        }
        this.isSaving = false;
      },
      error: () => { this.isSaving = false; }
    });
  }

  downloadTemplate(): void {
    this.noteService.telechargerTemplate(this.evaluationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_notes_${this.evaluationId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notification.error('Erreur lors du téléchargement')
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { CC: 'Contrôle continu', TP: 'TP', PARTIEL: 'Partiel', EXAMEN: 'Examen', RATTRAPAGE: 'Rattrapage', PROJET: 'Projet', ORAL: 'Oral' };
    return labels[type] || type;
  }

}

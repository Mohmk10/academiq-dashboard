import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import {
  EvaluationRequest, EvaluationResponse,
  NoteSaisieRequest, NoteResponse,
  SaisieEnMasseRequest, SaisieEnMasseResult,
  NotePrepopuleeDTO,
  StatistiquesEvaluationDTO,
  RecapitulatifEtudiantDTO,
  RecapitulatifModuleDTO,
  ImportResult
} from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class NoteService {

  constructor(private api: ApiService, private mock: MockDataService) {}

  // --- Evaluations ---
  getEvaluations(moduleId?: number, promotionId?: number): Observable<ApiResponse<EvaluationResponse[]>> {
    if (this.mock.isDevMode()) {
      let list = this.mock.evaluations;
      if (moduleId) list = list.filter(e => e.moduleId === moduleId);
      if (promotionId) list = list.filter(e => e.promotionId === promotionId);
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    if (moduleId && promotionId) {
      return this.api.get<EvaluationResponse[]>(`notes/evaluations/module/${moduleId}/promotion/${promotionId}`);
    }
    if (moduleId) {
      return this.api.get<EvaluationResponse[]>(`notes/evaluations/module/${moduleId}`);
    }
    return this.api.get<EvaluationResponse[]>('notes/evaluations/module/0');
  }

  getEvaluation(id: number): Observable<ApiResponse<EvaluationResponse>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.evaluations.find(e => e.id === id)!)).pipe(delay(300));
    }
    return this.api.get<EvaluationResponse>(`notes/evaluations/${id}`);
  }

  createEvaluation(request: EvaluationRequest): Observable<ApiResponse<EvaluationResponse>> {
    if (this.mock.isDevMode()) {
      const evaluation: EvaluationResponse = {
        id: Date.now(), moduleId: request.moduleId, promotionId: request.promotionId,
        type: request.type, nom: request.nom, coefficient: request.coefficient,
        date: request.date, noteMax: request.noteMax ?? 20,
        moduleNom: 'Module', moduleCode: 'MOD', promotionNom: 'Promotion',
        nombreNotesSaisies: 0, nombreEtudiantsInscrits: 45, publiee: false
      };
      return of(this.mock.wrap(evaluation)).pipe(delay(300));
    }
    const body = {
      nom: request.nom,
      type: request.type,
      dateEvaluation: request.date,
      noteMaximale: request.noteMax ?? 20,
      coefficient: request.coefficient,
      moduleFormationId: request.moduleId,
      promotionId: request.promotionId
    };
    return this.api.post<EvaluationResponse>('notes/evaluations', body);
  }

  updateEvaluation(id: number, request: EvaluationRequest): Observable<ApiResponse<EvaluationResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.evaluations.find(e => e.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    const body = {
      nom: request.nom,
      type: request.type,
      dateEvaluation: request.date,
      noteMaximale: request.noteMax ?? 20,
      coefficient: request.coefficient,
      moduleFormationId: request.moduleId,
      promotionId: request.promotionId
    };
    return this.api.put<EvaluationResponse>(`notes/evaluations/${id}`, body);
  }

  deleteEvaluation(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`notes/evaluations/${id}`);
  }

  publierEvaluation(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.patch<void>(`notes/evaluations/${id}/terminer`);
  }

  // --- Notes ---
  saisirNote(request: NoteSaisieRequest): Observable<ApiResponse<NoteResponse>> {
    if (this.mock.isDevMode()) {
      const note: NoteResponse = {
        id: Date.now(), evaluationId: request.evaluationId, evaluationNom: 'Evaluation',
        etudiantId: request.etudiantId, etudiantNom: 'Etudiant', etudiantMatricule: 'ETU-XXX',
        valeur: request.valeur, noteMax: 20, saisieParId: 2, saisieParNom: 'Diop Ibrahima',
        dateSaisie: new Date().toISOString()
      };
      return of(this.mock.wrap(note)).pipe(delay(300));
    }
    return this.api.post<NoteResponse>('notes/saisir', request);
  }

  saisirEnMasse(request: SaisieEnMasseRequest): Observable<ApiResponse<SaisieEnMasseResult>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap({ totalTraitees: request.notes.length, totalSucces: request.notes.length, totalEchecs: 0, erreurs: [] })).pipe(delay(500));
    }
    return this.api.post<SaisieEnMasseResult>('notes/saisir-en-masse', request);
  }

  getNotesEvaluation(evaluationId: number): Observable<ApiResponse<NoteResponse[]>> {
    if (this.mock.isDevMode()) {
      const notes: NoteResponse[] = this.mock.etudiants.slice(0, 10).map((e, i) => ({
        id: i + 100, evaluationId, evaluationNom: this.mock.evaluations.find(ev => ev.id === evaluationId)?.nom ?? '',
        etudiantId: e.id, etudiantNom: `${e.prenom} ${e.nom}`, etudiantMatricule: e.matricule!,
        valeur: Math.round((8 + Math.random() * 12) * 100) / 100, noteMax: 20,
        saisieParId: 2, saisieParNom: 'Diop Ibrahima', dateSaisie: '2026-02-20'
      }));
      return of(this.mock.wrap(notes)).pipe(delay(300));
    }
    return this.api.get<NoteResponse[]>(`notes/evaluation/${evaluationId}`);
  }

  getNotesPrepopulees(evaluationId: number): Observable<ApiResponse<NotePrepopuleeDTO[]>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.getNotesPrepopulees())).pipe(delay(300));
    }
    return this.api.get<NotePrepopuleeDTO[]>(`notes/evaluations/${evaluationId}/preparer-saisie`);
  }

  getNotesEtudiant(etudiantId: number): Observable<ApiResponse<NoteResponse[]>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.notesEtudiant)).pipe(delay(300));
    }
    return this.api.get<NoteResponse[]>(`notes/etudiant/${etudiantId}`);
  }

  // --- Statistiques ---
  getStatistiquesEvaluation(evaluationId: number): Observable<ApiResponse<StatistiquesEvaluationDTO>> {
    if (this.mock.isDevMode()) {
      const stats: StatistiquesEvaluationDTO = {
        evaluationId, evaluationNom: this.mock.evaluations.find(e => e.id === evaluationId)?.nom ?? '',
        moyenne: 12.45, mediane: 12.0, ecartType: 3.2,
        noteMin: 3.0, noteMax: 19.5, tauxReussite: 73.3,
        nombreNotes: 42,
        distribution: [
          { label: '0-5', min: 0, max: 5, count: 3, pourcentage: 7.1 },
          { label: '5-10', min: 5, max: 10, count: 8, pourcentage: 19.0 },
          { label: '10-12', min: 10, max: 12, count: 10, pourcentage: 23.8 },
          { label: '12-14', min: 12, max: 14, count: 9, pourcentage: 21.4 },
          { label: '14-16', min: 14, max: 16, count: 7, pourcentage: 16.7 },
          { label: '16-20', min: 16, max: 20, count: 5, pourcentage: 11.9 }
        ]
      };
      return of(this.mock.wrap(stats)).pipe(delay(300));
    }
    return this.api.get<StatistiquesEvaluationDTO>(`notes/evaluations/${evaluationId}/statistiques`);
  }

  // --- Recapitulatifs ---
  getRecapitulatifEtudiant(etudiantId: number, promotionId: number): Observable<ApiResponse<RecapitulatifEtudiantDTO>> {
    return this.api.get<RecapitulatifEtudiantDTO>(`notes/etudiant/${etudiantId}/promotion/${promotionId}/recapitulatif`);
  }

  getRecapitulatifModule(moduleId: number, promotionId: number): Observable<ApiResponse<RecapitulatifModuleDTO>> {
    return this.api.get<RecapitulatifModuleDTO>(`notes/modules/${moduleId}/promotion/${promotionId}/recapitulatif`);
  }

  // --- Import/Export ---
  telechargerTemplate(evaluationId: number): Observable<Blob> {
    if (this.mock.isDevMode()) {
      return of(this.mock.createFakeBlob()).pipe(delay(300));
    }
    return this.api.download(`notes/evaluations/${evaluationId}/template-excel`);
  }

  importerNotes(evaluationId: number, file: File): Observable<ApiResponse<ImportResult>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap({ totalTraitees: 45, totalSucces: 42, totalEchecs: 3, erreurs: ['Ligne 5: note invalide', 'Ligne 12: etudiant inconnu', 'Ligne 30: doublon'] })).pipe(delay(500));
    }
    return this.api.upload<ImportResult>(`notes/evaluations/${evaluationId}/import-excel`, file);
  }
}

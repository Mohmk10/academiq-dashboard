import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
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

  constructor(private api: ApiService) {}

  // --- Evaluations ---
  getEvaluations(moduleId?: number, promotionId?: number): Observable<ApiResponse<EvaluationResponse[]>> {
    if (moduleId && promotionId) {
      return this.api.get<EvaluationResponse[]>(`notes/evaluations/module/${moduleId}/promotion/${promotionId}`);
    }
    if (moduleId) {
      return this.api.get<EvaluationResponse[]>(`notes/evaluations/module/${moduleId}`);
    }
    return this.api.get<EvaluationResponse[]>('notes/evaluations/module/0');
  }

  getEvaluation(id: number): Observable<ApiResponse<EvaluationResponse>> {
    return this.api.get<EvaluationResponse>(`notes/evaluations/${id}`);
  }

  createEvaluation(request: EvaluationRequest): Observable<ApiResponse<EvaluationResponse>> {
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
    return this.api.delete<void>(`notes/evaluations/${id}`);
  }

  publierEvaluation(id: number): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`notes/evaluations/${id}/terminer`);
  }

  // --- Notes ---
  saisirNote(request: NoteSaisieRequest): Observable<ApiResponse<NoteResponse>> {
    return this.api.post<NoteResponse>('notes/saisir', request);
  }

  saisirEnMasse(request: SaisieEnMasseRequest): Observable<ApiResponse<SaisieEnMasseResult>> {
    return this.api.post<SaisieEnMasseResult>('notes/saisir-en-masse', request);
  }

  getNotesEvaluation(evaluationId: number): Observable<ApiResponse<NoteResponse[]>> {
    return this.api.get<NoteResponse[]>(`notes/evaluation/${evaluationId}`);
  }

  getNotesPrepopulees(evaluationId: number): Observable<ApiResponse<NotePrepopuleeDTO[]>> {
    return this.api.get<NotePrepopuleeDTO[]>(`notes/evaluations/${evaluationId}/preparer-saisie`);
  }

  getNotesEtudiant(etudiantId: number): Observable<ApiResponse<NoteResponse[]>> {
    return this.api.get<NoteResponse[]>(`notes/etudiant/${etudiantId}`);
  }

  // --- Statistiques ---
  getStatistiquesEvaluation(evaluationId: number): Observable<ApiResponse<StatistiquesEvaluationDTO>> {
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
    return this.api.download(`notes/evaluations/${evaluationId}/template-excel`);
  }

  importerNotes(evaluationId: number, file: File): Observable<ApiResponse<ImportResult>> {
    return this.api.upload<ImportResult>(`notes/evaluations/${evaluationId}/import-excel`, file);
  }
}

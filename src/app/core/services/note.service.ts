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

  // --- Évaluations ---
  getEvaluations(moduleId?: number, promotionId?: number): Observable<ApiResponse<EvaluationResponse[]>> {
    return this.api.get<EvaluationResponse[]>('evaluations', { moduleId, promotionId });
  }

  getEvaluation(id: number): Observable<ApiResponse<EvaluationResponse>> {
    return this.api.get<EvaluationResponse>(`evaluations/${id}`);
  }

  createEvaluation(request: EvaluationRequest): Observable<ApiResponse<EvaluationResponse>> {
    return this.api.post<EvaluationResponse>('evaluations', request);
  }

  updateEvaluation(id: number, request: EvaluationRequest): Observable<ApiResponse<EvaluationResponse>> {
    return this.api.put<EvaluationResponse>(`evaluations/${id}`, request);
  }

  deleteEvaluation(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`evaluations/${id}`);
  }

  publierEvaluation(id: number): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`evaluations/${id}/publier`);
  }

  // --- Notes ---
  saisirNote(request: NoteSaisieRequest): Observable<ApiResponse<NoteResponse>> {
    return this.api.post<NoteResponse>('notes', request);
  }

  saisirEnMasse(request: SaisieEnMasseRequest): Observable<ApiResponse<SaisieEnMasseResult>> {
    return this.api.post<SaisieEnMasseResult>('notes/saisie-masse', request);
  }

  getNotesEvaluation(evaluationId: number): Observable<ApiResponse<NoteResponse[]>> {
    return this.api.get<NoteResponse[]>(`notes/evaluation/${evaluationId}`);
  }

  getNotesPrepopulees(evaluationId: number): Observable<ApiResponse<NotePrepopuleeDTO[]>> {
    return this.api.get<NotePrepopuleeDTO[]>(`notes/evaluation/${evaluationId}/prepopulees`);
  }

  getNotesEtudiant(etudiantId: number): Observable<ApiResponse<NoteResponse[]>> {
    return this.api.get<NoteResponse[]>(`notes/etudiant/${etudiantId}`);
  }

  // --- Statistiques ---
  getStatistiquesEvaluation(evaluationId: number): Observable<ApiResponse<StatistiquesEvaluationDTO>> {
    return this.api.get<StatistiquesEvaluationDTO>(`notes/evaluation/${evaluationId}/statistiques`);
  }

  // --- Récapitulatifs ---
  getRecapitulatifEtudiant(etudiantId: number, promotionId: number): Observable<ApiResponse<RecapitulatifEtudiantDTO>> {
    return this.api.get<RecapitulatifEtudiantDTO>(`notes/recapitulatif/etudiant/${etudiantId}`, { promotionId });
  }

  getRecapitulatifModule(moduleId: number, promotionId: number): Observable<ApiResponse<RecapitulatifModuleDTO>> {
    return this.api.get<RecapitulatifModuleDTO>(`notes/recapitulatif/module/${moduleId}`, { promotionId });
  }

  // --- Import/Export ---
  telechargerTemplate(evaluationId: number): Observable<Blob> {
    return this.api.download(`notes/evaluation/${evaluationId}/template`);
  }

  importerNotes(evaluationId: number, file: File): Observable<ApiResponse<ImportResult>> {
    return this.api.upload<ImportResult>(`notes/evaluation/${evaluationId}/import`, file);
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import {
  FiliereRequest, FiliereResponse,
  NiveauRequest, NiveauResponse,
  PromotionRequest, PromotionResponse,
  SemestreRequest, SemestreResponse,
  UeRequest, UeResponse,
  ModuleRequest, ModuleResponse,
  InscriptionRequest, InscriptionResponse,
  AffectationRequest, AffectationResponse
} from '../models/structure.model';

@Injectable({ providedIn: 'root' })
export class StructureService {

  constructor(private api: ApiService) {}

  // --- Filieres ---
  getFilieres(): Observable<ApiResponse<FiliereResponse[]>> {
    return this.api.get<FiliereResponse[]>('structure/filieres');
  }

  getFiliere(id: number): Observable<ApiResponse<FiliereResponse>> {
    return this.api.get<FiliereResponse>(`structure/filieres/${id}`);
  }

  createFiliere(request: FiliereRequest): Observable<ApiResponse<FiliereResponse>> {
    return this.api.post<FiliereResponse>('structure/filieres', request);
  }

  updateFiliere(id: number, request: FiliereRequest): Observable<ApiResponse<FiliereResponse>> {
    return this.api.put<FiliereResponse>(`structure/filieres/${id}`, request);
  }

  deleteFiliere(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`structure/filieres/${id}`);
  }

  // --- Niveaux ---
  getNiveaux(filiereId?: number): Observable<ApiResponse<NiveauResponse[]>> {
    if (filiereId) {
      return this.api.get<NiveauResponse[]>(`structure/filieres/${filiereId}/niveaux`);
    }
    return of({ success: true, message: '', data: [], timestamp: new Date().toISOString() } as ApiResponse<NiveauResponse[]>);
  }

  createNiveau(request: NiveauRequest): Observable<ApiResponse<NiveauResponse>> {
    return this.api.post<NiveauResponse>(`structure/filieres/${request.filiereId}/niveaux`, request);
  }

  updateNiveau(id: number, request: NiveauRequest): Observable<ApiResponse<NiveauResponse>> {
    return this.api.put<NiveauResponse>(`structure/niveaux/${id}`, request);
  }

  deleteNiveau(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`structure/niveaux/${id}`);
  }

  // --- Promotions ---
  getPromotions(niveauId?: number): Observable<ApiResponse<PromotionResponse[]>> {
    if (niveauId) {
      return this.api.get<PromotionResponse[]>(`structure/niveaux/${niveauId}/promotions`);
    }
    return this.api.get<PromotionResponse[]>('structure/promotions');
  }

  getPromotion(id: number): Observable<ApiResponse<PromotionResponse>> {
    return this.api.get<PromotionResponse>(`structure/promotions/${id}`);
  }

  createPromotion(request: PromotionRequest): Observable<ApiResponse<PromotionResponse>> {
    return this.api.post<PromotionResponse>(`structure/niveaux/${request.niveauId}/promotions`, request);
  }

  updatePromotion(id: number, request: PromotionRequest): Observable<ApiResponse<PromotionResponse>> {
    return this.api.put<PromotionResponse>(`structure/promotions/${id}`, request);
  }

  deletePromotion(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`structure/promotions/${id}`);
  }

  // --- Semestres ---
  getSemestres(niveauId?: number): Observable<ApiResponse<SemestreResponse[]>> {
    if (niveauId) {
      return this.api.get<SemestreResponse[]>(`structure/niveaux/${niveauId}/semestres`);
    }
    return of({ success: true, message: '', data: [], timestamp: new Date().toISOString() } as ApiResponse<SemestreResponse[]>);
  }

  createSemestre(request: SemestreRequest): Observable<ApiResponse<SemestreResponse>> {
    return this.api.post<SemestreResponse>(`structure/niveaux/${request.promotionId}/semestres`, request);
  }

  updateSemestre(id: number, request: SemestreRequest): Observable<ApiResponse<SemestreResponse>> {
    return this.api.put<SemestreResponse>(`structure/semestres/${id}`, request);
  }

  deleteSemestre(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`structure/semestres/${id}`);
  }

  // --- UEs ---
  getUes(semestreId?: number): Observable<ApiResponse<UeResponse[]>> {
    if (semestreId) {
      return this.api.get<UeResponse[]>(`structure/semestres/${semestreId}/ues`);
    }
    return of({ success: true, message: '', data: [], timestamp: new Date().toISOString() } as ApiResponse<UeResponse[]>);
  }

  createUe(request: UeRequest): Observable<ApiResponse<UeResponse>> {
    return this.api.post<UeResponse>(`structure/semestres/${request.semestreId}/ues`, request);
  }

  updateUe(id: number, request: UeRequest): Observable<ApiResponse<UeResponse>> {
    return this.api.put<UeResponse>(`structure/ues/${id}`, request);
  }

  deleteUe(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`structure/ues/${id}`);
  }

  // --- Modules ---
  getModules(ueId?: number): Observable<ApiResponse<ModuleResponse[]>> {
    if (ueId) {
      return this.api.get<ModuleResponse[]>(`structure/ues/${ueId}/modules`);
    }
    return of({ success: true, message: '', data: [], timestamp: new Date().toISOString() } as ApiResponse<ModuleResponse[]>);
  }

  getModule(id: number): Observable<ApiResponse<ModuleResponse>> {
    return this.api.get<ModuleResponse>(`structure/modules/${id}`);
  }

  createModule(request: ModuleRequest): Observable<ApiResponse<ModuleResponse>> {
    return this.api.post<ModuleResponse>(`structure/ues/${request.ueId}/modules`, request);
  }

  updateModule(id: number, request: ModuleRequest): Observable<ApiResponse<ModuleResponse>> {
    return this.api.put<ModuleResponse>(`structure/modules/${id}`, request);
  }

  deleteModule(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`structure/modules/${id}`);
  }

  getModulesParEnseignant(enseignantId: number): Observable<ApiResponse<ModuleResponse[]>> {
    return this.api.get<ModuleResponse[]>(`structure/modules/enseignant/${enseignantId}`);
  }

  // --- Inscriptions ---
  inscrireEtudiant(request: InscriptionRequest): Observable<ApiResponse<InscriptionResponse>> {
    return this.api.post<InscriptionResponse>('inscriptions', request);
  }

  getInscriptions(promotionId: number, page: number, size: number): Observable<ApiResponse<PageResponse<InscriptionResponse>>> {
    return this.api.get<PageResponse<InscriptionResponse>>(`inscriptions/promotion/${promotionId}`);
  }

  // --- Affectations ---
  affecterEnseignant(request: AffectationRequest): Observable<ApiResponse<AffectationResponse>> {
    return this.api.post<AffectationResponse>('affectations', request);
  }

  getAffectations(enseignantId?: number): Observable<ApiResponse<AffectationResponse[]>> {
    if (enseignantId) {
      return this.api.get<AffectationResponse[]>(`affectations/enseignant/${enseignantId}`);
    }
    return this.api.get<AffectationResponse[]>('affectations');
  }

  deleteAffectation(id: number): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`affectations/${id}/desactiver`);
  }
}

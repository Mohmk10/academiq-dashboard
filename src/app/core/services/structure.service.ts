import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  // --- Filières ---
  getFilieres(): Observable<ApiResponse<FiliereResponse[]>> {
    return this.api.get<FiliereResponse[]>('filieres');
  }

  getFiliere(id: number): Observable<ApiResponse<FiliereResponse>> {
    return this.api.get<FiliereResponse>(`filieres/${id}`);
  }

  createFiliere(request: FiliereRequest): Observable<ApiResponse<FiliereResponse>> {
    return this.api.post<FiliereResponse>('filieres', request);
  }

  updateFiliere(id: number, request: FiliereRequest): Observable<ApiResponse<FiliereResponse>> {
    return this.api.put<FiliereResponse>(`filieres/${id}`, request);
  }

  deleteFiliere(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`filieres/${id}`);
  }

  // --- Niveaux ---
  getNiveaux(filiereId?: number): Observable<ApiResponse<NiveauResponse[]>> {
    return this.api.get<NiveauResponse[]>('niveaux', filiereId ? { filiereId } : undefined);
  }

  createNiveau(request: NiveauRequest): Observable<ApiResponse<NiveauResponse>> {
    return this.api.post<NiveauResponse>('niveaux', request);
  }

  updateNiveau(id: number, request: NiveauRequest): Observable<ApiResponse<NiveauResponse>> {
    return this.api.put<NiveauResponse>(`niveaux/${id}`, request);
  }

  deleteNiveau(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`niveaux/${id}`);
  }

  // --- Promotions ---
  getPromotions(niveauId?: number): Observable<ApiResponse<PromotionResponse[]>> {
    return this.api.get<PromotionResponse[]>('promotions', niveauId ? { niveauId } : undefined);
  }

  getPromotion(id: number): Observable<ApiResponse<PromotionResponse>> {
    return this.api.get<PromotionResponse>(`promotions/${id}`);
  }

  createPromotion(request: PromotionRequest): Observable<ApiResponse<PromotionResponse>> {
    return this.api.post<PromotionResponse>('promotions', request);
  }

  updatePromotion(id: number, request: PromotionRequest): Observable<ApiResponse<PromotionResponse>> {
    return this.api.put<PromotionResponse>(`promotions/${id}`, request);
  }

  deletePromotion(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`promotions/${id}`);
  }

  // --- Semestres ---
  getSemestres(promotionId?: number): Observable<ApiResponse<SemestreResponse[]>> {
    return this.api.get<SemestreResponse[]>('semestres', promotionId ? { promotionId } : undefined);
  }

  createSemestre(request: SemestreRequest): Observable<ApiResponse<SemestreResponse>> {
    return this.api.post<SemestreResponse>('semestres', request);
  }

  updateSemestre(id: number, request: SemestreRequest): Observable<ApiResponse<SemestreResponse>> {
    return this.api.put<SemestreResponse>(`semestres/${id}`, request);
  }

  deleteSemestre(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`semestres/${id}`);
  }

  // --- UEs ---
  getUes(semestreId?: number): Observable<ApiResponse<UeResponse[]>> {
    return this.api.get<UeResponse[]>('ues', semestreId ? { semestreId } : undefined);
  }

  createUe(request: UeRequest): Observable<ApiResponse<UeResponse>> {
    return this.api.post<UeResponse>('ues', request);
  }

  updateUe(id: number, request: UeRequest): Observable<ApiResponse<UeResponse>> {
    return this.api.put<UeResponse>(`ues/${id}`, request);
  }

  deleteUe(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`ues/${id}`);
  }

  // --- Modules ---
  getModules(ueId?: number): Observable<ApiResponse<ModuleResponse[]>> {
    return this.api.get<ModuleResponse[]>('modules', ueId ? { ueId } : undefined);
  }

  getModule(id: number): Observable<ApiResponse<ModuleResponse>> {
    return this.api.get<ModuleResponse>(`modules/${id}`);
  }

  createModule(request: ModuleRequest): Observable<ApiResponse<ModuleResponse>> {
    return this.api.post<ModuleResponse>('modules', request);
  }

  updateModule(id: number, request: ModuleRequest): Observable<ApiResponse<ModuleResponse>> {
    return this.api.put<ModuleResponse>(`modules/${id}`, request);
  }

  deleteModule(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`modules/${id}`);
  }

  // --- Inscriptions ---
  inscrireEtudiant(request: InscriptionRequest): Observable<ApiResponse<InscriptionResponse>> {
    return this.api.post<InscriptionResponse>('inscriptions', request);
  }

  getInscriptions(promotionId: number, page: number, size: number): Observable<ApiResponse<PageResponse<InscriptionResponse>>> {
    return this.api.getPage<InscriptionResponse>('inscriptions', page, size, undefined, undefined, { promotionId });
  }

  // --- Affectations ---
  affecterEnseignant(request: AffectationRequest): Observable<ApiResponse<AffectationResponse>> {
    return this.api.post<AffectationResponse>('affectations', request);
  }

  getAffectations(enseignantId?: number): Observable<ApiResponse<AffectationResponse[]>> {
    return this.api.get<AffectationResponse[]>('affectations', enseignantId ? { enseignantId } : undefined);
  }

  deleteAffectation(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`affectations/${id}`);
  }
}

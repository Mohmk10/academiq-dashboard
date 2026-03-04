import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
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

  constructor(private api: ApiService, private mock: MockDataService) {}

  // --- Filieres ---
  getFilieres(): Observable<ApiResponse<FiliereResponse[]>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.filieres)).pipe(delay(300));
    }
    return this.api.get<FiliereResponse[]>('structure/filieres');
  }

  getFiliere(id: number): Observable<ApiResponse<FiliereResponse>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.filieres.find(f => f.id === id)!)).pipe(delay(300));
    }
    return this.api.get<FiliereResponse>(`structure/filieres/${id}`);
  }

  createFiliere(request: FiliereRequest): Observable<ApiResponse<FiliereResponse>> {
    if (this.mock.isDevMode()) {
      const filiere: FiliereResponse = { id: Date.now(), ...request, niveaux: [], actif: true };
      return of(this.mock.wrap(filiere)).pipe(delay(300));
    }
    return this.api.post<FiliereResponse>('structure/filieres', request);
  }

  updateFiliere(id: number, request: FiliereRequest): Observable<ApiResponse<FiliereResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.filieres.find(f => f.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<FiliereResponse>(`structure/filieres/${id}`, request);
  }

  deleteFiliere(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`structure/filieres/${id}`);
  }

  // --- Niveaux ---
  getNiveaux(filiereId?: number): Observable<ApiResponse<NiveauResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = filiereId ? this.mock.niveauxList.filter(n => n.filiereId === filiereId) : this.mock.niveauxList;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    if (filiereId) {
      return this.api.get<NiveauResponse[]>(`structure/filieres/${filiereId}/niveaux`);
    }
    return this.api.get<NiveauResponse[]>('structure/filieres/0/niveaux');
  }

  createNiveau(request: NiveauRequest): Observable<ApiResponse<NiveauResponse>> {
    if (this.mock.isDevMode()) {
      const niveau: NiveauResponse = { id: Date.now(), ...request };
      return of(this.mock.wrap(niveau)).pipe(delay(300));
    }
    return this.api.post<NiveauResponse>(`structure/filieres/${request.filiereId}/niveaux`, request);
  }

  updateNiveau(id: number, request: NiveauRequest): Observable<ApiResponse<NiveauResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.niveauxList.find(n => n.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<NiveauResponse>(`structure/niveaux/${id}`, request);
  }

  deleteNiveau(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`structure/niveaux/${id}`);
  }

  // --- Promotions ---
  getPromotions(niveauId?: number): Observable<ApiResponse<PromotionResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = niveauId ? this.mock.promotions.filter(p => p.niveauId === niveauId) : this.mock.promotions;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    if (niveauId) {
      return this.api.get<PromotionResponse[]>(`structure/niveaux/${niveauId}/promotions`);
    }
    return this.api.get<PromotionResponse[]>('structure/promotions');
  }

  getPromotion(id: number): Observable<ApiResponse<PromotionResponse>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.promotions.find(p => p.id === id)!)).pipe(delay(300));
    }
    return this.api.get<PromotionResponse>(`structure/promotions/${id}`);
  }

  createPromotion(request: PromotionRequest): Observable<ApiResponse<PromotionResponse>> {
    if (this.mock.isDevMode()) {
      const promo: PromotionResponse = { id: Date.now(), ...request, niveauNom: 'Niveau', filiereNom: 'Filiere', nombreEtudiants: 0, actif: true };
      return of(this.mock.wrap(promo)).pipe(delay(300));
    }
    return this.api.post<PromotionResponse>(`structure/niveaux/${request.niveauId}/promotions`, request);
  }

  updatePromotion(id: number, request: PromotionRequest): Observable<ApiResponse<PromotionResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.promotions.find(p => p.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<PromotionResponse>(`structure/promotions/${id}`, request);
  }

  deletePromotion(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`structure/promotions/${id}`);
  }

  // --- Semestres ---
  getSemestres(niveauId?: number): Observable<ApiResponse<SemestreResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = niveauId ? this.mock.semestres.filter(s => s.promotionId === niveauId) : this.mock.semestres;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    if (niveauId) {
      return this.api.get<SemestreResponse[]>(`structure/niveaux/${niveauId}/semestres`);
    }
    return this.api.get<SemestreResponse[]>('structure/niveaux/0/semestres');
  }

  createSemestre(request: SemestreRequest): Observable<ApiResponse<SemestreResponse>> {
    if (this.mock.isDevMode()) {
      const semestre: SemestreResponse = { id: Date.now(), ...request };
      return of(this.mock.wrap(semestre)).pipe(delay(300));
    }
    return this.api.post<SemestreResponse>(`structure/niveaux/${request.promotionId}/semestres`, request);
  }

  updateSemestre(id: number, request: SemestreRequest): Observable<ApiResponse<SemestreResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.semestres.find(s => s.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<SemestreResponse>(`structure/semestres/${id}`, request);
  }

  deleteSemestre(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`structure/semestres/${id}`);
  }

  // --- UEs ---
  getUes(semestreId?: number): Observable<ApiResponse<UeResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = semestreId ? this.mock.ues.filter(u => u.semestreId === semestreId) : this.mock.ues;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    if (semestreId) {
      return this.api.get<UeResponse[]>(`structure/semestres/${semestreId}/ues`);
    }
    return this.api.get<UeResponse[]>('structure/semestres/0/ues');
  }

  createUe(request: UeRequest): Observable<ApiResponse<UeResponse>> {
    if (this.mock.isDevMode()) {
      const ue: UeResponse = { id: Date.now(), ...request };
      return of(this.mock.wrap(ue)).pipe(delay(300));
    }
    return this.api.post<UeResponse>(`structure/semestres/${request.semestreId}/ues`, request);
  }

  updateUe(id: number, request: UeRequest): Observable<ApiResponse<UeResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.ues.find(u => u.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<UeResponse>(`structure/ues/${id}`, request);
  }

  deleteUe(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`structure/ues/${id}`);
  }

  // --- Modules ---
  getModules(ueId?: number): Observable<ApiResponse<ModuleResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = ueId ? this.mock.modules.filter(m => m.ueId === ueId) : this.mock.modules;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    if (ueId) {
      return this.api.get<ModuleResponse[]>(`structure/ues/${ueId}/modules`);
    }
    return this.api.get<ModuleResponse[]>('structure/ues/0/modules');
  }

  getModule(id: number): Observable<ApiResponse<ModuleResponse>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.modules.find(m => m.id === id)!)).pipe(delay(300));
    }
    return this.api.get<ModuleResponse>(`structure/modules/${id}`);
  }

  createModule(request: ModuleRequest): Observable<ApiResponse<ModuleResponse>> {
    if (this.mock.isDevMode()) {
      const mod: ModuleResponse = { id: Date.now(), ...request, ueNom: 'UE', enseignantNom: 'Enseignant' };
      return of(this.mock.wrap(mod)).pipe(delay(300));
    }
    return this.api.post<ModuleResponse>(`structure/ues/${request.ueId}/modules`, request);
  }

  updateModule(id: number, request: ModuleRequest): Observable<ApiResponse<ModuleResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.modules.find(m => m.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<ModuleResponse>(`structure/modules/${id}`, request);
  }

  deleteModule(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`structure/modules/${id}`);
  }

  getModulesParEnseignant(enseignantId: number): Observable<ApiResponse<ModuleResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = this.mock.modules.filter(m => m.enseignantId === enseignantId);
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    return this.api.get<ModuleResponse[]>(`structure/modules/enseignant/${enseignantId}`);
  }

  // --- Inscriptions ---
  inscrireEtudiant(request: InscriptionRequest): Observable<ApiResponse<InscriptionResponse>> {
    if (this.mock.isDevMode()) {
      const insc: InscriptionResponse = {
        id: Date.now(), ...request, etudiantNom: 'Etudiant', etudiantMatricule: 'ETU-XXX',
        promotionNom: 'Promotion', dateInscription: new Date().toISOString(), statut: 'INSCRIT'
      };
      return of(this.mock.wrap(insc)).pipe(delay(300));
    }
    return this.api.post<InscriptionResponse>('inscriptions', request);
  }

  getInscriptions(promotionId: number, page: number, size: number): Observable<ApiResponse<PageResponse<InscriptionResponse>>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.paginate(this.mock.inscriptions, page, size))).pipe(delay(300));
    }
    return this.api.get<PageResponse<InscriptionResponse>>(`inscriptions/promotion/${promotionId}`);
  }

  // --- Affectations ---
  affecterEnseignant(request: AffectationRequest): Observable<ApiResponse<AffectationResponse>> {
    if (this.mock.isDevMode()) {
      const aff: AffectationResponse = { id: Date.now(), ...request, enseignantNom: 'Enseignant', moduleNom: 'Module' };
      return of(this.mock.wrap(aff)).pipe(delay(300));
    }
    return this.api.post<AffectationResponse>('affectations', request);
  }

  getAffectations(enseignantId?: number): Observable<ApiResponse<AffectationResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = enseignantId ? this.mock.affectations.filter(a => a.enseignantId === enseignantId) : this.mock.affectations;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    if (enseignantId) {
      return this.api.get<AffectationResponse[]>(`affectations/enseignant/${enseignantId}`);
    }
    return this.api.get<AffectationResponse[]>('affectations');
  }

  deleteAffectation(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.patch<void>(`affectations/${id}/desactiver`);
  }
}

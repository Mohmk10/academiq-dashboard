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
    return this.api.get<FiliereResponse[]>('filieres');
  }

  getFiliere(id: number): Observable<ApiResponse<FiliereResponse>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.filieres.find(f => f.id === id)!)).pipe(delay(300));
    }
    return this.api.get<FiliereResponse>(`filieres/${id}`);
  }

  createFiliere(request: FiliereRequest): Observable<ApiResponse<FiliereResponse>> {
    if (this.mock.isDevMode()) {
      const filiere: FiliereResponse = { id: Date.now(), ...request, niveaux: [], actif: true };
      return of(this.mock.wrap(filiere)).pipe(delay(300));
    }
    return this.api.post<FiliereResponse>('filieres', request);
  }

  updateFiliere(id: number, request: FiliereRequest): Observable<ApiResponse<FiliereResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.filieres.find(f => f.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<FiliereResponse>(`filieres/${id}`, request);
  }

  deleteFiliere(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`filieres/${id}`);
  }

  // --- Niveaux ---
  getNiveaux(filiereId?: number): Observable<ApiResponse<NiveauResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = filiereId ? this.mock.niveauxList.filter(n => n.filiereId === filiereId) : this.mock.niveauxList;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    return this.api.get<NiveauResponse[]>('niveaux', filiereId ? { filiereId } : undefined);
  }

  createNiveau(request: NiveauRequest): Observable<ApiResponse<NiveauResponse>> {
    if (this.mock.isDevMode()) {
      const niveau: NiveauResponse = { id: Date.now(), ...request };
      return of(this.mock.wrap(niveau)).pipe(delay(300));
    }
    return this.api.post<NiveauResponse>('niveaux', request);
  }

  updateNiveau(id: number, request: NiveauRequest): Observable<ApiResponse<NiveauResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.niveauxList.find(n => n.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<NiveauResponse>(`niveaux/${id}`, request);
  }

  deleteNiveau(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`niveaux/${id}`);
  }

  // --- Promotions ---
  getPromotions(niveauId?: number): Observable<ApiResponse<PromotionResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = niveauId ? this.mock.promotions.filter(p => p.niveauId === niveauId) : this.mock.promotions;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    return this.api.get<PromotionResponse[]>('promotions', niveauId ? { niveauId } : undefined);
  }

  getPromotion(id: number): Observable<ApiResponse<PromotionResponse>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.promotions.find(p => p.id === id)!)).pipe(delay(300));
    }
    return this.api.get<PromotionResponse>(`promotions/${id}`);
  }

  createPromotion(request: PromotionRequest): Observable<ApiResponse<PromotionResponse>> {
    if (this.mock.isDevMode()) {
      const promo: PromotionResponse = { id: Date.now(), ...request, niveauNom: 'Niveau', filiereNom: 'Filiere', nombreEtudiants: 0, actif: true };
      return of(this.mock.wrap(promo)).pipe(delay(300));
    }
    return this.api.post<PromotionResponse>('promotions', request);
  }

  updatePromotion(id: number, request: PromotionRequest): Observable<ApiResponse<PromotionResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.promotions.find(p => p.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<PromotionResponse>(`promotions/${id}`, request);
  }

  deletePromotion(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`promotions/${id}`);
  }

  // --- Semestres ---
  getSemestres(promotionId?: number): Observable<ApiResponse<SemestreResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = promotionId ? this.mock.semestres.filter(s => s.promotionId === promotionId) : this.mock.semestres;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    return this.api.get<SemestreResponse[]>('semestres', promotionId ? { promotionId } : undefined);
  }

  createSemestre(request: SemestreRequest): Observable<ApiResponse<SemestreResponse>> {
    if (this.mock.isDevMode()) {
      const semestre: SemestreResponse = { id: Date.now(), ...request };
      return of(this.mock.wrap(semestre)).pipe(delay(300));
    }
    return this.api.post<SemestreResponse>('semestres', request);
  }

  updateSemestre(id: number, request: SemestreRequest): Observable<ApiResponse<SemestreResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.semestres.find(s => s.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<SemestreResponse>(`semestres/${id}`, request);
  }

  deleteSemestre(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`semestres/${id}`);
  }

  // --- UEs ---
  getUes(semestreId?: number): Observable<ApiResponse<UeResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = semestreId ? this.mock.ues.filter(u => u.semestreId === semestreId) : this.mock.ues;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    return this.api.get<UeResponse[]>('ues', semestreId ? { semestreId } : undefined);
  }

  createUe(request: UeRequest): Observable<ApiResponse<UeResponse>> {
    if (this.mock.isDevMode()) {
      const ue: UeResponse = { id: Date.now(), ...request };
      return of(this.mock.wrap(ue)).pipe(delay(300));
    }
    return this.api.post<UeResponse>('ues', request);
  }

  updateUe(id: number, request: UeRequest): Observable<ApiResponse<UeResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.ues.find(u => u.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<UeResponse>(`ues/${id}`, request);
  }

  deleteUe(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`ues/${id}`);
  }

  // --- Modules ---
  getModules(ueId?: number): Observable<ApiResponse<ModuleResponse[]>> {
    if (this.mock.isDevMode()) {
      const list = ueId ? this.mock.modules.filter(m => m.ueId === ueId) : this.mock.modules;
      return of(this.mock.wrap(list)).pipe(delay(300));
    }
    return this.api.get<ModuleResponse[]>('modules', ueId ? { ueId } : undefined);
  }

  getModule(id: number): Observable<ApiResponse<ModuleResponse>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.modules.find(m => m.id === id)!)).pipe(delay(300));
    }
    return this.api.get<ModuleResponse>(`modules/${id}`);
  }

  createModule(request: ModuleRequest): Observable<ApiResponse<ModuleResponse>> {
    if (this.mock.isDevMode()) {
      const mod: ModuleResponse = { id: Date.now(), ...request, ueNom: 'UE', enseignantNom: 'Enseignant' };
      return of(this.mock.wrap(mod)).pipe(delay(300));
    }
    return this.api.post<ModuleResponse>('modules', request);
  }

  updateModule(id: number, request: ModuleRequest): Observable<ApiResponse<ModuleResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.modules.find(m => m.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<ModuleResponse>(`modules/${id}`, request);
  }

  deleteModule(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`modules/${id}`);
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
    return this.api.getPage<InscriptionResponse>('inscriptions', page, size, undefined, undefined, { promotionId });
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
    return this.api.get<AffectationResponse[]>('affectations', enseignantId ? { enseignantId } : undefined);
  }

  deleteAffectation(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`affectations/${id}`);
  }
}

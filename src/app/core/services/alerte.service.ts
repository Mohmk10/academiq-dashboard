import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import {
  AlerteResponse,
  TraiterAlerteRequest,
  RegleAlerteRequest, RegleAlerteResponse,
  StatistiquesAlertesDTO,
  StatutAlerte
} from '../models/alerte.model';

@Injectable({ providedIn: 'root' })
export class AlerteService {

  constructor(private api: ApiService, private mock: MockDataService) {}

  getAlertes(page: number, size: number, statut?: StatutAlerte): Observable<ApiResponse<PageResponse<AlerteResponse>>> {
    if (this.mock.isDevMode()) {
      const list = statut ? this.mock.alertes.filter(a => a.statut === statut) : this.mock.alertes;
      return of(this.mock.wrap(this.mock.paginate(list, page, size))).pipe(delay(300));
    }
    return this.api.getPage<AlerteResponse>('alertes/rechercher', page, size, 'createdAt', 'desc', statut ? { statut } : undefined);
  }

  getAlerte(id: number): Observable<ApiResponse<AlerteResponse>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.alertes.find(a => a.id === id)!)).pipe(delay(300));
    }
    return this.api.get<AlerteResponse>(`alertes/${id}`);
  }

  traiterAlerte(id: number, request: TraiterAlerteRequest): Observable<ApiResponse<AlerteResponse>> {
    if (this.mock.isDevMode()) {
      const alerte = { ...this.mock.alertes.find(a => a.id === id)!, statut: 'TRAITEE' as any, traitePar: 'Admin', commentaireTraitement: request.commentaire };
      return of(this.mock.wrap(alerte)).pipe(delay(300));
    }
    return this.api.patch<AlerteResponse>(`alertes/${id}/traiter`, request);
  }

  resoudreAlerte(id: number): Observable<ApiResponse<AlerteResponse>> {
    if (this.mock.isDevMode()) {
      const alerte = { ...this.mock.alertes.find(a => a.id === id)!, statut: 'RESOLUE' as any };
      return of(this.mock.wrap(alerte)).pipe(delay(300));
    }
    return this.api.patch<AlerteResponse>(`alertes/${id}/resoudre`);
  }

  ignorerAlerte(id: number, commentaire?: string): Observable<ApiResponse<AlerteResponse>> {
    if (this.mock.isDevMode()) {
      const alerte = { ...this.mock.alertes.find(a => a.id === id)!, statut: 'IGNOREE' as any };
      return of(this.mock.wrap(alerte)).pipe(delay(300));
    }
    return this.api.patch<AlerteResponse>(`alertes/${id}/ignorer`, { commentaire: commentaire ?? '' });
  }

  getAlertesEtudiant(etudiantId: number): Observable<ApiResponse<AlerteResponse[]>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.alertes.filter(a => a.etudiantId === etudiantId))).pipe(delay(300));
    }
    return this.api.get<AlerteResponse[]>(`alertes/etudiant/${etudiantId}`);
  }

  getStatistiques(): Observable<ApiResponse<StatistiquesAlertesDTO>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.alerteStats)).pipe(delay(300));
    }
    return this.api.get<StatistiquesAlertesDTO>('alertes/statistiques');
  }

  getRegles(): Observable<ApiResponse<RegleAlerteResponse[]>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.reglesAlerte)).pipe(delay(300));
    }
    return this.api.get<RegleAlerteResponse[]>('alertes/regles');
  }

  createRegle(request: RegleAlerteRequest): Observable<ApiResponse<RegleAlerteResponse>> {
    if (this.mock.isDevMode()) {
      const regle: RegleAlerteResponse = { id: Date.now(), ...request, actif: true, createdAt: new Date().toISOString() };
      return of(this.mock.wrap(regle)).pipe(delay(300));
    }
    return this.api.post<RegleAlerteResponse>('alertes/regles', request);
  }

  updateRegle(id: number, request: RegleAlerteRequest): Observable<ApiResponse<RegleAlerteResponse>> {
    if (this.mock.isDevMode()) {
      const existing = this.mock.reglesAlerte.find(r => r.id === id)!;
      return of(this.mock.wrap({ ...existing, ...request })).pipe(delay(300));
    }
    return this.api.put<RegleAlerteResponse>(`alertes/regles/${id}`, request);
  }

  deleteRegle(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`alertes/regles/${id}`);
  }

  toggleRegle(id: number): Observable<ApiResponse<RegleAlerteResponse>> {
    if (this.mock.isDevMode()) {
      const regle = this.mock.reglesAlerte.find(r => r.id === id)!;
      return of(this.mock.wrap({ ...regle, actif: !regle.actif })).pipe(delay(300));
    }
    return this.api.patch<RegleAlerteResponse>(`alertes/regles/${id}/toggle`);
  }
}

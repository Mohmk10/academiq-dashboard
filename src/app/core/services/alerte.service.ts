import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
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

  private alertCountSubject = new BehaviorSubject<number>(0);
  alertCount$ = this.alertCountSubject.asObservable();

  constructor(private api: ApiService) {}

  refreshAlertCount(): void {
    this.getStatistiques().subscribe({
      next: (res) => this.alertCountSubject.next(res.data?.totalActives ?? 0),
      error: () => {}
    });
  }

  resetAlertCount(): void {
    this.alertCountSubject.next(0);
  }

  getAlertes(page: number, size: number, statut?: StatutAlerte): Observable<ApiResponse<PageResponse<AlerteResponse>>> {
    return this.api.getPage<AlerteResponse>('alertes/rechercher', page, size, 'createdAt', 'desc', statut ? { statut } : undefined);
  }

  getAlerte(id: number): Observable<ApiResponse<AlerteResponse>> {
    return this.api.get<AlerteResponse>(`alertes/${id}`);
  }

  traiterAlerte(id: number, request: TraiterAlerteRequest): Observable<ApiResponse<AlerteResponse>> {
    return this.api.patch<AlerteResponse>(`alertes/${id}/traiter`, request);
  }

  resoudreAlerte(id: number): Observable<ApiResponse<AlerteResponse>> {
    return this.api.patch<AlerteResponse>(`alertes/${id}/resoudre`);
  }

  ignorerAlerte(id: number, commentaire?: string): Observable<ApiResponse<AlerteResponse>> {
    return this.api.patch<AlerteResponse>(`alertes/${id}/ignorer`, { commentaire: commentaire ?? '' });
  }

  getAlertesEtudiant(etudiantId: number): Observable<ApiResponse<AlerteResponse[]>> {
    return this.api.get<AlerteResponse[]>(`alertes/etudiant/${etudiantId}`);
  }

  getStatistiques(): Observable<ApiResponse<StatistiquesAlertesDTO>> {
    return this.api.get<StatistiquesAlertesDTO>('alertes/statistiques');
  }

  getRegles(): Observable<ApiResponse<RegleAlerteResponse[]>> {
    return this.api.get<RegleAlerteResponse[]>('alertes/regles');
  }

  createRegle(request: RegleAlerteRequest): Observable<ApiResponse<RegleAlerteResponse>> {
    return this.api.post<RegleAlerteResponse>('alertes/regles', request);
  }

  updateRegle(id: number, request: RegleAlerteRequest): Observable<ApiResponse<RegleAlerteResponse>> {
    return this.api.put<RegleAlerteResponse>(`alertes/regles/${id}`, request);
  }

  deleteRegle(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`alertes/regles/${id}`);
  }

  toggleRegle(id: number): Observable<ApiResponse<RegleAlerteResponse>> {
    return this.api.patch<RegleAlerteResponse>(`alertes/regles/${id}/toggle`);
  }

  deleteAlerte(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`alertes/${id}`);
  }

  analyserToutes(): Observable<ApiResponse<any>> {
    return this.api.post<any>('alertes/analyser/toutes', {});
  }
}

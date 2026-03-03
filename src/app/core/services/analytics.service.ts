import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import {
  DashboardAdminDTO,
  DashboardEnseignantDTO,
  DashboardEtudiantDTO,
  TauxReussiteDTO,
  DistributionNotesDTO,
  ComparaisonPromotionsDTO,
  EvolutionPerformanceDTO,
  BulletinEtudiantDTO
} from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  constructor(private api: ApiService) {}

  // --- Dashboards ---
  getDashboardAdmin(): Observable<ApiResponse<DashboardAdminDTO>> {
    return this.api.get<DashboardAdminDTO>('analytics/dashboard/admin');
  }

  getDashboardEnseignant(): Observable<ApiResponse<DashboardEnseignantDTO>> {
    return this.api.get<DashboardEnseignantDTO>('analytics/dashboard/enseignant');
  }

  getDashboardEtudiant(): Observable<ApiResponse<DashboardEtudiantDTO>> {
    return this.api.get<DashboardEtudiantDTO>('analytics/dashboard/etudiant');
  }

  // --- Taux de réussite ---
  getTauxReussite(promotionId: number): Observable<ApiResponse<TauxReussiteDTO>> {
    return this.api.get<TauxReussiteDTO>(`analytics/taux-reussite/${promotionId}`);
  }

  // --- Distribution des notes ---
  getDistributionNotes(moduleId: number, promotionId?: number): Observable<ApiResponse<DistributionNotesDTO>> {
    return this.api.get<DistributionNotesDTO>(`analytics/distribution/${moduleId}`, promotionId ? { promotionId } : undefined);
  }

  // --- Comparaison promotions ---
  getComparaisonPromotions(niveauId: number): Observable<ApiResponse<ComparaisonPromotionsDTO>> {
    return this.api.get<ComparaisonPromotionsDTO>(`analytics/comparaison-promotions/${niveauId}`);
  }

  // --- Évolution performance ---
  getEvolutionPerformance(promotionId: number): Observable<ApiResponse<EvolutionPerformanceDTO>> {
    return this.api.get<EvolutionPerformanceDTO>(`analytics/evolution/${promotionId}`);
  }

  // --- Bulletin ---
  getBulletinEtudiant(etudiantId: number, promotionId: number): Observable<ApiResponse<BulletinEtudiantDTO>> {
    return this.api.get<BulletinEtudiantDTO>(`analytics/bulletin/${etudiantId}`, { promotionId });
  }
}

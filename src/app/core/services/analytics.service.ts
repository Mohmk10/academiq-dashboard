import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
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

  constructor(private api: ApiService, private mock: MockDataService) {}

  getSystemStats(): Observable<ApiResponse<any>> {
    return this.api.get<any>('analytics/system-stats');
  }

  getRecentAuditLogs(limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>('analytics/audit-logs/recent', { limit });
  }

  getDashboardAdmin(): Observable<ApiResponse<DashboardAdminDTO>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.dashboardAdmin)).pipe(delay(300));
    }
    return this.api.get<DashboardAdminDTO>('analytics/dashboard/admin');
  }

  getDashboardEnseignant(enseignantId?: number): Observable<ApiResponse<DashboardEnseignantDTO>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.dashboardEnseignant)).pipe(delay(300));
    }
    if (enseignantId) {
      return this.api.get<DashboardEnseignantDTO>(`analytics/dashboard/enseignant/${enseignantId}`);
    }
    return this.api.get<DashboardEnseignantDTO>('analytics/dashboard/enseignant/0');
  }

  getDashboardEtudiant(etudiantId?: number): Observable<ApiResponse<DashboardEtudiantDTO>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.dashboardEtudiant)).pipe(delay(300));
    }
    if (etudiantId) {
      return this.api.get<DashboardEtudiantDTO>(`analytics/dashboard/etudiant/${etudiantId}`);
    }
    return this.api.get<DashboardEtudiantDTO>('analytics/dashboard/etudiant/0');
  }

  getTauxReussite(promotionId: number): Observable<ApiResponse<TauxReussiteDTO>> {
    return this.api.get<TauxReussiteDTO>(`analytics/taux-reussite/promotion/${promotionId}`);
  }

  getDistributionNotes(moduleId: number, promotionId: number): Observable<ApiResponse<DistributionNotesDTO>> {
    return this.api.get<DistributionNotesDTO>(`analytics/distribution/module/${moduleId}/promotion/${promotionId}`);
  }

  getComparaisonPromotions(promotionIds: number[]): Observable<ApiResponse<ComparaisonPromotionsDTO>> {
    return this.api.get<ComparaisonPromotionsDTO>('analytics/comparaison', { promotionIds: promotionIds.join(',') });
  }

  getEvolutionEtudiant(etudiantId: number): Observable<ApiResponse<EvolutionPerformanceDTO>> {
    return this.api.get<EvolutionPerformanceDTO>(`analytics/evolution/etudiant/${etudiantId}`);
  }

  getBulletinEtudiant(etudiantId: number, promotionId: number): Observable<ApiResponse<BulletinEtudiantDTO>> {
    return this.api.get<BulletinEtudiantDTO>(`analytics/bulletin/${etudiantId}`, { promotionId });
  }
}

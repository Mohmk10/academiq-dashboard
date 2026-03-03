import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { UtilisateurSummary, UtilisateurDetail, Role } from '../models/user.model';
import { ImportResult } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {

  private readonly endpoint = 'utilisateurs';

  constructor(private api: ApiService, private mock: MockDataService) {}

  getAll(page: number, size: number, role?: Role): Observable<ApiResponse<PageResponse<UtilisateurSummary>>> {
    if (this.mock.isDevMode()) {
      const list = role === 'ENSEIGNANT' ? this.mock.enseignants
                 : role === 'ETUDIANT' ? this.mock.etudiants
                 : this.mock.getAllUsers();
      return of(this.mock.wrap(this.mock.paginate(list, page, size))).pipe(delay(300));
    }
    return this.api.getPage<UtilisateurSummary>(this.endpoint, page, size, undefined, undefined, role ? { role } : undefined);
  }

  getById(id: number): Observable<ApiResponse<UtilisateurDetail>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.getUserDetail(id))).pipe(delay(300));
    }
    return this.api.get<UtilisateurDetail>(`${this.endpoint}/${id}`);
  }

  create(request: any): Observable<ApiResponse<UtilisateurDetail>> {
    if (this.mock.isDevMode()) {
      const detail: UtilisateurDetail = { id: Date.now(), ...request, actif: true, createdAt: new Date().toISOString() };
      return of(this.mock.wrap(detail)).pipe(delay(300));
    }
    return this.api.post<UtilisateurDetail>(this.endpoint, request);
  }

  update(id: number, request: any): Observable<ApiResponse<UtilisateurDetail>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.getUserDetail(id))).pipe(delay(300));
    }
    return this.api.put<UtilisateurDetail>(`${this.endpoint}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  toggleActivation(id: number): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.patch<void>(`${this.endpoint}/${id}/toggle-activation`);
  }

  changeRole(id: number, role: Role): Observable<ApiResponse<void>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(undefined as any)).pipe(delay(300));
    }
    return this.api.patch<void>(`${this.endpoint}/${id}/role`, { role });
  }

  rechercher(keyword: string, page: number, size: number): Observable<ApiResponse<PageResponse<UtilisateurSummary>>> {
    if (this.mock.isDevMode()) {
      const kw = keyword.toLowerCase();
      const filtered = this.mock.getAllUsers().filter(u =>
        u.nom.toLowerCase().includes(kw) || u.prenom.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw)
      );
      return of(this.mock.wrap(this.mock.paginate(filtered, page, size))).pipe(delay(300));
    }
    return this.api.getPage<UtilisateurSummary>(`${this.endpoint}/recherche`, page, size, undefined, undefined, { keyword });
  }

  importerEtudiants(file: File): Observable<ApiResponse<ImportResult>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap({ totalTraitees: 10, totalSucces: 8, totalEchecs: 2, erreurs: ['Ligne 3: email invalide', 'Ligne 7: doublon'] })).pipe(delay(500));
    }
    return this.api.upload<ImportResult>(`${this.endpoint}/import-etudiants`, file);
  }

  getStats(): Observable<ApiResponse<any>> {
    if (this.mock.isDevMode()) {
      return of(this.mock.wrap(this.mock.userStats)).pipe(delay(300));
    }
    return this.api.get<any>(`${this.endpoint}/stats`);
  }
}

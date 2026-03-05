import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { UtilisateurSummary, UtilisateurDetail, Role } from '../models/user.model';
import { ImportResult } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {

  private readonly endpoint = 'utilisateurs';

  constructor(private api: ApiService) {}

  getAll(page: number, size: number, role?: Role): Observable<ApiResponse<PageResponse<UtilisateurSummary>>> {
    return this.api.getPage<UtilisateurSummary>(this.endpoint, page, size, undefined, undefined, role ? { role } : undefined);
  }

  getById(id: number): Observable<ApiResponse<UtilisateurDetail>> {
    return this.api.get<UtilisateurDetail>(`${this.endpoint}/${id}`);
  }

  create(request: any): Observable<ApiResponse<UtilisateurDetail>> {
    return this.api.post<UtilisateurDetail>(this.endpoint, request);
  }

  update(id: number, request: any): Observable<ApiResponse<UtilisateurDetail>> {
    return this.api.put<UtilisateurDetail>(`${this.endpoint}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  toggleActivation(id: number): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`${this.endpoint}/${id}/toggle-activation`);
  }

  changeRole(id: number, role: Role): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`${this.endpoint}/${id}/role`, { role });
  }

  rechercher(keyword: string, page: number, size: number): Observable<ApiResponse<PageResponse<UtilisateurSummary>>> {
    return this.api.getPage<UtilisateurSummary>(`${this.endpoint}/recherche`, page, size, undefined, undefined, { keyword });
  }

  importerEtudiants(file: File): Observable<ApiResponse<ImportResult>> {
    return this.api.upload<ImportResult>(`${this.endpoint}/import-etudiants`, file);
  }

  getStats(): Observable<ApiResponse<any>> {
    return this.api.get<any>(`${this.endpoint}/stats`);
  }
}

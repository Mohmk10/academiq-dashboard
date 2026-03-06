import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AdminService {

  constructor(private api: ApiService) {}

  resetDatabase(): Observable<ApiResponse<void>> {
    return this.api.post<void>('admin/reset-database?confirm=RESET_ALL', {});
  }

  exporterDonnees(): Observable<Blob> {
    return this.api.download('admin/export-donnees');
  }
}

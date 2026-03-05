import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RapportService {

  constructor(private api: ApiService) {}

  telechargerReleve(etudiantId: number, promotionId: number): Observable<Blob> {
    return this.api.download(`rapports/releve/etudiant/${etudiantId}/promotion/${promotionId}`);
  }

  telechargerAttestation(etudiantId: number, promotionId: number): Observable<Blob> {
    return this.api.download(`rapports/attestation/etudiant/${etudiantId}/promotion/${promotionId}`);
  }

  telechargerPV(promotionId: number): Observable<Blob> {
    return this.api.download(`rapports/pv-deliberation/promotion/${promotionId}`);
  }

  exporterExcelPromotion(promotionId: number): Observable<Blob> {
    return this.api.download(`rapports/export-excel/promotion/${promotionId}`);
  }

  exporterExcelModule(moduleId: number, promotionId: number): Observable<Blob> {
    return this.api.download(`rapports/export-excel/module/${moduleId}/promotion/${promotionId}`);
  }
}

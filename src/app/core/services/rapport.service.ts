import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RapportService {

  constructor(private api: ApiService) {}

  telechargerReleve(etudiantId: number, promotionId: number): Observable<Blob> {
    return this.api.download(`rapports/releve/${etudiantId}?promotionId=${promotionId}`);
  }

  telechargerAttestation(etudiantId: number, promotionId: number): Observable<Blob> {
    return this.api.download(`rapports/attestation/${etudiantId}?promotionId=${promotionId}`);
  }

  telechargerPV(promotionId: number): Observable<Blob> {
    return this.api.download(`rapports/pv/${promotionId}`);
  }

  exporterExcelPromotion(promotionId: number): Observable<Blob> {
    return this.api.download(`rapports/excel/promotion/${promotionId}`);
  }

  exporterExcelModule(moduleId: number, promotionId: number): Observable<Blob> {
    return this.api.download(`rapports/excel/module/${moduleId}?promotionId=${promotionId}`);
  }
}

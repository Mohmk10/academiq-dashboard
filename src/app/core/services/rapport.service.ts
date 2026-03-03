import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class RapportService {

  constructor(private api: ApiService, private mock: MockDataService) {}

  telechargerReleve(etudiantId: number, promotionId: number): Observable<Blob> {
    if (this.mock.isDevMode()) {
      return of(this.mock.createFakeBlob()).pipe(delay(500));
    }
    return this.api.download(`rapports/releve/${etudiantId}?promotionId=${promotionId}`);
  }

  telechargerAttestation(etudiantId: number, promotionId: number): Observable<Blob> {
    if (this.mock.isDevMode()) {
      return of(this.mock.createFakeBlob()).pipe(delay(500));
    }
    return this.api.download(`rapports/attestation/${etudiantId}?promotionId=${promotionId}`);
  }

  telechargerPV(promotionId: number): Observable<Blob> {
    if (this.mock.isDevMode()) {
      return of(this.mock.createFakeBlob()).pipe(delay(500));
    }
    return this.api.download(`rapports/pv/${promotionId}`);
  }

  exporterExcelPromotion(promotionId: number): Observable<Blob> {
    if (this.mock.isDevMode()) {
      return of(this.mock.createFakeBlob()).pipe(delay(500));
    }
    return this.api.download(`rapports/excel/promotion/${promotionId}`);
  }

  exporterExcelModule(moduleId: number, promotionId: number): Observable<Blob> {
    if (this.mock.isDevMode()) {
      return of(this.mock.createFakeBlob()).pipe(delay(500));
    }
    return this.api.download(`rapports/excel/module/${moduleId}?promotionId=${promotionId}`);
  }
}

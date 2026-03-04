import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StructureService } from '../../../../core/services/structure.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PromotionResponse, InscriptionResponse } from '../../../../core/models/structure.model';

@Component({
  selector: 'app-inscription-tab',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Formulaire d'inscription -->
      @if (canCreate) {
      <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Inscrire un étudiant</h3>
        <form [formGroup]="inscriptionForm" (ngSubmit)="onSubmit()" class="flex flex-col sm:flex-row gap-4 items-end">
          <div class="field !mb-0 flex-1">
            <label class="field-label">ID Étudiant</label>
            <input class="field-input" type="number" formControlName="etudiantId" placeholder="Ex: 1">
          </div>
          <div class="field !mb-0 flex-1">
            <label class="field-label">Promotion</label>
            <select class="field-input" formControlName="promotionId">
              <option [ngValue]="null" disabled>Sélectionner</option>
              @for (p of promotions; track p.id) {
                <option [ngValue]="p.id">{{ p.filiereNom }} — {{ p.niveauNom }} ({{ p.anneeUniversitaire }})</option>
              }
            </select>
          </div>
          <button class="btn-primary sm:self-center" type="submit" [disabled]="inscriptionForm.invalid || isSubmitting">
            <i class="fas fa-user-plus mr-2"></i> Inscrire
          </button>
        </form>
      </div>
      }

      <!-- Liste des inscriptions -->
      <div>
        <div class="flex items-center gap-4 mb-4">
          <div class="field !mb-0 w-64">
            <label class="field-label">Promotion</label>
            <select class="field-input" [formControl]="promotionFilter" (change)="loadInscriptions()">
              <option [ngValue]="null" disabled>Sélectionner</option>
              @for (p of promotions; track p.id) {
                <option [ngValue]="p.id">{{ p.filiereNom }} — {{ p.niveauNom }} ({{ p.anneeUniversitaire }})</option>
              }
            </select>
          </div>
        </div>

        @if (isLoading) {
          <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
        } @else if (inscriptions.length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-gray-400">
            <i class="fas fa-user-graduate text-5xl mb-4"></i>
            <p class="font-medium">Aucune inscription trouvée</p>
            <p class="text-sm mt-1">Sélectionnez une promotion pour voir les inscriptions</p>
          </div>
        } @else {
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Étudiant</th>
                  <th>Promotion</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                @for (row of inscriptions; track row.id) {
                  <tr>
                    <td><span class="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{{ row.etudiantMatricule }}</span></td>
                    <td class="cell-primary">{{ row.etudiantNom }}</td>
                    <td>{{ row.promotionNom }}</td>
                    <td class="cell-secondary">{{ formatDate(row.dateInscription) }}</td>
                    <td>
                      <span class="px-2.5 py-1 rounded-full text-xs font-medium" [class]="row.statut === 'INSCRIT' ? 'bg-green-50 text-success' : 'bg-gray-100 text-gray-500'">
                        {{ row.statut }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            <div class="table-pagination">
              <div class="pagination-info">
                <span>{{ pageIndex * pageSize + 1 }}</span>–<span>{{ min((pageIndex + 1) * pageSize, totalElements) }}</span> sur <span>{{ totalElements }}</span>
              </div>
              <div class="pagination-controls">
                <button class="pagination-btn" [disabled]="pageIndex === 0" (click)="goToPage(0)"><i class="fas fa-angles-left"></i></button>
                <button class="pagination-btn" [disabled]="pageIndex === 0" (click)="goToPage(pageIndex - 1)"><i class="fas fa-chevron-left"></i></button>
                @for (p of visiblePages; track p) {
                  <button class="pagination-btn" [class.active]="p === pageIndex" (click)="goToPage(p)">{{ p + 1 }}</button>
                }
                <button class="pagination-btn" [disabled]="pageIndex >= totalPages - 1" (click)="goToPage(pageIndex + 1)"><i class="fas fa-chevron-right"></i></button>
                <button class="pagination-btn" [disabled]="pageIndex >= totalPages - 1" (click)="goToPage(totalPages - 1)"><i class="fas fa-angles-right"></i></button>
              </div>
              <div class="pagination-size">
                <span>Lignes</span>
                <select [value]="pageSize" (change)="changePageSize(+$any($event.target).value)">
                  <option [value]="10">10</option>
                  <option [value]="25">25</option>
                  <option [value]="50">50</option>
                </select>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class InscriptionTabComponent implements OnInit {
  @Input() canCreate = false;

  promotions: PromotionResponse[] = [];
  inscriptions: InscriptionResponse[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = false;
  isSubmitting = false;

  inscriptionForm: FormGroup;
  promotionFilter = new FormControl<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private structureService: StructureService,
    private notification: NotificationService
  ) {
    this.inscriptionForm = this.fb.group({
      etudiantId: [null, [Validators.required, Validators.min(1)]],
      promotionId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.structureService.getPromotions().subscribe({
      next: (res) => this.promotions = res.data,
      error: () => {
        this.promotions = [
          { id: 1, anneeUniversitaire: '2024-2025', niveauId: 1, niveauNom: 'L1', filiereNom: 'Informatique', actif: true },
          { id: 2, anneeUniversitaire: '2024-2025', niveauId: 2, niveauNom: 'L2', filiereNom: 'Informatique', actif: true }
        ];
      }
    });
  }

  onSubmit(): void {
    if (this.inscriptionForm.invalid) return;
    this.isSubmitting = true;
    this.structureService.inscrireEtudiant(this.inscriptionForm.value).subscribe({
      next: () => {
        this.notification.success('Étudiant inscrit avec succès');
        this.isSubmitting = false;
        this.inscriptionForm.reset();
        if (this.promotionFilter.value) this.loadInscriptions();
      },
      error: () => { this.isSubmitting = false; }
    });
  }

  loadInscriptions(): void {
    const promoId = this.promotionFilter.value;
    if (!promoId) return;
    this.isLoading = true;
    this.structureService.getInscriptions(promoId, this.pageIndex, this.pageSize).subscribe({
      next: (res) => { this.inscriptions = res.data.content; this.totalElements = res.data.totalElements; this.isLoading = false; },
      error: () => { this.isLoading = false; this.loadMockData(); }
    });
  }

  get totalPages(): number { return Math.ceil(this.totalElements / this.pageSize); }
  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.pageIndex - 2);
    const end = Math.min(this.totalPages, start + 5);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }
  goToPage(page: number): void { this.pageIndex = page; this.loadInscriptions(); }
  changePageSize(size: number): void { this.pageSize = size; this.pageIndex = 0; this.loadInscriptions(); }
  min(a: number, b: number): number { return Math.min(a, b); }

  formatDate(date: string): string { return new Date(date).toLocaleDateString('fr-FR'); }

  private loadMockData(): void {
    this.inscriptions = [
      { id: 1, etudiantId: 1, etudiantNom: 'Diallo Amadou', etudiantMatricule: 'ETU-2024-001', promotionId: 1, promotionNom: 'L1 Informatique 2024-2025', dateInscription: '2024-10-01', statut: 'INSCRIT' },
      { id: 2, etudiantId: 2, etudiantNom: 'Traoré Fatoumata', etudiantMatricule: 'ETU-2024-002', promotionId: 1, promotionNom: 'L1 Informatique 2024-2025', dateInscription: '2024-10-01', statut: 'INSCRIT' },
      { id: 3, etudiantId: 3, etudiantNom: 'Coulibaly Ibrahim', etudiantMatricule: 'ETU-2024-003', promotionId: 1, promotionNom: 'L1 Informatique 2024-2025', dateInscription: '2024-10-02', statut: 'INSCRIT' },
    ];
    this.totalElements = 3;
  }
}

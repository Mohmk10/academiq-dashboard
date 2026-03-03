import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, of, debounceTime, switchMap, startWith, map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RapportService } from '../../core/services/rapport.service';
import { StructureService } from '../../core/services/structure.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role, UtilisateurSummary } from '../../core/models/user.model';
import { PromotionResponse, ModuleResponse } from '../../core/models/structure.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatAutocompleteModule
  ],
  template: `
    <div class="space-y-6 fade-in-up">
      <div>
        <h1 class="page-title">{{ role === 'ETUDIANT' ? 'Mes documents' : 'Rapports & Documents' }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ role === 'ETUDIANT' ? 'Téléchargez vos relevés et attestations' : 'Générez et téléchargez les documents académiques' }}</p>
      </div>

      @if (role === 'ETUDIANT') {
        <!-- Vue étudiant -->
        <div class="card">
          <h3 class="section-title"><i class="fas fa-file-alt mr-2"></i> Mes documents</h3>
          <div class="space-y-4">
            <mat-form-field appearance="outline" class="w-full sm:w-80" subscriptSizing="dynamic">
              <mat-label>Promotion</mat-label>
              <mat-select [formControl]="promotionControl">
                @for (p of promotions; track p.id) {
                  <mat-option [value]="p.id">{{ p.filiereNom }} — {{ p.niveauNom }} ({{ p.anneeUniversitaire }})</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <div class="flex flex-wrap gap-3">
              <button mat-raised-button color="primary" [disabled]="!promotionControl.value || loadingMap['releve']" (click)="telechargerReleve()">
                @if (loadingMap['releve']) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                <i class="fas fa-file-pdf mr-2 text-red-400"></i> Relevé de notes
              </button>
              <button mat-raised-button color="primary" [disabled]="!promotionControl.value || loadingMap['attestation']" (click)="telechargerAttestation()">
                @if (loadingMap['attestation']) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                <i class="fas fa-graduation-cap mr-2 text-red-400"></i> Attestation de réussite
              </button>
            </div>
          </div>
        </div>
      } @else {
        <!-- Vue admin/responsable/enseignant -->

        @if (role !== 'ENSEIGNANT') {
          <!-- Documents individuels -->
          <div class="card">
            <h3 class="section-title"><i class="fas fa-user mr-2"></i> Documents individuels</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Rechercher un étudiant</mat-label>
                <input matInput [formControl]="etudiantSearch" [matAutocomplete]="auto" placeholder="Nom ou matricule">
                <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayEtudiant" (optionSelected)="onEtudiantSelected($event.option.value)">
                  @for (e of filteredEtudiants$ | async; track e.id) {
                    <mat-option [value]="e">{{ e.prenom }} {{ e.nom }} ({{ e.matricule || e.email }})</mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Promotion</mat-label>
                <mat-select [formControl]="promotionControl">
                  @for (p of promotions; track p.id) {
                    <mat-option [value]="p.id">{{ p.filiereNom }} — {{ p.niveauNom }} ({{ p.anneeUniversitaire }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="flex flex-wrap gap-3">
              <button mat-raised-button color="primary" [disabled]="!selectedEtudiantId || !promotionControl.value || loadingMap['releve']" (click)="telechargerReleve()">
                @if (loadingMap['releve']) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                <i class="fas fa-file-pdf mr-2 text-red-400"></i> Relevé de notes
              </button>
              <button mat-raised-button color="primary" [disabled]="!selectedEtudiantId || !promotionControl.value || loadingMap['attestation']" (click)="telechargerAttestation()">
                @if (loadingMap['attestation']) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                <i class="fas fa-graduation-cap mr-2 text-red-400"></i> Attestation de réussite
              </button>
            </div>
          </div>

          <!-- Documents collectifs -->
          <div class="card">
            <h3 class="section-title"><i class="fas fa-users mr-2"></i> Documents collectifs</h3>
            <div class="mb-4">
              <mat-form-field appearance="outline" class="w-full sm:w-80" subscriptSizing="dynamic">
                <mat-label>Promotion</mat-label>
                <mat-select [formControl]="promotionCollectifControl">
                  @for (p of promotions; track p.id) {
                    <mat-option [value]="p.id">{{ p.filiereNom }} — {{ p.niveauNom }} ({{ p.anneeUniversitaire }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="flex flex-wrap gap-3">
              <button mat-raised-button color="primary" [disabled]="!promotionCollectifControl.value || loadingMap['pv']" (click)="telechargerPV()">
                @if (loadingMap['pv']) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                <i class="fas fa-file-pdf mr-2 text-red-400"></i> PV de délibération
              </button>
              <button mat-raised-button class="!bg-green-600 !text-white" [disabled]="!promotionCollectifControl.value || loadingMap['excel']" (click)="exporterExcelPromotion()">
                @if (loadingMap['excel']) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
                <i class="fas fa-file-excel mr-2"></i> Export résultats
              </button>
            </div>
          </div>
        }

        <!-- Export par module -->
        <div class="card">
          <h3 class="section-title"><i class="fas fa-book mr-2"></i> Export par module</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Promotion</mat-label>
              <mat-select [formControl]="promotionModuleControl">
                @for (p of promotions; track p.id) {
                  <mat-option [value]="p.id">{{ p.filiereNom }} — {{ p.niveauNom }} ({{ p.anneeUniversitaire }})</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Module</mat-label>
              <mat-select [formControl]="moduleControl">
                @for (m of modules; track m.id) {
                  <mat-option [value]="m.id">{{ m.code }} — {{ m.nom }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <button mat-raised-button class="!bg-green-600 !text-white" [disabled]="!moduleControl.value || !promotionModuleControl.value || loadingMap['excelModule']" (click)="exporterExcelModule()">
            @if (loadingMap['excelModule']) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
            <i class="fas fa-file-excel mr-2"></i> Export notes du module
          </button>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export default class ReportsComponent implements OnInit {
  role: Role | null;
  promotions: PromotionResponse[] = [];
  modules: ModuleResponse[] = [];
  loadingMap: Record<string, boolean> = {};
  selectedEtudiantId: number | null = null;

  promotionControl = new FormControl<number | null>(null);
  promotionCollectifControl = new FormControl<number | null>(null);
  promotionModuleControl = new FormControl<number | null>(null);
  moduleControl = new FormControl<number | null>(null);
  etudiantSearch = new FormControl('');
  filteredEtudiants$!: Observable<UtilisateurSummary[]>;

  constructor(
    private authService: AuthService,
    private rapportService: RapportService,
    private structureService: StructureService,
    private utilisateurService: UtilisateurService,
    private notification: NotificationService
  ) {
    this.role = this.authService.getCurrentUserRole();
  }

  ngOnInit(): void {
    this.structureService.getPromotions().subscribe({
      next: (res) => this.promotions = res.data,
      error: () => {
        this.promotions = [
          { id: 1, anneeUniversitaire: '2024-2025', niveauId: 1, niveauNom: 'L1', filiereNom: 'Informatique', actif: true },
          { id: 2, anneeUniversitaire: '2024-2025', niveauId: 2, niveauNom: 'L2', filiereNom: 'Informatique', actif: true },
        ];
      }
    });

    this.structureService.getModules().subscribe({
      next: (res) => this.modules = res.data,
      error: () => {
        this.modules = [
          { id: 1, nom: 'Algorithmique', code: 'INFO-101', coefficient: 3, ueId: 1 },
          { id: 2, nom: 'Programmation C', code: 'INFO-102', coefficient: 3, ueId: 1 },
        ];
      }
    });

    this.filteredEtudiants$ = this.etudiantSearch.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        const keyword = typeof value === 'string' ? value : '';
        if (keyword.length < 2) return of([]);
        return this.utilisateurService.rechercher(keyword, 0, 10).pipe(
          map(res => res.data.content.filter(u => u.role === 'ETUDIANT'))
        );
      })
    );
  }

  displayEtudiant(e: UtilisateurSummary): string {
    return e ? `${e.prenom} ${e.nom}` : '';
  }

  onEtudiantSelected(e: UtilisateurSummary): void {
    this.selectedEtudiantId = e.id;
  }

  telechargerReleve(): void {
    const etudiantId = this.selectedEtudiantId || 0;
    const promoId = this.promotionControl.value!;
    if (this.role === 'ETUDIANT') {
      this.authService.getProfile().subscribe(res => {
        this.telecharger(this.rapportService.telechargerReleve(res.data.id, promoId), `releve_notes.pdf`, 'releve');
      });
    } else {
      this.telecharger(this.rapportService.telechargerReleve(etudiantId, promoId), `releve_notes_${etudiantId}.pdf`, 'releve');
    }
  }

  telechargerAttestation(): void {
    const etudiantId = this.selectedEtudiantId || 0;
    const promoId = this.promotionControl.value!;
    if (this.role === 'ETUDIANT') {
      this.authService.getProfile().subscribe(res => {
        this.telecharger(this.rapportService.telechargerAttestation(res.data.id, promoId), `attestation.pdf`, 'attestation');
      });
    } else {
      this.telecharger(this.rapportService.telechargerAttestation(etudiantId, promoId), `attestation_${etudiantId}.pdf`, 'attestation');
    }
  }

  telechargerPV(): void {
    const promoId = this.promotionCollectifControl.value!;
    this.telecharger(this.rapportService.telechargerPV(promoId), `pv_deliberation_${promoId}.pdf`, 'pv');
  }

  exporterExcelPromotion(): void {
    const promoId = this.promotionCollectifControl.value!;
    this.telecharger(this.rapportService.exporterExcelPromotion(promoId), `resultats_promotion_${promoId}.xlsx`, 'excel');
  }

  exporterExcelModule(): void {
    const moduleId = this.moduleControl.value!;
    const promoId = this.promotionModuleControl.value!;
    this.telecharger(this.rapportService.exporterExcelModule(moduleId, promoId), `notes_module_${moduleId}.xlsx`, 'excelModule');
  }

  private telecharger(observable: Observable<Blob>, nomFichier: string, key: string): void {
    this.loadingMap[key] = true;
    observable.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loadingMap[key] = false;
        this.notification.success('Document téléchargé avec succès');
      },
      error: () => {
        this.loadingMap[key] = false;
        this.notification.error('Erreur lors du téléchargement');
      }
    });
  }
}

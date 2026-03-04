import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StructureService } from '../../../../core/services/structure.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ModuleResponse, AffectationResponse } from '../../../../core/models/structure.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-affectation-tab',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Formulaire d'affectation -->
      <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Affecter un enseignant à un module</h3>
        <form [formGroup]="affectationForm" (ngSubmit)="onSubmit()" class="flex flex-col sm:flex-row gap-4 items-end">
          <div class="field !mb-0 flex-1">
            <label class="field-label">ID Enseignant</label>
            <input class="field-input" type="number" formControlName="enseignantId" placeholder="Ex: 10">
          </div>
          <div class="field !mb-0 flex-1">
            <label class="field-label">Module</label>
            <select class="field-input" formControlName="moduleId">
              <option [ngValue]="null" disabled>Sélectionner</option>
              @for (m of modules; track m.id) {
                <option [ngValue]="m.id">{{ m.code }} — {{ m.nom }}</option>
              }
            </select>
          </div>
          <button class="btn-primary sm:self-center" type="submit" [disabled]="affectationForm.invalid || isSubmitting">
            <i class="fas fa-link mr-2"></i> Affecter
          </button>
        </form>
      </div>

      <!-- Liste des affectations -->
      @if (isLoading) {
        <div class="flex items-center justify-center h-48"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (affectations.length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-gray-400">
          <i class="fas fa-chalkboard-user text-5xl mb-4"></i>
          <p class="font-medium">Aucune affectation enregistrée</p>
        </div>
      } @else {
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Enseignant</th>
                <th>Module</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (row of affectations; track row.id) {
                <tr>
                  <td class="cell-primary">{{ row.enseignantNom }}</td>
                  <td>{{ row.moduleNom }}</td>
                  <td class="cell-actions">
                    <button class="action-menu-btn" style="color: #DC2626;" (click)="deleteAffectation(row)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AffectationTabComponent implements OnInit {
  modules: ModuleResponse[] = [];
  affectations: AffectationResponse[] = [];
  isLoading = true;
  isSubmitting = false;

  affectationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private structureService: StructureService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {
    this.affectationForm = this.fb.group({
      enseignantId: [null, [Validators.required, Validators.min(1)]],
      moduleId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.structureService.getModules().subscribe({
      next: (res) => this.modules = res.data,
      error: () => {
        this.modules = [
          { id: 1, nom: 'Algorithmique', code: 'INFO-101', coefficient: 3, ueId: 1 },
          { id: 2, nom: 'Programmation C', code: 'INFO-102', coefficient: 3, ueId: 1 }
        ];
      }
    });
    this.loadAffectations();
  }

  loadAffectations(): void {
    this.isLoading = true;
    this.structureService.getAffectations().subscribe({
      next: (res) => { this.affectations = res.data; this.isLoading = false; },
      error: () => { this.isLoading = false; this.loadMockData(); }
    });
  }

  onSubmit(): void {
    if (this.affectationForm.invalid) return;
    this.isSubmitting = true;
    this.structureService.affecterEnseignant(this.affectationForm.value).subscribe({
      next: () => {
        this.notification.success('Enseignant affecté au module');
        this.isSubmitting = false;
        this.affectationForm.reset();
        this.loadAffectations();
      },
      error: () => { this.isSubmitting = false; }
    });
  }

  deleteAffectation(aff: AffectationResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw', data: { title: 'Retirer l\'affectation', message: `Retirer ${aff.enseignantNom} du module ${aff.moduleNom} ?`, confirmText: 'Retirer' }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.structureService.deleteAffectation(aff.id).subscribe({
        next: () => { this.notification.success('Affectation retirée'); this.loadAffectations(); },
        error: () => {}
      });
    });
  }

  private loadMockData(): void {
    this.affectations = [
      { id: 1, enseignantId: 10, enseignantNom: 'Keita Ousmane', moduleId: 1, moduleNom: 'Algorithmique' },
      { id: 2, enseignantId: 11, enseignantNom: 'Cissé Aissata', moduleId: 2, moduleNom: 'Programmation C' },
      { id: 3, enseignantId: 12, enseignantNom: 'Touré Mohamed', moduleId: 3, moduleNom: 'Bases de données' },
    ];
  }
}

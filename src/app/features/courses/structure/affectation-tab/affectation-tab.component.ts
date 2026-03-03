import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    CommonModule, ReactiveFormsModule, MatTableModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Formulaire d'affectation -->
      <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Affecter un enseignant à un module</h3>
        <form [formGroup]="affectationForm" (ngSubmit)="onSubmit()" class="flex flex-col sm:flex-row gap-4 items-end">
          <mat-form-field appearance="outline" class="flex-1" subscriptSizing="dynamic">
            <mat-label>ID Enseignant</mat-label>
            <input matInput type="number" formControlName="enseignantId" placeholder="Ex: 10">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-1" subscriptSizing="dynamic">
            <mat-label>Module</mat-label>
            <mat-select formControlName="moduleId">
              @for (m of modules; track m.id) {
                <mat-option [value]="m.id">{{ m.code }} — {{ m.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="affectationForm.invalid || isSubmitting" class="sm:self-center">
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
        <div class="card !p-0 overflow-hidden">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="affectations" class="w-full">
              <ng-container matColumnDef="enseignant">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Enseignant</th>
                <td mat-cell *matCellDef="let row" class="!font-medium">{{ row.enseignantNom }}</td>
              </ng-container>
              <ng-container matColumnDef="module">
                <th mat-header-cell *matHeaderCellDef class="!text-gray-500 !text-xs !font-semibold uppercase">Module</th>
                <td mat-cell *matCellDef="let row">{{ row.moduleNom }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="!w-16"></th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button color="warn" (click)="deleteAffectation(row)">
                    <mat-icon class="!text-lg">delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns" class="hover:bg-gray-50 transition-colors"></tr>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class AffectationTabComponent implements OnInit {
  modules: ModuleResponse[] = [];
  affectations: AffectationResponse[] = [];
  displayedColumns = ['enseignant', 'module', 'actions'];
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

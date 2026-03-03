import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlerteService } from '../../../../core/services/alerte.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RegleAlerteResponse, TypeAlerte } from '../../../../core/models/alerte.model';

@Component({
  selector: 'app-regles-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatSlideToggleModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">Gérer les règles d'alerte</h2>
        <p class="dialog-subtitle">Configurez les seuils de déclenchement</p>
      </div>

      <div class="dialog-content !max-h-[70vh]">
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">{{ editingId ? 'Modifier la règle' : 'Nouvelle règle' }}</h4>
          <form [formGroup]="form" (ngSubmit)="onSubmitRule()" class="form-grid-3 items-end">
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                @for (t of types; track t.value) {
                  <mat-option [value]="t.value">{{ t.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Seuil</mat-label>
              <input matInput type="number" formControlName="seuil" placeholder="Ex: 10">
            </mat-form-field>
            <div class="flex gap-2">
              <button class="btn-primary flex-1" type="submit" [disabled]="form.invalid">
                {{ editingId ? 'Modifier' : 'Ajouter' }}
              </button>
              @if (editingId) {
                <button class="btn-secondary" type="button" (click)="cancelEdit()">Annuler</button>
              }
            </div>
          </form>
          <mat-form-field appearance="outline" class="w-full mt-3">
            <mat-label>Description</mat-label>
            <input matInput [formControl]="$any(form.get('description'))" placeholder="Ex: Alerte si moyenne < 10">
          </mat-form-field>
        </div>

        @if (isLoading) {
          <div class="flex justify-center py-8"><mat-spinner diameter="32"></mat-spinner></div>
        } @else if (regles.length === 0) {
          <p class="text-center text-gray-400 py-8">Aucune règle configurée</p>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="regles" class="w-full">
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let row">{{ getTypeLabel(row.type) }}</td>
              </ng-container>
              <ng-container matColumnDef="seuil">
                <th mat-header-cell *matHeaderCellDef>Seuil</th>
                <td mat-cell *matCellDef="let row" class="!font-medium">{{ row.seuil }}</td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let row" class="text-sm text-gray-500">{{ row.description || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="actif">
                <th mat-header-cell *matHeaderCellDef>Actif</th>
                <td mat-cell *matCellDef="let row">
                  <mat-slide-toggle [checked]="row.actif" (change)="toggleRegle(row)" color="primary"></mat-slide-toggle>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="!w-20"></th>
                <td mat-cell *matCellDef="let row">
                  <div class="flex gap-1">
                    <button mat-icon-button (click)="startEdit(row)"><mat-icon class="!text-lg text-gray-400">edit</mat-icon></button>
                    <button mat-icon-button (click)="deleteRegle(row)"><mat-icon class="!text-lg text-danger">delete</mat-icon></button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns" class="hover:bg-gray-50"></tr>
            </table>
          </div>
        }
      </div>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="dialogRef.close()">Fermer</button>
      </div>
    </div>
  `
})
export class ReglesDialogComponent implements OnInit {
  regles: RegleAlerteResponse[] = [];
  columns = ['type', 'seuil', 'description', 'actif', 'actions'];
  isLoading = true;
  editingId: number | null = null;
  form: FormGroup;

  types: { value: TypeAlerte; label: string }[] = [
    { value: 'NOTE_BASSE', label: 'Note basse' },
    { value: 'MOYENNE_FAIBLE', label: 'Moyenne faible' },
    { value: 'ABSENCE_NOTE', label: 'Absence de note' },
    { value: 'RISQUE_ECHEC', label: 'Risque d\'échec' },
    { value: 'CUSTOM', label: 'Personnalisée' }
  ];

  constructor(
    private fb: FormBuilder,
    private alerteService: AlerteService,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<ReglesDialogComponent>
  ) {
    this.form = this.fb.group({
      type: ['MOYENNE_FAIBLE', Validators.required],
      seuil: [10, [Validators.required, Validators.min(0)]],
      actif: [true],
      description: ['']
    });
  }

  ngOnInit(): void { this.loadRegles(); }

  loadRegles(): void {
    this.isLoading = true;
    this.alerteService.getRegles().subscribe({
      next: (res) => { this.regles = res.data; this.isLoading = false; },
      error: () => {
        this.isLoading = false;
        this.regles = [
          { id: 1, type: 'MOYENNE_FAIBLE', seuil: 10, actif: true, description: 'Alerte si moyenne < 10', createdAt: '2024-10-01' },
          { id: 2, type: 'NOTE_BASSE', seuil: 5, actif: true, description: 'Alerte si note < 5', createdAt: '2024-10-01' },
          { id: 3, type: 'RISQUE_ECHEC', seuil: 8, actif: false, description: 'Risque si moyenne < 8', createdAt: '2024-10-01' },
        ];
      }
    });
  }

  getTypeLabel(type: string): string {
    return this.types.find(t => t.value === type)?.label || type;
  }

  onSubmitRule(): void {
    if (this.form.invalid) return;
    const value = this.form.value;
    if (this.editingId) {
      this.alerteService.updateRegle(this.editingId, value).subscribe({
        next: () => { this.notification.success('Règle modifiée'); this.cancelEdit(); this.loadRegles(); },
        error: () => {}
      });
    } else {
      this.alerteService.createRegle(value).subscribe({
        next: () => { this.notification.success('Règle créée'); this.form.reset({ type: 'MOYENNE_FAIBLE', seuil: 10, actif: true, description: '' }); this.loadRegles(); },
        error: () => {}
      });
    }
  }

  startEdit(regle: RegleAlerteResponse): void {
    this.editingId = regle.id;
    this.form.patchValue({ type: regle.type, seuil: regle.seuil, actif: regle.actif, description: regle.description || '' });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.reset({ type: 'MOYENNE_FAIBLE', seuil: 10, actif: true, description: '' });
  }

  toggleRegle(regle: RegleAlerteResponse): void {
    this.alerteService.toggleRegle(regle.id).subscribe({
      next: () => { regle.actif = !regle.actif; },
      error: () => {}
    });
  }

  deleteRegle(regle: RegleAlerteResponse): void {
    this.alerteService.deleteRegle(regle.id).subscribe({
      next: () => { this.notification.success('Règle supprimée'); this.loadRegles(); },
      error: () => {}
    });
  }
}

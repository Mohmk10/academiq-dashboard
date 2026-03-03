import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { StructureService } from '../../../../core/services/structure.service';
import { UeResponse, ModuleResponse } from '../../../../core/models/structure.model';

@Component({
  selector: 'app-module-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">Renseignez les informations du module</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" placeholder="Ex: Algorithmique">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" placeholder="Ex: INFO-101">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Unité d'enseignement (UE)</mat-label>
          <mat-select formControlName="ueId">
            @for (ue of ues; track ue.id) {
              <mat-option [value]="ue.id">{{ ue.code }} — {{ ue.nom }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Coefficient</mat-label>
            <input matInput type="number" formControlName="coefficient" placeholder="Ex: 3">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Volume horaire</mat-label>
            <input matInput type="number" formControlName="volumeHoraire" placeholder="Ex: 48">
          </mat-form-field>
        </div>
      </form>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="onCancel()">Annuler</button>
        <button class="btn-primary" [disabled]="form.invalid" (click)="onSubmit()">
          {{ data.mode === 'create' ? 'Créer' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  `
})
export class ModuleDialogComponent implements OnInit {
  form: FormGroup;
  ues: UeResponse[] = [];

  get dialogTitle(): string {
    return this.data.mode === 'create' ? 'Nouveau module' : 'Modifier le module';
  }

  constructor(
    private fb: FormBuilder,
    private structureService: StructureService,
    public dialogRef: MatDialogRef<ModuleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; module?: ModuleResponse; ues?: UeResponse[] }
  ) {
    this.form = this.fb.group({
      nom: [data.module?.nom || '', Validators.required],
      code: [data.module?.code || '', Validators.required],
      ueId: [data.module?.ueId || null, Validators.required],
      coefficient: [data.module?.coefficient || 1, [Validators.required, Validators.min(1)]],
      volumeHoraire: [data.module?.volumeHoraire || null]
    });
  }

  ngOnInit(): void {
    if (this.data.ues) {
      this.ues = this.data.ues;
    } else {
      this.structureService.getUes().subscribe(res => this.ues = res.data);
    }
  }

  onCancel(): void { this.dialogRef.close(); }
  onSubmit(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
}

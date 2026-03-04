import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StructureService } from '../../../../core/services/structure.service';
import { UeResponse, ModuleResponse } from '../../../../core/models/structure.model';

@Component({
  selector: 'app-module-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ dialogTitle }}</h2>
        <p class="dialog-subtitle">Renseignez les informations du module</p>
      </div>

      <form [formGroup]="form" class="dialog-content">
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Nom <span class="required">*</span></label>
            <input class="field-input" formControlName="nom" placeholder="Ex: Algorithmique">
          </div>
          <div class="field">
            <label class="field-label">Code <span class="required">*</span></label>
            <input class="field-input" formControlName="code" placeholder="Ex: INFO-101">
          </div>
        </div>
        <div class="field">
          <label class="field-label">Unité d'enseignement (UE) <span class="required">*</span></label>
          <select class="field-input" formControlName="ueId">
            <option [ngValue]="null" disabled>Sélectionner...</option>
            @for (ue of ues; track ue.id) {
              <option [ngValue]="ue.id">{{ ue.code }} — {{ ue.nom }}</option>
            }
          </select>
        </div>
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Coefficient <span class="required">*</span></label>
            <input class="field-input" type="number" formControlName="coefficient" placeholder="Ex: 3">
          </div>
          <div class="field">
            <label class="field-label">Volume horaire</label>
            <input class="field-input" type="number" formControlName="volumeHoraire" placeholder="Ex: 48">
          </div>
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

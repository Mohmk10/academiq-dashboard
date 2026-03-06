import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Role } from '../../../core/models/user.model';

export interface ChangeRoleDialogData {
  userName: string;
  currentRole: Role;
}

@Component({
  selector: 'app-change-role-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">Changer le role</h2>
        <p class="dialog-subtitle">Modifier le role de <strong>{{ data.userName }}</strong></p>
      </div>

      <div class="dialog-content">
        <div class="field">
          <label class="field-label">Role actuel</label>
          <div class="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 font-medium">
            {{ getRoleLabel(data.currentRole) }}
          </div>
        </div>

        <div class="field">
          <label class="field-label">Nouveau role <span class="required">*</span></label>
          <select class="field-input" [(ngModel)]="selectedRole">
            @for (r of availableRoles; track r.value) {
              <option [value]="r.value" [disabled]="r.value === data.currentRole">{{ r.label }}</option>
            }
          </select>
        </div>

        <div class="field">
          <label class="field-label">Motif du changement</label>
          <textarea class="field-input" [(ngModel)]="motif" rows="3" placeholder="Indiquez la raison du changement de role..."></textarea>
        </div>

        @if (selectedRole !== data.currentRole) {
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div class="flex gap-2">
              <i class="fas fa-triangle-exclamation text-amber-500 mt-0.5"></i>
              <div class="text-sm text-amber-700">
                <p class="font-medium">Attention</p>
                <p class="mt-0.5">Le changement de role modifiera les permissions d'acces de cet utilisateur.</p>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="dialog-actions">
        <button class="btn-secondary" (click)="onCancel()">Annuler</button>
        <button class="btn-primary" (click)="onConfirm()" [disabled]="selectedRole === data.currentRole">Confirmer</button>
      </div>
    </div>
  `
})
export class ChangeRoleDialogComponent {
  selectedRole: Role;
  motif = '';

  availableRoles: { value: Role; label: string }[] = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'RESPONSABLE_PEDAGOGIQUE', label: 'Responsable pedagogique' },
    { value: 'ENSEIGNANT', label: 'Enseignant' },
    { value: 'ETUDIANT', label: 'Etudiant' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ChangeRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeRoleDialogData
  ) {
    this.selectedRole = data.currentRole;
  }

  getRoleLabel(role: Role): string {
    const labels: Record<string, string> = {
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'RESPONSABLE_PEDAGOGIQUE': 'Responsable pedagogique',
      'ENSEIGNANT': 'Enseignant',
      'ETUDIANT': 'Etudiant'
    };
    return labels[role] ?? role;
  }

  onCancel(): void { this.dialogRef.close(); }
  onConfirm(): void { this.dialogRef.close({ role: this.selectedRole, motif: this.motif }); }
}

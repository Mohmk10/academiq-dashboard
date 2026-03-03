import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { ImportResult } from '../../../core/models/note.model';

@Component({
  selector: 'app-import-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">Importer des étudiants</h2>
        <p class="dialog-subtitle">Importez un fichier CSV ou XLSX</p>
      </div>

      <div class="dialog-content">
        @if (!result && !isUploading) {
          <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200"
               (click)="fileInput.click()"
               (dragover)="$event.preventDefault(); dragOver = true"
               (dragleave)="dragOver = false"
               (drop)="onDrop($event)"
               [class.border-primary]="dragOver"
               [class.bg-blue-50]="dragOver">
            <i class="fas fa-cloud-arrow-up text-4xl text-gray-400 mb-3"></i>
            <p class="text-gray-600 font-medium">Glissez votre fichier ici</p>
            <p class="text-sm text-gray-400 mt-1">ou cliquez pour parcourir</p>
            @if (selectedFile) {
              <p class="mt-3 text-sm text-primary font-medium"><i class="fas fa-file-csv mr-1"></i> {{ selectedFile.name }}</p>
            }
          </div>
          <input #fileInput type="file" accept=".csv,.xlsx" class="hidden" (change)="onFileSelected($event)">
        }
        @if (isUploading) {
          <div class="text-center py-4">
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            <p class="text-sm text-gray-500 mt-3">Importation en cours...</p>
          </div>
        }
        @if (result) {
          <div class="space-y-3">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-green-50">
              <i class="fas fa-check-circle text-success"></i>
              <span class="text-sm">{{ result.totalSucces }} étudiants importés avec succès</span>
            </div>
            @if (result.totalEchecs > 0) {
              <div class="flex items-center gap-3 p-3 rounded-lg bg-red-50">
                <i class="fas fa-times-circle text-danger"></i>
                <span class="text-sm">{{ result.totalEchecs }} erreurs</span>
              </div>
              @for (err of result.erreurs; track err) {
                <p class="text-xs text-red-600 pl-4">{{ err }}</p>
              }
            }
          </div>
        }
      </div>

      <div class="dialog-actions">
        @if (result) {
          <button class="btn-primary" (click)="dialogRef.close(true)">Fermer</button>
        } @else {
          <button class="btn-secondary" (click)="dialogRef.close()">Annuler</button>
          <button class="btn-primary" (click)="upload()" [disabled]="!selectedFile || isUploading">Importer</button>
        }
      </div>
    </div>
  `
})
export class ImportDialogComponent {
  selectedFile: File | null = null;
  isUploading = false;
  dragOver = false;
  result: ImportResult | null = null;

  constructor(
    public dialogRef: MatDialogRef<ImportDialogComponent>,
    private utilisateurService: UtilisateurService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files.length) this.selectedFile = event.dataTransfer.files[0];
  }

  upload(): void {
    if (!this.selectedFile) return;
    this.isUploading = true;
    this.utilisateurService.importerEtudiants(this.selectedFile).subscribe({
      next: (res) => { this.result = res.data; this.isUploading = false; },
      error: () => { this.isUploading = false; }
    });
  }
}

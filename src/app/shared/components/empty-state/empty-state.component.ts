import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i [class]="'fas ' + icon + ' text-5xl mb-4'"></i>
      <p class="font-medium text-gray-600">{{ title }}</p>
      @if (message) {
        <p class="text-sm mt-1">{{ message }}</p>
      }
      @if (actionLabel && actionLink) {
        <a mat-raised-button [routerLink]="actionLink" color="primary" class="mt-4">{{ actionLabel }}</a>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'fa-inbox';
  @Input() title = 'Aucun élément';
  @Input() message = '';
  @Input() actionLabel = '';
  @Input() actionLink = '';
}

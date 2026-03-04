import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i [class]="'fas ' + icon + ' text-5xl mb-4'"></i>
      <p class="font-medium text-gray-600">{{ title }}</p>
      @if (message) {
        <p class="text-sm mt-1">{{ message }}</p>
      }
      @if (actionLabel && actionLink) {
        <a [routerLink]="actionLink" class="btn-primary mt-4">{{ actionLabel }}</a>
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

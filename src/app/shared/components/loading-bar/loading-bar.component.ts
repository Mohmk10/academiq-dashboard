import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpLoadingService } from '../../../core/services/http-loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    @if (loadingService.isLoading$ | async) {
      <mat-progress-bar mode="indeterminate" class="!absolute top-0 left-0 right-0 z-50"></mat-progress-bar>
    }
  `,
  styles: [`:host { display: block; position: relative; }`]
})
export class LoadingBarComponent {
  constructor(public loadingService: HttpLoadingService) {}
}

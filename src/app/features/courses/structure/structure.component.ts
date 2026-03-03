import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { FiliereTabComponent } from './filiere-tab/filiere-tab.component';
import { PromotionTabComponent } from './promotion-tab/promotion-tab.component';
import { ModuleTabComponent } from './module-tab/module-tab.component';
import { InscriptionTabComponent } from './inscription-tab/inscription-tab.component';
import { AffectationTabComponent } from './affectation-tab/affectation-tab.component';

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [CommonModule, MatTabsModule, FiliereTabComponent, PromotionTabComponent, ModuleTabComponent, InscriptionTabComponent, AffectationTabComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="page-title">Structure académique</h1>
        <p class="text-sm text-gray-500 mt-1">Gérez les filières, promotions, modules et affectations</p>
      </div>

      <mat-tab-group animationDuration="200ms" class="structure-tabs">
        <mat-tab>
          <ng-template mat-tab-label>
            <i class="fas fa-sitemap mr-2"></i> Filières
          </ng-template>
          <div class="pt-6">
            <app-filiere-tab></app-filiere-tab>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <i class="fas fa-calendar-alt mr-2"></i> Promotions
          </ng-template>
          <div class="pt-6">
            <app-promotion-tab></app-promotion-tab>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <i class="fas fa-book mr-2"></i> Modules
          </ng-template>
          <div class="pt-6">
            <app-module-tab></app-module-tab>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <i class="fas fa-user-graduate mr-2"></i> Inscriptions
          </ng-template>
          <div class="pt-6">
            <app-inscription-tab></app-inscription-tab>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <i class="fas fa-chalkboard-user mr-2"></i> Affectations
          </ng-template>
          <div class="pt-6">
            <app-affectation-tab></app-affectation-tab>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .structure-tabs .mat-mdc-tab-labels { gap: 4px; }
  `]
})
export default class StructureComponent {}

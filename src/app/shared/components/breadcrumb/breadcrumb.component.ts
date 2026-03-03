import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (breadcrumbs.length > 1) {
      <nav class="flex items-center gap-1 text-sm text-gray-400 mb-4">
        @for (crumb of breadcrumbs; track crumb.url; let last = $last) {
          @if (last) {
            <span class="text-gray-700 font-medium">{{ crumb.label }}</span>
          } @else {
            <a [routerLink]="crumb.url" class="hover:text-primary transition-colors">{{ crumb.label }}</a>
            <i class="fas fa-chevron-right text-[10px]"></i>
          }
        }
      </nav>
    }
  `
})
export class BreadcrumbComponent implements OnDestroy {
  breadcrumbs: Breadcrumb[] = [];
  private destroy$ = new Subject<void>();

  private routeLabels: Record<string, string> = {
    'dashboard': 'Tableau de bord',
    'etudiants': 'Étudiants',
    'enseignants': 'Enseignants',
    'structure': 'Structure académique',
    'notes': 'Notes',
    'saisie': 'Saisie',
    'alertes': 'Alertes',
    'rapports': 'Rapports',
    'profil': 'Mon profil',
    'parametres': 'Paramètres'
  };

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.buildBreadcrumbs());
    this.buildBreadcrumbs();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private buildBreadcrumbs(): void {
    const url = this.router.url.split('?')[0];
    const segments = url.split('/').filter(Boolean);
    this.breadcrumbs = [{ label: 'Accueil', url: '/dashboard' }];

    let currentUrl = '';
    for (const segment of segments) {
      currentUrl += `/${segment}`;
      const label = this.routeLabels[segment] || (isNaN(+segment) ? segment : `#${segment}`);
      this.breadcrumbs.push({ label, url: currentUrl });
    }
  }
}

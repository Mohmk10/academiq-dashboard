import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/user.model';
import { LoadingBarComponent } from '../../shared/components/loading-bar/loading-bar.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    LoadingBarComponent,
    BreadcrumbComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  sidebarCollapsed = false;
  mobileView = false;
  userName = '';
  userRole: Role | null = null;
  userInitials = '';
  menuItems: MenuItem[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();

    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.userName = `${user.prenom} ${user.nom}`;
        this.userInitials = `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
      }
    });

    this.userRole = this.authService.getCurrentUserRole();
    this.menuItems = this.buildMenu();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  toggleSidebar(): void {
    if (this.mobileView) {
      this.sidebarOpen = !this.sidebarOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeMobileSidebar(): void {
    if (this.mobileView) {
      this.sidebarOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'ENSEIGNANT': 'Enseignant',
      'ETUDIANT': 'Étudiant',
      'RESPONSABLE_PEDAGOGIQUE': 'Responsable pédagogique'
    };
    return labels[this.userRole ?? ''] ?? this.userRole ?? '';
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;
    this.mobileView = width < 1024;
    if (this.mobileView) {
      this.sidebarOpen = false;
      this.sidebarCollapsed = false;
    } else {
      this.sidebarOpen = true;
    }
  }

  private buildMenu(): MenuItem[] {
    const items: MenuItem[] = [
      { label: 'Tableau de bord', icon: 'fa-solid fa-house', route: '/dashboard' }
    ];

    if (this.authService.hasRole('ADMIN')) {
      items.push(
        { label: 'Étudiants', icon: 'fa-solid fa-user-graduate', route: '/etudiants' },
        { label: 'Enseignants', icon: 'fa-solid fa-chalkboard-user', route: '/enseignants' },
        { label: 'Structure académique', icon: 'fa-solid fa-building-columns', route: '/structure' },
        { label: 'Notes & Évaluations', icon: 'fa-solid fa-file-pen', route: '/notes' },
        { label: 'Alertes pédagogiques', icon: 'fa-solid fa-triangle-exclamation', route: '/alertes' },
        { label: 'Rapports', icon: 'fa-solid fa-chart-column', route: '/rapports' },
        { label: 'Paramètres', icon: 'fa-solid fa-gear', route: '/parametres' }
      );
    } else if (this.authService.hasRole('RESPONSABLE_PEDAGOGIQUE')) {
      items.push(
        { label: 'Étudiants', icon: 'fa-solid fa-user-graduate', route: '/etudiants' },
        { label: 'Notes', icon: 'fa-solid fa-file-pen', route: '/notes' },
        { label: 'Alertes', icon: 'fa-solid fa-triangle-exclamation', route: '/alertes' },
        { label: 'Rapports', icon: 'fa-solid fa-chart-column', route: '/rapports' }
      );
    } else if (this.authService.hasRole('ENSEIGNANT')) {
      items.push(
        { label: 'Mes notes', icon: 'fa-solid fa-file-pen', route: '/notes' },
        { label: 'Alertes', icon: 'fa-solid fa-triangle-exclamation', route: '/alertes' },
        { label: 'Rapports', icon: 'fa-solid fa-chart-column', route: '/rapports' }
      );
    } else if (this.authService.hasRole('ETUDIANT')) {
      items.push(
        { label: 'Mes notes', icon: 'fa-solid fa-file-pen', route: '/notes' },
        { label: 'Mes relevés', icon: 'fa-solid fa-chart-column', route: '/rapports' }
      );
    }

    items.push({ label: 'Mon profil', icon: 'fa-solid fa-user', route: '/profil' });

    return items;
  }
}

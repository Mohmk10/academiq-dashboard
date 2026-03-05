import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
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

interface MenuSection {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatMenuModule,
    MatTooltipModule,
    LoadingBarComponent,
    BreadcrumbComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  mobileView = false;
  userName = '';
  userRole: Role | null = null;
  userInitials = '';
  menuSections: MenuSection[] = [];

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
        this.userRole = this.authService.getCurrentUserRole();
        this.menuSections = this.buildMenu();
      }
    });

    this.userRole = this.authService.getCurrentUserRole();
    this.menuSections = this.buildMenu();
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
    this.sidebarOpen = !this.sidebarOpen;
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
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'ENSEIGNANT': 'Enseignant',
      'ETUDIANT': 'Etudiant',
      'RESPONSABLE_PEDAGOGIQUE': 'Responsable pedagogique'
    };
    return labels[this.userRole ?? ''] ?? this.userRole ?? '';
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;
    this.mobileView = width < 1024;
    if (this.mobileView) {
      this.sidebarOpen = false;
    }
  }

  private buildMenu(): MenuSection[] {
    const sections: MenuSection[] = [
      {
        title: 'PRINCIPAL',
        items: [{ label: 'Tableau de bord', icon: 'fa-solid fa-house', route: '/dashboard' }]
      }
    ];

    if (this.authService.isExactRole('SUPER_ADMIN')) {
      sections.push(
        {
          title: 'ADMINISTRATION',
          items: [
            { label: 'Gestion des utilisateurs', icon: 'fa-solid fa-users-gear', route: '/gestion-utilisateurs' },
            { label: 'Logs d\'audit', icon: 'fa-solid fa-clipboard-list', route: '/audit-logs' },
            { label: 'Parametres', icon: 'fa-solid fa-gear', route: '/parametres' },
          ]
        },
        {
          title: 'GESTION',
          items: [
            { label: 'Etudiants', icon: 'fa-solid fa-user-graduate', route: '/etudiants' },
            { label: 'Enseignants', icon: 'fa-solid fa-chalkboard-user', route: '/enseignants' },
            { label: 'Structure', icon: 'fa-solid fa-building-columns', route: '/structure' },
            { label: 'Notes', icon: 'fa-solid fa-file-pen', route: '/notes' },
          ]
        },
        {
          title: 'SUIVI',
          items: [
            { label: 'Alertes', icon: 'fa-solid fa-triangle-exclamation', route: '/alertes' },
            { label: 'Rapports', icon: 'fa-solid fa-chart-column', route: '/rapports' },
          ]
        }
      );
    } else if (this.authService.isExactRole('ADMIN')) {
      sections.push(
        {
          title: 'GESTION',
          items: [
            { label: 'Etudiants', icon: 'fa-solid fa-user-graduate', route: '/etudiants' },
            { label: 'Enseignants', icon: 'fa-solid fa-chalkboard-user', route: '/enseignants' },
            { label: 'Structure', icon: 'fa-solid fa-building-columns', route: '/structure' },
            { label: 'Notes', icon: 'fa-solid fa-file-pen', route: '/notes' },
          ]
        },
        {
          title: 'SUIVI',
          items: [
            { label: 'Alertes', icon: 'fa-solid fa-triangle-exclamation', route: '/alertes' },
            { label: 'Rapports', icon: 'fa-solid fa-chart-column', route: '/rapports' },
          ]
        },
        {
          title: 'SYSTEME',
          items: [
            { label: 'Parametres', icon: 'fa-solid fa-gear', route: '/parametres' },
          ]
        }
      );
    } else if (this.authService.isExactRole('RESPONSABLE_PEDAGOGIQUE')) {
      sections.push(
        {
          title: 'CONSULTATION',
          items: [
            { label: 'Etudiants', icon: 'fa-solid fa-user-graduate', route: '/etudiants' },
            { label: 'Enseignants', icon: 'fa-solid fa-chalkboard-user', route: '/enseignants' },
            { label: 'Structure', icon: 'fa-solid fa-building-columns', route: '/structure' },
            { label: 'Notes', icon: 'fa-solid fa-file-pen', route: '/notes' },
          ]
        },
        {
          title: 'SUIVI',
          items: [
            { label: 'Alertes', icon: 'fa-solid fa-triangle-exclamation', route: '/alertes' },
            { label: 'Rapports', icon: 'fa-solid fa-chart-column', route: '/rapports' },
          ]
        }
      );
    } else if (this.authService.isExactRole('ENSEIGNANT')) {
      sections.push(
        {
          title: 'PEDAGOGIE',
          items: [
            { label: 'Structure', icon: 'fa-solid fa-building-columns', route: '/structure' },
            { label: 'Mes notes', icon: 'fa-solid fa-file-pen', route: '/notes' },
          ]
        },
        {
          title: 'SUIVI',
          items: [
            { label: 'Alertes', icon: 'fa-solid fa-triangle-exclamation', route: '/alertes' },
            { label: 'Rapports', icon: 'fa-solid fa-chart-column', route: '/rapports' },
          ]
        }
      );
    } else if (this.authService.isExactRole('ETUDIANT')) {
      sections.push(
        {
          title: 'SCOLARITE',
          items: [
            { label: 'Mes notes', icon: 'fa-solid fa-file-pen', route: '/notes' },
          ]
        },
        {
          title: 'SUIVI',
          items: [
            { label: 'Mes releves', icon: 'fa-solid fa-chart-column', route: '/rapports' },
          ]
        }
      );
    }

    return sections;
  }
}

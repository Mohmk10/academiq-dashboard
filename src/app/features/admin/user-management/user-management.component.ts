import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Role, UtilisateurSummary } from '../../../core/models/user.model';
import { ChangeRoleDialogComponent } from './change-role-dialog.component';
import { CreateUserDialogComponent } from './create-user-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatMenuModule, MatDialogModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export default class UserManagementComponent implements OnInit, OnDestroy {
  allUsers: UtilisateurSummary[] = [];
  filteredUsers: UtilisateurSummary[] = [];
  pagedUsers: UtilisateurSummary[] = [];

  searchControl = new FormControl('');
  roleFilter = new FormControl('');
  statutFilter = new FormControl('');

  pageSize = 10;
  pageIndex = 0;

  sortColumn = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';

  stats = { total: 0, superAdmins: 0, admins: 0, enseignants: 0, etudiants: 0, actifs: 0 };

  private destroy$ = new Subject<void>();
  private currentUserEmail: string | null = null;

  constructor(
    private utilisateurService: UtilisateurService,
    private authService: AuthService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {
    const user = this.authService.currentUser$.subscribe(u => {
      this.currentUserEmail = u?.email ?? null;
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => { this.pageIndex = 0; this.applyFilters(); });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.utilisateurService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.allUsers = res.data?.content ?? [];
        this.computeStats();
        this.applyFilters();
      },
      error: () => {
        this.allUsers = [];
        this.computeStats();
        this.applyFilters();
      }
    });
  }

  computeStats(): void {
    this.stats = {
      total: this.allUsers.length,
      superAdmins: this.allUsers.filter(u => u.role === 'SUPER_ADMIN').length,
      admins: this.allUsers.filter(u => u.role === 'ADMIN').length,
      enseignants: this.allUsers.filter(u => u.role === 'ENSEIGNANT').length,
      etudiants: this.allUsers.filter(u => u.role === 'ETUDIANT').length,
      actifs: this.allUsers.filter(u => u.actif).length
    };
  }

  applyFilters(): void {
    let result = [...this.allUsers];
    const search = this.searchControl.value?.trim().toLowerCase();
    if (search) {
      result = result.filter(u =>
        u.nom.toLowerCase().includes(search) ||
        u.prenom.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        (u.matricule && u.matricule.toLowerCase().includes(search))
      );
    }
    const role = this.roleFilter.value;
    if (role) {
      result = result.filter(u => u.role === role);
    }
    const statut = this.statutFilter.value;
    if (statut === 'actif') {
      result = result.filter(u => u.actif);
    } else if (statut === 'inactif') {
      result = result.filter(u => !u.actif);
    }
    this.sortData(result);
    this.filteredUsers = result;
    this.updatePage();
  }

  sortData(data: UtilisateurSummary[]): void {
    data.sort((a, b) => {
      let valA: string, valB: string;
      switch (this.sortColumn) {
        case 'nom': valA = `${a.nom} ${a.prenom}`.toLowerCase(); valB = `${b.nom} ${b.prenom}`.toLowerCase(); break;
        case 'email': valA = a.email.toLowerCase(); valB = b.email.toLowerCase(); break;
        case 'role': valA = a.role; valB = b.role; break;
        default: valA = a.nom.toLowerCase(); valB = b.nom.toLowerCase();
      }
      const cmp = valA.localeCompare(valB);
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  updatePage(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number { return Math.ceil(this.filteredUsers.length / this.pageSize); }
  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.pageIndex - 2);
    const end = Math.min(this.totalPages, start + 5);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }
  goToPage(page: number): void { this.pageIndex = page; this.updatePage(); }
  changePageSize(size: number): void { this.pageSize = size; this.pageIndex = 0; this.updatePage(); }
  min(a: number, b: number): number { return Math.min(a, b); }

  getRoleLabel(role: Role): string {
    const labels: Record<string, string> = {
      'SUPER_ADMIN': 'Super Admin',
      'ADMIN': 'Admin',
      'RESPONSABLE_PEDAGOGIQUE': 'Resp. Peda.',
      'ENSEIGNANT': 'Enseignant',
      'ETUDIANT': 'Etudiant'
    };
    return labels[role] ?? role;
  }

  getRoleBadgeClass(role: Role): string {
    const classes: Record<string, string> = {
      'SUPER_ADMIN': 'bg-purple-50 text-purple-700',
      'ADMIN': 'bg-blue-50 text-blue-700',
      'RESPONSABLE_PEDAGOGIQUE': 'bg-cyan-50 text-cyan-700',
      'ENSEIGNANT': 'bg-amber-50 text-amber-700',
      'ETUDIANT': 'bg-green-50 text-green-700'
    };
    return classes[role] ?? 'bg-gray-50 text-gray-600';
  }

  getStatutBadge(actif: boolean): { text: string; class: string } {
    return actif
      ? { text: 'Actif', class: 'bg-green-50 text-success' }
      : { text: 'Inactif', class: 'bg-gray-100 text-gray-500' };
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CreateUserDialogComponent, {
      width: '650px', maxWidth: '95vw'
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.utilisateurService.create(result).subscribe({
          next: () => {
            this.notification.success(`Utilisateur ${result.prenom} ${result.nom} cree avec succes`);
            this.loadUsers();
          },
          error: () => this.notification.error('Erreur lors de la creation de l\'utilisateur')
        });
      }
    });
  }

  openChangeRoleDialog(user: UtilisateurSummary): void {
    if (user.role === 'SUPER_ADMIN') {
      this.notification.error('Le role du Super Administrateur ne peut pas etre modifie');
      return;
    }
    if (user.email === this.currentUserEmail) {
      this.notification.error('Vous ne pouvez pas modifier votre propre role');
      return;
    }
    const ref = this.dialog.open(ChangeRoleDialogComponent, {
      width: '450px', maxWidth: '95vw',
      data: { userName: `${user.prenom} ${user.nom}`, currentRole: user.role }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.utilisateurService.changeRole(user.id, result.role, result.motif).subscribe({
          next: () => {
            this.notification.success(`Role de ${user.prenom} ${user.nom} modifie en ${this.getRoleLabel(result.role)}`);
            this.loadUsers();
          },
          error: () => this.notification.error('Erreur lors du changement de role')
        });
      }
    });
  }

  toggleActivation(user: UtilisateurSummary): void {
    if (user.role === 'SUPER_ADMIN') return;
    if (user.email === this.currentUserEmail) {
      this.notification.error('Vous ne pouvez pas desactiver votre propre compte');
      return;
    }
    const action = user.actif ? 'desactiver' : 'activer';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw',
      data: { title: `${user.actif ? 'Desactiver' : 'Activer'} l'utilisateur`, message: `Voulez-vous ${action} ${user.prenom} ${user.nom} ?` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.utilisateurService.toggleActivation(user.id).subscribe({
          next: () => {
            this.notification.success(`Utilisateur ${action === 'activer' ? 'active' : 'desactive'}`);
            this.loadUsers();
          },
          error: () => this.notification.error('Erreur lors de l\'operation')
        });
      }
    });
  }

  deleteUser(user: UtilisateurSummary): void {
    if (user.role === 'SUPER_ADMIN') return;
    if (user.email === this.currentUserEmail) {
      this.notification.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw',
      data: {
        title: 'Supprimer l\'utilisateur',
        message: `Etes-vous sur de vouloir supprimer ${user.prenom} ${user.nom} ? Cette action est irreversible.`,
        confirmText: 'Supprimer',
        color: 'warn'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.utilisateurService.delete(user.id).subscribe({
          next: () => {
            this.notification.success('Utilisateur supprime');
            this.loadUsers();
          },
          error: () => this.notification.error('Erreur lors de la suppression')
        });
      }
    });
  }
}

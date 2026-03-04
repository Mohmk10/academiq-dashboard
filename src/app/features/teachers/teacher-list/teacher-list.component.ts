import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UtilisateurSummary } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TeacherDialogComponent } from '../teacher-dialog/teacher-dialog.component';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatMenuModule, MatProgressSpinnerModule, MatDialogModule
  ],
  templateUrl: './teacher-list.component.html',
  styleUrl: './teacher-list.component.scss'
})
export default class TeacherListComponent implements OnInit, OnDestroy {
  teachers: UtilisateurSummary[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;

  searchControl = new FormControl('');
  statutFilter = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    private utilisateurService: UtilisateurService,
    private authService: AuthService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  get canCreate(): boolean { return this.authService.hasAnyRole(['ADMIN']); }
  get canEdit(): boolean { return this.authService.hasAnyRole(['ADMIN']); }
  get canDelete(): boolean { return this.authService.hasAnyRole(['ADMIN']); }
  get isReadOnly(): boolean { return this.authService.isExactRole('RESPONSABLE_PEDAGOGIQUE'); }

  ngOnInit(): void {
    this.loadTeachers();
    this.searchControl.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => { this.pageIndex = 0; this.loadTeachers(); });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadTeachers(): void {
    this.isLoading = true;
    const keyword = this.searchControl.value?.trim();
    const obs = keyword
      ? this.utilisateurService.rechercher(keyword, this.pageIndex, this.pageSize)
      : this.utilisateurService.getAll(this.pageIndex, this.pageSize, 'ENSEIGNANT');

    obs.subscribe({
      next: (res) => { this.teachers = res.data.content; this.totalElements = res.data.totalElements; this.isLoading = false; },
      error: () => { this.isLoading = false; this.teachers = []; this.totalElements = 0; }
    });
  }

  get totalPages(): number { return Math.ceil(this.totalElements / this.pageSize); }
  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.pageIndex - 2);
    const end = Math.min(this.totalPages, start + 5);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }
  goToPage(page: number): void { this.pageIndex = page; this.loadTeachers(); }
  changePageSize(size: number): void { this.pageSize = size; this.pageIndex = 0; this.loadTeachers(); }
  min(a: number, b: number): number { return Math.min(a, b); }

  viewTeacher(id: number): void { this.router.navigate(['/enseignants', id]); }

  openCreateDialog(): void {
    const ref = this.dialog.open(TeacherDialogComponent, { width: '650px', maxWidth: '95vw', data: { mode: 'create' } });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.utilisateurService.create({ ...result, role: 'ENSEIGNANT' }).subscribe({
          next: () => { this.notification.success('Enseignant créé avec succès'); this.loadTeachers(); },
          error: () => {}
        });
      }
    });
  }

  openEditDialog(teacher: UtilisateurSummary): void {
    this.utilisateurService.getById(teacher.id).subscribe(res => {
      const ref = this.dialog.open(TeacherDialogComponent, { width: '650px', maxWidth: '95vw', data: { mode: 'edit', teacher: res.data } });
      ref.afterClosed().subscribe(result => {
        if (result) {
          this.utilisateurService.update(teacher.id, result).subscribe({
            next: () => { this.notification.success('Enseignant modifié'); this.loadTeachers(); },
            error: () => {}
          });
        }
      });
    });
  }

  toggleActivation(t: UtilisateurSummary): void {
    const action = t.actif ? 'désactiver' : 'activer';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw', data: { title: `${t.actif ? 'Désactiver' : 'Activer'} l'enseignant`, message: `Voulez-vous ${action} ${t.prenom} ${t.nom} ?` }
    });
    ref.afterClosed().subscribe(ok => { if (ok) this.utilisateurService.toggleActivation(t.id).subscribe({ next: () => { this.notification.success(`Enseignant ${action === 'activer' ? 'activé' : 'désactivé'}`); this.loadTeachers(); }, error: () => {} }); });
  }

  deleteTeacher(t: UtilisateurSummary): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw', data: { title: 'Supprimer l\'enseignant', message: `Êtes-vous sûr de vouloir supprimer ${t.prenom} ${t.nom} ?`, confirmText: 'Supprimer' }
    });
    ref.afterClosed().subscribe(ok => { if (ok) this.utilisateurService.delete(t.id).subscribe({ next: () => { this.notification.success('Enseignant supprimé'); this.loadTeachers(); }, error: () => {} }); });
  }

  getStatutBadge(actif: boolean): { text: string; class: string } {
    return actif ? { text: 'Actif', class: 'bg-green-50 text-success' } : { text: 'Inactif', class: 'bg-gray-100 text-gray-500' };
  }

}

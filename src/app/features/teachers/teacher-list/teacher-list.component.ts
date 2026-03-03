import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UtilisateurSummary } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TeacherDialogComponent } from '../teacher-dialog/teacher-dialog.component';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatDialogModule
  ],
  templateUrl: './teacher-list.component.html',
  styleUrl: './teacher-list.component.scss'
})
export default class TeacherListComponent implements OnInit, OnDestroy {
  teachers: UtilisateurSummary[] = [];
  displayedColumns = ['matricule', 'nom', 'email', 'statut', 'actions'];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;

  searchControl = new FormControl('');
  statutFilter = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    private utilisateurService: UtilisateurService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

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
      error: () => { this.isLoading = false; this.loadMockData(); }
    });
  }

  onPageChange(event: PageEvent): void { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; this.loadTeachers(); }

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

  private loadMockData(): void {
    this.teachers = [
      { id: 10, nom: 'Keita', prenom: 'Ousmane', email: 'ousmane.keita@univ.ml', role: 'ENSEIGNANT', actif: true, matricule: 'ENS-2020-001' },
      { id: 11, nom: 'Cissé', prenom: 'Aissata', email: 'aissata.cisse@univ.ml', role: 'ENSEIGNANT', actif: true, matricule: 'ENS-2019-002' },
      { id: 12, nom: 'Touré', prenom: 'Mohamed', email: 'mohamed.toure@univ.ml', role: 'ENSEIGNANT', actif: false, matricule: 'ENS-2021-003' },
    ];
    this.totalElements = 3;
  }
}

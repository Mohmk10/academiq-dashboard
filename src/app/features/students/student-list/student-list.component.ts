import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UtilisateurSummary } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentDialogComponent } from '../student-dialog/student-dialog.component';
import { ImportDialogComponent } from '../import-dialog/import-dialog.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatMenuModule, MatProgressSpinnerModule, MatDialogModule
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export default class StudentListComponent implements OnInit, OnDestroy {
  students: UtilisateurSummary[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;

  searchControl = new FormControl('');
  niveauFilter = new FormControl('');
  statutFilter = new FormControl('');

  niveaux = ['L1', 'L2', 'L3', 'M1', 'M2'];
  statuts = ['Actif', 'Suspendu', 'Diplômé', 'Abandonné'];

  private destroy$ = new Subject<void>();

  constructor(
    private utilisateurService: UtilisateurService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => { this.pageIndex = 0; this.loadStudents(); });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudents(): void {
    this.isLoading = true;
    const keyword = this.searchControl.value?.trim();
    const obs = keyword
      ? this.utilisateurService.rechercher(keyword, this.pageIndex, this.pageSize)
      : this.utilisateurService.getAll(this.pageIndex, this.pageSize, 'ETUDIANT');

    obs.subscribe({
      next: (res) => {
        this.students = res.data.content;
        this.totalElements = res.data.totalElements;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.loadMockData(); }
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
  goToPage(page: number): void { this.pageIndex = page; this.loadStudents(); }
  changePageSize(size: number): void { this.pageSize = size; this.pageIndex = 0; this.loadStudents(); }
  min(a: number, b: number): number { return Math.min(a, b); }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadStudents();
  }

  viewStudent(id: number): void {
    this.router.navigate(['/etudiants', id]);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(StudentDialogComponent, {
      width: '650px', maxWidth: '95vw',
      data: { mode: 'create' }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.utilisateurService.create({ ...result, role: 'ETUDIANT' }).subscribe({
          next: () => { this.notification.success('Étudiant créé avec succès'); this.loadStudents(); },
          error: () => {}
        });
      }
    });
  }

  openEditDialog(student: UtilisateurSummary): void {
    this.utilisateurService.getById(student.id).subscribe(res => {
      const ref = this.dialog.open(StudentDialogComponent, {
        width: '650px', maxWidth: '95vw',
        data: { mode: 'edit', student: res.data }
      });
      ref.afterClosed().subscribe(result => {
        if (result) {
          this.utilisateurService.update(student.id, result).subscribe({
            next: () => { this.notification.success('Étudiant modifié avec succès'); this.loadStudents(); },
            error: () => {}
          });
        }
      });
    });
  }

  toggleActivation(student: UtilisateurSummary): void {
    const action = student.actif ? 'désactiver' : 'activer';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw',
      data: { title: `${student.actif ? 'Désactiver' : 'Activer'} l'étudiant`, message: `Voulez-vous ${action} ${student.prenom} ${student.nom} ?` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.utilisateurService.toggleActivation(student.id).subscribe({
          next: () => { this.notification.success(`Étudiant ${action === 'activer' ? 'activé' : 'désactivé'}`); this.loadStudents(); },
          error: () => {}
        });
      }
    });
  }

  deleteStudent(student: UtilisateurSummary): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: '95vw',
      data: { title: 'Supprimer l\'étudiant', message: `Êtes-vous sûr de vouloir supprimer ${student.prenom} ${student.nom} ? Cette action est irréversible.`, confirmText: 'Supprimer' }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.utilisateurService.delete(student.id).subscribe({
          next: () => { this.notification.success('Étudiant supprimé'); this.loadStudents(); },
          error: () => {}
        });
      }
    });
  }

  openImportDialog(): void {
    const ref = this.dialog.open(ImportDialogComponent, { width: '500px', maxWidth: '95vw' });
    ref.afterClosed().subscribe(result => { if (result) this.loadStudents(); });
  }

  getStatutBadge(actif: boolean): { text: string; class: string } {
    return actif
      ? { text: 'Actif', class: 'bg-green-50 text-success' }
      : { text: 'Inactif', class: 'bg-gray-100 text-gray-500' };
  }

  private loadMockData(): void {
    this.students = [
      { id: 1, nom: 'Diallo', prenom: 'Amadou', email: 'amadou.diallo@univ.ml', role: 'ETUDIANT', actif: true, matricule: 'ETU-2024-001' },
      { id: 2, nom: 'Traoré', prenom: 'Fatou', email: 'fatou.traore@univ.ml', role: 'ETUDIANT', actif: true, matricule: 'ETU-2024-002' },
      { id: 3, nom: 'Konaté', prenom: 'Ibrahim', email: 'ibrahim.konate@univ.ml', role: 'ETUDIANT', actif: false, matricule: 'ETU-2024-003' },
      { id: 4, nom: 'Sangaré', prenom: 'Mariam', email: 'mariam.sangare@univ.ml', role: 'ETUDIANT', actif: true, matricule: 'ETU-2024-004' },
      { id: 5, nom: 'Coulibaly', prenom: 'Sekou', email: 'sekou.coulibaly@univ.ml', role: 'ETUDIANT', actif: true, matricule: 'ETU-2024-005' },
    ];
    this.totalElements = 5;
  }
}

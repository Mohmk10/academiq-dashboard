import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UtilisateurDetail } from '../../../core/models/user.model';
import { TeacherDialogComponent } from '../teacher-dialog/teacher-dialog.component';

@Component({
  selector: 'app-teacher-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './teacher-detail.component.html',
  styleUrl: './teacher-detail.component.scss'
})
export default class TeacherDetailComponent implements OnInit {
  teacher: UtilisateurDetail | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.utilisateurService.getById(id).subscribe({
      next: (res) => { this.teacher = res.data; this.isLoading = false; },
      error: () => { this.isLoading = false; this.loadMockData(); }
    });
  }

  openEditDialog(): void {
    if (!this.teacher) return;
    const ref = this.dialog.open(TeacherDialogComponent, { width: '650px', maxWidth: '95vw', data: { mode: 'edit', teacher: this.teacher } });
    ref.afterClosed().subscribe(result => {
      if (result && this.teacher) {
        this.utilisateurService.update(this.teacher.id, result).subscribe({
          next: () => { this.notification.success('Enseignant modifié'); this.ngOnInit(); },
          error: () => {}
        });
      }
    });
  }

  formatDate(date: string): string { return new Date(date).toLocaleDateString('fr-FR'); }

  private loadMockData(): void {
    this.teacher = {
      id: 10, nom: 'Keita', prenom: 'Ousmane', email: 'ousmane.keita@univ.ml', role: 'ENSEIGNANT',
      telephone: '+223 76 12 34 56', actif: true, createdAt: '2020-09-01',
      enseignant: { id: 1, matricule: 'ENS-2020-001', specialite: 'Informatique', grade: 'Maître de conférences', departement: 'Sciences & Technologies', bureau: 'B-204', dateRecrutement: '2020-09-01', statut: 'Actif' }
    };
  }
}

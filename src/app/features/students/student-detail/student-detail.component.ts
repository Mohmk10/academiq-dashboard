import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { NoteService } from '../../../core/services/note.service';
import { AlerteService } from '../../../core/services/alerte.service';
import { RapportService } from '../../../core/services/rapport.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UtilisateurDetail } from '../../../core/models/user.model';
import { NoteResponse } from '../../../core/models/note.model';
import { AlerteResponse } from '../../../core/models/alerte.model';
import { StudentDialogComponent } from '../student-dialog/student-dialog.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss'
})
export default class StudentDetailComponent implements OnInit {
  student: UtilisateurDetail | null = null;
  notes: NoteResponse[] = [];
  alertes: AlerteResponse[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private noteService: NoteService,
    private alerteService: AlerteService,
    private rapportService: RapportService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.utilisateurService.getById(id).subscribe({
      next: (res) => {
        this.student = res.data;
        this.isLoading = false;
        this.loadNotes(id);
        this.loadAlertes(id);
      },
      error: () => { this.isLoading = false; this.student = null; }
    });
  }

  openEditDialog(): void {
    if (!this.student) return;
    const ref = this.dialog.open(StudentDialogComponent, {
      width: '650px', maxWidth: '95vw',
      data: { mode: 'edit', student: this.student }
    });
    ref.afterClosed().subscribe(result => {
      if (result && this.student) {
        this.utilisateurService.update(this.student.id, result).subscribe({
          next: () => { this.notification.success('Étudiant modifié'); this.ngOnInit(); },
          error: () => {}
        });
      }
    });
  }

  telechargerReleve(): void {
    if (!this.student?.etudiant) return;
    this.notification.info('Téléchargement en cours...');
    this.rapportService.telechargerReleve(this.student.id, 0).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `releve_${this.student!.etudiant!.matricule}.pdf`;
        a.click(); window.URL.revokeObjectURL(url);
      },
      error: () => this.notification.error('Impossible de télécharger le relevé')
    });
  }

  getNoteClass(note: number): string {
    if (note >= 14) return 'text-success font-bold';
    if (note >= 10) return 'text-primary';
    return 'text-danger font-bold';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getAlertIcon(type: string): string {
    return type === 'ABSENCES_REPETEES' || type === 'MOYENNE_FAIBLE' || type === 'NON_ASSIDUITE' ? 'text-warning' : 'text-danger';
  }

  private loadNotes(id: number): void {
    this.noteService.getNotesEtudiant(id).subscribe({
      next: (res) => this.notes = res.data?.slice(0, 10) ?? [],
      error: () => {}
    });
  }

  private loadAlertes(id: number): void {
    this.alerteService.getAlertesEtudiant(id).subscribe({
      next: (res) => this.alertes = (res.data ?? []).filter(a => a.statut === 'ACTIVE'),
      error: () => {}
    });
  }

}

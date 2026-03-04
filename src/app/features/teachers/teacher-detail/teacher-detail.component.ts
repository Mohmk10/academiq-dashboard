import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UtilisateurDetail } from '../../../core/models/user.model';
import { TeacherDialogComponent } from '../teacher-dialog/teacher-dialog.component';

@Component({
  selector: 'app-teacher-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule],
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
      error: () => { this.isLoading = false; this.teacher = null; }
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

}

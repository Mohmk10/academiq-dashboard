import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthService } from '../../../core/services/auth.service';
import { RapportService } from '../../../core/services/rapport.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DashboardEtudiantDTO, ResultatModuleDTO, EvolutionDTO } from '../../../core/models/analytics.model';

interface NoteRecente {
  date: string;
  evaluation: string;
  module: string;
  type: string;
  note: number;
  sur: number;
}

@Component({
  selector: 'app-etudiant-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  templateUrl: './etudiant-dashboard.component.html',
  styleUrl: './etudiant-dashboard.component.scss'
})
export class EtudiantDashboardComponent implements OnInit {
  data: DashboardEtudiantDTO | null = null;
  isLoading = true;
  userName = '';
  notesRecentes: NoteRecente[] = [];

  barData: ChartData<'bar'> = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 20, ticks: { stepSize: 4 }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false }, ticks: { maxRotation: 45 } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => (ctx.parsed.y ?? 0).toFixed(2) + '/20' } }
    }
  };

  lineData: ChartData<'line'> = { labels: [], datasets: [] };
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 20, ticks: { stepSize: 4 }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  hasEvolution = false;

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private rapportService: RapportService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getCurrentUserName().split(' ')[0] || 'Étudiant';

    this.analyticsService.getDashboardEtudiant().subscribe({
      next: (res) => {
        const d = res.data;
        this.data = {
          ...d,
          resultatsModules: d.resultatsModules ?? [],
          evolutionMoyenne: d.evolutionMoyenne ?? []
        };
        this.buildBarChart(this.data.resultatsModules);
        this.buildLineChart(this.data.evolutionMoyenne);
        this.buildNotesRecentes(this.data.resultatsModules);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.data = {
          moyenneGenerale: 0, creditValides: 0, creditTotal: 0,
          alertesActives: 0, resultatsModules: [], evolutionMoyenne: []
        };
      }
    });
  }

  getMoyenneClass(moyenne: number): string {
    if (moyenne >= 12) return 'text-primary';
    if (moyenne >= 10) return 'text-amber-600';
    return 'text-red-600';
  }

  getCreditPercent(): number {
    if (!this.data || this.data.creditTotal === 0) return 0;
    return Math.round((this.data.creditValides / this.data.creditTotal) * 100);
  }

  getNoteClass(note: number): string {
    if (note >= 14) return 'text-emerald-600';
    if (note >= 10) return 'text-gray-900';
    return 'text-red-600';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  telechargerReleve(): void {
    this.notification.info('Téléchargement du relevé en cours...');
    this.authService.getProfile().subscribe({
      next: (res) => {
        const etudiantId = res.data.id;
        this.rapportService.telechargerReleve(etudiantId, 0).subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'releve_notes.pdf';
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: () => this.notification.error('Impossible de télécharger le relevé')
        });
      },
      error: () => this.notification.error('Impossible de récupérer le profil')
    });
  }

  private buildBarChart(modules: ResultatModuleDTO[]): void {
    const colors = modules.map(m =>
      m.moyenne >= 12 ? '#059669' : m.moyenne >= 10 ? '#2563EB' : '#DC2626'
    );

    this.barData = {
      labels: modules.map(m => m.moduleCode),
      datasets: [{
        data: modules.map(m => m.moyenne),
        backgroundColor: colors,
        borderRadius: 6,
        barThickness: 28
      }]
    };
  }

  private buildLineChart(evolution: EvolutionDTO[]): void {
    this.hasEvolution = evolution.length > 1;
    if (!this.hasEvolution) return;

    this.lineData = {
      labels: evolution.map(e => e.periode),
      datasets: [{
        data: evolution.map(e => e.valeur),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2563EB',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    };
  }

  private buildNotesRecentes(modules: ResultatModuleDTO[]): void {
    this.notesRecentes = modules.map(m => ({
      date: '',
      evaluation: m.moduleCode,
      module: m.moduleNom,
      type: m.statut ?? '',
      note: m.moyenne,
      sur: m.noteMax
    })).slice(0, 10);
  }

}

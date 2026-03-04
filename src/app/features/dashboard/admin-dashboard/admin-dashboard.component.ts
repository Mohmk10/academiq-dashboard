import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardAdminDTO, RepartitionDTO } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  data: DashboardAdminDTO | null = null;
  isLoading = true;
  error = false;

  doughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle' } }
    },
    cutout: '65%'
  };

  barData: ChartData<'bar'> = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: { min: 0, max: 100, ticks: { callback: (v) => v + '%' }, grid: { color: '#f1f5f9' } },
      y: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => (ctx.parsed.x ?? 0).toFixed(1) + '%' } }
    }
  };

  isSuperAdmin = false;
  userName = '';
  systemStats: any = null;
  recentLogs: any[] = [];

  private chartColors = ['#2563EB', '#059669', '#8B5CF6', '#D97706', '#DC2626', '#06B6D4', '#EC4899', '#F97316'];

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isExactRole('SUPER_ADMIN');
    this.userName = this.authService.getCurrentUserName();

    if (this.isSuperAdmin) {
      this.loadSystemStats();
      this.loadRecentLogs();
    }

    this.analyticsService.getDashboardAdmin().subscribe({
      next: (res) => {
        const d = res.data;
        this.data = {
          ...d,
          repartitionEtudiants: d.repartitionEtudiants ?? [],
          evolutionInscriptions: d.evolutionInscriptions ?? [],
          dernieresAlertes: d.dernieresAlertes ?? []
        };
        if (this.data.repartitionEtudiants.length) {
          this.buildDoughnutChart(this.data.repartitionEtudiants);
          this.buildBarChart();
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
        this.data = {
          totalEtudiants: 0, totalEnseignants: 0, totalFilieres: 0,
          totalModules: 0, alertesActives: 0, tauxReussiteGlobal: 0,
          moyenneGenerale: 0, repartitionEtudiants: [],
          evolutionInscriptions: [], dernieresAlertes: []
        };
      }
    });
  }

  private loadSystemStats(): void {
    this.analyticsService.getSystemStats().subscribe({
      next: (res) => this.systemStats = res.data,
      error: () => this.systemStats = {
        totalUtilisateurs: 0, utilisateursActifs: 0,
        totalEtudiants: 0, totalEnseignants: 0,
        totalEvaluations: 0, alertesActives: 0
      }
    });
  }

  private loadRecentLogs(): void {
    this.analyticsService.getRecentAuditLogs(10).subscribe({
      next: (res) => this.recentLogs = res.data ?? [],
      error: () => this.recentLogs = []
    });
  }

  getLogIcon(action: string): string {
    const icons: Record<string, string> = {
      'CONNEXION': 'fa-right-to-bracket text-gray-400',
      'CREATION_UTILISATEUR': 'fa-user-plus text-green-500',
      'MODIFICATION_UTILISATEUR': 'fa-user-pen text-blue-500',
      'SUPPRESSION_UTILISATEUR': 'fa-user-minus text-red-500',
      'CHANGEMENT_ROLE': 'fa-user-shield text-purple-500',
      'DESACTIVATION_COMPTE': 'fa-user-slash text-amber-500',
      'ACTIVATION_COMPTE': 'fa-user-check text-emerald-500',
      'SAISIE_NOTES': 'fa-pen text-blue-500',
      'VERROUILLAGE_EVALUATION': 'fa-lock text-gray-500',
      'DEVERROUILLAGE_EVALUATION': 'fa-lock-open text-gray-500',
      'GENERATION_RAPPORT': 'fa-file-export text-indigo-500',
      'TRAITEMENT_ALERTE': 'fa-bell text-amber-500'
    };
    return icons[action] ?? 'fa-circle text-gray-400';
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'CONNEXION': 'Connexion',
      'CREATION_UTILISATEUR': 'Creation utilisateur',
      'MODIFICATION_UTILISATEUR': 'Modification utilisateur',
      'SUPPRESSION_UTILISATEUR': 'Suppression utilisateur',
      'CHANGEMENT_ROLE': 'Changement de role',
      'DESACTIVATION_COMPTE': 'Desactivation compte',
      'ACTIVATION_COMPTE': 'Activation compte',
      'SAISIE_NOTES': 'Saisie de notes',
      'VERROUILLAGE_EVALUATION': 'Verrouillage evaluation',
      'DEVERROUILLAGE_EVALUATION': 'Deverrouillage evaluation',
      'GENERATION_RAPPORT': 'Generation rapport',
      'TRAITEMENT_ALERTE': 'Traitement alerte'
    };
    return labels[action] ?? action;
  }

  formatDateTime(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) +
      ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getAlertTypeIcon(type: string): string {
    switch (type) {
      case 'NOTE_BASSE': case 'MOYENNE_FAIBLE': case 'RISQUE_ECHEC': return 'text-danger';
      case 'ABSENCE_NOTE': return 'text-warning';
      default: return 'text-gray-500';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  private buildDoughnutChart(repartition: RepartitionDTO[]): void {
    this.doughnutData = {
      labels: repartition.map(r => r.label),
      datasets: [{
        data: repartition.map(r => r.valeur),
        backgroundColor: this.chartColors.slice(0, repartition.length),
        borderWidth: 0,
        hoverOffset: 8
      }]
    };
  }

  private buildBarChart(): void {
    if (!this.data?.repartitionEtudiants?.length) return;
    const repartition = this.data.repartitionEtudiants;
    const labels = repartition.map(r => r.label);
    const values = repartition.map(() => Math.round(50 + Math.random() * 45));
    const colors = values.map(v => v >= 70 ? '#059669' : v >= 50 ? '#D97706' : '#DC2626');

    this.barData = {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 4,
        barThickness: 24
      }]
    };
  }
}

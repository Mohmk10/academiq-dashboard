import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardAdminDTO, DerniereAlerteDTO, RepartitionDTO } from '../../../core/models/analytics.model';

interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: string;
  activeUsers: number;
  requestsToday: number;
}

interface RecentLog {
  action: string;
  user: string;
  date: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'ROLE_CHANGE';
}

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
  systemStats: SystemStats | null = null;
  recentLogs: RecentLog[] = [];

  private chartColors = ['#2563EB', '#059669', '#8B5CF6', '#D97706', '#DC2626', '#06B6D4', '#EC4899', '#F97316'];

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isExactRole('SUPER_ADMIN');

    if (this.isSuperAdmin) {
      this.loadSystemStats();
    }

    this.analyticsService.getDashboardAdmin().subscribe({
      next: (res) => {
        this.data = res.data;
        this.buildDoughnutChart(res.data.repartitionEtudiants);
        this.buildBarChart();
        this.isLoading = false;
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
        this.loadMockData();
      }
    });
  }

  private loadSystemStats(): void {
    this.systemStats = {
      cpuUsage: 34,
      memoryUsage: 62,
      diskUsage: 45,
      uptime: '15j 8h 42m',
      activeUsers: 23,
      requestsToday: 1847
    };
    this.recentLogs = [
      { action: 'Role modifie pour Diagne Abdou', user: 'Kouyate Makan', date: '2026-03-04T09:20:00', type: 'ROLE_CHANGE' },
      { action: 'Nouvel etudiant inscrit (ETU-2025-016)', user: 'Diagne Abdou', date: '2026-03-04T10:00:00', type: 'CREATE' },
      { action: 'Notes saisies CC2 Spring Boot', user: 'Diop Ibrahima', date: '2026-03-03T15:30:00', type: 'UPDATE' },
      { action: 'Export releves L3 GL', user: 'Diagne Abdou', date: '2026-03-03T14:00:00', type: 'CREATE' },
      { action: 'Connexion reussie', user: 'Diagne Abdou', date: '2026-03-03T08:30:00', type: 'LOGIN' }
    ];
  }

  getLogIcon(type: string): string {
    const icons: Record<string, string> = {
      'CREATE': 'fa-plus text-green-500',
      'UPDATE': 'fa-pen text-blue-500',
      'DELETE': 'fa-trash text-red-500',
      'LOGIN': 'fa-right-to-bracket text-gray-400',
      'ROLE_CHANGE': 'fa-user-shield text-purple-500'
    };
    return icons[type] ?? 'fa-circle text-gray-400';
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
    if (!this.data) return;
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

  private loadMockData(): void {
    this.data = {
      totalEtudiants: 547,
      totalEnseignants: 42,
      totalFilieres: 8,
      totalModules: 64,
      alertesActives: 12,
      tauxReussiteGlobal: 73.5,
      moyenneGenerale: 12.4,
      repartitionEtudiants: [
        { label: 'Informatique', valeur: 180, pourcentage: 32.9 },
        { label: 'Génie Civil', valeur: 120, pourcentage: 21.9 },
        { label: 'Électronique', valeur: 95, pourcentage: 17.4 },
        { label: 'Mécanique', valeur: 82, pourcentage: 15.0 },
        { label: 'Mathématiques', valeur: 70, pourcentage: 12.8 }
      ],
      evolutionInscriptions: [],
      dernieresAlertes: [
        { id: 1, type: 'NOTE_BASSE', message: 'Note inférieure au seuil en Algorithmes', etudiantNom: 'Diallo Amadou', date: '2026-03-01T10:30:00' },
        { id: 2, type: 'MOYENNE_FAIBLE', message: 'Moyenne générale inférieure à 8/20', etudiantNom: 'Traoré Fatou', date: '2026-02-28T14:15:00' },
        { id: 3, type: 'RISQUE_ECHEC', message: 'Risque d\'échec détecté en Analyse', etudiantNom: 'Konaté Ibrahim', date: '2026-02-27T09:00:00' },
        { id: 4, type: 'ABSENCE_NOTE', message: 'Note manquante en Base de données', etudiantNom: 'Sangaré Mariam', date: '2026-02-26T16:45:00' },
        { id: 5, type: 'NOTE_BASSE', message: 'Note inférieure au seuil en Physique', etudiantNom: 'Coulibaly Sekou', date: '2026-02-25T11:20:00' }
      ]
    };
    this.buildDoughnutChart(this.data.repartitionEtudiants);
    this.buildBarChart();
  }
}

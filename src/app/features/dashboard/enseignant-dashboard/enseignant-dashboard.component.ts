import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardEnseignantDTO, ModuleEnseignantDTO } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-enseignant-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    BaseChartDirective,
    DatePipe
  ],
  templateUrl: './enseignant-dashboard.component.html',
  styleUrl: './enseignant-dashboard.component.scss'
})
export class EnseignantDashboardComponent implements OnInit {
  data: DashboardEnseignantDTO | null = null;
  isLoading = true;
  userName = '';
  today = new Date();
  sortedModules: ModuleEnseignantDTO[] = [];
  displayedColumns = ['moduleNom', 'moduleCode', 'nombreEtudiants', 'moyenneClasse', 'evaluationsCount', 'actions'];

  barData: ChartData<'bar'> = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 20, ticks: { stepSize: 2 }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => (ctx.parsed.y ?? 0).toFixed(2) + '/20' } }
    }
  };

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getCurrentUserName();

    this.analyticsService.getDashboardEnseignant().subscribe({
      next: (res) => {
        this.data = res.data;
        this.sortedModules = [...res.data.modules];
        this.buildBarChart(res.data.modules);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadMockData();
      }
    });
  }

  getMoyenneColor(moyenne: number): string {
    if (moyenne >= 12) return 'text-success';
    if (moyenne >= 10) return 'text-warning';
    return 'text-danger';
  }

  getProgressPercent(module: ModuleEnseignantDTO): number {
    if (module.nombreEtudiants === 0) return 0;
    return Math.round((module.evaluationsCount / Math.max(module.nombreEtudiants, 1)) * 100);
  }

  getProgressColor(percent: number): string {
    if (percent >= 80) return 'primary';
    if (percent >= 50) return 'accent';
    return 'warn';
  }

  onSort(sort: Sort): void {
    if (!this.data) return;
    const data = [...this.data.modules];
    if (!sort.active || sort.direction === '') {
      this.sortedModules = data;
      return;
    }
    this.sortedModules = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'moduleNom': return compare(a.moduleNom, b.moduleNom, isAsc);
        case 'nombreEtudiants': return compare(a.nombreEtudiants, b.nombreEtudiants, isAsc);
        case 'moyenneClasse': return compare(a.moyenneClasse, b.moyenneClasse, isAsc);
        default: return 0;
      }
    });
  }

  private buildBarChart(modules: ModuleEnseignantDTO[]): void {
    const colors = modules.map(m =>
      m.moyenneClasse >= 12 ? '#10B981' : m.moyenneClasse >= 10 ? '#F59E0B' : '#EF4444'
    );

    this.barData = {
      labels: modules.map(m => m.moduleCode),
      datasets: [{
        data: modules.map(m => m.moyenneClasse),
        backgroundColor: colors,
        borderRadius: 6,
        barThickness: 32
      }]
    };
  }

  private loadMockData(): void {
    this.data = {
      totalModules: 4,
      totalEtudiants: 156,
      evaluationsEnCours: 3,
      moyenneModules: 11.8,
      modules: [
        { moduleId: 1, moduleNom: 'Algorithmes avancés', moduleCode: 'ALGO-301', nombreEtudiants: 45, moyenneClasse: 12.5, evaluationsCount: 38 },
        { moduleId: 2, moduleNom: 'Base de données', moduleCode: 'BDD-201', nombreEtudiants: 52, moyenneClasse: 11.2, evaluationsCount: 52 },
        { moduleId: 3, moduleNom: 'Réseaux informatiques', moduleCode: 'RES-301', nombreEtudiants: 38, moyenneClasse: 9.8, evaluationsCount: 20 },
        { moduleId: 4, moduleNom: 'Génie logiciel', moduleCode: 'GL-401', nombreEtudiants: 21, moyenneClasse: 13.6, evaluationsCount: 21 }
      ],
      alertesRecentes: [
        { id: 1, type: 'NOTE_BASSE', message: 'Note inférieure au seuil en Réseaux', etudiantNom: 'Diallo Amadou', date: '2026-03-01T10:30:00' },
        { id: 2, type: 'MOYENNE_FAIBLE', message: 'Moyenne faible en Algorithmes', etudiantNom: 'Traoré Fatou', date: '2026-02-28T14:15:00' }
      ]
    };
    this.sortedModules = [...this.data.modules];
    this.buildBarChart(this.data.modules);
  }
}

function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

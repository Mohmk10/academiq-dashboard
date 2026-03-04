import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule,
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
        this.data = {
          totalModules: 0, totalEtudiants: 0, evaluationsEnCours: 0,
          moyenneModules: 0, modules: [], alertesRecentes: []
        };
        this.sortedModules = [];
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

  sortColumn = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  onSort(column: string): void {
    if (!this.data) return;
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? '' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    const data = [...this.data.modules];
    if (!this.sortColumn || this.sortDirection === '') {
      this.sortedModules = data;
      return;
    }
    const isAsc = this.sortDirection === 'asc';
    this.sortedModules = data.sort((a, b) => {
      switch (this.sortColumn) {
        case 'moduleNom': return compare(a.moduleNom, b.moduleNom, isAsc);
        case 'nombreEtudiants': return compare(a.nombreEtudiants, b.nombreEtudiants, isAsc);
        case 'moyenneClasse': return compare(a.moyenneClasse, b.moyenneClasse, isAsc);
        default: return 0;
      }
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column || this.sortDirection === '') return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  private buildBarChart(modules: ModuleEnseignantDTO[]): void {
    const colors = modules.map(m =>
      m.moyenneClasse >= 12 ? '#059669' : m.moyenneClasse >= 10 ? '#D97706' : '#DC2626'
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

}

function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

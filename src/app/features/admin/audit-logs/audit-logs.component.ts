import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalyticsService } from '../../../core/services/analytics.service';

interface AuditLog {
  id: number;
  action: string;
  type: string;
  utilisateur: string;
  role?: string;
  cible?: string;
  details: string;
  date: string;
  ip?: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss'
})
export default class AuditLogsComponent implements OnInit {
  allLogs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  pagedLogs: AuditLog[] = [];
  isLoading = true;

  searchControl = new FormControl('');
  typeFilter = new FormControl('');
  dateFilter = new FormControl('');

  pageSize = 15;
  pageIndex = 0;

  types = [
    { value: 'CREATE', label: 'Creation', icon: 'fa-plus', color: 'text-green-600' },
    { value: 'UPDATE', label: 'Modification', icon: 'fa-pen', color: 'text-blue-600' },
    { value: 'DELETE', label: 'Suppression', icon: 'fa-trash', color: 'text-red-600' },
    { value: 'LOGIN', label: 'Connexion', icon: 'fa-right-to-bracket', color: 'text-gray-600' },
    { value: 'ROLE_CHANGE', label: 'Changement role', icon: 'fa-user-shield', color: 'text-purple-600' },
    { value: 'EXPORT', label: 'Export', icon: 'fa-download', color: 'text-amber-600' }
  ];

  private readonly actionTypeMap: Record<string, string> = {
    'CONNEXION': 'LOGIN',
    'CREATION_UTILISATEUR': 'CREATE',
    'MODIFICATION_UTILISATEUR': 'UPDATE',
    'SUPPRESSION_UTILISATEUR': 'DELETE',
    'CHANGEMENT_ROLE': 'ROLE_CHANGE',
    'DESACTIVATION_COMPTE': 'UPDATE',
    'ACTIVATION_COMPTE': 'UPDATE',
    'SAISIE_NOTES': 'UPDATE',
    'VERROUILLAGE_EVALUATION': 'UPDATE',
    'DEVERROUILLAGE_EVALUATION': 'UPDATE',
    'GENERATION_RAPPORT': 'EXPORT',
    'TRAITEMENT_ALERTE': 'UPDATE'
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadLogs();
    this.searchControl.valueChanges.subscribe(() => { this.pageIndex = 0; this.applyFilters(); });
  }

  loadLogs(): void {
    this.isLoading = true;
    this.analyticsService.getRecentAuditLogs(200).subscribe({
      next: (res) => {
        const logs = res.data ?? [];
        this.allLogs = logs.map((log: any, index: number) => ({
          id: log.id ?? index,
          action: this.getActionLabel(log.action),
          type: this.actionTypeMap[log.action] ?? 'UPDATE',
          utilisateur: log.performedByName || log.performedBy || 'Systeme',
          role: log.role,
          cible: log.targetName || log.cible,
          details: log.details || log.action,
          date: log.date || log.createdAt || '',
          ip: log.ip
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.allLogs = [];
        this.filteredLogs = [];
        this.pagedLogs = [];
        this.isLoading = false;
      }
    });
  }

  private getActionLabel(action: string): string {
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

  applyFilters(): void {
    let result = [...this.allLogs];
    const search = this.searchControl.value?.trim().toLowerCase();
    if (search) {
      result = result.filter(l =>
        l.utilisateur.toLowerCase().includes(search) ||
        l.details.toLowerCase().includes(search) ||
        (l.cible && l.cible.toLowerCase().includes(search))
      );
    }
    const type = this.typeFilter.value;
    if (type) {
      result = result.filter(l => l.type === type);
    }
    const dateVal = this.dateFilter.value;
    if (dateVal) {
      result = result.filter(l => l.date.startsWith(dateVal));
    }
    this.filteredLogs = result;
    this.updatePage();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  updatePage(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedLogs = this.filteredLogs.slice(start, start + this.pageSize);
  }

  get totalPages(): number { return Math.ceil(this.filteredLogs.length / this.pageSize); }
  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.pageIndex - 2);
    const end = Math.min(this.totalPages, start + 5);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }
  goToPage(page: number): void { this.pageIndex = page; this.updatePage(); }
  min(a: number, b: number): number { return Math.min(a, b); }

  getTypeConfig(type: string): { label: string; icon: string; color: string } {
    return this.types.find(t => t.value === type) ?? { label: type, icon: 'fa-circle', color: 'text-gray-500' };
  }

  getTypeBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      'CREATE': 'bg-green-50 text-green-700',
      'UPDATE': 'bg-blue-50 text-blue-700',
      'DELETE': 'bg-red-50 text-red-700',
      'LOGIN': 'bg-gray-100 text-gray-600',
      'ROLE_CHANGE': 'bg-purple-50 text-purple-700',
      'EXPORT': 'bg-amber-50 text-amber-700'
    };
    return classes[type] ?? 'bg-gray-50 text-gray-600';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}

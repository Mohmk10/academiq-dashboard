import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

interface AuditLog {
  id: number;
  action: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'ROLE_CHANGE' | 'EXPORT';
  utilisateur: string;
  role: string;
  cible?: string;
  details: string;
  date: string;
  ip: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss'
})
export default class AuditLogsComponent implements OnInit {
  allLogs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  pagedLogs: AuditLog[] = [];

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

  ngOnInit(): void {
    this.loadLogs();
    this.searchControl.valueChanges.subscribe(() => { this.pageIndex = 0; this.applyFilters(); });
  }

  loadLogs(): void {
    this.allLogs = this.generateMockLogs();
    this.applyFilters();
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

  private generateMockLogs(): AuditLog[] {
    return [
      { id: 1, action: 'Connexion', type: 'LOGIN', utilisateur: 'Kouyate Makan', role: 'SUPER_ADMIN', details: 'Connexion reussie au tableau de bord', date: '2026-03-04T09:15:00', ip: '192.168.1.100' },
      { id: 2, action: 'Modification role', type: 'ROLE_CHANGE', utilisateur: 'Kouyate Makan', role: 'SUPER_ADMIN', cible: 'Diagne Abdou', details: 'Role modifie de ENSEIGNANT a ADMIN', date: '2026-03-04T09:20:00', ip: '192.168.1.100' },
      { id: 3, action: 'Creation', type: 'CREATE', utilisateur: 'Diagne Abdou', role: 'ADMIN', cible: 'Sy Aissatou', details: 'Nouvel etudiant inscrit (ETU-2025-016)', date: '2026-03-04T10:00:00', ip: '192.168.1.105' },
      { id: 4, action: 'Modification', type: 'UPDATE', utilisateur: 'Diop Ibrahima', role: 'ENSEIGNANT', cible: 'CC2 Spring Boot', details: 'Notes saisies pour 38 etudiants', date: '2026-03-03T15:30:00', ip: '192.168.1.120' },
      { id: 5, action: 'Export', type: 'EXPORT', utilisateur: 'Diagne Abdou', role: 'ADMIN', details: 'Export des releves de notes L3 GL', date: '2026-03-03T14:00:00', ip: '192.168.1.105' },
      { id: 6, action: 'Suppression', type: 'DELETE', utilisateur: 'Kouyate Makan', role: 'SUPER_ADMIN', cible: 'Compte test', details: 'Suppression du compte utilisateur test', date: '2026-03-03T11:45:00', ip: '192.168.1.100' },
      { id: 7, action: 'Connexion', type: 'LOGIN', utilisateur: 'Diagne Abdou', role: 'ADMIN', details: 'Connexion reussie', date: '2026-03-03T08:30:00', ip: '192.168.1.105' },
      { id: 8, action: 'Modification', type: 'UPDATE', utilisateur: 'Diagne Abdou', role: 'ADMIN', cible: 'Regle alerte #3', details: 'Seuil modifie de 7 a 8', date: '2026-03-02T16:20:00', ip: '192.168.1.105' },
      { id: 9, action: 'Creation', type: 'CREATE', utilisateur: 'Diagne Abdou', role: 'ADMIN', cible: 'Module MOD-IA', details: 'Nouveau module Intelligence Artificielle cree', date: '2026-03-02T14:10:00', ip: '192.168.1.105' },
      { id: 10, action: 'Connexion', type: 'LOGIN', utilisateur: 'Toure Aissata', role: 'ENSEIGNANT', details: 'Connexion reussie', date: '2026-03-02T09:00:00', ip: '192.168.1.130' },
      { id: 11, action: 'Modification', type: 'UPDATE', utilisateur: 'Toure Aissata', role: 'ENSEIGNANT', cible: 'CC1 BDA', details: 'Note modifiee pour Diallo Aminata (7.5 → 8.0)', date: '2026-03-01T16:45:00', ip: '192.168.1.130' },
      { id: 12, action: 'Export', type: 'EXPORT', utilisateur: 'Diagne Abdou', role: 'ADMIN', details: 'Export CSV de la liste des etudiants', date: '2026-03-01T11:30:00', ip: '192.168.1.105' },
      { id: 13, action: 'Modification role', type: 'ROLE_CHANGE', utilisateur: 'Kouyate Makan', role: 'SUPER_ADMIN', cible: 'Ndiaye Fatimata', details: 'Role modifie de ENSEIGNANT a RESPONSABLE_PEDAGOGIQUE', date: '2026-02-28T10:00:00', ip: '192.168.1.100' },
      { id: 14, action: 'Suppression', type: 'DELETE', utilisateur: 'Diagne Abdou', role: 'ADMIN', cible: 'Promotion L1 RT 2024-2025', details: 'Suppression de la promotion archivee', date: '2026-02-28T09:15:00', ip: '192.168.1.105' },
      { id: 15, action: 'Connexion', type: 'LOGIN', utilisateur: 'Kouyate Makan', role: 'SUPER_ADMIN', details: 'Connexion reussie', date: '2026-02-27T08:00:00', ip: '192.168.1.100' },
      { id: 16, action: 'Creation', type: 'CREATE', utilisateur: 'Diagne Abdou', role: 'ADMIN', cible: 'Evaluation Examen Algo', details: 'Nouvelle evaluation creee pour MOD-ALGO', date: '2026-02-26T14:30:00', ip: '192.168.1.105' },
      { id: 17, action: 'Modification', type: 'UPDATE', utilisateur: 'Diop Ibrahima', role: 'ENSEIGNANT', cible: 'Examen Final Spring Boot', details: 'Publication des notes (42 etudiants)', date: '2026-02-25T17:00:00', ip: '192.168.1.120' },
      { id: 18, action: 'Connexion', type: 'LOGIN', utilisateur: 'Ba Ousmane', role: 'ENSEIGNANT', details: 'Connexion echouee — mot de passe incorrect', date: '2026-02-25T08:45:00', ip: '192.168.1.140' },
      { id: 19, action: 'Export', type: 'EXPORT', utilisateur: 'Kouyate Makan', role: 'SUPER_ADMIN', details: 'Export du rapport global annuel', date: '2026-02-24T16:00:00', ip: '192.168.1.100' },
      { id: 20, action: 'Creation', type: 'CREATE', utilisateur: 'Diagne Abdou', role: 'ADMIN', cible: 'Sall Amadou', details: 'Nouvel enseignant ajoute (ENS-2019-002)', date: '2026-02-20T10:30:00', ip: '192.168.1.105' }
    ];
  }
}

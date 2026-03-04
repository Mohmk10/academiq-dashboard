import { Injectable } from '@angular/core';
import { Role, UtilisateurSummary, UtilisateurDetail } from '../models/user.model';
import { AuthResponse, UtilisateurResponse } from '../models/auth.model';
import {
  DashboardAdminDTO, DashboardEnseignantDTO, DashboardEtudiantDTO
} from '../models/analytics.model';
import {
  FiliereResponse, NiveauResponse, PromotionResponse, SemestreResponse,
  UeResponse, ModuleResponse, InscriptionResponse, AffectationResponse
} from '../models/structure.model';
import {
  EvaluationResponse, NoteResponse, NotePrepopuleeDTO
} from '../models/note.model';
import {
  AlerteResponse, StatistiquesAlertesDTO, RegleAlerteResponse
} from '../models/alerte.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  readonly DEV_MODE = false;

  isDevMode(): boolean {
    return this.DEV_MODE;
  }

  // ============================================================
  // HELPERS
  // ============================================================

  wrap<T>(data: T): ApiResponse<T> {
    return { success: true, message: 'OK', data, timestamp: new Date().toISOString() };
  }

  paginate<T>(items: T[], page: number, size: number): PageResponse<T> {
    const start = page * size;
    return {
      content: items.slice(start, start + size),
      pageNumber: page,
      pageSize: size,
      totalElements: items.length,
      totalPages: Math.ceil(items.length / size),
      first: page === 0,
      last: start + size >= items.length
    };
  }

  createFakeJwt(role: Role): string {
    const user = this.getUserByRole(role);
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.email,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 86400 * 365
    }));
    return `${header}.${payload}.dev-signature`;
  }

  getUserByRole(role: Role): { id: number; nom: string; prenom: string; email: string; role: Role; telephone: string; actif: boolean } {
    switch (role) {
      case 'SUPER_ADMIN': return this.superAdminUser;
      case 'RESPONSABLE_PEDAGOGIQUE': return this.responsablePedagogiqueUser;
      case 'ENSEIGNANT': return this.enseignantUser;
      case 'ETUDIANT': return this.etudiantUser;
      default: return this.adminUser;
    }
  }

  getAuthResponse(role: Role): AuthResponse {
    const user = this.getUserByRole(role);
    return {
      accessToken: this.createFakeJwt(role),
      refreshToken: 'fake-refresh-token',
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role
    };
  }

  createFakeBlob(): Blob {
    return new Blob(['Document de demonstration AcademiQ'], { type: 'application/pdf' });
  }

  // ============================================================
  // USER PROFILES
  // ============================================================

  superAdminUser = {
    id: 100, nom: 'Kouyate', prenom: 'Makan', email: 'superadmin@academiq.sn',
    role: 'SUPER_ADMIN' as Role, telephone: '+221781975048', actif: true
  };

  adminUser = {
    id: 1, nom: 'Diagne', prenom: 'Abdou', email: 'admin@academiq.sn',
    role: 'ADMIN' as Role, telephone: '+221781234567', actif: true
  };

  responsablePedagogiqueUser = {
    id: 50, nom: 'Ba', prenom: 'Fatou', email: 'fatou.ba@academiq.sn',
    role: 'RESPONSABLE_PEDAGOGIQUE' as Role, telephone: '+221776543210', actif: true
  };

  enseignantUser = {
    id: 2, nom: 'Diop', prenom: 'Ibrahima', email: 'idiop@academiq.sn',
    role: 'ENSEIGNANT' as Role, telephone: '+221771234567', actif: true
  };

  etudiantUser = {
    id: 3, nom: 'Diallo', prenom: 'Aminata', email: 'adiallo@academiq.sn',
    role: 'ETUDIANT' as Role, telephone: '+221761234567', actif: true
  };

  // ============================================================
  // STUDENTS LIST (15)
  // ============================================================

  etudiants: UtilisateurSummary[] = [
    { id: 3, nom: 'Diallo', prenom: 'Aminata', email: 'adiallo@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-001' },
    { id: 4, nom: 'Sow', prenom: 'Ousmane', email: 'osow@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-002' },
    { id: 5, nom: 'Ba', prenom: 'Mariama', email: 'mba@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-003' },
    { id: 6, nom: 'Ndiaye', prenom: 'Moussa', email: 'mndiaye@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-004' },
    { id: 7, nom: 'Fall', prenom: 'Fatou', email: 'ffall@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-005' },
    { id: 8, nom: 'Sarr', prenom: 'Ibrahima', email: 'isarr@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-006' },
    { id: 9, nom: 'Sy', prenom: 'Aissatou', email: 'asy@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-007' },
    { id: 10, nom: 'Kane', prenom: 'Abdoulaye', email: 'akane@academiq.sn', role: 'ETUDIANT', actif: false, matricule: 'ETU-2025-008' },
    { id: 11, nom: 'Mbaye', prenom: 'Khady', email: 'kmbaye@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-009' },
    { id: 12, nom: 'Gueye', prenom: 'Mamadou', email: 'mgueye@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-010' },
    { id: 13, nom: 'Diop', prenom: 'Rama', email: 'rdiop@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-011' },
    { id: 14, nom: 'Thiam', prenom: 'Boubacar', email: 'bthiam@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-012' },
    { id: 15, nom: 'Niang', prenom: 'Coumba', email: 'cniang@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-013' },
    { id: 16, nom: 'Faye', prenom: 'Lamine', email: 'lfaye@academiq.sn', role: 'ETUDIANT', actif: false, matricule: 'ETU-2025-014' },
    { id: 17, nom: 'Cisse', prenom: 'Djeneba', email: 'dcisse@academiq.sn', role: 'ETUDIANT', actif: true, matricule: 'ETU-2025-015' },
  ];

  // ============================================================
  // TEACHERS LIST (8)
  // ============================================================

  enseignants: UtilisateurSummary[] = [
    { id: 2, nom: 'Diop', prenom: 'Ibrahima', email: 'idiop@academiq.sn', role: 'ENSEIGNANT', actif: true, matricule: 'ENS-2020-001' },
    { id: 20, nom: 'Sall', prenom: 'Amadou', email: 'asall@academiq.sn', role: 'ENSEIGNANT', actif: true, matricule: 'ENS-2019-002' },
    { id: 21, nom: 'Toure', prenom: 'Aissata', email: 'atoure@academiq.sn', role: 'ENSEIGNANT', actif: true, matricule: 'ENS-2021-003' },
    { id: 22, nom: 'Ba', prenom: 'Ousmane', email: 'oba@academiq.sn', role: 'ENSEIGNANT', actif: true, matricule: 'ENS-2018-004' },
    { id: 23, nom: 'Ndiaye', prenom: 'Fatimata', email: 'fndiaye@academiq.sn', role: 'ENSEIGNANT', actif: true, matricule: 'ENS-2020-005' },
    { id: 24, nom: 'Gueye', prenom: 'Cheikh', email: 'cgueye@academiq.sn', role: 'ENSEIGNANT', actif: true, matricule: 'ENS-2017-006' },
    { id: 25, nom: 'Diallo', prenom: 'Mariama', email: 'mdiallo@academiq.sn', role: 'ENSEIGNANT', actif: false, matricule: 'ENS-2022-007' },
    { id: 26, nom: 'Fall', prenom: 'Modou', email: 'mfall@academiq.sn', role: 'ENSEIGNANT', actif: true, matricule: 'ENS-2019-008' },
  ];

  // ============================================================
  // USER DETAIL BUILDERS
  // ============================================================

  private readonly niveaux = ['L1', 'L2', 'L3', 'M1', 'M2'];
  private readonly filieresNames = ['Genie Logiciel', 'Reseaux & Telecoms', 'Systemes d\'Information', 'Data Science', 'Cybersecurite'];
  private readonly specialites = ['Genie Logiciel', 'Reseaux', 'Bases de Donnees', 'Mathematiques', 'Systemes d\'Information', 'Cybersecurite', 'Data Science', 'Physique'];
  private readonly grades = ['Professeur', 'Maitre de conferences', 'Charge de cours', 'Assistant'];

  getEtudiantDetail(id: number): UtilisateurDetail {
    const summary = this.etudiants.find(e => e.id === id) || this.etudiants[0];
    const idx = this.etudiants.indexOf(summary);
    return {
      id: summary.id, nom: summary.nom, prenom: summary.prenom,
      email: summary.email, role: 'ETUDIANT',
      telephone: `+221 77 ${String(100 + idx).padStart(3, '0')} 00 00`,
      dateNaissance: `${2001 + (idx % 4)}-${String(1 + idx % 12).padStart(2, '0')}-${String(5 + idx * 3 % 25).padStart(2, '0')}`,
      adresse: 'Dakar, Senegal', actif: summary.actif, createdAt: '2024-09-15',
      etudiant: {
        id: summary.id, matricule: summary.matricule!,
        niveauActuel: this.niveaux[idx % 5],
        filiereActuelle: this.filieresNames[idx % 5],
        dateInscription: '2024-09-15',
        nomTuteur: `${summary.nom} Senior`,
        numeroTuteur: `+221 76 ${String(200 + idx).padStart(3, '0')} 00 00`,
        statut: summary.actif ? 'ACTIF' : 'SUSPENDU'
      }
    };
  }

  getEnseignantDetail(id: number): UtilisateurDetail {
    const summary = this.enseignants.find(e => e.id === id) || this.enseignants[0];
    const idx = this.enseignants.indexOf(summary);
    return {
      id: summary.id, nom: summary.nom, prenom: summary.prenom,
      email: summary.email, role: 'ENSEIGNANT',
      telephone: `+221 77 ${String(300 + idx).padStart(3, '0')} 00 00`,
      actif: summary.actif, createdAt: `${2017 + idx % 6}-09-01`,
      enseignant: {
        id: summary.id, matricule: summary.matricule!,
        specialite: this.specialites[idx % this.specialites.length],
        grade: this.grades[idx % this.grades.length],
        departement: 'Sciences & Technologies',
        bureau: `B-${200 + idx}`,
        dateRecrutement: `${2017 + idx % 6}-09-01`,
        statut: summary.actif ? 'ACTIF' : 'INACTIF'
      }
    };
  }

  getSuperAdminDetail(): UtilisateurDetail {
    return {
      id: 100, nom: 'Kouyate', prenom: 'Makan', email: 'superadmin@academiq.sn',
      role: 'SUPER_ADMIN', telephone: '+221781975048', actif: true, createdAt: '2024-01-01',
      admin: { id: 100, fonction: 'Super Administrateur', departement: 'Direction Generale', niveau: 'Super Admin' }
    };
  }

  getResponsablePedagogiqueDetail(): UtilisateurDetail {
    return {
      id: 50, nom: 'Ba', prenom: 'Fatou', email: 'fatou.ba@academiq.sn',
      role: 'RESPONSABLE_PEDAGOGIQUE', telephone: '+221776543210', actif: true, createdAt: '2024-03-01',
      admin: { id: 50, fonction: 'Responsable pedagogique', departement: 'Sciences & Technologies', niveau: 'Responsable' }
    };
  }

  getAdminDetail(): UtilisateurDetail {
    return {
      id: 1, nom: 'Diagne', prenom: 'Abdou', email: 'admin@academiq.sn',
      role: 'ADMIN', telephone: '+221781234567', actif: true, createdAt: '2024-01-15',
      admin: { id: 1, fonction: 'Administrateur systeme', departement: 'Direction des Systemes d\'Information', niveau: 'Admin' }
    };
  }

  getUserDetail(id: number): UtilisateurDetail {
    if (id === 100) return this.getSuperAdminDetail();
    if (id === 50) return this.getResponsablePedagogiqueDetail();
    if (id === 1) return this.getAdminDetail();
    if (this.enseignants.find(e => e.id === id)) return this.getEnseignantDetail(id);
    return this.getEtudiantDetail(id);
  }

  getProfileByRole(role: Role): UtilisateurResponse {
    const user = this.getUserByRole(role);
    return {
      id: user.id, nom: user.nom, prenom: user.prenom,
      email: user.email, role: user.role,
      telephone: user.telephone, actif: user.actif,
      createdAt: role === 'SUPER_ADMIN' ? '2024-01-01' : '2024-01-15'
    };
  }

  getAllUsers(): UtilisateurSummary[] {
    return [
      { id: 100, nom: 'Kouyate', prenom: 'Makan', email: 'superadmin@academiq.sn', role: 'SUPER_ADMIN', actif: true },
      { id: 1, nom: 'Diagne', prenom: 'Abdou', email: 'admin@academiq.sn', role: 'ADMIN', actif: true },
      { id: 50, nom: 'Ba', prenom: 'Fatou', email: 'fatou.ba@academiq.sn', role: 'RESPONSABLE_PEDAGOGIQUE', actif: true },
      ...this.enseignants,
      ...this.etudiants
    ];
  }

  // ============================================================
  // DASHBOARD ADMIN
  // ============================================================

  dashboardAdmin: DashboardAdminDTO = {
    totalEtudiants: 285,
    totalEnseignants: 42,
    totalFilieres: 5,
    totalModules: 48,
    alertesActives: 23,
    tauxReussiteGlobal: 73.5,
    moyenneGenerale: 12.34,
    repartitionEtudiants: [
      { label: 'Genie Logiciel', valeur: 119, pourcentage: 41.8 },
      { label: 'Reseaux & Telecoms', valeur: 72, pourcentage: 25.3 },
      { label: 'Systemes d\'Information', valeur: 65, pourcentage: 22.8 },
      { label: 'Data Science', valeur: 18, pourcentage: 6.3 },
      { label: 'Cybersecurite', valeur: 11, pourcentage: 3.9 }
    ],
    evolutionInscriptions: [
      { periode: '2022-2023', valeur: 210 },
      { periode: '2023-2024', valeur: 248 },
      { periode: '2024-2025', valeur: 271 },
      { periode: '2025-2026', valeur: 285 }
    ],
    dernieresAlertes: [
      { id: 1, type: 'RISQUE_ECHEC', message: 'Risque d\'exclusion — 3 modules sous le seuil', etudiantNom: 'Kane Abdoulaye', date: '2026-03-02T14:30:00' },
      { id: 2, type: 'NOTE_BASSE', message: 'Note eliminatoire en BDA (3/20)', etudiantNom: 'Faye Lamine', date: '2026-03-01T10:15:00' },
      { id: 3, type: 'MOYENNE_FAIBLE', message: 'Moyenne generale inferieure a 8/20', etudiantNom: 'Sarr Ibrahima', date: '2026-02-28T16:45:00' },
      { id: 4, type: 'ABSENCE_NOTE', message: 'Note manquante CC2 Spring Boot', etudiantNom: 'Ndiaye Moussa', date: '2026-02-27T09:00:00' },
      { id: 5, type: 'NOTE_BASSE', message: 'Note inferieure au seuil en Algorithmique', etudiantNom: 'Ba Mariama', date: '2026-02-26T11:20:00' }
    ]
  };

  // ============================================================
  // DASHBOARD ENSEIGNANT
  // ============================================================

  dashboardEnseignant: DashboardEnseignantDTO = {
    totalModules: 4,
    totalEtudiants: 157,
    evaluationsEnCours: 3,
    moyenneModules: 12.67,
    modules: [
      { moduleId: 1, moduleNom: 'Spring Boot Avance', moduleCode: 'MOD-SB', nombreEtudiants: 45, moyenneClasse: 12.67, evaluationsCount: 3 },
      { moduleId: 2, moduleNom: 'Architecture Logicielle', moduleCode: 'MOD-AL', nombreEtudiants: 22, moyenneClasse: 14.12, evaluationsCount: 2 },
      { moduleId: 3, moduleNom: 'Base de Donnees Avancees', moduleCode: 'MOD-BDA', nombreEtudiants: 45, moyenneClasse: 9.85, evaluationsCount: 1 },
      { moduleId: 4, moduleNom: 'Programmation Java', moduleCode: 'MOD-JAVA', nombreEtudiants: 52, moyenneClasse: 11.23, evaluationsCount: 4 }
    ],
    alertesRecentes: [
      { id: 1, type: 'NOTE_BASSE', message: 'Note inferieure au seuil en BDA', etudiantNom: 'Kane Abdoulaye', date: '2026-03-01T10:30:00' },
      { id: 2, type: 'MOYENNE_FAIBLE', message: 'Moyenne faible en Programmation Java', etudiantNom: 'Faye Lamine', date: '2026-02-28T14:15:00' },
      { id: 3, type: 'ABSENCE_NOTE', message: 'Note manquante CC2 Spring Boot', etudiantNom: 'Ndiaye Moussa', date: '2026-02-27T09:00:00' }
    ]
  };

  // ============================================================
  // DASHBOARD ETUDIANT
  // ============================================================

  dashboardEtudiant: DashboardEtudiantDTO = {
    moyenneGenerale: 13.47,
    rang: 5,
    totalEtudiants: 45,
    creditValides: 42,
    creditTotal: 60,
    alertesActives: 1,
    resultatsModules: [
      { moduleId: 1, moduleNom: 'Spring Boot Avance', moduleCode: 'MOD-SB', moyenne: 14.5, noteMax: 20, coefficient: 4, statut: 'VALIDE' },
      { moduleId: 2, moduleNom: 'Algorithmique', moduleCode: 'MOD-ALGO', moyenne: 12.0, noteMax: 20, coefficient: 3, statut: 'VALIDE' },
      { moduleId: 3, moduleNom: 'Developpement Web', moduleCode: 'MOD-WEB', moyenne: 15.8, noteMax: 20, coefficient: 3, statut: 'VALIDE' },
      { moduleId: 4, moduleNom: 'Base de Donnees Avancees', moduleCode: 'MOD-BDA', moyenne: 8.5, noteMax: 20, coefficient: 4, statut: 'NON_VALIDE' },
      { moduleId: 5, moduleNom: 'Conception UML', moduleCode: 'MOD-UML', moyenne: 13.2, noteMax: 20, coefficient: 2, statut: 'VALIDE' },
      { moduleId: 6, moduleNom: 'Reseaux', moduleCode: 'MOD-RES', moyenne: 11.7, noteMax: 20, coefficient: 2, statut: 'VALIDE' }
    ],
    evolutionMoyenne: [
      { periode: 'S1 L1', valeur: 10.5 },
      { periode: 'S2 L1', valeur: 11.2 },
      { periode: 'S1 L2', valeur: 12.1 },
      { periode: 'S2 L2', valeur: 12.8 },
      { periode: 'S1 L3', valeur: 13.47 }
    ]
  };

  // ============================================================
  // STRUCTURE
  // ============================================================

  filieres: FiliereResponse[] = [
    {
      id: 1, nom: 'Genie Logiciel', code: 'GL', departement: 'Sciences & Technologies',
      responsable: 'Pr. Ibrahima Diop', actif: true,
      description: 'Formation en developpement logiciel, architecture et genie du logiciel',
      niveaux: [
        { id: 1, nom: 'Licence 1', code: 'L1', ordre: 1, filiereId: 1 },
        { id: 2, nom: 'Licence 2', code: 'L2', ordre: 2, filiereId: 1 },
        { id: 3, nom: 'Licence 3', code: 'L3', ordre: 3, filiereId: 1 },
        { id: 4, nom: 'Master 1', code: 'M1', ordre: 4, filiereId: 1 },
        { id: 5, nom: 'Master 2', code: 'M2', ordre: 5, filiereId: 1 }
      ]
    },
    {
      id: 2, nom: 'Reseaux & Telecoms', code: 'RT', departement: 'Sciences & Technologies',
      responsable: 'Pr. Amadou Sall', actif: true,
      description: 'Formation en reseaux informatiques et telecommunications',
      niveaux: [
        { id: 6, nom: 'Licence 1', code: 'L1', ordre: 1, filiereId: 2 },
        { id: 7, nom: 'Licence 2', code: 'L2', ordre: 2, filiereId: 2 },
        { id: 8, nom: 'Licence 3', code: 'L3', ordre: 3, filiereId: 2 }
      ]
    },
    {
      id: 3, nom: 'Systemes d\'Information', code: 'SI', departement: 'Sciences & Technologies',
      responsable: 'Pr. Fatimata Ndiaye', actif: true,
      description: 'Formation en gestion des systemes d\'information',
      niveaux: [
        { id: 9, nom: 'Licence 1', code: 'L1', ordre: 1, filiereId: 3 },
        { id: 10, nom: 'Licence 2', code: 'L2', ordre: 2, filiereId: 3 },
        { id: 11, nom: 'Licence 3', code: 'L3', ordre: 3, filiereId: 3 }
      ]
    },
    {
      id: 4, nom: 'Data Science', code: 'DS', departement: 'Sciences & Technologies',
      responsable: 'Pr. Mariama Diallo', actif: true,
      description: 'Formation en science des donnees et intelligence artificielle',
      niveaux: [
        { id: 12, nom: 'Master 1', code: 'M1', ordre: 1, filiereId: 4 },
        { id: 13, nom: 'Master 2', code: 'M2', ordre: 2, filiereId: 4 }
      ]
    },
    {
      id: 5, nom: 'Cybersecurite', code: 'CS', departement: 'Sciences & Technologies',
      responsable: 'Pr. Cheikh Gueye', actif: true,
      description: 'Formation en securite informatique et protection des systemes',
      niveaux: [
        { id: 14, nom: 'Master 1', code: 'M1', ordre: 1, filiereId: 5 },
        { id: 15, nom: 'Master 2', code: 'M2', ordre: 2, filiereId: 5 }
      ]
    }
  ];

  niveauxList: NiveauResponse[] = this.filieres.flatMap(f => f.niveaux || []);

  promotions: PromotionResponse[] = [
    { id: 1, anneeUniversitaire: '2025-2026', niveauId: 3, niveauNom: 'L3', filiereNom: 'Genie Logiciel', nombreEtudiants: 45, actif: true },
    { id: 2, anneeUniversitaire: '2025-2026', niveauId: 2, niveauNom: 'L2', filiereNom: 'Genie Logiciel', nombreEtudiants: 52, actif: true },
    { id: 3, anneeUniversitaire: '2025-2026', niveauId: 1, niveauNom: 'L1', filiereNom: 'Genie Logiciel', nombreEtudiants: 65, actif: true },
    { id: 4, anneeUniversitaire: '2025-2026', niveauId: 4, niveauNom: 'M1', filiereNom: 'Genie Logiciel', nombreEtudiants: 22, actif: true },
    { id: 5, anneeUniversitaire: '2025-2026', niveauId: 5, niveauNom: 'M2', filiereNom: 'Genie Logiciel', nombreEtudiants: 18, actif: true },
    { id: 6, anneeUniversitaire: '2025-2026', niveauId: 8, niveauNom: 'L3', filiereNom: 'Reseaux & Telecoms', nombreEtudiants: 38, actif: true },
    { id: 7, anneeUniversitaire: '2025-2026', niveauId: 7, niveauNom: 'L2', filiereNom: 'Reseaux & Telecoms', nombreEtudiants: 42, actif: true },
    { id: 8, anneeUniversitaire: '2025-2026', niveauId: 6, niveauNom: 'L1', filiereNom: 'Reseaux & Telecoms', nombreEtudiants: 55, actif: true },
    { id: 9, anneeUniversitaire: '2025-2026', niveauId: 11, niveauNom: 'L3', filiereNom: 'Systemes d\'Information', nombreEtudiants: 35, actif: true },
    { id: 10, anneeUniversitaire: '2025-2026', niveauId: 10, niveauNom: 'L2', filiereNom: 'Systemes d\'Information', nombreEtudiants: 40, actif: true },
    { id: 11, anneeUniversitaire: '2025-2026', niveauId: 12, niveauNom: 'M1', filiereNom: 'Data Science', nombreEtudiants: 18, actif: true },
    { id: 12, anneeUniversitaire: '2025-2026', niveauId: 14, niveauNom: 'M1', filiereNom: 'Cybersecurite', nombreEtudiants: 11, actif: true }
  ];

  semestres: SemestreResponse[] = [
    { id: 1, nom: 'Semestre 1', numero: 1, promotionId: 1 },
    { id: 2, nom: 'Semestre 2', numero: 2, promotionId: 1 },
    { id: 3, nom: 'Semestre 1', numero: 1, promotionId: 2 },
    { id: 4, nom: 'Semestre 2', numero: 2, promotionId: 2 },
    { id: 5, nom: 'Semestre 1', numero: 1, promotionId: 4 },
    { id: 6, nom: 'Semestre 2', numero: 2, promotionId: 4 }
  ];

  ues: UeResponse[] = [
    { id: 1, nom: 'UE Developpement', code: 'UE-DEV', credit: 12, semestreId: 1, coefficient: 4 },
    { id: 2, nom: 'UE Donnees', code: 'UE-DATA', credit: 8, semestreId: 1, coefficient: 3 },
    { id: 3, nom: 'UE Fondamentaux', code: 'UE-FOND', credit: 8, semestreId: 2, coefficient: 3 },
    { id: 4, nom: 'UE Reseaux', code: 'UE-RES', credit: 6, semestreId: 2, coefficient: 2 },
    { id: 5, nom: 'UE Securite', code: 'UE-SEC', credit: 6, semestreId: 5, coefficient: 2 },
    { id: 6, nom: 'UE Data Science', code: 'UE-DS', credit: 8, semestreId: 5, coefficient: 3 },
    { id: 7, nom: 'UE Transversales', code: 'UE-TRANS', credit: 4, semestreId: 2, coefficient: 1 }
  ];

  modules: ModuleResponse[] = [
    { id: 1, nom: 'Spring Boot Avance', code: 'MOD-SB', coefficient: 4, ueId: 1, ueNom: 'UE Developpement', enseignantId: 2, enseignantNom: 'Diop Ibrahima', volumeHoraire: 60 },
    { id: 2, nom: 'Architecture Logicielle', code: 'MOD-AL', coefficient: 3, ueId: 1, ueNom: 'UE Developpement', enseignantId: 2, enseignantNom: 'Diop Ibrahima', volumeHoraire: 45 },
    { id: 3, nom: 'Base de Donnees Avancees', code: 'MOD-BDA', coefficient: 4, ueId: 2, ueNom: 'UE Donnees', enseignantId: 21, enseignantNom: 'Toure Aissata', volumeHoraire: 60 },
    { id: 4, nom: 'Programmation Java', code: 'MOD-JAVA', coefficient: 3, ueId: 1, ueNom: 'UE Developpement', enseignantId: 2, enseignantNom: 'Diop Ibrahima', volumeHoraire: 50 },
    { id: 5, nom: 'Algorithmique Avancee', code: 'MOD-ALGO', coefficient: 3, ueId: 3, ueNom: 'UE Fondamentaux', enseignantId: 22, enseignantNom: 'Ba Ousmane', volumeHoraire: 45 },
    { id: 6, nom: 'Reseaux IP', code: 'MOD-RES', coefficient: 3, ueId: 4, ueNom: 'UE Reseaux', enseignantId: 20, enseignantNom: 'Sall Amadou', volumeHoraire: 50 },
    { id: 7, nom: 'Developpement Web', code: 'MOD-WEB', coefficient: 3, ueId: 1, ueNom: 'UE Developpement', enseignantId: 23, enseignantNom: 'Ndiaye Fatimata', volumeHoraire: 50 },
    { id: 8, nom: 'Conception UML', code: 'MOD-UML', coefficient: 2, ueId: 3, ueNom: 'UE Fondamentaux', enseignantId: 2, enseignantNom: 'Diop Ibrahima', volumeHoraire: 30 },
    { id: 9, nom: 'Securite Informatique', code: 'MOD-SEC', coefficient: 3, ueId: 5, ueNom: 'UE Securite', enseignantId: 24, enseignantNom: 'Gueye Cheikh', volumeHoraire: 45 },
    { id: 10, nom: 'Machine Learning', code: 'MOD-ML', coefficient: 4, ueId: 6, ueNom: 'UE Data Science', enseignantId: 25, enseignantNom: 'Diallo Mariama', volumeHoraire: 60 },
    { id: 11, nom: 'Systemes Distribues', code: 'MOD-SD', coefficient: 3, ueId: 3, ueNom: 'UE Fondamentaux', enseignantId: 26, enseignantNom: 'Fall Modou', volumeHoraire: 45 },
    { id: 12, nom: 'Anglais Technique', code: 'MOD-ANG', coefficient: 2, ueId: 7, ueNom: 'UE Transversales', enseignantId: 26, enseignantNom: 'Fall Modou', volumeHoraire: 25 }
  ];

  inscriptions: InscriptionResponse[] = this.etudiants.slice(0, 10).map((e, i) => ({
    id: i + 1,
    etudiantId: e.id,
    etudiantNom: `${e.prenom} ${e.nom}`,
    etudiantMatricule: e.matricule!,
    promotionId: 1,
    promotionNom: 'L3 Genie Logiciel 2025-2026',
    dateInscription: '2025-09-15',
    statut: e.actif ? 'INSCRIT' : 'SUSPENDU'
  }));

  affectations: AffectationResponse[] = this.modules.slice(0, 8).map((m, i) => ({
    id: i + 1,
    enseignantId: m.enseignantId!,
    enseignantNom: m.enseignantNom!,
    moduleId: m.id,
    moduleNom: m.nom
  }));

  // ============================================================
  // EVALUATIONS & NOTES
  // ============================================================

  evaluations: EvaluationResponse[] = [
    { id: 1, moduleId: 1, moduleNom: 'Spring Boot Avance', moduleCode: 'MOD-SB', promotionId: 1, promotionNom: 'L3 GL 2025-2026', type: 'EXAMEN', nom: 'Examen Final Spring Boot', coefficient: 2, noteMax: 20, nombreNotesSaisies: 42, nombreEtudiantsInscrits: 45, publiee: true, date: '2026-02-15' },
    { id: 2, moduleId: 1, moduleNom: 'Spring Boot Avance', moduleCode: 'MOD-SB', promotionId: 1, promotionNom: 'L3 GL 2025-2026', type: 'CONTROLE_CONTINU', nom: 'CC1 Spring Boot', coefficient: 1, noteMax: 20, nombreNotesSaisies: 45, nombreEtudiantsInscrits: 45, publiee: true, date: '2026-01-20' },
    { id: 3, moduleId: 1, moduleNom: 'Spring Boot Avance', moduleCode: 'MOD-SB', promotionId: 1, promotionNom: 'L3 GL 2025-2026', type: 'CONTROLE_CONTINU', nom: 'CC2 Spring Boot', coefficient: 1, noteMax: 20, nombreNotesSaisies: 38, nombreEtudiantsInscrits: 45, publiee: false, date: '2026-02-28' },
    { id: 4, moduleId: 2, moduleNom: 'Architecture Logicielle', moduleCode: 'MOD-AL', promotionId: 4, promotionNom: 'M1 GL 2025-2026', type: 'EXAMEN', nom: 'Examen Architecture', coefficient: 2, noteMax: 20, nombreNotesSaisies: 22, nombreEtudiantsInscrits: 22, publiee: true, date: '2026-02-10' },
    { id: 5, moduleId: 2, moduleNom: 'Architecture Logicielle', moduleCode: 'MOD-AL', promotionId: 4, promotionNom: 'M1 GL 2025-2026', type: 'PROJET', nom: 'Projet Architecture', coefficient: 1, noteMax: 20, nombreNotesSaisies: 20, nombreEtudiantsInscrits: 22, publiee: false, date: '2026-03-01' },
    { id: 6, moduleId: 3, moduleNom: 'Base de Donnees Avancees', moduleCode: 'MOD-BDA', promotionId: 1, promotionNom: 'L3 GL 2025-2026', type: 'CONTROLE_CONTINU', nom: 'CC1 BDA', coefficient: 1, noteMax: 20, nombreNotesSaisies: 45, nombreEtudiantsInscrits: 45, publiee: true, date: '2026-01-15' },
    { id: 7, moduleId: 4, moduleNom: 'Programmation Java', moduleCode: 'MOD-JAVA', promotionId: 2, promotionNom: 'L2 GL 2025-2026', type: 'EXAMEN', nom: 'Examen Java', coefficient: 2, noteMax: 20, nombreNotesSaisies: 45, nombreEtudiantsInscrits: 52, publiee: false, date: '2026-02-20' },
    { id: 8, moduleId: 4, moduleNom: 'Programmation Java', moduleCode: 'MOD-JAVA', promotionId: 2, promotionNom: 'L2 GL 2025-2026', type: 'TP', nom: 'TP3 Java Collections', coefficient: 1, noteMax: 20, nombreNotesSaisies: 52, nombreEtudiantsInscrits: 52, publiee: true, date: '2026-02-05' },
    { id: 9, moduleId: 5, moduleNom: 'Algorithmique Avancee', moduleCode: 'MOD-ALGO', promotionId: 1, promotionNom: 'L3 GL 2025-2026', type: 'EXAMEN', nom: 'Examen Algo', coefficient: 2, noteMax: 20, nombreNotesSaisies: 0, nombreEtudiantsInscrits: 45, publiee: false, date: '2026-03-10' },
    { id: 10, moduleId: 7, moduleNom: 'Developpement Web', moduleCode: 'MOD-WEB', promotionId: 1, promotionNom: 'L3 GL 2025-2026', type: 'PROJET', nom: 'Projet Angular', coefficient: 1, noteMax: 20, nombreNotesSaisies: 40, nombreEtudiantsInscrits: 45, publiee: true, date: '2026-02-25' }
  ];

  notesEtudiant: NoteResponse[] = [
    { id: 1, evaluationId: 1, evaluationNom: 'Examen Final Spring Boot', etudiantId: 3, etudiantNom: 'Diallo Aminata', etudiantMatricule: 'ETU-2025-001', valeur: 15.5, noteMax: 20, saisieParId: 2, saisieParNom: 'Diop Ibrahima', dateSaisie: '2026-02-16' },
    { id: 2, evaluationId: 2, evaluationNom: 'CC1 Spring Boot', etudiantId: 3, etudiantNom: 'Diallo Aminata', etudiantMatricule: 'ETU-2025-001', valeur: 13.0, noteMax: 20, saisieParId: 2, saisieParNom: 'Diop Ibrahima', dateSaisie: '2026-01-21' },
    { id: 3, evaluationId: 3, evaluationNom: 'CC2 Spring Boot', etudiantId: 3, etudiantNom: 'Diallo Aminata', etudiantMatricule: 'ETU-2025-001', valeur: 15.5, noteMax: 20, saisieParId: 2, saisieParNom: 'Diop Ibrahima', dateSaisie: '2026-02-28' },
    { id: 4, evaluationId: 6, evaluationNom: 'CC1 BDA', etudiantId: 3, etudiantNom: 'Diallo Aminata', etudiantMatricule: 'ETU-2025-001', valeur: 7.5, noteMax: 20, saisieParId: 21, saisieParNom: 'Toure Aissata', dateSaisie: '2026-01-16' },
    { id: 5, evaluationId: 9, evaluationNom: 'Examen Algo', etudiantId: 3, etudiantNom: 'Diallo Aminata', etudiantMatricule: 'ETU-2025-001', valeur: 12.0, noteMax: 20, saisieParId: 22, saisieParNom: 'Ba Ousmane', dateSaisie: '2026-02-20' },
    { id: 6, evaluationId: 10, evaluationNom: 'Projet Angular', etudiantId: 3, etudiantNom: 'Diallo Aminata', etudiantMatricule: 'ETU-2025-001', valeur: 17.0, noteMax: 20, saisieParId: 23, saisieParNom: 'Ndiaye Fatimata', dateSaisie: '2026-02-26' }
  ];

  getNotesPrepopulees(): NotePrepopuleeDTO[] {
    return this.etudiants.slice(0, 10).map((e, i) => ({
      etudiantId: e.id,
      etudiantNom: e.nom,
      etudiantPrenom: e.prenom,
      matricule: e.matricule!,
      noteExistante: i < 6 ? [14, 16.5, 8, 12.5, 15, 9.5][i] : undefined,
      commentaire: i === 1 ? 'Excellent travail' : undefined
    }));
  }

  // ============================================================
  // ALERTES
  // ============================================================

  alertes: AlerteResponse[] = [
    { id: 1, type: 'RISQUE_ECHEC', statut: 'ACTIVE', message: 'Risque d\'exclusion — 3 modules sous le seuil', etudiantId: 10, etudiantNom: 'Kane Abdoulaye', etudiantMatricule: 'ETU-2025-008', createdAt: '2026-03-02T14:30:00' },
    { id: 2, type: 'NOTE_BASSE', statut: 'ACTIVE', message: 'Note eliminatoire en BDA (3/20)', etudiantId: 16, etudiantNom: 'Faye Lamine', etudiantMatricule: 'ETU-2025-014', moduleNom: 'Base de Donnees Avancees', valeurNote: 3, seuil: 5, createdAt: '2026-03-01T10:15:00' },
    { id: 3, type: 'MOYENNE_FAIBLE', statut: 'ACTIVE', message: 'Moyenne generale inferieure a 8/20', etudiantId: 8, etudiantNom: 'Sarr Ibrahima', etudiantMatricule: 'ETU-2025-006', valeurNote: 7.5, seuil: 8, createdAt: '2026-02-28T16:45:00' },
    { id: 4, type: 'ABSENCE_NOTE', statut: 'ACTIVE', message: 'Note manquante pour CC2 Spring Boot', etudiantId: 6, etudiantNom: 'Ndiaye Moussa', etudiantMatricule: 'ETU-2025-004', evaluationNom: 'CC2 Spring Boot', createdAt: '2026-02-27T09:00:00' },
    { id: 5, type: 'NOTE_BASSE', statut: 'ACTIVE', message: 'Note inferieure au seuil en Algorithmique (4.5/20)', etudiantId: 5, etudiantNom: 'Ba Mariama', etudiantMatricule: 'ETU-2025-003', moduleNom: 'Algorithmique', valeurNote: 4.5, seuil: 5, createdAt: '2026-02-26T11:20:00' },
    { id: 6, type: 'MOYENNE_FAIBLE', statut: 'TRAITEE', message: 'Moyenne du module inferieure a 10/20', etudiantId: 4, etudiantNom: 'Sow Ousmane', etudiantMatricule: 'ETU-2025-002', moduleNom: 'Reseaux IP', valeurNote: 9.2, seuil: 10, createdAt: '2026-02-25T08:00:00', traitePar: 'Pr. Sall', commentaireTraitement: 'Convocation envoyee' },
    { id: 7, type: 'RISQUE_ECHEC', statut: 'TRAITEE', message: 'Risque d\'echec — moyenne < 8/20 sur 2 semestres', etudiantId: 14, etudiantNom: 'Thiam Boubacar', etudiantMatricule: 'ETU-2025-012', createdAt: '2026-02-24T15:30:00', traitePar: 'Admin', commentaireTraitement: 'Entretien programme' },
    { id: 8, type: 'ABSENCE_NOTE', statut: 'RESOLUE', message: 'Note rattrapee apres absence justifiee', etudiantId: 9, etudiantNom: 'Sy Aissatou', etudiantMatricule: 'ETU-2025-007', evaluationNom: 'Examen Java', createdAt: '2026-02-20T10:00:00', traitePar: 'Pr. Diop', commentaireTraitement: 'Rattrapage effectue', dateTraitement: '2026-02-22T14:00:00' },
    { id: 9, type: 'NOTE_BASSE', statut: 'RESOLUE', message: 'Note corrigee apres reclamation', etudiantId: 11, etudiantNom: 'Mbaye Khady', etudiantMatricule: 'ETU-2025-009', moduleNom: 'Programmation Java', createdAt: '2026-02-18T09:00:00', traitePar: 'Pr. Diop', dateTraitement: '2026-02-20T11:00:00' },
    { id: 10, type: 'MOYENNE_FAIBLE', statut: 'ACTIVE', message: 'Moyenne du module BDA inferieure a 10/20', etudiantId: 3, etudiantNom: 'Diallo Aminata', etudiantMatricule: 'ETU-2025-001', moduleNom: 'Base de Donnees Avancees', valeurNote: 8.5, seuil: 10, createdAt: '2026-02-15T16:00:00' },
    { id: 11, type: 'CUSTOM', statut: 'ACTIVE', message: 'Retard repete en cours de Spring Boot', etudiantId: 12, etudiantNom: 'Gueye Mamadou', etudiantMatricule: 'ETU-2025-010', createdAt: '2026-02-14T08:30:00' },
    { id: 12, type: 'NOTE_BASSE', statut: 'TRAITEE', message: 'Note eliminatoire en Machine Learning (2/20)', etudiantId: 12, etudiantNom: 'Gueye Mamadou', etudiantMatricule: 'ETU-2025-010', moduleNom: 'Machine Learning', valeurNote: 2, seuil: 5, createdAt: '2026-02-12T14:00:00', traitePar: 'Admin' },
    { id: 13, type: 'ABSENCE_NOTE', statut: 'ACTIVE', message: 'Note manquante pour TP3 Java', etudiantId: 15, etudiantNom: 'Niang Coumba', etudiantMatricule: 'ETU-2025-013', evaluationNom: 'TP3 Java Collections', createdAt: '2026-02-10T11:00:00' },
    { id: 14, type: 'MOYENNE_FAIBLE', statut: 'RESOLUE', message: 'Moyenne relevee apres examen de rattrapage', etudiantId: 13, etudiantNom: 'Diop Rama', etudiantMatricule: 'ETU-2025-011', createdAt: '2026-02-08T09:30:00' },
    { id: 15, type: 'RISQUE_ECHEC', statut: 'ACTIVE', message: 'Risque d\'exclusion — absences non justifiees', etudiantId: 16, etudiantNom: 'Faye Lamine', etudiantMatricule: 'ETU-2025-014', createdAt: '2026-02-05T10:00:00' }
  ];

  alerteStats: StatistiquesAlertesDTO = {
    totalAlertes: 15,
    alertesActives: 8,
    alertesTraitees: 3,
    alertesResolues: 3,
    parType: { 'RISQUE_ECHEC': 3, 'NOTE_BASSE': 4, 'MOYENNE_FAIBLE': 4, 'ABSENCE_NOTE': 3, 'CUSTOM': 1 },
    evolution: [
      { periode: '2026-01', count: 4 },
      { periode: '2026-02', count: 8 },
      { periode: '2026-03', count: 3 }
    ]
  };

  reglesAlerte: RegleAlerteResponse[] = [
    { id: 1, type: 'MOYENNE_FAIBLE', seuil: 10, actif: true, description: 'Alerte si la moyenne du module est inferieure a 10/20', createdAt: '2025-09-01' },
    { id: 2, type: 'NOTE_BASSE', seuil: 5, actif: true, description: 'Alerte si une note est inferieure a 5/20 (eliminatoire)', createdAt: '2025-09-01' },
    { id: 3, type: 'RISQUE_ECHEC', seuil: 8, actif: true, description: 'Alerte si la moyenne generale est inferieure a 8/20', createdAt: '2025-09-01' },
    { id: 4, type: 'ABSENCE_NOTE', seuil: 0, actif: true, description: 'Alerte si note manquante pour evaluation publiee', createdAt: '2025-09-01' },
    { id: 5, type: 'CUSTOM', seuil: 3, actif: false, description: 'Alerte personnalisee pour absences repetees (> 3)', createdAt: '2025-10-15' }
  ];

  // ============================================================
  // USER STATS (settings page)
  // ============================================================

  userStats = { superAdmins: 1, admins: 2, responsables: 1, enseignants: 8, etudiants: 15, comptesInactifs: 3 };
}

export interface DashboardAdminDTO {
  totalEtudiants: number;
  totalEnseignants: number;
  totalFilieres: number;
  totalModules: number;
  alertesActives: number;
  tauxReussiteGlobal: number;
  moyenneGenerale: number;
  repartitionEtudiants: RepartitionDTO[];
  evolutionInscriptions: EvolutionDTO[];
  dernieresAlertes: DerniereAlerteDTO[];
}

export interface DashboardEnseignantDTO {
  totalModules: number;
  totalEtudiants: number;
  evaluationsEnCours: number;
  moyenneModules: number;
  modules: ModuleEnseignantDTO[];
  alertesRecentes: DerniereAlerteDTO[];
}

export interface DashboardEtudiantDTO {
  moyenneGenerale: number;
  rang?: number;
  totalEtudiants?: number;
  creditValides: number;
  creditTotal: number;
  alertesActives: number;
  resultatsModules: ResultatModuleDTO[];
  evolutionMoyenne: EvolutionDTO[];
}

export interface RepartitionDTO {
  label: string;
  valeur: number;
  pourcentage: number;
}

export interface EvolutionDTO {
  periode: string;
  valeur: number;
}

export interface DerniereAlerteDTO {
  id: number;
  type: string;
  message: string;
  etudiantNom: string;
  date: string;
}

export interface ModuleEnseignantDTO {
  moduleId: number;
  moduleNom: string;
  moduleCode: string;
  nombreEtudiants: number;
  moyenneClasse: number;
  evaluationsCount: number;
}

export interface ResultatModuleDTO {
  moduleId: number;
  moduleNom: string;
  moduleCode: string;
  moyenne: number;
  noteMax: number;
  coefficient: number;
  statut: string;
}

export interface TauxReussiteDTO {
  promotionId: number;
  promotionNom: string;
  tauxReussite: number;
  totalEtudiants: number;
  totalReussis: number;
}

export interface DistributionNotesDTO {
  moduleId: number;
  moduleNom: string;
  tranches: TrancheDistributionDTO[];
}

export interface TrancheDistributionDTO {
  label: string;
  min: number;
  max: number;
  count: number;
  pourcentage: number;
}

export interface ComparaisonPromotionsDTO {
  promotions: PromotionStatsDTO[];
}

export interface PromotionStatsDTO {
  promotionId: number;
  promotionNom: string;
  anneeUniversitaire: string;
  moyenneGenerale: number;
  tauxReussite: number;
  nombreEtudiants: number;
}

export interface EvolutionPerformanceDTO {
  periodes: string[];
  moyennes: number[];
  tauxReussite: number[];
}

export interface BulletinEtudiantDTO {
  etudiantId: number;
  etudiantNom: string;
  etudiantPrenom: string;
  matricule: string;
  promotionNom: string;
  anneeUniversitaire: string;
  semestres: BulletinSemestreDTO[];
  moyenneGenerale: number;
  creditsTotalValides: number;
  creditsTotalRequis: number;
  rang?: number;
  mention?: string;
}

export interface BulletinSemestreDTO {
  semestreId: number;
  semestreNom: string;
  ues: BulletinUeDTO[];
  moyenneSemestre: number;
  creditsValides: number;
  creditsRequis: number;
}

export interface BulletinUeDTO {
  ueId: number;
  ueNom: string;
  ueCode: string;
  credit: number;
  modules: BulletinModuleDTO[];
  moyenneUe: number;
  validee: boolean;
}

export interface BulletinModuleDTO {
  moduleId: number;
  moduleNom: string;
  moduleCode: string;
  coefficient: number;
  moyenne: number;
  noteMax: number;
  statut: string;
}

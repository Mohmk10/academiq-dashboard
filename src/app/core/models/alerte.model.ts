export type TypeAlerte = 'MOYENNE_FAIBLE' | 'ABSENCES_REPETEES' | 'CHUTE_PERFORMANCE' | 'RISQUE_EXCLUSION' | 'NOTE_ELIMINATOIRE' | 'NON_ASSIDUITE';
export type StatutAlerte = 'ACTIVE' | 'TRAITEE' | 'RESOLUE' | 'IGNOREE';
export type NiveauAlerte = 'INFO' | 'ATTENTION' | 'CRITIQUE';

export interface AlerteResponse {
  id: number;
  type: TypeAlerte;
  statut: StatutAlerte;
  message: string;
  etudiantId: number;
  etudiantNom: string;
  etudiantMatricule: string;
  moduleId?: number;
  moduleNom?: string;
  evaluationId?: number;
  evaluationNom?: string;
  valeurNote?: number;
  seuil?: number;
  createdAt: string;
  traitePar?: string;
  dateTraitement?: string;
  commentaireTraitement?: string;
}

export interface TraiterAlerteRequest {
  commentaire: string;
}

export interface RegleAlerteRequest {
  nom: string;
  type: TypeAlerte;
  niveauAlerte: NiveauAlerte;
  seuil: number;
  description?: string;
  seuilCritique?: number;
  nombreMaxAbsences?: number;
  pourcentageBaisse?: number;
}

export interface RegleAlerteResponse {
  id: number;
  nom: string;
  type: TypeAlerte;
  niveauAlerte: NiveauAlerte;
  seuil: number;
  actif: boolean;
  description?: string;
  seuilCritique?: number;
  nombreMaxAbsences?: number;
  pourcentageBaisse?: number;
}

export interface StatistiquesAlertesDTO {
  totalActives: number;
  totalCritiques: number;
  totalAttention: number;
  totalTraitees: number;
  totalResolues: number;
  parType: { [key: string]: number };
}
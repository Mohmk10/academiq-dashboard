export type TypeAlerte = 'NOTE_BASSE' | 'ABSENCE_NOTE' | 'MOYENNE_FAIBLE' | 'RISQUE_ECHEC' | 'CUSTOM';
export type StatutAlerte = 'ACTIVE' | 'TRAITEE' | 'RESOLUE' | 'IGNOREE';

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
  type: TypeAlerte;
  seuil: number;
  actif: boolean;
  description?: string;
}

export interface RegleAlerteResponse {
  id: number;
  type: TypeAlerte;
  seuil: number;
  actif: boolean;
  description?: string;
  createdAt: string;
}

export interface StatistiquesAlertesDTO {
  totalAlertes: number;
  alertesActives: number;
  alertesTraitees: number;
  alertesResolues: number;
  parType: { [key: string]: number };
  evolution: EvolutionAlertesDTO[];
}

export interface EvolutionAlertesDTO {
  periode: string;
  count: number;
}

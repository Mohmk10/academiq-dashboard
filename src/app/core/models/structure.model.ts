export interface FiliereRequest {
  nom: string;
  code: string;
  description?: string;
  departement?: string;
  responsableId?: number;
}

export interface FiliereResponse {
  id: number;
  nom: string;
  code: string;
  description?: string;
  departement?: string;
  responsable?: string;
  niveaux?: NiveauResponse[];
  actif: boolean;
}

export interface NiveauRequest {
  nom: string;
  code: string;
  ordre: number;
  filiereId: number;
}

export interface NiveauResponse {
  id: number;
  nom: string;
  code: string;
  ordre: number;
  filiereId: number;
  filiereNom?: string;
  promotions?: PromotionResponse[];
}

export interface PromotionRequest {
  anneeUniversitaire: string;
  niveauId: number;
  dateDebut?: string;
  dateFin?: string;
}

export interface PromotionResponse {
  id: number;
  anneeUniversitaire: string;
  niveauId: number;
  niveauNom?: string;
  filiereNom?: string;
  dateDebut?: string;
  dateFin?: string;
  nombreEtudiants?: number;
  semestres?: SemestreResponse[];
  actif: boolean;
}

export interface SemestreRequest {
  nom: string;
  numero: number;
  promotionId: number;
  dateDebut?: string;
  dateFin?: string;
}

export interface SemestreResponse {
  id: number;
  nom: string;
  numero: number;
  promotionId: number;
  dateDebut?: string;
  dateFin?: string;
  ues?: UeResponse[];
}

export interface UeRequest {
  nom: string;
  code: string;
  credit: number;
  semestreId: number;
  coefficient?: number;
}

export interface UeResponse {
  id: number;
  nom: string;
  code: string;
  credit: number;
  coefficient?: number;
  semestreId: number;
  semestreNom?: string;
  modules?: ModuleResponse[];
}

export interface ModuleRequest {
  nom: string;
  code: string;
  coefficient: number;
  ueId: number;
  enseignantId?: number;
  volumeHoraire?: number;
}

export interface ModuleResponse {
  id: number;
  nom: string;
  code: string;
  coefficient: number;
  ueId: number;
  ueNom?: string;
  enseignantId?: number;
  enseignantNom?: string;
  volumeHoraire?: number;
}

export interface InscriptionRequest {
  etudiantId: number;
  promotionId: number;
  dateInscription?: string;
}

export interface InscriptionResponse {
  id: number;
  etudiantId: number;
  etudiantNom: string;
  etudiantMatricule: string;
  promotionId: number;
  promotionNom: string;
  dateInscription: string;
  statut: string;
}

export interface AffectationRequest {
  enseignantId: number;
  moduleId: number;
}

export interface AffectationResponse {
  id: number;
  enseignantId: number;
  enseignantNom: string;
  moduleId: number;
  moduleNom: string;
}

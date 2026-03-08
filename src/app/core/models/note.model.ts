export type TypeEvaluation = 'CC' | 'TP' | 'PARTIEL' | 'EXAMEN' | 'RATTRAPAGE' | 'PROJET' | 'ORAL';

export interface EvaluationRequest {
  moduleId: number;
  promotionId: number;
  type: TypeEvaluation;
  nom: string;
  coefficient: number;
  date?: string;
  noteMax?: number;
}

export interface EvaluationResponse {
  id: number;
  moduleId: number;
  moduleNom: string;
  moduleCode: string;
  promotionId: number;
  promotionNom: string;
  type: TypeEvaluation;
  nom: string;
  coefficient: number;
  date?: string;
  noteMax: number;
  nombreNotesSaisies: number;
  nombreEtudiantsInscrits: number;
  publiee: boolean;
}

export interface NoteSaisieRequest {
  evaluationId: number;
  etudiantId: number;
  valeur: number;
  commentaire?: string;
}

export interface SaisieEnMasseRequest {
  evaluationId: number;
  notes: NoteSaisieUnitaire[];
}

export interface NoteSaisieUnitaire {
  etudiantId: number;
  valeur: number;
  commentaire?: string;
}

export interface NoteResponse {
  id: number;
  evaluationId: number;
  evaluationNom: string;
  etudiantId: number;
  etudiantNom: string;
  etudiantMatricule: string;
  valeur: number;
  noteMax: number;
  commentaire?: string;
  saisieParId: number;
  saisieParNom: string;
  dateSaisie: string;
}

export interface NotePrepopuleeDTO {
  etudiantId: number;
  etudiantNom: string;
  etudiantPrenom: string;
  matricule: string;
  noteExistante?: number;
  commentaire?: string;
}

export interface SaisieEnMasseResult {
  totalTraitees: number;
  totalSucces: number;
  totalEchecs: number;
  erreurs: string[];
}

export interface StatistiquesEvaluationDTO {
  evaluationId: number;
  evaluationNom: string;
  moyenne: number;
  mediane: number;
  ecartType: number;
  noteMin: number;
  noteMax: number;
  tauxReussite: number;
  nombreNotes: number;
  distribution: TrancheDTO[];
}

export interface TrancheDTO {
  label: string;
  min: number;
  max: number;
  count: number;
  pourcentage: number;
}

export interface RecapitulatifEtudiantDTO {
  etudiantId: number;
  etudiantNom: string;
  matricule: string;
  modules: RecapModuleDTO[];
  moyenneGenerale: number;
  rang?: number;
}

export interface RecapModuleDTO {
  moduleId: number;
  moduleNom: string;
  moduleCode: string;
  notes: NoteDetailDTO[];
  moyenneModule: number;
  coefficient: number;
}

export interface NoteDetailDTO {
  evaluationNom: string;
  type: TypeEvaluation;
  valeur: number;
  noteMax: number;
  coefficient: number;
}

export interface RecapitulatifModuleDTO {
  moduleId: number;
  moduleNom: string;
  moduleCode: string;
  enseignantNom: string;
  etudiants: EtudiantRecapDTO[];
  moyenneClasse: number;
  tauxReussite: number;
}

export interface EtudiantRecapDTO {
  etudiantId: number;
  etudiantNom: string;
  matricule: string;
  notes: NoteDetailDTO[];
  moyenneModule: number;
}

export interface ImportResult {
  totalTraitees: number;
  totalSucces: number;
  totalEchecs: number;
  erreurs: string[];
}

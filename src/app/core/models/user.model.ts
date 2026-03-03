export type Role = 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT' | 'RESPONSABLE_PEDAGOGIQUE';

export interface UtilisateurSummary {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  actif: boolean;
  matricule?: string;
}

export interface UtilisateurDetail {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  telephone?: string;
  dateNaissance?: string;
  adresse?: string;
  photoProfil?: string;
  actif: boolean;
  dernierLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  etudiant?: EtudiantInfo;
  enseignant?: EnseignantInfo;
  admin?: AdminInfo;
}

export interface EtudiantInfo {
  id: number;
  matricule: string;
  niveauActuel?: string;
  filiereActuelle?: string;
  dateInscription?: string;
  numeroTuteur?: string;
  nomTuteur?: string;
  statut: string;
}

export interface EnseignantInfo {
  id: number;
  matricule: string;
  specialite: string;
  grade?: string;
  departement?: string;
  bureau?: string;
  dateRecrutement?: string;
  statut: string;
}

export interface AdminInfo {
  id: number;
  fonction: string;
  departement?: string;
  niveau: string;
}

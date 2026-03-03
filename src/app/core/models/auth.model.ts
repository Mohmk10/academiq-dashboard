export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  dateNaissance?: string;
  adresse?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

export interface ChangePasswordRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
  confirmationMotDePasse: string;
}

export interface UtilisateurResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  telephone?: string;
  dateNaissance?: string;
  adresse?: string;
  photoProfil?: string;
  actif: boolean;
  dernierLogin?: string;
  createdAt?: string;
}

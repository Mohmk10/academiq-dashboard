import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen flex flex-col lg:flex-row">
      <!-- Branding Panel -->
      <div class="lg:w-1/2 bg-primary text-white flex flex-col justify-center items-center p-8 lg:p-16 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full"></div>
          <div class="absolute bottom-20 right-10 w-64 h-64 border-2 border-white rounded-full"></div>
          <div class="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-accent rotate-45"></div>
        </div>
        <div class="relative z-10 text-center fade-in">
          <div class="flex items-center justify-center gap-3 mb-6">
            <i class="fas fa-graduation-cap text-accent text-5xl"></i>
            <h1 class="text-5xl font-bold tracking-tight">AcademiQ</h1>
          </div>
          <p class="text-lg text-gray-300 max-w-md leading-relaxed">
            Plateforme intelligente de gestion des notes et suivi pédagogique
          </p>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div class="w-full max-w-md fade-in">
          <div class="lg:hidden flex items-center gap-2 mb-6">
            <i class="fas fa-graduation-cap text-secondary text-2xl"></i>
            <span class="text-2xl font-bold text-primary">AcademiQ</span>
          </div>

          @if (!emailSent) {
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-primary">Mot de passe oublié</h2>
              <p class="text-gray-500 mt-2">Entrez votre adresse email pour recevoir un lien de réinitialisation</p>
            </div>

            <form (ngSubmit)="onSubmit()" class="space-y-5">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Adresse email</mat-label>
                <mat-icon matPrefix class="mr-2 text-gray-400">email</mat-icon>
                <input matInput type="email" [formControl]="emailControl" placeholder="exemple@academiq.com">
                @if (emailControl.hasError('required') && emailControl.touched) {
                  <mat-error>L'adresse email est requise</mat-error>
                }
                @if (emailControl.hasError('email') && emailControl.touched) {
                  <mat-error>Veuillez entrer une adresse email valide</mat-error>
                }
              </mat-form-field>

              <button mat-raised-button type="submit" class="w-full !bg-secondary !text-white h-12 text-base font-semibold" [disabled]="emailControl.invalid">
                Envoyer le lien de réinitialisation
              </button>
            </form>
          } @else {
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check text-2xl text-success"></i>
              </div>
              <h2 class="text-2xl font-bold text-primary mb-2">Email envoyé</h2>
              <p class="text-gray-500 mb-6">
                Si un compte existe avec l'adresse <strong>{{ emailControl.value }}</strong>, un lien de réinitialisation a été envoyé.
              </p>
              <p class="text-sm text-gray-400">Vérifiez votre boîte de réception et vos spams.</p>
            </div>
          }

          <div class="mt-8 text-center">
            <a routerLink="/login" class="text-sm text-secondary hover:text-secondary/80 font-medium transition-colors">
              <i class="fas fa-arrow-left mr-1"></i> Retour à la connexion
            </a>
          </div>

          <p class="mt-8 text-center text-sm text-gray-400">
            &copy; {{ currentYear }} AcademiQ — Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export default class ForgotPasswordComponent {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  emailSent = false;
  currentYear = new Date().getFullYear();

  onSubmit(): void {
    if (this.emailControl.valid) {
      this.emailSent = true;
    }
  }
}

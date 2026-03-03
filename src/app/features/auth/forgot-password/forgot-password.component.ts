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
      <div class="lg:w-1/2 bg-sidebar text-white flex flex-col justify-center items-center p-8 lg:p-16 relative overflow-hidden">
        <div class="relative z-10 text-center fade-in">
          <div class="mb-8">
            <div class="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-graduation-cap text-accent text-2xl"></i>
            </div>
            <h1 class="text-3xl font-bold tracking-tight text-white">AcademiQ</h1>
            <p class="text-sm text-gray-400 mt-2 max-w-sm leading-relaxed">
              Plateforme de gestion des notes et suivi pedagogique
            </p>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div class="w-full max-w-md fade-in-up">
          <div class="lg:hidden flex items-center gap-2 mb-6">
            <i class="fas fa-graduation-cap text-primary text-xl"></i>
            <span class="text-xl font-semibold text-gray-900">AcademiQ</span>
          </div>

          @if (!emailSent) {
            <div class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900">Mot de passe oublie</h2>
              <p class="text-sm text-gray-500 mt-1">Entrez votre adresse email pour recevoir un lien de reinitialisation</p>
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

              <button type="submit" class="btn-primary w-full justify-center !py-3" [disabled]="emailControl.invalid">
                Envoyer le lien de reinitialisation
              </button>
            </form>
          } @else {
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check text-2xl text-emerald-600"></i>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Email envoye</h2>
              <p class="text-gray-500 mb-6">
                Si un compte existe avec l'adresse <strong>{{ emailControl.value }}</strong>, un lien de reinitialisation a ete envoye.
              </p>
              <p class="text-sm text-gray-400">Verifiez votre boite de reception et vos spams.</p>
            </div>
          }

          <div class="mt-8 text-center">
            <a routerLink="/login" class="text-sm text-primary hover:text-primary-hover font-medium transition-colors">
              <i class="fas fa-arrow-left mr-1"></i> Retour a la connexion
            </a>
          </div>

          <p class="mt-8 text-center text-xs text-gray-400">
            &copy; {{ currentYear }} AcademiQ — Tous droits reserves
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

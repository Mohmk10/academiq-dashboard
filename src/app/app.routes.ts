import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component') },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component') },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component') },
      {
        path: 'etudiants',
        loadComponent: () => import('./features/students/student-list/student-list.component'),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RESPONSABLE_PEDAGOGIQUE'] }
      },
      { path: 'etudiants/:id', loadComponent: () => import('./features/students/student-detail/student-detail.component') },
      {
        path: 'enseignants',
        loadComponent: () => import('./features/teachers/teacher-list/teacher-list.component'),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RESPONSABLE_PEDAGOGIQUE'] }
      },
      { path: 'enseignants/:id', loadComponent: () => import('./features/teachers/teacher-detail/teacher-detail.component') },
      {
        path: 'structure',
        loadComponent: () => import('./features/courses/structure/structure.component'),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      { path: 'notes', loadComponent: () => import('./features/grades/grades.component') },
      {
        path: 'notes/saisie/:evaluationId',
        loadComponent: () => import('./features/grades/grade-entry/grade-entry.component'),
        canActivate: [roleGuard],
        data: { roles: ['ENSEIGNANT', 'ADMIN'] }
      },
      {
        path: 'alertes',
        loadComponent: () => import('./features/alerts/alert-list/alert-list.component'),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RESPONSABLE_PEDAGOGIQUE', 'ENSEIGNANT'] }
      },
      { path: 'rapports', loadComponent: () => import('./features/reports/reports.component') },
      { path: 'profil', loadComponent: () => import('./features/auth/profile/profile.component') },
      {
        path: 'parametres',
        loadComponent: () => import('./features/settings/settings.component'),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
    ]
  },

  { path: '**', redirectTo: 'login' }
];

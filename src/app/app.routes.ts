import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'cjenik/:qrKod',
    loadComponent: () => 
      import('./pages/javni-cjenik/javni-cjenik.component').then(m => m.JavniCjenikComponent)
  },
  {
    path: '',
    redirectTo: '/cjenik/default',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => 
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { uloge: ['Administrator'] }
  },
  {
    path: 'dashboard',
    loadComponent: () => 
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
  path: 'putnik',
  loadChildren: () => import('./features/putnik/putnik.routes').then(m => m.PUTNIK_ROUTES),
  canActivate: [authGuard]
  },
  {
  path: 'ugostitelj',
  loadChildren: () => import('./features/ugostitelj/ugostitelj.routes').then(m => m.UGOSTITELJ_ROUTES),
  canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => 
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
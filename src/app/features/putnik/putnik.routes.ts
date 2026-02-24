import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const PUTNIK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./putnik-dashboard/putnik-dashboard.component').then(m => m.PutnikDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { uloge: ['Administrator', 'Putnik'] }
  }
];
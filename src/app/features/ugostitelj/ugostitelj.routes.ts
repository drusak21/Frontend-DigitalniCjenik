import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const UGOSTITELJ_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./ugostitelj-dashboard/ugostitelj-dashboard.component').then(m => m.UgostiteljDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { uloge: ['Administrator', 'Ugostitelj'] }
  }
];
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { uloge: ['Administrator'] },
    children: [
      {
        path: 'korisnici',
        loadComponent: () => 
          import('./korisnici/korisnici.component').then(m => m.KorisniciComponent),
        canActivate: [authGuard, roleGuard],
        data: { uloge: ['Administrator'] }
      },
      {
        path: 'objekti',
        loadComponent: () => 
          import('./objekti/objekti.component').then(m => m.ObjektiComponent),
        canActivate: [authGuard, roleGuard],
        data: { uloge: ['Administrator'] }
      },
      {
      path: 'ugostitelji',
      loadComponent: () => 
        import('./ugostitelji/ugostitelji.component').then(m => m.UgostiteljiComponent),
      canActivate: [authGuard, roleGuard],
      data: { uloge: ['Administrator'] }
      },
      {
        path: 'artikli',
        loadComponent: () => 
          import('./artikli/artikli.component').then(m => m.ArtikliComponent),
        canActivate: [authGuard, roleGuard],
        data: { uloge: ['Administrator'] }
      },
      {
        path: 'kategorije',
        loadComponent: () => 
          import('./kategorije/kategorije.component').then(m => m.KategorijeComponent),
        canActivate: [authGuard, roleGuard],
        data: { uloge: ['Administrator'] }
      },
      {
        path: 'akcije',
        loadComponent: () => 
          import('./akcije/akcije.component').then(m => m.AkcijeComponent),
        canActivate: [authGuard, roleGuard],
        data: { uloge: ['Administrator'] }
      },
      {
        path: 'banneri',
        loadComponent: () => 
          import('./banneri/banneri.component').then(m => m.BanneriComponent),
        canActivate: [authGuard, roleGuard],
        data: { uloge: ['Administrator'] }
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'korisnici'
      }
    ]
  }
];
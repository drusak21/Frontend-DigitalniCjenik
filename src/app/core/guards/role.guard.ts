import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const dozvoljeneUloge = route.data['uloge'] as Array<string>;
  const korisnikUloga = localStorage.getItem('korisnikUloga') || 'Gost';
  
  if (dozvoljeneUloge.includes(korisnikUloga)) {
    return true;
  }
  

  router.navigate(['/']);
  return false;
};
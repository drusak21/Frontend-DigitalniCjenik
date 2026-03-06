import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const token = localStorage.getItem('token');
  
  if (token && !isTokenExpired(token)) {  
    return true;
  }
  

  if (token) {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnikUloga');
  }
  
  router.navigate(['/login']);
  return false;
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}
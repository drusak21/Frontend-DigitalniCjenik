import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  lozinka: string;
}

export interface LoginResponse {
  token: string;
  uloga: string;
  imePrezime: string;
}

export interface RegisterRequest {
  imePrezime: string;
  email: string;
  lozinka: string;
  ulogaID: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        // Spremi token i podatke u localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('korisnikIme', response.imePrezime);
        localStorage.setItem('korisnikUloga', response.uloga);
        
        // Dekodiraj token da dobijemo ID korisnika
        const decodedToken = this.decodeToken(response.token);
        if (decodedToken) {
          localStorage.setItem('korisnikId', decodedToken.nameid);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/register`, request, {
      responseType: 'text' as 'json'  // Jer backend vraća string
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnikIme');
    localStorage.removeItem('korisnikUloga');
    localStorage.removeItem('korisnikId');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('korisnikUloga');
  }

  getUserName(): string | null {
    return localStorage.getItem('korisnikIme');
  }

  getUserId(): string | null {
    return localStorage.getItem('korisnikId');
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
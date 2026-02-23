import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Korisnik, CreateKorisnikRequest, UpdateKorisnikRequest, Uloga } from '../models/korisnik.model';

@Injectable({
  providedIn: 'root'
})
export class KorisniciService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /api/korisnici
  getKorisnici(): Observable<Korisnik[]> {
    return this.http.get<Korisnik[]>(`${this.apiUrl}/korisnici`);
  }

  // GET /api/uloge
  getUloge(): Observable<Uloga[]> {
    return this.http.get<Uloga[]>(`${this.apiUrl}/uloge`);
  }

  // POST /api/korisnici
  createKorisnik(korisnik: CreateKorisnikRequest): Observable<any> {
  return this.http.post(`${this.apiUrl}/korisnici`, korisnik, { 
    responseType: 'text' 
  }).pipe(
    map(response => {
      console.log('Create response:', response); // "Korisnik uspješno kreiran."
      
      return { 
        success: true, 
        message: response,

        data: korisnik
      };
    })
  );
}

  // PUT /api/korisnici/{id} - Backend vraća tekst
  updateKorisnik(id: number, korisnik: UpdateKorisnikRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/korisnici/${id}`, korisnik, { 
      responseType: 'text' 
    }).pipe(
      map(response => {
        console.log('Update response:', response);
        return { success: true, message: response };
      })
    );
  }

  // PATCH /api/korisnici/{id}/deactivate - Backend vraća tekst
  deaktivirajKorisnika(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/korisnici/${id}/deactivate`, {}, { 
      responseType: 'text' 
    }).pipe(
      map(response => {
        console.log('Deactivate response:', response);
        return { success: true, message: response };
      })
    );
  }

  // Aktivacija korisnika 
  aktivirajKorisnika(id: number): Observable<any> {
    return this.getKorisnici().pipe(
      map(korisnici => {
        const korisnik = korisnici.find(k => k.id === id);
        if (!korisnik) {
          throw new Error('Korisnik nije pronađen');
        }
        

        const ulogaID = this.getUlogaIdByNaziv(korisnik.ulogaNaziv);
        

        return {
          imePrezime: korisnik.imePrezime,
          email: korisnik.email,
          ulogaID: ulogaID,
          jezikSucelja: korisnik.jezikSučelja || 'HR',
          aktivnost: true,
          lozinka: '' 
        };
      }),
      switchMap(updateData => 
        this.http.put(`${this.apiUrl}/korisnici/${id}`, updateData, { 
          responseType: 'text' 
        }).pipe(
          map(response => {
            console.log('Aktivacija response:', response);
            return { success: true, message: response };
          })
        )
      )
    );
  }


  getUlogaIdByNaziv(naziv: string): number {
    const mapa: { [key: string]: number } = {
      'Administrator': 1,
      'Ugostitelj': 2,
      'Putnik': 3,
      'Gost': 4
    };
    return mapa[naziv] || 3; 
  }
}
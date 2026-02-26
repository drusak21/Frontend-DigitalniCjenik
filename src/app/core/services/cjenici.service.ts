import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cjenik } from '../models/cjenik.model';

@Injectable({
  providedIn: 'root'
})
export class CjeniciService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /api/cjenici/objekt/{objektId}
  getCjeniciZaObjekt(objektId: number): Observable<Cjenik[]> {
    return this.http.get<Cjenik[]>(`${this.apiUrl}/cjenici/objekt/${objektId}`);
  }

  // Dohvati samo aktivni cjenik
  getAktivniCjenik(objektId: number): Observable<Cjenik | null> {
    return this.getCjeniciZaObjekt(objektId).pipe(
      map(cjenici => {
        const aktivni = cjenici.find(c => c.status === 'aktivan');
        return aktivni || null;
      })
    );
  }

  updateCjenik(id: number, cjenik: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cjenici/${id}`, cjenik, {
      responseType: 'text'
    });
  }

  createCjenik(cjenik: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cjenici`, cjenik, {
      responseType: 'text'
    });
  }

  posaljiNaPotvrdu(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cjenici/${id}/posalji`, {}, {
      responseType: 'text'
    });
  }

  // POST /api/cjenici/{id}/potvrdi - potvrdi cjenik
  potvrdiCjenik(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cjenici/${id}/potvrdi`, {}, {
      responseType: 'text'
    });
  }

  odbijCjenik(id: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/cjenici/${id}/odbij`, {}, {
    responseType: 'text'
  });
}
}
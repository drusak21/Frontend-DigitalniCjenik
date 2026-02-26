import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Akcija, CreateAkcijaDTO, UpdateAkcijaDTO } from '../models/akcija.model';

@Injectable({
  providedIn: 'root'
})
export class AkcijeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /api/akcije
  getSveAkcije(): Observable<Akcija[]> {
    return this.http.get<Akcija[]>(`${this.apiUrl}/akcije`);
  }

  // GET /api/akcije/objekt/{objektId}
  getAkcijeZaObjekt(objektId: number): Observable<Akcija[]> {
    return this.http.get<Akcija[]>(`${this.apiUrl}/akcije/objekt/${objektId}`);
  }

  // GET /api/akcije/{id}
  getAkcija(id: number): Observable<Akcija> {
    return this.http.get<Akcija>(`${this.apiUrl}/akcije/${id}`);
  }

  // POST /api/akcije
  createAkcija(akcija: CreateAkcijaDTO): Observable<Akcija> {
    return this.http.post<Akcija>(`${this.apiUrl}/akcije`, akcija);
  }

  // PUT /api/akcije/{id}
  updateAkcija(id: number, akcija: UpdateAkcijaDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/akcije/${id}`, akcija, {
      responseType: 'text'
    });
  }

  // DELETE /api/akcije/{id}
  deleteAkcija(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/akcije/${id}`, {
      responseType: 'text'
    });
  }

  // PATCH /api/akcije/{id}/aktiviraj
  // PATCH /api/akcije/{id}/aktiviraj - šalje boolean
    aktivirajAkciju(id: number, aktivna: boolean): Observable<any> {
  return this.http.patch(`${this.apiUrl}/akcije/${id}/aktiviraj`, aktivna, {
    headers: { 'Content-Type': 'application/json' },
    responseType: 'text'
  });
}
}
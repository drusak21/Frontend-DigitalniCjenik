import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Artikl, CreateArtiklDTO, UpdateArtiklDTO } from '../models/artikl.model';

@Injectable({
  providedIn: 'root'
})
export class ArtikliService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /api/artikli
  getSviArtikli(): Observable<Artikl[]> {
    return this.http.get<Artikl[]>(`${this.apiUrl}/artikli`);
  }

  // GET /api/artikli/{id}
  getArtikl(id: number): Observable<Artikl> {
    return this.http.get<Artikl>(`${this.apiUrl}/artikli/${id}`);
  }


  // POST /api/artikli
  createArtikl(artikl: CreateArtiklDTO): Observable<Artikl> {
    return this.http.post<Artikl>(`${this.apiUrl}/artikli`, artikl);
  }

  // PUT /api/artikli/{id}
  updateArtikl(id: number, artikl: UpdateArtiklDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/artikli/${id}`, artikl, {
      responseType: 'text'
    });
  }

  // DELETE /api/artikli/{id}
  deleteArtikl(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/artikli/${id}`, {
      responseType: 'text'
    });
  }

  // POST /api/artikli/import
  importArtikli(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/artikli/import`, formData, {
      responseType: 'text'
    });
  }
}
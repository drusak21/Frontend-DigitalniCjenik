import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Kategorija {
  id: number;
  naziv: string;
  redoslijedPrikaza: number;
  aktivan: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class KategorijeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /api/kategorije
  getSveKategorije(): Observable<Kategorija[]> {
    return this.http.get<Kategorija[]>(`${this.apiUrl}/kategorije`);
  }

  // GET /api/kategorije/{id}
  getKategorija(id: number): Observable<Kategorija> {
    return this.http.get<Kategorija>(`${this.apiUrl}/kategorije/${id}`);
  }

  // POST /api/kategorije
  createKategorija(kategorija: any): Observable<Kategorija> {
    return this.http.post<Kategorija>(`${this.apiUrl}/kategorije`, kategorija);
  }

  // PUT /api/kategorije/{id}
  updateKategorija(id: number, kategorija: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/kategorije/${id}`, kategorija, {
      responseType: 'text'
    });
  }

  // DELETE /api/kategorije/{id}
  deleteKategorija(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/kategorije/${id}`, {
      responseType: 'text'
    });
  }
}
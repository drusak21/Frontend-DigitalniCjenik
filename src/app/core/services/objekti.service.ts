import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateObjektDTO, Objekt, UpdateObjektDTO } from '../models/objekt.model';


@Injectable({
  providedIn: 'root'
})
export class ObjektiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

   getSviObjekti(): Observable<Objekt[]> {
    return this.http.get<Objekt[]>(`${this.apiUrl}/objekti`);
  }

  getObjekt(id: number): Observable<Objekt> {
    return this.http.get<Objekt>(`${this.apiUrl}/objekti/${id}`);
  }

  // GET /api/objekti/qr/{qrKod}
  getObjektByQR(qrKod: string): Observable<Objekt> {
    return this.http.get<Objekt>(`${this.apiUrl}/objekti/qr/${qrKod}`);
  }

   createObjekt(objekt: CreateObjektDTO): Observable<Objekt> {
    return this.http.post<Objekt>(`${this.apiUrl}/objekti`, objekt);
  }

  // PUT /api/objekti/{id}
  updateObjekt(id: number, objekt: UpdateObjektDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/objekti/${id}`, objekt, {
      responseType: 'text'
    });
  }

  // PATCH /api/objekti/{id}/aktivnost
  toggleAktivnost(id: number, aktivnost: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/objekti/${id}/aktivnost`, { aktivnost }, {
      responseType: 'text'
    });
  }

  // DELETE /api/objekti/{id} (ako postoji)
  deleteObjekt(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/objekti/${id}`, {
      responseType: 'text'
    });
  }

  // Preuzimanje QR koda
  preuzmiQR(kod: string, naziv: string, base64: string) {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `QR-${naziv}-${kod}.png`;
    link.click();
  }
}
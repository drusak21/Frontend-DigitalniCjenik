import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Objekt } from '../models/objekt.model';


@Injectable({
  providedIn: 'root'
})
export class ObjektiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /api/objekti/qr/{qrKod}
  getObjektByQR(qrKod: string): Observable<Objekt> {
    return this.http.get<Objekt>(`${this.apiUrl}/objekti/qr/${qrKod}`);
  }
}
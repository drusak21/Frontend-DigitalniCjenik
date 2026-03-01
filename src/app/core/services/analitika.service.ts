import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AnalitikaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // POST /api/analitika/zabiljezi
  zabiljeziDogadaj(dogadaj: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/analitika/zabiljezi`, dogadaj);
  }

  // GET /api/analitika/izvjestaj/qr
  getQRStatistika(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/analitika/izvjestaj/qr`, { params });
  }

  // GET /api/analitika/izvjestaj/otvaranja
  getOtvaranjaStatistika(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/analitika/izvjestaj/otvaranja`, { params });
  }

  // GET /api/analitika/izvjestaj/klikovi
  getKlikoviStatistika(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/analitika/izvjestaj/klikovi`, { params });
  }

  // GET /api/analitika/dashboard
  getDashboardPodaci(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/analitika/dashboard`, { params });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Banner, CreateBannerDTO, UpdateBannerDTO } from '../models/banner.model';

@Injectable({
  providedIn: 'root'
})
export class BanneriService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /api/banneri
  getSviBanneri(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.apiUrl}/banneri`);
  }

  // GET /api/banneri/objekt/{objektId}
  getBanneriZaObjekt(objektId: number): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.apiUrl}/banneri/objekt/${objektId}`);
  }

  // GET /api/banneri/{id}
  getBanner(id: number): Observable<Banner> {
    return this.http.get<Banner>(`${this.apiUrl}/banneri/${id}`);
  }

  // POST /api/banneri
  createBanner(banner: CreateBannerDTO): Observable<Banner> {
    return this.http.post<Banner>(`${this.apiUrl}/banneri`, banner);
  }

  // PUT /api/banneri/{id}
  updateBanner(id: number, banner: UpdateBannerDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/banneri/${id}`, banner, {
      responseType: 'text'
    });
  }

  // DELETE /api/banneri/{id}
  deleteBanner(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/banneri/${id}`, {
      responseType: 'text'
    });
  }

  // PATCH /api/banneri/{id}/aktiviraj
  aktivirajBanner(id: number, aktivna: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/banneri/${id}/aktiviraj`, aktivna, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }
}
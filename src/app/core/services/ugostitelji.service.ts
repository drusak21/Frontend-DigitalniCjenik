import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ugostitelj, CreateUgostiteljDTO, UpdateUgostiteljDTO } from '../models/ugostitelj.model';

@Injectable({
  providedIn: 'root'
})
export class UgostiteljiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /api/ugostitelji
  getSviUgostitelji(): Observable<Ugostitelj[]> {
    return this.http.get<Ugostitelj[]>(`${this.apiUrl}/ugostitelji`);
  }

  // GET /api/ugostitelji/{id}
  getUgostitelj(id: number): Observable<Ugostitelj> {
    return this.http.get<Ugostitelj>(`${this.apiUrl}/ugostitelji/${id}`);
  }

  // POST /api/ugostitelji - Backend vraća tekst
  createUgostitelj(ugostitelj: CreateUgostiteljDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/ugostitelji`, ugostitelj, { 
      responseType: 'text' 
    }).pipe(
      map(response => {
        console.log('Create response:', response); // "Ugostitelj uspješno kreiran."
        return { 
          success: true, 
          message: response 
        };
      })
    );
  }

  // PUT /api/ugostitelji/{id} - Backend vraća tekst
  updateUgostitelj(id: number, ugostitelj: UpdateUgostiteljDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/ugostitelji/${id}`, ugostitelj, {
      responseType: 'text'
    }).pipe(
      map(response => {
        console.log('Update response:', response);
        return { success: true, message: response };
      })
    );
  }

  // DELETE /api/ugostitelji/{id} - Backend vraća tekst
  deleteUgostitelj(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ugostitelji/${id}`, {
      responseType: 'text'
    }).pipe(
      map(response => {
        console.log('Delete response:', response);
        return { success: true, message: response };
      })
    );
  }
}
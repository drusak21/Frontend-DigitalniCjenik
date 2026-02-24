import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObjektiService } from '../../../core/services/objekti.service';
import { Objekt } from '../../../core/models/objekt.model';

@Component({
  selector: 'app-putnik-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './putnik-dashboard.component.html',
  styleUrls: ['./putnik-dashboard.component.scss']
})
export class PutnikDashboardComponent implements OnInit {
  objekti: Objekt[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  
  // Statistika
  ukupnoObjekata = 0;
  aktivnihObjekata = 0;
  neaktivnihObjekata = 0;

  constructor(private objektiService: ObjektiService) {}

  ngOnInit(): void {
    this.ucitajObjekte();
  }

  ucitajObjekte(): void {
    this.loading = true;
    this.objektiService.getSviObjekti().subscribe({
      next: (data) => {
        this.objekti = data;
        this.izracunajStatistiku();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Greška pri učitavanju objekata';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  izracunajStatistiku(): void {
    this.ukupnoObjekata = this.objekti.length;
    this.aktivnihObjekata = this.objekti.filter(o => o.aktivnost).length;
    this.neaktivnihObjekata = this.ukupnoObjekata - this.aktivnihObjekata;
  }

  get filtriraniObjekti(): Objekt[] {
    if (!this.searchTerm) return this.objekti;
    const term = this.searchTerm.toLowerCase();
    return this.objekti.filter(o => 
      o.naziv.toLowerCase().includes(term) ||
      o.adresa.toLowerCase().includes(term)
    );
  }

  getStatusClass(aktivnost: boolean): string {
    return aktivnost ? 'status-active' : 'status-inactive';
  }

  getStatusText(aktivnost: boolean): string {
    return aktivnost ? 'Aktivan' : 'Neaktivan';
  }

  otvoriQRPreview(objekt: any) {
  if (!objekt.qrKodBase64) {
    alert('QR kod nije dostupan');
    return;
  }
  
  const qrUrl = `data:image/png;base64,${objekt.qrKodBase64}`;
  const noviTab = window.open();
  if (noviTab) {
    noviTab.document.write(`
      <html>
        <head><title>QR kod - ${objekt.naziv}</title></head>
        <body style="text-align:center;padding:20px;">
          <h2>${objekt.naziv}</h2>
          <img src="${qrUrl}" style="width:300px;height:300px;">
          <p>${objekt.qrKod}</p>
        </body>
      </html>
    `);
  }
}
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalitikaService } from '../../../core/services/analitika.service';
import { ObjektiService } from '../../../core/services/objekti.service';
import { Objekt } from '../../../core/models/objekt.model';
import { DashboardPodaci, DanPodaci } from '../../../core/models/analitika.model';

@Component({
  selector: 'app-analitika',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analitika.component.html',
  styleUrls: ['./analitika.component.scss']
})
export class AnalitikaComponent implements OnInit {
  objekti: Objekt[] = [];
  loading = false;
  errorMessage = '';
  
  // Filteri
  datumOd: string = this.getPrviDanUMjesecu();
  datumDo: string = this.getDanasnjiDatum();
  selectedObjektId: number = 0;
  
  // Podaci
  ukupnoQr: number = 0;
  ukupnoOtvaranja: number = 0;
  ukupnoKlikova: number = 0;
  poDanima: DanPodaci[] = [];

  constructor(
    private analitikaService: AnalitikaService,
    private objektiService: ObjektiService
  ) {}

  ngOnInit(): void {
    this.ucitajObjekte();
    this.ucitajPodatke();
  }

  getPrviDanUMjesecu(): string {
    const danas = new Date();
    const prvi = new Date(danas.getFullYear(), danas.getMonth(), 1);
    return this.formatDate(prvi);
  }

  getDanasnjiDatum(): string {
    return this.formatDate(new Date());
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  ucitajObjekte(): void {
    this.objektiService.getSviObjekti().subscribe({
      next: (data) => {
        this.objekti = data;
      },
      error: (error) => {
        console.error('Greška pri učitavanju objekata:', error);
      }
    });
  }

  ucitajPodatke(): void {
    this.loading = true;
    
    const params: any = {
      datumOd: this.datumOd,
      datumDo: this.datumDo
    };
    
    if (this.selectedObjektId > 0) {
      params.objektID = this.selectedObjektId;
    }

    this.analitikaService.getDashboardPodaci(params).subscribe({
      next: (data: DashboardPodaci) => {
        console.log('Dashboard podaci:', data);
        this.ukupnoQr = data.ukupnoQr;
        this.ukupnoOtvaranja = data.ukupnoOtvorenih;
        this.ukupnoKlikova = data.ukupnoKlikova;
        this.poDanima = data.poDanima || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Greška pri učitavanju podataka';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  filtriraj(): void {
    this.ucitajPodatke();
  }

  resetFilter(): void {
    this.datumOd = this.getPrviDanUMjesecu();
    this.datumDo = this.getDanasnjiDatum();
    this.selectedObjektId = 0;
    this.ucitajPodatke();
  }

  exportToCSV(): void {
    // TODO: Implementirati export u CSV
    alert('Export u CSV dolazi uskoro!');
  }

  // Pomoćne metode za HTML
  getNajaktivnijiDan(): any {
    if (!this.poDanima || this.poDanima.length === 0) return null;
    
    return this.poDanima.reduce((max, dan) => 
      dan.qr > max.qr ? dan : max, this.poDanima[0]);
  }

  getProsjecnoDnevno(): number {
    if (!this.poDanima || this.poDanima.length === 0) return 0;
    
    const ukupno = this.poDanima.reduce((sum, dan) => sum + dan.qr, 0);
    return ukupno / this.poDanima.length;
  }

  getNajaktivnijiDanDatum(): string {
  const najdan = this.getNajaktivnijiDan();
  if (!najdan || !najdan.datum) return 'N/A';
  
  const datum = new Date(najdan.datum);
  const dan = ('0' + datum.getDate()).slice(-2);
  const mjesec = ('0' + (datum.getMonth() + 1)).slice(-2);
  const godina = datum.getFullYear();
  
  return `${dan}.${mjesec}.${godina}.`;
}
}
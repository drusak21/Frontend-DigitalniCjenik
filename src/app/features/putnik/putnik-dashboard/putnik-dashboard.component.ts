import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObjektiService } from '../../../core/services/objekti.service';
import { CjeniciService } from '../../../core/services/cjenici.service';
import { ArtikliService } from '../../../core/services/artikli.service';
import { KategorijeService } from '../../../core/services/kategorije.service';
import { Objekt } from '../../../core/models/objekt.model';

@Component({
  selector: 'app-putnik-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './putnik-dashboard.component.html',
  styleUrls: ['./putnik-dashboard.component.scss']
})
export class PutnikDashboardComponent implements OnInit {
  // Objekti
  objekti: Objekt[] = [];
  
  // Zahtjevi za potvrdu
  zahtjevi: any[] = [];
  
  // Za pregled cjenika
  prikaziPregled: boolean = false;
  odabraniCjenik: any = null;
  artikliUCjeniku: any[] = [];
  kategorije: any[] = [];
  sviArtikli: any[] = [];
  
  // UI
  loading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  aktivniTab: 'objekti' | 'zahtjevi' = 'objekti';
  
  // Statistika
  ukupnoObjekata = 0;
  aktivnihObjekata = 0;
  neaktivnihObjekata = 0;

  constructor(
    private objektiService: ObjektiService,
    private cjeniciService: CjeniciService,
    private artikliService: ArtikliService,
    private kategorijeService: KategorijeService
  ) {}

  ngOnInit(): void {
    this.ucitajKategorije();
    this.ucitajSveArtikle();
    this.ucitajObjekte();
    this.ucitajZahtjeve();
  }

  ucitajKategorije(): void {
    this.kategorijeService.getSveKategorije().subscribe({
      next: (data) => {
        this.kategorije = data;
      },
      error: (error) => {
        console.error('Greška pri učitavanju kategorija:', error);
      }
    });
  }

  ucitajSveArtikle(): void {
    this.artikliService.getSviArtikli().subscribe({
      next: (data) => {
        this.sviArtikli = data;
      },
      error: (error) => {
        console.error('Greška pri učitavanju artikala:', error);
      }
    });
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

  ucitajZahtjeve(): void {
  this.loading = true;
  
  this.objektiService.getSviObjekti().subscribe({
    next: (objekti) => {
      let zahtjeviTemp: any[] = [];
      let completed = 0;
      
      if (objekti.length === 0) {
        this.zahtjevi = [];
        this.loading = false;
        return;
      }
      
      objekti.forEach(objekt => {
        // Zaštita - provjeri da objekt ima ID
        if (!objekt.id) {
          console.warn('Objekt nema ID:', objekt);
          completed++;
          if (completed === objekti.length) {
            this.zahtjevi = zahtjeviTemp;
            this.loading = false;
          }
          return;
        }
        
        this.cjeniciService.getCjeniciZaObjekt(objekt.id).subscribe({
          next: (cjenici) => {
            const naPotvrdi = cjenici.filter(c => c.status === 'na potvrdi');
            naPotvrdi.forEach(c => {
              c.objektNaziv = objekt.naziv;
              c.objektID = objekt.id;
            });
            zahtjeviTemp = [...zahtjeviTemp, ...naPotvrdi];
            
            completed++;
            if (completed === objekti.length) {
              this.zahtjevi = zahtjeviTemp;
              this.loading = false;
            }
          },
          error: (error) => {
            console.error(`Greška za objekt ${objekt.id}:`, error);
            completed++;
            if (completed === objekti.length) {
              this.zahtjevi = zahtjeviTemp;
              this.loading = false;
            }
          }
        });
      });
    },
    error: (error) => {
      console.error('Greška pri učitavanju objekata:', error);
      this.errorMessage = 'Greška pri učitavanju zahtjeva';
      this.loading = false;
    }
  });
}

  izracunajStatistiku(): void {
    this.ukupnoObjekata = this.objekti.length;
    this.aktivnihObjekata = this.objekti.filter(o => o.aktivnost).length;
    this.neaktivnihObjekata = this.ukupnoObjekata - this.aktivnihObjekata;
  }

  promijeniTab(tab: 'objekti' | 'zahtjevi'): void {
    this.aktivniTab = tab;
  }

  pregledajCjenik(cjenik: any): void {
     if (!cjenik.objektID) {
    this.errorMessage = 'Cjenik nema povezan objekt';
    return;
  }
    this.loading = true;
    this.odabraniCjenik = cjenik;
    
    // Dohvati detalje cjenika
    this.cjeniciService.getCjeniciZaObjekt(cjenik.objektID).subscribe({
      next: (cjenici) => {
        const detaljniCjenik = cjenici.find(c => c.id === cjenik.id);
        this.odabraniCjenik = detaljniCjenik;
        
        if (detaljniCjenik?.artikli) {
          const artiklIds = detaljniCjenik.artikli.map((a: any) => a.artiklID);
          this.artikliUCjeniku = this.sviArtikli.filter(a => artiklIds.includes(a.id));
        } else {
          this.artikliUCjeniku = [];
        }
        
        this.prikaziPregled = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Greška pri dohvatu cjenika:', error);
        this.errorMessage = 'Greška pri dohvatu cjenika';
        this.loading = false;
      }
    });
  }

  zatvoriPregled(): void {
    this.prikaziPregled = false;
    this.odabraniCjenik = null;
    this.artikliUCjeniku = [];
  }

  potvrdiCjenik(id: number): void {
    if (confirm('Jeste li sigurni da želite potvrditi ovaj cjenik?')) {
      this.loading = true;
      this.cjeniciService.potvrdiCjenik(id).subscribe({
        next: (response) => {
          console.log('Cjenik potvrđen:', response);
          this.successMessage = 'Cjenik uspješno potvrđen';
          this.ucitajZahtjeve(); // Ponovo učitaj zahtjeve
          this.zatvoriPregled();
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Greška pri potvrdi:', error);
          this.errorMessage = 'Greška pri potvrdi cjenika';
          this.loading = false;
        }
      });
    }
  }

odbijCjenik(id: number): void {
  if (confirm('Jeste li sigurni da želite odbiti ovaj cjenik?')) {
    this.loading = true;
    
    this.cjeniciService.odbijCjenik(id).subscribe({
      next: (response) => {
        console.log('Cjenik odbijen:', response);
        this.successMessage = 'Cjenik odbijen i vraćen u pripremu';
        this.ucitajZahtjeve(); // Ponovo učitaj zahtjeve
        this.zatvoriPregled();
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Greška pri odbijanju:', error);
        this.errorMessage = 'Greška pri odbijanju cjenika';
        this.loading = false;
      }
    });
  }
}

  // Postojeće metode
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

  getNazivKategorije(kategorijaId: number): string {
    const kat = this.kategorije.find(k => k.id === kategorijaId);
    return kat ? kat.naziv : 'Nepoznato';
  }

  jeZakljucan(artikl: any): boolean {
  return artikl?.zakljucan === true;
}
}
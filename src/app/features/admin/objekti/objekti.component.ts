import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObjektiService } from '../../../core/services/objekti.service';
import { KorisniciService } from '../../../core/services/korisnici.service';
import { Objekt, CreateObjektDTO } from '../../../core/models/objekt.model';
import { Korisnik } from '../../../core/models/korisnik.model';

@Component({
  selector: 'app-objekti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './objekti.component.html',
  styleUrls: ['./objekti.component.scss']
})
export class ObjektiComponent implements OnInit {
  objekti: Objekt[] = [];
  ugostitelji: Korisnik[] = [];
  putnici: Korisnik[] = [];
  
  // Za novi objekt
  noviObjekt: CreateObjektDTO = {
    naziv: '',
    adresa: '',
    ugostiteljID: 0,
    putnikID: 0
  };

  // Za edit
  editObjekt: Objekt | null = null;
  editData: any = {
    naziv: '',
    adresa: '',
    ugostiteljID: 0,
    putnikID: 0
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  prikaziFormu = false;
  searchTerm = '';
  prikaziQR: number | null = null; // ID objekta za prikaz QR koda

  constructor(
    private objektiService: ObjektiService,
    private korisniciService: KorisniciService
  ) {}

  ngOnInit(): void {
    this.ucitajKorisnike();
    this.ucitajObjekte();
  }

  ucitajObjekte(): void {
  this.loading = true;
  this.objektiService.getSviObjekti().subscribe({
    next: (data) => {
    
      this.objekti = data;
      this.loading = false;
    },
    error: (error) => {
      this.errorMessage = 'Greška pri učitavanju objekata';
      this.loading = false;
      console.error('Greška:', error);
    }
  });
}

  ucitajKorisnike(): void {
  this.korisniciService.getKorisnici().subscribe({
    next: (data) => {
      
      this.ugostitelji = data.filter(k => {
        return k.ulogaNaziv === 'Ugostitelj';
      });
      
      this.putnici = data.filter(k => {
        return k.ulogaNaziv === 'Putnik';
      });
      
    },
    error: (error) => {
      console.error('Greška pri učitavanju korisnika:', error);
    }
  });
}

  dodajObjekt(): void {
    if (!this.noviObjekt.naziv || !this.noviObjekt.adresa) {
      this.errorMessage = 'Naziv i adresa su obavezni';
      return;
    }

    if (this.noviObjekt.ugostiteljID === 0 || this.noviObjekt.putnikID === 0) {
      this.errorMessage = 'Odaberite ugostitelja i putnika';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    this.objektiService.createObjekt(this.noviObjekt).subscribe({
      next: (objekt) => {
        this.objekti.push(objekt);
        this.resetFormu();
        this.successMessage = 'Objekt uspješno dodan';
        this.loading = false;
        this.prikaziFormu = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri dodavanju objekta';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  urediObjekt(objekt: Objekt): void {
    this.editObjekt = objekt;
    this.editData = {
      naziv: objekt.naziv,
      adresa: objekt.adresa,
      ugostiteljID: objekt.ugostiteljID,
      putnikID: objekt.putnikID
    };
  }

  spremiIzmjene(): void {
    if (!this.editObjekt) return;

    this.loading = true;
    
    this.objektiService.updateObjekt(this.editObjekt.id, {
      naziv: this.editData.naziv,
      adresa: this.editData.adresa,
      ugostiteljID: this.editData.ugostiteljID,
      putnikID: this.editData.putnikID,
      aktivnost: this.editObjekt.aktivnost
    }).subscribe({
      next: (response) => {
        this.ucitajObjekte();
        this.editObjekt = null;
        this.successMessage = 'Objekt uspješno ažuriran';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri ažuriranju objekta';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  deaktivirajObjekt(id: number): void {
    if (confirm('Jeste li sigurni da želite deaktivirati ovaj objekt?')) {
      this.loading = true;
      this.objektiService.toggleAktivnost(id, false).subscribe({
        next: () => {
          this.ucitajObjekte();
          this.successMessage = 'Objekt deaktiviran';
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Greška pri deaktivaciji';
          this.loading = false;
          console.error('Greška:', error);
        }
      });
    }
  }

  aktivirajObjekt(id: number): void {
    this.loading = true;
    this.objektiService.toggleAktivnost(id, true).subscribe({
      next: () => {
        this.ucitajObjekte();
        this.successMessage = 'Objekt aktiviran';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri aktivaciji';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }


  getNazivUgostitelja(id: number): string {

  
  const ugostitelj = this.ugostitelji.find(u => u.id === id);

  
  return ugostitelj ? ugostitelj.imePrezime : 'Nepoznato';
}

getImePutnika(id: number): string {

  const putnik = this.putnici.find(p => p.id === id);

  return putnik ? putnik.imePrezime : 'Nepoznato';
}

  resetFormu(): void {
    this.noviObjekt = {
      naziv: '',
      adresa: '',
      ugostiteljID: 0,
      putnikID: 0
    };
    this.editObjekt = null;
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editObjekt = null;
    this.editData = {};
  }

  get filtriraniObjekti(): Objekt[] {
    if (!this.searchTerm) return this.objekti;
    const term = this.searchTerm.toLowerCase();
    return this.objekti.filter(o => 
      o.naziv.toLowerCase().includes(term) ||
      o.adresa.toLowerCase().includes(term) ||
      this.getNazivUgostitelja(o.ugostiteljID).toLowerCase().includes(term)
    );
  }

  otvoriQRPreview(objekt: any) {
  if (!objekt.qrKodBase64) {
    alert('QR kod nije dostupan za ovaj objekt');
    return;
  }
  
  const qrUrl = `data:image/png;base64,${objekt.qrKodBase64}`;
  const linkUrl = `http://localhost:4200/cjenik/${objekt.qrKod}`; // Link za cjenik
  
  const noviTab = window.open();
  if (noviTab) {
    noviTab.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR kod - ${objekt.naziv}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
          }
          h2 {
            color: #333;
            margin: 0 0 20px 0;
            font-size: 24px;
          }
          img {
            width: 300px;
            height: 300px;
            display: block;
            margin: 0 auto 20px;
            border: 2px solid #eee;
            padding: 10px;
            background: white;
            border-radius: 10px;
          }
          .qr-code {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            word-break: break-all;
            color: #333;
            border: 1px solid #e0e0e0;
            margin-bottom: 20px;
          }
          .link {
            margin-top: 20px;
          }
          .link a {
            background: #4a47a3;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s;
            box-shadow: 0 4px 8px rgba(74, 71, 163, 0.3);
          }
          .link a:hover {
            background: #3a3780;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(74, 71, 163, 0.4);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${objekt.naziv}</h2>
          <img src="${qrUrl}" alt="QR kod">
          <div class="qr-code">${objekt.qrKod}</div>
          <div class="link">
            <a href="${linkUrl}" target="_blank">🔗 Otvori cjenik</a>
          </div>
        </div>
      </body>
      </html>
    `);
    noviTab.document.close();
  }
}

}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CjeniciService } from '../../core/services/cjenici.service';
import { ObjektiService } from '../../core/services/objekti.service';
import { KategorijeService } from '../../core/services/kategorija.service';
import { ArtiklUCjeniku } from '../../core/models/cjenik.model';


interface KategorijaPrikaz {
  id: number;
  naziv: string;
  proizvodi: ArtiklUCjeniku[];
}

@Component({
  selector: 'app-javni-cjenik',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './javni-cjenik.component.html',
  styleUrl: './javni-cjenik.component.scss'
})
export class JavniCjenikComponent implements OnInit {
  qrKod: string = '';
  objektNaziv: string = 'Učitavanje...';
  kategorije: KategorijaPrikaz[] = [];
  aktivnaKategorija: number = 0;
  jezik: string = 'HR';
  isLoggedIn: boolean = false;
  loading: boolean = true;
  error: boolean = false;
  korisnikUloga: string = '';

  // Mapa kategorija prema tvojoj bazi
  kategorijeMap: Map<number, string> = new Map([
    [1, 'Bezalkoholna pića'],
    [2, 'Alkoholna pića'],
    [3, 'Hrana'],
    [4, 'Panonski Izvori'],
    [5, 'Deserti'],
    [6, 'Topli napitci']
  ]);

  kategorijePrijevodi: Map<number, string> = new Map([
  [1, 'Non-alcoholic drinks'],
  [2, 'Alcoholic drinks'],
  [3, 'Food'],
  [4, 'Panonski Izvori'],
  [5, 'Desserts'],
  [6, 'Hot drinks']
]);

  // Prijevodi
  translations: any = {
    HR: {
      sve: 'Sve',
      prijava: 'Prijava',
      administracija: 'Administracija',
      qrKod: 'QR kod',
      ucitavanje: 'Učitavanje...',
      error: 'Došlo je do greške',
      pokusajPonovo: 'Pokušaj ponovo',
      nemaArtikala: 'Nema artikala u cjeniku'
    },
    EN: {
      sve: 'All',
      prijava: 'Login',
      administracija: 'Administration',
      qrKod: 'QR code',
      ucitavanje: 'Loading...',
      error: 'An error occurred',
      pokusajPonovo: 'Try again',
      nemaArtikala: 'No items in menu'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private objektiService: ObjektiService,
    private cjeniciService: CjeniciService,
    private kategorijeService: KategorijeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.qrKod = this.route.snapshot.paramMap.get('qrKod') || 'default';
    this.provjeriPrijavu();
    this.ucitajPodatke();
  }

  provjeriPrijavu() {
  this.isLoggedIn = this.authService.isLoggedIn();
  if (this.isLoggedIn) {
    this.korisnikUloga = this.authService.getUserRole() || '';
  }
}

  ucitajPodatke() {
    this.loading = true;
    
    if (this.qrKod === 'default') {
      this.ucitajTestPodatke();
      return;
    }

    // 1. Dohvati objekt po QR kodu
    this.objektiService.getObjektByQR(this.qrKod).subscribe({
      next: (objekt) => {
        this.objektNaziv = objekt.naziv;
        
        // 2. Dohvati aktivni cjenik za taj objekt
        this.cjeniciService.getAktivniCjenik(objekt.id).subscribe({
          next: (cjenik) => {
            if (cjenik && cjenik.artikli && cjenik.artikli.length > 0) {
              // Grupiraj artikle po kategorijama
              this.kategorije = this.grupirajPoKategorijama(cjenik.artikli);
            } else {
              this.kategorije = [];
            }
            this.loading = false;
          },
          error: (err) => {
            console.error('Greška pri učitavanju cjenika:', err);
            this.error = true;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Greška pri učitavanju objekta:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  // Grupiranje artikala po kategorijama
  grupirajPoKategorijama(artikli: ArtiklUCjeniku[]): KategorijaPrikaz[] {
    const grupe = new Map<number, KategorijaPrikaz>();
    
    artikli.forEach(artikl => {
      // Dohvati kategoriju za artikl prema ID-u
      const kategorijaId = this.getKategorijaZaArtikl(artikl.artiklID);
      const kategorijaNaziv = this.kategorijeMap.get(kategorijaId) || 'Ostalo';
      
      if (!grupe.has(kategorijaId)) {
        grupe.set(kategorijaId, {
          id: kategorijaId,
          naziv: kategorijaNaziv,
          proizvodi: []
        });
      }
      
      grupe.get(kategorijaId)?.proizvodi.push(artikl);
    });
    
    // Sortiraj kategorije po redoslijedu (1-6)
    return Array.from(grupe.values()).sort((a, b) => a.id - b.id);
  }

  // Mapiranje artikala u kategorije prema tvojoj bazi
  getKategorijaZaArtikl(artiklID: number): number {
    const mapa: { [key: number]: number } = {
      // Panonski Izvori (kategorija 4)
      2: 4, 3: 4,
      // Bezalkoholna pića (kategorija 1)
      4: 1, 5: 1, 6: 1,
      // Alkoholna pića (kategorija 2)
      7: 2, 8: 2, 9: 2,
      // Hrana (kategorija 3)
      10: 3, 11: 3,
      // Deserti (kategorija 5)
      12: 5, 13: 5,
      // Topli napitci (kategorija 6)
      14: 6, 15: 6, 16: 6
    };
    
    return mapa[artiklID] || 1; // Default Bezalkoholna pića ako nema
  }

  ucitajTestPodatke() {
    this.objektNaziv = 'Kavanica (TEST)';
    
    const testArtikli: ArtiklUCjeniku[] = [
      // Panonski Izvori (kategorija 4)
      { artiklID: 2, artiklNaziv: 'Panonski Izvori Rakija', cijena: 12.00, redoslijedPrikaza: 1, zakljucan: true },
      { artiklID: 3, artiklNaziv: 'Panonski Izvori Medica', cijena: 4.00, redoslijedPrikaza: 2, zakljucan: true },
      
      // Bezalkoholna pića (kategorija 1)
      { artiklID: 4, artiklNaziv: 'Coca-Cola 0.25L', cijena: 3.00, redoslijedPrikaza: 3, zakljucan: false },
      { artiklID: 5, artiklNaziv: 'Jucy Sok Jabuka 0.2L', cijena: 3.50, redoslijedPrikaza: 4, zakljucan: false },
      { artiklID: 6, artiklNaziv: 'Jamnica 0.5L', cijena: 1.20, redoslijedPrikaza: 5, zakljucan: false },
      
      // Alkoholna pića (kategorija 2)
      { artiklID: 7, artiklNaziv: 'Vino Zlatan Plavac mali 0.75L', cijena: 12.00, redoslijedPrikaza: 6, zakljucan: false },
      { artiklID: 8, artiklNaziv: 'Karlovačko pivo 0.5L', cijena: 2.20, redoslijedPrikaza: 7, zakljucan: false },
      { artiklID: 9, artiklNaziv: 'Gemišt 0.2L', cijena: 2.80, redoslijedPrikaza: 8, zakljucan: false },
      
      // Hrana (kategorija 3)
      { artiklID: 10, artiklNaziv: 'Pomfrit 300g', cijena: 3.50, redoslijedPrikaza: 9, zakljucan: false },
      { artiklID: 11, artiklNaziv: 'Pohani sir 150g', cijena: 5.50, redoslijedPrikaza: 10, zakljucan: false },
      
      // Deserti (kategorija 5)
      { artiklID: 12, artiklNaziv: 'Palačinka s Nutellom', cijena: 4.50, redoslijedPrikaza: 11, zakljucan: false },
      { artiklID: 13, artiklNaziv: 'Cheesecake', cijena: 5.20, redoslijedPrikaza: 12, zakljucan: false },
      
      // Topli napitci (kategorija 6)
      { artiklID: 14, artiklNaziv: 'Kava s mlijekom', cijena: 1.80, redoslijedPrikaza: 13, zakljucan: false },
      { artiklID: 15, artiklNaziv: 'Čaj od šipka', cijena: 1.50, redoslijedPrikaza: 14, zakljucan: false },
      { artiklID: 16, artiklNaziv: 'Topla čokolada', cijena: 2.50, redoslijedPrikaza: 15, zakljucan: false }
    ];
    
    this.kategorije = this.grupirajPoKategorijama(testArtikli);
    this.loading = false;
  }

  promijeniKategoriju(id: number) {
    this.aktivnaKategorija = id;
  }

  promijeniJezik() {
    this.jezik = this.jezik === 'HR' ? 'EN' : 'HR';
  }

  getNazivKategorije(kategorija: any): string {
  if (this.jezik === 'EN') {
    return this.kategorijePrijevodi.get(kategorija.id) || kategorija.naziv;
  }
  return kategorija.naziv;
}

  getText(key: string): string {
    return this.translations[this.jezik][key] || key;
  }

  formatCijena(cijena: number): string {
    return cijena.toFixed(2) + ' €';
  }

  get sveKategorije() {
    if (!this.kategorije || this.kategorije.length === 0) {
      return [{ id: 0, naziv: this.getText('sve'), proizvodi: [] }];
    }
    
    return [
      { id: 0, naziv: this.getText('sve'), proizvodi: [] },
      ...this.kategorije
    ];
  }

  get filtriraniProizvodi() {
    if (!this.kategorije || this.kategorije.length === 0) {
      return [];
    }
    
    if (this.aktivnaKategorija === 0) {
      return this.kategorije;
    } else {
      return this.kategorije.filter(k => k.id === this.aktivnaKategorija);
    }
  }

   logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.korisnikUloga = '';
  }
}
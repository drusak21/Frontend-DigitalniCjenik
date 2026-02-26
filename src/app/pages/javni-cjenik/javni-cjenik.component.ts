import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CjeniciService } from '../../core/services/cjenici.service';
import { ObjektiService } from '../../core/services/objekti.service';
import { KategorijeService } from '../../core/services/kategorija.service';
import { ArtikliService } from '../../core/services/artikli.service';
import { AkcijeService } from '../../core/services/akcije.service';
import { ArtiklUCjeniku } from '../../core/models/cjenik.model';
import { Banner } from '../../core/models/banner.model';
import { BanneriService } from '../../core/services/banneri.service';

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
  sviArtikliMap: Map<number, any> = new Map();
  akcijeMap: Map<number, string> = new Map();
  banneri: Banner[] = [];
  homepageBanneri: Banner[] = [];
  popupBanner: Banner | null = null;
  popupZatvoren: boolean = false;
  banneriPoKategoriji: Map<number, any[]> = new Map();


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
    private artikliService: ArtikliService,
    private akcijeService: AkcijeService,
    private authService: AuthService,
    private banneriService: BanneriService,
     private cdr: ChangeDetectorRef
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

  kategorijaBanneri: any[] = [];

// Metoda za provjeru pripada li banner kategoriji
bannerPripadaKategoriji(banner: any, kategorijaId: number): boolean {
  if (!banner || !banner.sadrzaj) return false;
  
  // Pokušaj pronaći ID kategorije u sadržaju
  const pattern = new RegExp(`KATEGORIJA_ID[=:]${kategorijaId}(\\s|$|--)`);
  return pattern.test(banner.sadrzaj);
}

ucitajBannereZaObjekt(objektId: number): void {
  console.log('🔥 Učitavam banner-e za objekt:', objektId);
  
  this.banneriService.getBanneriZaObjekt(objektId).subscribe({
    next: (banneri) => {
      console.log('🔥 Svi banneri iz servisa:', banneri);
      
      // Filtriraj aktivne bannere
      const aktivniBanneri = banneri.filter(b => b.aktivan);
      console.log('🔥 Aktivni banneri:', aktivniBanneri);
      
      // Homepage banneri
      this.homepageBanneri = aktivniBanneri.filter(b => 
        b.tip?.toLowerCase() === 'homepage'
      );
      console.log('🔥 Homepage banneri:', this.homepageBanneri);
      
      // Pop-up banner
      const popup = aktivniBanneri.find(b => b.tip?.toLowerCase() === 'popup');
      this.popupBanner = popup || null;
      console.log('🔥 Pop-up banner:', this.popupBanner);
      
      // Kategorija banneri
      this.kategorijaBanneri = aktivniBanneri.filter(b => 
        b.tip?.toLowerCase() === 'kategorija'
      );
      console.log('🔥 Kategorija banneri (prije obrade):', this.kategorijaBanneri);
      
      // Ispiši sadržaj prvog banner-a za provjeru
      if (this.kategorijaBanneri.length > 0) {
        console.log('🔥 Prvi banner sadržaj:', this.kategorijaBanneri[0].sadrzaj);
        
        // Testiraj regex na prvom banneru
        const testBanner = this.kategorijaBanneri[0];
        const testMatch = testBanner.sadrzaj?.match(/<!--\s*KATEGORIJA_ID=(\d+)\s*-->/);
        console.log('🔥 Test regex na prvom banneru:', testMatch);
      }
      
      // FORCIRAJ OSVJEŽAVANJE POMOĆU setTimeout
      setTimeout(() => {
        this.kategorijaBanneri = [...this.kategorijaBanneri];
        console.log('🔥 Kategorija banneri nakon osvježavanja:', this.kategorijaBanneri.length);
      }, 0);
    },
    error: (err) => {
      console.error('🔥 Greška pri učitavanju banner-a:', err);
      
      // U slučaju greške, osiguraj da je niz prazan
      this.kategorijaBanneri = [];
      this.homepageBanneri = [];
      this.popupBanner = null;
    }
  });
}

  ucitajAkcijeZaObjekt(objektId: number, callback?: () => void): void {
  
  this.akcijeService.getAkcijeZaObjekt(objektId).subscribe({
    next: (akcije) => {


      const aktivneAkcije = akcije.filter(a => a.aktivna);
      
      // Spremi u mapu: ID artikla -> opis akcije
      this.akcijeMap.clear();
      aktivneAkcije.forEach(akcija => {

        const artiklId = akcija.artiklID;
        
        if (artiklId) {
          const tekstAkcije = akcija.opis || akcija.naziv;
          this.akcijeMap.set(artiklId, tekstAkcije);
        } else {
          console.log('  Akcija nema artiklID - preskačem');
        }
      });
      
      console.log('Konačna mapa akcija:', Array.from(this.akcijeMap.entries()));
      
      if (callback) {
        callback();
      }
    },
    error: (err) => {
      console.error('Greška pri učitavanju akcija:', err);
      if (callback) {
        callback();
      }
    }
  });
}

  ucitajPodatke() {
  this.loading = true;
  
  if (this.qrKod === 'default') {
    this.ucitajTestPodatke();
    return;
  }

  // Prvo dohvati sve artikle (da imamo kategorije)
  this.artikliService.getSviArtikli().subscribe({
    next: (sviArtikli) => {
      sviArtikli.forEach(a => {
        this.sviArtikliMap.set(a.id, a);
      });
      
      // Zatim dohvati objekt po QR kodu
      this.objektiService.getObjektByQR(this.qrKod).subscribe({
        next: (objekt) => {
          this.objektNaziv = objekt.naziv;
          
   
          this.ucitajAkcijeZaObjekt(objekt.id, () => {
            
            this.banneriService.getBanneriZaObjekt(objekt.id).subscribe({
              next: (banneri) => {
                console.log('🔥 BANNERI UČITANI:', banneri);
                
                // Filtriraj aktivne
                const aktivni = banneri.filter(b => b.aktivan);
                
                // Homepage
                this.homepageBanneri = aktivni.filter(b => b.tip?.toLowerCase() === 'homepage');
                
                // Popup
                this.popupBanner = aktivni.find(b => b.tip?.toLowerCase() === 'popup') || null;
                
                // Kategorija banneri - direktno u listu
                this.kategorijaBanneri = aktivni.filter(b => b.tip?.toLowerCase() === 'kategorija');
                
                console.log('🔥 Kategorija banneri:', this.kategorijaBanneri);
                console.log('🔥 Prvi banner sadržaj:', this.kategorijaBanneri[0]?.sadrzaj);
                
                // ===== NASTAVI S UČITAVANJEM CJENIKA =====
                this.cjeniciService.getAktivniCjenik(objekt.id).subscribe({
                  next: (cjenik) => {
                    if (cjenik && cjenik.artikli && cjenik.artikli.length > 0) {
                      const artikliSaKategorijom = cjenik.artikli.map((a: any) => {
                        const puniArtikl = this.sviArtikliMap.get(a.artiklID);
                        const akcijaOpis = this.akcijeMap.get(a.artiklID);
                        
                        return {
                          ...a,
                          kategorijaID: puniArtikl?.kategorijaID,
                          akcijaOpis: akcijaOpis
                        };
                      }).filter((a: any) => a.kategorijaID);
                      
                      this.kategorije = this.grupirajPoKategorijama(artikliSaKategorijom);
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
                console.error('Greška pri učitavanju banner-a:', err);
                // Nastavi bez banner-a
                this.cjeniciService.getAktivniCjenik(objekt.id).subscribe({
                  next: (cjenik) => {
                    // ... isti kod za cjenik
                    if (cjenik && cjenik.artikli && cjenik.artikli.length > 0) {
                      const artikliSaKategorijom = cjenik.artikli.map((a: any) => {
                        const puniArtikl = this.sviArtikliMap.get(a.artiklID);
                        const akcijaOpis = this.akcijeMap.get(a.artiklID);
                        return {
                          ...a,
                          kategorijaID: puniArtikl?.kategorijaID,
                          akcijaOpis: akcijaOpis
                        };
                      }).filter((a: any) => a.kategorijaID);
                      this.kategorije = this.grupirajPoKategorijama(artikliSaKategorijom);
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
              }
            });
          });
        },
        error: (err) => {
          console.error('Greška pri učitavanju objekta:', err);
          this.error = true;
          this.loading = false;
        }
      });
    },
    error: (err) => {
      console.error('Greška pri učitavanju artikala:', err);
      this.error = true;
      this.loading = false;
    }
  });
}

  // Grupiranje artikala po kategorijama
  grupirajPoKategorijama(artikli: any[]): KategorijaPrikaz[] {
    const grupe = new Map<number, KategorijaPrikaz>();
    
    artikli.forEach(artikl => {
      const kategorijaId = artikl.kategorijaID;
      if (!kategorijaId) return;
      
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
    
    return Array.from(grupe.values()).sort((a, b) => a.id - b.id);
  }

  ucitajTestPodatke() {
    this.objektNaziv = 'Kavanica (TEST)';
    
    const testArtikli: any[] = [
      // Panonski Izvori (kategorija 4)
      { artiklID: 2, artiklNaziv: 'Panonski Izvori Rakija', cijena: 12.00, redoslijedPrikaza: 1, zakljucan: true, kategorijaID: 4 },
      { artiklID: 3, artiklNaziv: 'Panonski Izvori Medica', cijena: 4.00, redoslijedPrikaza: 2, zakljucan: true, kategorijaID: 4 },
      
      // Bezalkoholna pića (kategorija 1)
      { artiklID: 4, artiklNaziv: 'Coca-Cola 0.25L', cijena: 3.00, redoslijedPrikaza: 3, zakljucan: false, kategorijaID: 1 },
      { artiklID: 5, artiklNaziv: 'Jucy Sok Jabuka 0.2L', cijena: 3.50, redoslijedPrikaza: 4, zakljucan: false, kategorijaID: 1 },
      { artiklID: 6, artiklNaziv: 'Jamnica 0.5L', cijena: 1.20, redoslijedPrikaza: 5, zakljucan: false, kategorijaID: 1 },
      
      // Alkoholna pića (kategorija 2)
      { artiklID: 7, artiklNaziv: 'Vino Zlatan Plavac mali 0.75L', cijena: 12.00, redoslijedPrikaza: 6, zakljucan: false, kategorijaID: 2 },
      { artiklID: 8, artiklNaziv: 'Karlovačko pivo 0.5L', cijena: 2.20, redoslijedPrikaza: 7, zakljucan: false, kategorijaID: 2 },
      { artiklID: 9, artiklNaziv: 'Gemišt 0.2L', cijena: 2.80, redoslijedPrikaza: 8, zakljucan: false, kategorijaID: 2 },
      
      // Hrana (kategorija 3)
      { artiklID: 10, artiklNaziv: 'Pomfrit 300g', cijena: 3.50, redoslijedPrikaza: 9, zakljucan: false, kategorijaID: 3 },
      { artiklID: 11, artiklNaziv: 'Pohani sir 150g', cijena: 5.50, redoslijedPrikaza: 10, zakljucan: false, kategorijaID: 3 },
      
      // Deserti (kategorija 5)
      { artiklID: 12, artiklNaziv: 'Palačinka s Nutellom', cijena: 4.50, redoslijedPrikaza: 11, zakljucan: false, kategorijaID: 5 },
      { artiklID: 13, artiklNaziv: 'Cheesecake', cijena: 5.20, redoslijedPrikaza: 12, zakljucan: false, kategorijaID: 5 },
      
      // Topli napitci (kategorija 6)
      { artiklID: 14, artiklNaziv: 'Kava s mlijekom', cijena: 1.80, redoslijedPrikaza: 13, zakljucan: false, kategorijaID: 6 },
      { artiklID: 15, artiklNaziv: 'Čaj od šipka', cijena: 1.50, redoslijedPrikaza: 14, zakljucan: false, kategorijaID: 6 },
      { artiklID: 16, artiklNaziv: 'Topla čokolada', cijena: 2.50, redoslijedPrikaza: 15, zakljucan: false, kategorijaID: 6 }
    ];
    
    this.kategorije = this.grupirajPoKategorijama(testArtikli);
    this.loading = false;
  }

  promijeniKategoriju(id: number) {
  this.aktivnaKategorija = id;
  this.popupZatvoren = false; 
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

  zatvoriPopup(): void {
  this.popupZatvoren = true;
}




  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.korisnikUloga = '';
  }
}
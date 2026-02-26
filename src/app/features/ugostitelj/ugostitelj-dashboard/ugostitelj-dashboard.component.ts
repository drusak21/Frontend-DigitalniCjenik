import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObjektiService } from '../../../core/services/objekti.service';
import { ArtikliService } from '../../../core/services/artikli.service';
import { KategorijeService } from '../../../core/services/kategorije.service';
import { CjeniciService } from '../../../core/services/cjenici.service';
import { Objekt } from '../../../core/models/objekt.model';
import { Artikl } from '../../../core/models/artikl.model';
import { Kategorija } from '../../../core/models/kategorija.model';
import { Banner } from '../../../core/models/banner.model';
import { BanneriService } from '../../../core/services/banneri.service';

@Component({
  selector: 'app-ugostitelj-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ugostitelj-dashboard.component.html',
  styleUrls: ['./ugostitelj-dashboard.component.scss']
})
export class UgostiteljDashboardComponent implements OnInit {
  // Podaci
  mojiObjekti: Objekt[] = [];
  sviArtikli: Artikl[] = [];
  kategorije: Kategorija[] = [];
  artikliUCjeniku: Artikl[] = [];
  trenutniCjenik: any = null;
  banneri: Banner[] = [];

  editArtiklModal: boolean = false;
  editArtiklData: any = {
  id: 0,
  naziv: '',
  opis: '',
  brand: '',
  cijena: 0
};  
  
  // Selektirani objekt
  selectedObjektId: number = 0;
  selectedObjekt: Objekt | null = null;
  
  // Za filtriranje artikala
  filterKategorija: number = 0;
  searchTerm: string = '';
  
  // Za edit artikla (samo cijena i redoslijed)
  editArtikl: Artikl | null = null;
  editCijena: number = 0;
  
  // Za dodavanje novog artikla (samo za ugostitelja)
  noviArtikl: Partial<Artikl> = {
    naziv: '',
    opis: '',
    cijena: 0,
    sastavAlergeni: '',
    brand: '',
    zakljucan: false,
    kategorijaID: 0
  };
  prikaziNoviFormu = false;
  
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private objektiService: ObjektiService,
    private artikliService: ArtikliService,
    private kategorijeService: KategorijeService,
    private cjeniciService: CjeniciService,
    private banneriService: BanneriService
  ) {}

  ngOnInit(): void {
    this.ucitajKategorije();
    this.ucitajMojeObjekte();
    this.ucitajSveArtikle();
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

  ucitajMojeObjekte(): void {
    this.loading = true;
    this.objektiService.getSviObjekti().subscribe({
      next: (data) => {
        this.mojiObjekti = data;
        if (this.mojiObjekti.length > 0) {
          this.selectedObjektId = this.mojiObjekti[0].id;
          this.promijeniObjekt(this.selectedObjektId);
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Greška pri učitavanju objekata';
        this.loading = false;
        console.error('Greška:', error);
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

 ucitajCjenikZaObjekt(objektId: number): void {
  this.loading = true;
  
  this.artikliService.getSviArtikli().subscribe({
    next: (sviArtikli) => {
      this.sviArtikli = sviArtikli;  
      

      this.cjeniciService.getCjeniciZaObjekt(objektId).subscribe({
        next: (cjenici) => {
          console.log('Svi cjenici za objekt:', cjenici);
          
          const cjenikUPripremi = cjenici.find(c => c.status === 'u pripremi');
          
          if (cjenikUPripremi) {
            this.trenutniCjenik = cjenikUPripremi;
          } else {
            const aktivniCjenik = cjenici.find(c => c.status === 'aktivan');
            this.trenutniCjenik = aktivniCjenik || null;
          }
          
          if (this.trenutniCjenik && this.trenutniCjenik.artikli && this.trenutniCjenik.artikli.length > 0) {
            const artiklIds = this.trenutniCjenik.artikli.map((a: any) => a.artiklID);
            
            this.artikliUCjeniku = this.sviArtikli.filter(a => 
              artiklIds.includes(a.id)
            );
          } else {
            this.artikliUCjeniku = [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Greška pri učitavanju cjenika:', error);
          this.artikliUCjeniku = [];
          this.loading = false;
        }
      });
    },
    error: (error) => {
      console.error('Greška pri učitavanju artikala:', error);
      this.loading = false;
    }
  });
}

  kreirajNovuVerzijuCjenika(): void {
  if (!this.selectedObjekt || !this.trenutniCjenik) {
    this.errorMessage = 'Nema aktivnog cjenika za kreiranje nove verzije';
    return;
  }

  this.loading = true;
  
  // Dohvati sve cjenike za ovaj objekt
  this.cjeniciService.getCjeniciZaObjekt(this.selectedObjekt.id).subscribe({
    next: (cjenici) => {
      // Prebroji koliko već ima cjenika (uključujući aktivni)
      const brojCjenika = cjenici.length;
      const noviNaziv = `${this.trenutniCjenik.naziv} ${brojCjenika + 1}`;
      
      console.log(`Kreiram cjenik: ${noviNaziv}`);
      
      const artikliZaNoviCjenik = (this.trenutniCjenik.artikli || []).map((a: any, index: number) => ({
        artiklID: a.artiklID,
        cijena: a.cijena,
        redoslijedPrikaza: index + 1
      }));

      const noviCjenikData = {
        naziv: noviNaziv,
        objektID: this.selectedObjekt?.id || 0,
        artikli: artikliZaNoviCjenik
      };

      this.cjeniciService.createCjenik(noviCjenikData).subscribe({
        next: (response) => {
          console.log('Novi cjenik kreiran:', response);
          this.successMessage = `Nova verzija cjenika kreirana: ${noviNaziv}`;
          this.ucitajCjenikZaObjekt(this.selectedObjekt!.id);
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Greška pri kreiranju cjenika:', error);
          this.errorMessage = 'Greška pri kreiranju nove verzije cjenika';
          this.loading = false;
        }
      });
    },
    error: (error) => {
      console.error('Greška pri dohvatu cjenika:', error);
      this.errorMessage = 'Greška pri dohvatu cjenika';
      this.loading = false;
    }
  });
}

  // Artikli koji nisu zaključani (ugostitelj ih može uređivati)
  get slobodniArtikli(): Artikl[] {
    return this.artikliUCjeniku.filter(a => !a.zakljucan);
  }

  // Zaključani artikli (Panonski Izvori) - samo za pregled
  get zakljucaniArtikli(): Artikl[] {
    return this.artikliUCjeniku.filter(a => a.zakljucan);
  }

  get filtriraniSlobodniArtikli(): Artikl[] {
    let filtrirano = this.slobodniArtikli;
    
    if (this.filterKategorija > 0) {
      filtrirano = filtrirano.filter(a => a.kategorijaID === this.filterKategorija);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtrirano = filtrirano.filter(a => 
        a.naziv.toLowerCase().includes(term) ||
        a.opis?.toLowerCase().includes(term)
      );
    }
    
    return filtrirano;
  }

  urediCijenu(artikl: Artikl): void {
    this.editArtikl = artikl;
    this.editCijena = artikl.cijena;
  }

  spremiCijenu(): void {
    if (!this.editArtikl) return;
    
    // Provjeri status cjenika
    if (this.trenutniCjenik && this.trenutniCjenik.status !== 'u pripremi') {
      this.errorMessage = 'Cjenik nije u pripremi. Prvo kreirajte novu verziju cjenika.';
      return;
    }
    
    this.loading = true;
    this.artikliService.updateArtikl(this.editArtikl.id, {
      cijena: this.editCijena
    }).subscribe({
      next: () => {
        if (this.selectedObjekt) {
          this.ucitajCjenikZaObjekt(this.selectedObjekt.id);
        }
        
        this.editArtikl = null;
        this.successMessage = 'Cijena uspješno ažurirana';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri ažuriranju cijene';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

 dodajArtikl(): void {
  console.log('=================================');
  console.log('1. ZAPOČETO DODAVANJE ARTIKLA');
  console.log('=================================');

  // Provjera unosa
  if (!this.noviArtikl.naziv || !this.noviArtikl.cijena) {
    this.errorMessage = 'Naziv i cijena su obavezni';
    console.log('2. GREŠKA: Naziv ili cijena nedostaju');
    return;
  }

  console.log('2. Podaci novog artikla:', {
    naziv: this.noviArtikl.naziv,
    cijena: this.noviArtikl.cijena,
    kategorijaID: this.noviArtikl.kategorijaID,
    brand: this.noviArtikl.brand,
    opis: this.noviArtikl.opis
  });

  this.loading = true;
  console.log('3. Šaljem POST /api/artikli...');

  this.artikliService.createArtikl({
    naziv: this.noviArtikl.naziv!,
    opis: this.noviArtikl.opis || '',
    cijena: this.noviArtikl.cijena!,
    sastavAlergeni: this.noviArtikl.sastavAlergeni || '',
    slika: '',
    brand: this.noviArtikl.brand || '',
    zakljucan: false,
    kategorijaID: this.noviArtikl.kategorijaID || 0
  }).subscribe({
    next: (noviArtikl) => {
      console.log('4. ODGOVOR BACKENDA - kreiran artikl:', noviArtikl);
      console.log('   ID novog artikla:', noviArtikl.id);
      console.log('   Naziv:', noviArtikl.naziv);
      console.log('   Cijena:', noviArtikl.cijena);
      
      this.sviArtikli.push(noviArtikl);
      console.log('5. Dodan u sviArtikli, ukupno:', this.sviArtikli.length);

      console.log('6. Provjera statusa cjenika:');
      console.log('   selectedObjekt:', this.selectedObjekt ? this.selectedObjekt.naziv : 'null');
      console.log('   trenutniCjenik:', this.trenutniCjenik ? 'postoji' : 'null');
      
      if (this.trenutniCjenik) {
        console.log('   Status cjenika:', this.trenutniCjenik.status);
        console.log('   Cjenik ID:', this.trenutniCjenik.id);
        console.log('   Broj artikala u cjeniku:', this.trenutniCjenik.artikli?.length || 0);
      }
      
      if (this.selectedObjekt && this.trenutniCjenik && this.trenutniCjenik.status === 'u pripremi') {
        console.log('7. ✅ UVJET ISPUNJEN - dodajem artikl u cjenik');
        
        console.log('8. Postojeći artikli u cjeniku (RAW):', this.trenutniCjenik.artikli);
        
        const sviPostojeciArtikli = (this.trenutniCjenik.artikli || []).map((a: any, index: number) => {
          console.log(`   Postojeći artikl ${index + 1}:`, {
            artiklID: a.artiklID,
            cijena: a.cijena,
            redoslijedPrikaza: a.redoslijedPrikaza
          });
          return {
            artiklID: a.artiklID,
            cijena: a.cijena,
            redoslijedPrikaza: a.redoslijedPrikaza
          };
        });
        
        console.log('9. SVI postojeći artikli (uključujući zaključane):', sviPostojeciArtikli);
        
        // Kreiraj novi artikl za cjenik
        const noviArtiklUCjeniku = {
          artiklID: noviArtikl.id,
          cijena: this.noviArtikl.cijena!,
          redoslijedPrikaza: sviPostojeciArtikli.length + 1
        };
        
        console.log('10. Novi artikl za cjenik:', noviArtiklUCjeniku);
        
        const sviArtikliUCjeniku = [...sviPostojeciArtikli, noviArtiklUCjeniku];
        console.log('11. SVI artikli za cjenik (spojeni - ukupno):', sviArtikliUCjeniku.length);
        console.log('    Detalji:', sviArtikliUCjeniku);

        const updateData = {
          naziv: this.trenutniCjenik.naziv,
          objektID: this.selectedObjekt.id,
          artikli: sviArtikliUCjeniku
        };
        
        console.log('12. PODACI ZA PUT ZAHTJEV:');
        console.log(JSON.stringify(updateData, null, 2));
        console.log('13. Šaljem PUT na:', `/api/cjenici/${this.trenutniCjenik.id}`);
        
        this.cjeniciService.updateCjenik(this.trenutniCjenik.id, updateData).subscribe({
          next: (response) => {
            console.log('14. ✅ PUT ODGOVOR - uspjeh:', response);
            console.log('15. Osvježavam cjenik...');
            
            this.ucitajCjenikZaObjekt(this.selectedObjekt!.id);
            this.resetNoviArtikl();
            this.successMessage = 'Artikl uspješno dodan u cjenik';
            this.loading = false;
            this.prikaziNoviFormu = false;
            
            console.log('16. ZAVRŠENO - artikl dodan u cjenik');
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            console.error('17. ❌ PUT GREŠKA:');
            console.error('   Status:', error.status);
            console.error('   Poruka:', error.message);
            console.error('   Detalji:', error.error);
            console.error('   URL:', error.url);
            
            this.errorMessage = 'Greška pri dodavanju artikla u cjenik';
            this.loading = false;
          }
        });
        
      } else {
        console.log('7. ❌ UVJET NIJE ISPUNJEN - ne dodajem u cjenik');
        console.log('   Razlozi:');
        if (!this.selectedObjekt) console.log('      - Nema odabranog objekta');
        if (!this.trenutniCjenik) console.log('      - Nema trenutnog cjenika');
        if (this.trenutniCjenik && this.trenutniCjenik.status !== 'u pripremi') {
          console.log('      - Status cjenika je:', this.trenutniCjenik.status);
        }
        
        this.ucitajSveArtikle();
        this.resetNoviArtikl();
        this.successMessage = 'Artikl uspješno dodan. Dodajte ga u cjenik putem admin panela.';
        this.loading = false;
        this.prikaziNoviFormu = false;
        setTimeout(() => this.successMessage = '', 5000);
      }
    },
    error: (error) => {
      console.error('XXX GREŠKA PRI KREIRANJU ARTIKLA XXX');
      console.error('Status:', error.status);
      console.error('Poruka:', error.message);
      console.error('Detalji:', error.error);
      
      this.errorMessage = 'Greška pri dodavanju artikla';
      this.loading = false;
    }
  });
}

  getNazivKategorije(kategorijaId: number | undefined): string {
  if (!kategorijaId) return 'Nepoznato';
  const kat = this.kategorije.find(k => k.id === kategorijaId);
  return kat ? kat.naziv : 'Nepoznato';
}

  resetNoviArtikl(): void {
    this.noviArtikl = {
      naziv: '',
      opis: '',
      cijena: 0,
      sastavAlergeni: '',
      brand: '',
      zakljucan: false,
      kategorijaID: 0
    };
  }

  cancelEdit(): void {
    this.editArtikl = null;
  }

  posaljiNaPotvrdu(): void {
  if (!this.trenutniCjenik) {
    this.errorMessage = 'Nema aktivnog cjenika za slanje';
    return;
  }

  if (this.trenutniCjenik.status !== 'u pripremi') {
    this.errorMessage = 'Samo cjenici u pripremi se mogu poslati na potvrdu';
    return;
  }

  if (!confirm('Jeste li sigurni da želite poslati ovaj cjenik na potvrdu? Nakon slanja nećete moći uređivati.')) {
    return;
  }

  this.loading = true;
  this.cjeniciService.posaljiNaPotvrdu(this.trenutniCjenik.id).subscribe({
    next: (response) => {
      console.log('Cjenik poslan na potvrdu:', response);
      this.successMessage = 'Cjenik uspješno poslan na potvrdu';
      
      if (this.selectedObjekt) {
        this.ucitajCjenikZaObjekt(this.selectedObjekt.id);
      }
      
      this.loading = false;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      console.error('Greška pri slanju na potvrdu:', error);
      this.errorMessage = 'Greška pri slanju cjenika na potvrdu';
      this.loading = false;
    }
  });
}

urediArtikl(artikl: Artikl): void {
  this.editArtiklData = {
    id: artikl.id,
    naziv: artikl.naziv,
    opis: artikl.opis || '',
    brand: artikl.brand || '',
    cijena: artikl.cijena
  };
  this.editArtiklModal = true;
}

// Zatvori modal
zatvoriEditModal(): void {
  this.editArtiklModal = false;
  this.editArtiklData = {
    id: 0,
    naziv: '',
    opis: '',
    brand: '',
    cijena: 0
  };
}

// Spremi izmjene artikla
spremiEditArtikla(): void {
  if (!this.editArtiklData.id) return;
  
  this.loading = true;
  this.artikliService.updateArtikl(this.editArtiklData.id, {
    naziv: this.editArtiklData.naziv,
    opis: this.editArtiklData.opis,
    brand: this.editArtiklData.brand,
    cijena: this.editArtiklData.cijena
  }).subscribe({
    next: () => {
      this.successMessage = 'Artikl uspješno ažuriran';
      
      // Osvježi podatke
      if (this.selectedObjekt) {
        this.ucitajCjenikZaObjekt(this.selectedObjekt.id);
      }
      
      this.zatvoriEditModal();
      this.loading = false;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      console.error('Greška pri ažuriranju artikla:', error);
      this.errorMessage = 'Greška pri ažuriranju artikla';
      this.loading = false;
    }
  });
}

// Ukloni artikl iz cjenika
ukloniArtiklIzCjenika(artikl: Artikl): void {
  if (!this.trenutniCjenik || this.trenutniCjenik.status !== 'u pripremi') {
    this.errorMessage = 'Cjenik nije u pripremi';
    return;
  }

  if (!confirm(`Jeste li sigurni da želite ukloniti artikl "${artikl.naziv}" iz cjenika?`)) {
    return;
  }

  this.loading = true;

  const noviArtikli = (this.trenutniCjenik.artikli || [])
    .filter((a: any) => a.artiklID !== artikl.id)
    .map((a: any, index: number) => ({
      artiklID: a.artiklID,
      cijena: a.cijena,
      redoslijedPrikaza: index + 1  
    }));

  const updateData = {
    naziv: this.trenutniCjenik.naziv,
    objektID: this.selectedObjekt!.id,
    artikli: noviArtikli
  };

  this.cjeniciService.updateCjenik(this.trenutniCjenik.id, updateData).subscribe({
    next: () => {
      this.successMessage = 'Artikl uklonjen iz cjenika';
      this.ucitajCjenikZaObjekt(this.selectedObjekt!.id);
      this.loading = false;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      console.error('Greška pri uklanjanju artikla:', error);
      this.errorMessage = 'Greška pri uklanjanju artikla';
      this.loading = false;
    }
  });
}

  ucitajBannereZaObjekt(objektId: number): void {
  this.banneriService.getBanneriZaObjekt(objektId).subscribe({
    next: (data) => {
      this.banneri = data;
    },
    error: (error) => {
      console.error('Greška pri učitavanju banner-a:', error);
    }
  });
}

promijeniObjekt(id: number): void {
  this.selectedObjektId = id;
  this.selectedObjekt = this.mojiObjekti.find(o => o.id === id) || null;
  
  if (this.selectedObjekt) {
    this.ucitajCjenikZaObjekt(this.selectedObjekt.id);
    this.ucitajBannereZaObjekt(this.selectedObjekt.id); 
  }
}

toggleBannerAktivnost(banner: Banner): void {
  const novaVrijednost = !banner.aktivan;
  
  this.banneriService.aktivirajBanner(banner.id, novaVrijednost).subscribe({
    next: () => {
      banner.aktivan = novaVrijednost;
      this.successMessage = `Banner ${novaVrijednost ? 'aktivirana' : 'deaktivirana'}`;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      console.error('Greška:', error);
      this.errorMessage = 'Greška pri promjeni statusa';
    }
  });
}
}
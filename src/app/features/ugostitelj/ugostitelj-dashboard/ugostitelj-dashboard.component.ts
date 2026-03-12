import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ObjektiService } from '../../../core/services/objekti.service';
import { ArtikliService } from '../../../core/services/artikli.service';
import { KategorijeService } from '../../../core/services/kategorije.service';
import { CjeniciService } from '../../../core/services/cjenici.service';
import { BanneriService } from '../../../core/services/banneri.service';
import { Objekt } from '../../../core/models/objekt.model';
import { Artikl } from '../../../core/models/artikl.model';
import { Kategorija } from '../../../core/models/kategorija.model';
import { Banner } from '../../../core/models/banner.model';

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
  banneri: Banner[] = [];
  homepageBanneri: Banner[] = [];
  popupBanner: Banner | null = null;
  trenutniCjenik: any = null;
  
  // Selektirani objekt
  selectedObjektId: number = 0;
  selectedObjekt: Objekt | null = null;
  
  // Za dropdown odabir artikla
  odabraniArtiklId: number = 0;
  odabraniArtikl: Artikl | null = null;
  novaCijena: number = 0;
  novaRedoslijed: number = 1;
  
  // Za filtriranje artikala
  filterKategorija: number = 0;
  searchTerm: string = '';
  
  // Za edit artikla
  editArtikl: Artikl | null = null;
  editArtiklModal: boolean = false;
  editArtiklData: any = {
    id: 0,
    naziv: '',
    opis: '',
    brand: '',
    cijena: 0
  };
  
  // UI state
  loading = false;
  errorMessage = '';
  successMessage = '';
  prikaziNoviFormu = false;
  popupZatvoren = false;

  constructor(
    private objektiService: ObjektiService,
    private artikliService: ArtikliService,
    private kategorijeService: KategorijeService,
    private cjeniciService: CjeniciService,
    private banneriService: BanneriService
  ) {}

  ngOnInit(): void {
    this.ucitajKategorije();
    this.ucitajSveArtikle();
    this.ucitajMojeObjekte();
  }

  // ========== METODE ZA UČITAVANJE PODATAKA ==========

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

  promijeniObjekt(id: number): void {
    this.selectedObjektId = id;
    this.selectedObjekt = this.mojiObjekti.find(o => o.id === id) || null;
    
    if (this.selectedObjekt) {
      this.ucitajCjenikZaObjekt(this.selectedObjekt.id);
      this.ucitajBannereZaObjekt(this.selectedObjekt.id);
    }
    
    // Resetiraj formu
    this.resetOdabirArtikla();
    this.prikaziNoviFormu = false;
  }

  ucitajCjenikZaObjekt(objektId: number): void {
    this.loading = true;
    
    this.cjeniciService.getCjeniciZaObjekt(objektId).subscribe({
      next: (cjenici) => {
        console.log('Svi cjenici za objekt:', cjenici);
        
        // Prvo traži cjenik u pripremi
        const cjenikUPripremi = cjenici.find(c => c.status === 'u pripremi');
        
        if (cjenikUPripremi) {
          this.trenutniCjenik = cjenikUPripremi;
          console.log('Prikazujem cjenik u pripremi:', this.trenutniCjenik);
        } else {
          const aktivniCjenik = cjenici.find(c => c.status === 'aktivan');
          this.trenutniCjenik = aktivniCjenik || null;
          console.log('Prikazujem aktivni cjenik:', this.trenutniCjenik);
        }
        
        if (this.trenutniCjenik && this.trenutniCjenik.artikli) {
          const artiklIds = this.trenutniCjenik.artikli.map((a: any) => a.artiklID);
          this.artikliUCjeniku = this.sviArtikli.filter(a => artiklIds.includes(a.id));
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
  }

  ucitajBannereZaObjekt(objektId: number): void {
    this.banneriService.getBanneriZaObjekt(objektId).subscribe({
      next: (banneri) => {
        const aktivniBanneri = banneri.filter(b => b.aktivan);
        this.homepageBanneri = aktivniBanneri.filter(b => b.tip?.toLowerCase() === 'homepage');
        this.banneri = aktivniBanneri.filter(b => b.tip?.toLowerCase() === 'kategorija');
        const popup = aktivniBanneri.find(b => b.tip?.toLowerCase() === 'popup');
        this.popupBanner = popup || null;
      },
      error: (err) => {
        console.error('Greška pri učitavanju banner-a:', err);
      }
    });
  }

  // ========== METODE ZA DROPDOWN ODABIR ARTIKLA ==========

  onArtiklChange(): void {
    if (this.odabraniArtiklId) {
      this.odabraniArtikl = this.sviArtikli.find(a => a.id === this.odabraniArtiklId) || null;
      if (this.odabraniArtikl) {
        this.novaCijena = this.odabraniArtikl.cijena;
        this.novaRedoslijed = this.artikliUCjeniku.length + 1;
      }
    } else {
      this.odabraniArtikl = null;
      this.novaCijena = 0;
    }
  }

  resetOdabirArtikla(): void {
    this.odabraniArtiklId = 0;
    this.odabraniArtikl = null;
    this.novaCijena = 0;
    this.novaRedoslijed = 1;
  }

  // ========== METODE ZA DODAVANJE ARTIKLA U CJENIK ==========

  dodajArtiklUCjenik(): void {
    if (!this.odabraniArtiklId || !this.novaCijena) {
      this.errorMessage = 'Odaberite artikl i unesite cijenu';
      return;
    }

    if (!this.trenutniCjenik || this.trenutniCjenik.status !== 'u pripremi') {
      this.errorMessage = 'Cjenik nije u pripremi';
      return;
    }

    this.loading = true;

    // Dohvati postojeće artikle iz cjenika
    const postojeciArtikli = (this.trenutniCjenik.artikli || []).map((a: any) => ({
      artiklID: a.artiklID,
      cijena: a.cijena,
      redoslijedPrikaza: a.redoslijedPrikaza
    }));

    // Kreiraj novi artikl za cjenik
    const noviArtiklUCjeniku = {
      artiklID: this.odabraniArtiklId,
      cijena: this.novaCijena,
      redoslijedPrikaza: this.novaRedoslijed
    };

    // Spoji sve artikle
    const sviArtikliUCjeniku = [...postojeciArtikli, noviArtiklUCjeniku];

    // Pripremi podatke za PUT zahtjev
    const updateData = {
      naziv: this.trenutniCjenik.naziv,
      objektID: this.selectedObjekt!.id,
      artikli: sviArtikliUCjeniku
    };

    this.cjeniciService.updateCjenik(this.trenutniCjenik.id, updateData).subscribe({
      next: (response) => {
        console.log('Artikl dodan u cjenik:', response);
        this.ucitajCjenikZaObjekt(this.selectedObjekt!.id);
        this.resetOdabirArtikla();
        this.prikaziNoviFormu = false;
        this.successMessage = 'Artikl uspješno dodan u cjenik';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Greška pri dodavanju artikla:', error);
        this.errorMessage = 'Greška pri dodavanju artikla u cjenik';
        this.loading = false;
      }
    });
  }

  // ========== METODE ZA UREĐIVANJE ARTIKALA ==========

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

  // ========== METODE ZA CJENIKE ==========

  kreirajNovuVerzijuCjenika(): void {
    if (!this.selectedObjekt || !this.trenutniCjenik) {
      this.errorMessage = 'Nema aktivnog cjenika za kreiranje nove verzije';
      return;
    }

    this.loading = true;
    
    this.cjeniciService.getCjeniciZaObjekt(this.selectedObjekt.id).subscribe({
      next: (cjenici) => {
        const osnovniNaziv = this.trenutniCjenik.naziv.replace(/\s*\(\d+\)$/, '');
        
        let maxVerzija = 0;
        cjenici.forEach(c => {
          if (c.naziv.startsWith(osnovniNaziv)) {
            const match = c.naziv.match(/\((\d+)\)$/);
            if (match) {
              const broj = parseInt(match[1], 10);
              if (broj > maxVerzija) maxVerzija = broj;
            }
          }
        });
        
        const novaVerzija = maxVerzija + 1;
        const noviNaziv = `${osnovniNaziv} (${novaVerzija})`;
        
        const artikliZaNoviCjenik = (this.trenutniCjenik.artikli || []).map((a: any, index: number) => ({
          artiklID: a.artiklID,
          cijena: a.cijena,
          redoslijedPrikaza: index + 1
        }));

        const noviCjenikData = {
          naziv: noviNaziv,
          objektID: this.selectedObjekt!.id,
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

  posaljiNaPotvrdu(): void {
    if (!this.trenutniCjenik) {
      this.errorMessage = 'Nema aktivnog cjenika za slanje';
      return;
    }

    if (this.trenutniCjenik.status !== 'u pripremi') {
      this.errorMessage = 'Samo cjenici u pripremi se mogu poslati na potvrdu';
      return;
    }

    if (!confirm('Jeste li sigurni da želite poslati ovaj cjenik na potvrdu?')) {
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

  // ========== METODE ZA BANNERE ==========

  toggleBannerAktivnost(banner: Banner): void {
    const novaVrijednost = !banner.aktivan;
    
    this.banneriService.aktivirajBanner(banner.id, novaVrijednost).subscribe({
      next: () => {
        banner.aktivan = novaVrijednost;
        this.successMessage = `Banner ${novaVrijednost ? 'aktiviran' : 'deaktiviran'}`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Greška:', error);
        this.errorMessage = 'Greška pri promjeni statusa';
      }
    });
  }

  zatvoriPopup(): void {
    this.popupZatvoren = true;
  }

  // ========== POMOĆNE METODE ==========

  getNazivKategorije(kategorijaId: number): string {
    const kat = this.kategorije.find(k => k.id === kategorijaId);
    return kat ? kat.naziv : 'Nepoznato';
  }

  get slobodniArtikli(): Artikl[] {
    return this.artikliUCjeniku.filter(a => !a.zakljucan);
  }

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
}